import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Label } from 'semantic-ui-react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { responsiveComponent, withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { expectedToolbars } from '/client/imports/components/Toolbar/expectedToolbars'

import fpSuperAdmin from './fpSuperAdmin'
import fpMobileMore from './fpMobileMore'
import fpSettings from './fpSettings'
import fpProjects from './fpProjects'
import fpAssets from './fpAssets'
import fpUsers from './fpUsers'
import fpChat from './fpChat'
import fpLearn from './fpLearn'
import handleFlexPanelChange from './handleFlexPanelChange'

import { ReactMeteorData } from 'meteor/react-meteor-data'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'

const flexPanelViews = [
  // default_level is defined in expectedToolbars.js (probably = 6)
  {
    tag: 'chat',
    lev: 1,
    name: 'chat',
    icon: 'chat',
    header: 'Chat',
    el: fpChat,
    superAdminOnly: false,
    mobileUI: true,
  },
  {
    tag: 'assets',
    lev: 1,
    name: 'assets',
    icon: 'pencil',
    header: 'Assets',
    el: fpAssets,
    superAdminOnly: false,
    mobileUI: true,
  },
  {
    tag: 'learn',
    lev: 1,
    name: 'learn',
    icon: 'student',
    header: 'Learn',
    el: fpLearn,
    superAdminOnly: false,
    mobileUI: false,
  },

  // Experimental UI for mobile
  //{ tag: 'more',      lev: 8,  name: 'more',     icon: 'ellipsis horizontal', header: 'More', el: fpMobileMore, superAdminOnly: false, mobileUI: true  },
  {
    tag: 'projects',
    lev: 5,
    name: 'projects',
    icon: 'sitemap',
    header: 'Projects',
    el: fpProjects,
    superAdminOnly: false,
    mobileUI: false,
  },
  {
    tag: 'users',
    lev: 7,
    name: 'users',
    icon: 'users',
    header: 'Users',
    el: fpUsers,
    superAdminOnly: false,
    mobileUI: false,
  },

  {
    tag: 'settings',
    lev: 3,
    name: 'settings',
    icon: 'options',
    header: 'Settings',
    el: fpSettings,
    superAdminOnly: false,
    mobileUI: false,
  },

  // SuperAdmin-only:
  {
    tag: 'super',
    lev: 4,
    name: 'admin',
    icon: 'red bomb',
    header: 'SuperAdmin',
    el: fpSuperAdmin,
    superAdminOnly: true,
    mobileUI: true,
  }, // ALWAYS SuperAdmin
]

const menuItemIndicatorStyle = {
  position: 'absolute',
  top: '0.4em',
  right: '0.4em',
  margin: '0',
}

const defaultPanelViewIndex = 0
const DEFAULT_FLEXPANEL_FEATURELEVEL = expectedToolbars.getDefaultLevel('FlexPanel')

class Indicator extends React.Component {
  state = { classes: 'animated swing' }

  componentDidMount() {
    setTimeout(() => this.setState({ classes: 'animated swing' }), 0)
  }

  render() {
    const { classes } = this.state
    const { content, title } = this.props
    return (
      <Label
        className={classes}
        color="red"
        title={title}
        empty={content === undefined}
        size={content !== undefined ? 'mini' : null}
        circular
        content={content}
        style={menuItemIndicatorStyle}
      />
    )
  }
}

const FlexPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    fpIsFooter: PropTypes.bool.isRequired, // If true, then flexPanel is fixed page footer
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array, // Projects list for currently logged in user

    chatChannelTimestamps: PropTypes.array, // as defined by Chats.getLastMessageTimestamps RPC
    hazUnreadChats: PropTypes.array, // This is just a subset of the data in chatChannelTimestamps,
    // but simplified - just an Array of chat channelNames with at
    // least one unread message. Handy for notification UIs, and quicker to parse
    requestChatChannelTimestampsNow: PropTypes.func.isRequired, // It does what it says on the box. Used by fpChat
    user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag: PropTypes.string, // One of the flexPanelViews.tags values (or validtagkeyhere.somesuffix)
    flexPanelIsVisible: PropTypes.bool.isRequired,
    handleFlexPanelToggle: PropTypes.func.isRequired, // Callback for enabling/disabling FlexPanel view
    flexPanelWidth: PropTypes.string.isRequired, // Typically something like "200px".
    isSuperAdmin: PropTypes.bool.isRequired, // Yes if one of core engineering team. Show extra stuff
    currentlyEditingAssetInfo: PropTypes.object.isRequired, // An object with some info about the currently edited Asset - as defined in App.js' this.state
  },

  contextTypes: {
    settings: PropTypes.object, // Used so some panels can be hidden by user
    urlLocation: PropTypes.object,
  },

  statics: {
    getDefaultPanelViewTag() {
      return flexPanelViews[defaultPanelViewIndex].tag
    },
  },

  getMeteorData() {
    return {
      fpFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('FlexPanel')),
    }
  },

  componentDidMount() {
    registerDebugGlobal('fp', this, __filename, 'The global FlexPanel instance')
    const { flexPanelIsVisible } = this.props

    const { el, tag } = this._getSelectedFlexPanelChoice()

    if (flexPanelIsVisible && el) {
      joyrideStore.completeTag(`mgbjr-CT-flexPanel-${tag}-show`)
    }
  },

  _viewTagMatchesPropSelectedViewTag(viewTag) {
    if (!this.props.selectedViewTag) return false

    const selectedViewTagParts = this.props.selectedViewTag.split('.')
    return selectedViewTagParts[0] === viewTag
  },

  _getSelectedFlexPanelChoice() {
    const defaultReturnValue = flexPanelViews[defaultPanelViewIndex]
    if (!this.props.selectedViewTag) return defaultReturnValue

    const selectedViewTagParts = this.props.selectedViewTag.split('.')
    // If the FlexPanel choice isn't recognized, just default to using our default one
    return _.find(flexPanelViews, ['tag', selectedViewTagParts[0]]) || defaultReturnValue
  },

  // Return the suffix (if any) of this.props.selectedViewTag.. For example 'chats.general' will return "general";    but 'chats' will return ""
  getSubNavParam() {
    const selectedViewTagParts = this.props.selectedViewTag.split('.')
    return selectedViewTagParts[1] || ''
  },

  handleChangeSubNavParam(newSubNavParamStr) {
    const { selectedViewTag } = this.props
    const selectedViewTagParts = selectedViewTag.split('.')
    const newFullViewTag = selectedViewTagParts[0] + '.' + newSubNavParamStr
    handleFlexPanelChange(newFullViewTag)
  },

  fpViewSelect(fpViewTag) {
    const { handleFlexPanelToggle, flexPanelIsVisible } = this.props
    if (flexPanelIsVisible && this._viewTagMatchesPropSelectedViewTag(fpViewTag)) handleFlexPanelToggle()
    else handleFlexPanelChange(fpViewTag)
  },

  getFpButtonSpecialClassForTag(tag) {
    const { joyride, hazUnreadChats } = this.props

    if (tag === 'chat' && hazUnreadChats.length > 0) return 'animated swing'

    if (tag === 'learn' && joyride.state.isRunning) return 'animated swing'

    return ''
  },

  getFpButtonExtraLabelForTag(tag) {
    const { joyride, hazUnreadChats } = this.props

    if (tag === 'chat' && hazUnreadChats.length > 0)
      return <Indicator title={`Channels: ${hazUnreadChats.join(', ')}`} content={hazUnreadChats.length} />

    if (tag === 'learn' && joyride.state.isRunning)
      return <Indicator title={`${joyride.state.steps.length} steps in tutorial`} />

    return null
  },

  render() {
    const {
      chatChannelTimestamps,
      currentlyEditingAssetInfo,
      currUser,
      currUserProjects,
      flexPanelIsVisible,
      flexPanelWidth,
      fpIsFooter,
      handleFlexPanelToggle,
      hazUnreadChats,
      isSuperAdmin,
      joyride,
      requestChatChannelTimestampsNow,
      selectedViewTag,
      user,
      fpIconColumnWidthInPixels,
      fpFlexPanelContentWidthInPixels,
    } = this.props

    const isMobileUI = fpIsFooter
    const fpFeatureLevel = this.data.fpFeatureLevel || DEFAULT_FLEXPANEL_FEATURELEVEL
    const panelStyle = fpIsFooter
      ? {
          position: 'fixed',
          top: flexPanelIsVisible ? '0px' : undefined,
          bottom: fpIconColumnWidthInPixels + 'px',
          width: flexPanelWidth,
          right: '0px',
          border: 'none',
          borderRadius: 0,
          marginBottom: 0,
          background: '#f3f4f5',
        }
      : {
          position: 'fixed',
          right: '0px',
          top: '0px',
          minHeight: '600px',
          marginLeft: '0px',
          bottom: '0px',
          width: flexPanelWidth,
          background: '#f3f4f5',
          borderLeft: '2px solid #ddd',
        }

    const miniNavClassNames = fpIsFooter
      ? 'ui blue borderless labeled icon bottom fixed six item fluid menu'
      : 'ui blue borderless labeled icon right fixed vertical horizontally fitted menu'
    const miniNavStyle = _.assign(
      {
        background: '#e2e3e4',
        border: 'none',
        boxShadow: 'none',
      },
      fpIsFooter
        ? {
            height: fpIconColumnWidthInPixels + 'px',
            zIndex: 300, // Temp Hack
          }
        : {
            // This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel
            width: fpIconColumnWidthInPixels + 'px',
          },
    )

    const panelScrollContainerStyle = {
      position: 'fixed',
      top: '0px',
      bottom: fpIsFooter ? '60px' : '0px',
      right: fpIsFooter ? '0px' : fpIconColumnWidthInPixels + 'px',
      width: fpFlexPanelContentWidthInPixels + 'px',
      overflowY: 'scroll',
      overflowX: 'hidden',
      zIndex: 301, // Temp Hack
    }

    const panelInnerStyle = {
      padding: '10px',
      paddingBottom: '24px',
      height: 'auto',
      zIndex: 302, // Temp Hack
    }

    const flexPanelChoice = this._getSelectedFlexPanelChoice()
    const flexPanelHeader = flexPanelChoice.header
    const ElementFP = !isSuperAdmin && flexPanelChoice.superAdminOnly ? null : flexPanelChoice.el

    if (flexPanelIsVisible && ElementFP !== null)
      joyride.completeTag(`mgbjr-CT-flexPanel-${flexPanelChoice.tag}-show`)

    return (
      <div className="mgbFlexPanel" style={panelStyle} id="mgbjr-flexPanelArea">
        {flexPanelIsVisible && (
          <div style={panelScrollContainerStyle}>
            <div style={panelInnerStyle}>
              {!ElementFP ? (
                <div className="ui fluid label">TODO: {flexPanelHeader} FlexPanel</div>
              ) : (
                <ElementFP
                  currUser={currUser}
                  currUserProjects={currUserProjects}
                  user={user}
                  chatChannelTimestamps={chatChannelTimestamps}
                  hazUnreadChats={hazUnreadChats}
                  requestChatChannelTimestampsNow={requestChatChannelTimestampsNow}
                  panelWidth={flexPanelWidth}
                  isSuperAdmin={isSuperAdmin}
                  currentlyEditingAssetInfo={currentlyEditingAssetInfo}
                  subNavParam={this.getSubNavParam()}
                  handleChangeSubNavParam={this.handleChangeSubNavParam}
                  location={this.context.urlLocation}
                />
              )}
            </div>
          </div>
        )}
        <div id="mgbjr-flexPanelIcons" className={miniNavClassNames} style={miniNavStyle}>
          {flexPanelViews.map(v => {
            const active = this._viewTagMatchesPropSelectedViewTag(v.tag)
            if (isMobileUI && !v.mobileUI) return null
            if (v.lev > fpFeatureLevel && selectedViewTag !== v.tag) return null
            if (v.superAdminOnly && !isSuperAdmin) return null
            if (fpIsFooter && v.lev > 4) return null
            if (v.tag === 'projects' && (!currUserProjects || !currUserProjects.length)) return null

            const itemClasses = cx(active && 'active selected', 'item')
            const itemStyle = active
              ? {
                  background: '#f3f4f5',
                  fontWeight: 700,
                }
              : {
                  boxShadow: 'none',
                }

            const activeStyle = {
              opacity: active ? 0.9 : 0.7,
            }

            const iconClasses = cx(v.icon, this.getFpButtonSpecialClassForTag(v.tag), 'icon')

            return (
              <a
                id={`mgbjr-flexPanelIcons-${v.tag}`}
                key={v.tag}
                style={itemStyle}
                className={itemClasses}
                title={v.name}
                onClick={this.fpViewSelect.bind(this, v.tag)}
              >
                <i style={activeStyle} className={iconClasses} />
                <span style={activeStyle}>{fpIsFooter ? null : v.name}</span>
                {this.getFpButtonExtraLabelForTag(v.tag)}
              </a>
            )
          })}
        </div>
      </div>
    )
  },
})

export default _.flow(withStores({ joyride: joyrideStore }), responsiveComponent())(FlexPanel)
