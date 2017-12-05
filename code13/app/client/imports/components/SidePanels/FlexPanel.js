import cx from 'classnames'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Label } from 'semantic-ui-react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { expectedToolbars } from '/client/imports/components/Toolbar/expectedToolbars'

import fpSuperAdmin from './fpSuperAdmin'
import fpMobileMore from './fpMobileMore'
import fpSettings from './fpSettings'
import fpActivity from './fpActivity'
import fpKeyboard from './fpKeyboard'
import fpProjects from './fpProjects'
import fpAssets from './fpAssets'
import fpSkills from './fpSkills'
import fpGoals from './fpGoals'
import fpUsers from './fpUsers'
import fpChat from './fpChat'

import { ReactMeteorData } from 'meteor/react-meteor-data'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'

const _flexPanelTitleHeaderIsHidden = true
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
    tag: 'goals',
    lev: 1,
    name: 'goals',
    icon: 'student',
    header: 'Goals',
    el: fpGoals,
    superAdminOnly: false,
    mobileUI: false,
  },
  {
    tag: 'skills',
    lev: 2,
    name: 'skills',
    icon: 'plus circle',
    header: 'Skills',
    el: fpSkills,
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
  //{ tag: 'keys',      lev: 7,  name: 'keys',     icon: 'keyboard',   header: 'Keys',          el: fpKeyboard,      superAdminOnly: false, mobileUI: false },
  {
    tag: 'activity',
    lev: 6,
    name: 'activity',
    icon: 'lightning',
    header: 'Activity',
    el: fpActivity,
    superAdminOnly: false,
    mobileUI: true,
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
    joyrideSteps: PropTypes.array, // As passed to Joyride. If non-empty, a joyride is active
    joyrideSkillPathTutorial: PropTypes.string, // Null, unless it is one of the builtin skills tutorials which is currently active
    joyrideCurrentStepNum: PropTypes.number, // Step number (IFF joyrideSteps is not an empty array)
    joyrideOriginatingAssetId: PropTypes.object, // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
    selectedViewTag: PropTypes.string, // One of the flexPanelViews.tags values (or validtagkeyhere.somesuffix)
    activity: PropTypes.array.isRequired, // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelIsVisible: PropTypes.bool.isRequired,
    handleFlexPanelToggle: PropTypes.func.isRequired, // Callback for enabling/disabling FlexPanel view
    handleFlexPanelChange: PropTypes.func.isRequired, // Callback to change pane - records it in URL
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

  getInitialState() {
    return {
      wiggleActivity: false,
    }
  },

  getMeteorData() {
    return {
      fpFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('FlexPanel')),
    }
  },

  componentDidMount() {
    registerDebugGlobal('fp', this, __filename, 'The global FlexPanel instance')
  },

  componentWillReceiveProps(nextProps) {
    const a1 = this.props.activity
    const a2 = nextProps.activity
    if (a1 && a1.length > 0 && a2 && a2.length > 0) {
      if (a1[0]._id !== a2[0]._id && this.state.wiggleActivity === false) {
        this.setState({ wiggleActivity: true })
        window.setTimeout(() => {
          this.setState({ wiggleActivity: false })
        }, 5 * 1000)
      }
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
    const { handleFlexPanelChange, selectedViewTag } = this.props
    const selectedViewTagParts = selectedViewTag.split('.')
    const newFullViewTag = selectedViewTagParts[0] + '.' + newSubNavParamStr
    handleFlexPanelChange(newFullViewTag)
  },

  fpViewSelect(fpViewTag) {
    const { handleFlexPanelToggle, flexPanelIsVisible, handleFlexPanelChange } = this.props
    if (flexPanelIsVisible && this._viewTagMatchesPropSelectedViewTag(fpViewTag)) handleFlexPanelToggle()
    else handleFlexPanelChange(fpViewTag)
  },

  getFpButtonSpecialClassForTag(tag) {
    const { joyrideSteps, hazUnreadChats } = this.props
    const { wiggleActivity } = this.state

    if (tag === 'chat' && hazUnreadChats.length > 0) return 'animated swing'

    if (tag === 'activity' && wiggleActivity) return 'animated swing'

    if (tag === 'goals' && joyrideSteps && joyrideSteps.length > 0) return 'animated swing'

    return ''
  },

  getFpButtonExtraLabelForTag(tag) {
    const { joyrideSteps, hazUnreadChats } = this.props
    const { wiggleActivity } = this.state

    if (tag === 'chat' && hazUnreadChats.length > 0)
      return <Indicator title={`Channels: ${hazUnreadChats.join(', ')}`} content={hazUnreadChats.length} />

    if (tag === 'goals' && joyrideSteps && joyrideSteps.length > 0)
      return <Indicator title={`${joyrideSteps.length} steps in tutorial`} />

    if (tag === 'activity' && wiggleActivity) return <Indicator />

    return null
  },

  render() {
    const {
      activity,
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
      joyrideSteps,
      joyrideSkillPathTutorial,
      joyrideOriginatingAssetId,
      joyrideCurrentStepNum,
      requestChatChannelTimestampsNow,
      selectedViewTag,
      user,
    } = this.props

    const isMobileUI = fpIsFooter
    const fpFeatureLevel = this.data.fpFeatureLevel || DEFAULT_FLEXPANEL_FEATURELEVEL
    const panelStyle = fpIsFooter
      ? {
          position: 'fixed',
          top: flexPanelIsVisible ? '0px' : undefined,
          bottom: '61px',
          width: flexPanelWidth,
          right: '0px',
          border: 'none',
          borderRadius: 0,
          marginBottom: 0,
          background: '#f3f4f5',
          //zIndex:       90    // Temp Hack - this forces onscreen controller to be behind controls
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
    const miniNavStyle = fpIsFooter
      ? {
          height: '61px',
          background: '#e2e3e4',
          border: 'none',
          boxShadow: 'none',
          zIndex: 300, // Temp Hack
        }
      : {
          // This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel
          width: '61px',
          background: '#e2e3e4',
          border: 'none',
          boxShadow: 'none',
        }

    const panelScrollContainerStyle = {
      position: 'fixed',
      top: _flexPanelTitleHeaderIsHidden ? '0px' : '50px', /// TODO calculate this
      bottom: fpIsFooter ? '60px' : '0px',
      right: fpIsFooter ? '0px' : '60px',
      width: '285px',
      overflowY: 'scroll',
      zIndex: 301, // Temp Hack
    }

    const panelInnerStyle = {
      padding: '10px',
      paddingBottom: '24px',
      height: 'auto',
      zIndex: 302, // Temp Hack
    }

    const flexHeaderStyle = {
      display: _flexPanelTitleHeaderIsHidden ? 'none' : 'block',
      float: 'right',
      marginRight: fpIsFooter ? '0px' : '60px',
      width: '285px',
      zIndex: 301, // Temp Hack
    }

    const flexPanelChoice = this._getSelectedFlexPanelChoice()
    const flexPanelHeader = flexPanelChoice.header
    const flexPanelIcon = flexPanelChoice.icon
    const ElementFP = !isSuperAdmin && flexPanelChoice.superAdminOnly ? null : flexPanelChoice.el

    if (flexPanelIsVisible && ElementFP !== null)
      joyrideCompleteTag(`mgbjr-CT-flexPanel-${flexPanelChoice.tag}-show`)

    return (
      <div className="mgbFlexPanel" style={panelStyle} id="mgbjr-flexPanelArea">
        {flexPanelIsVisible && (
          <div>
            <div className="flex header" style={flexHeaderStyle}>
              <span className="title">
                <i className={flexPanelIcon + ' icon'} />&nbsp;&nbsp;{flexPanelHeader}
              </span>
              <span
                style={{ float: 'right', cursor: 'pointer', padding: '3px' }}
                onClick={handleFlexPanelToggle}
              >
                <i className="ui grey small close icon" />
              </span>
            </div>

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
                    joyrideSteps={joyrideSteps}
                    joyrideSkillPathTutorial={joyrideSkillPathTutorial}
                    joyrideOriginatingAssetId={joyrideOriginatingAssetId}
                    joyrideCurrentStepNum={joyrideCurrentStepNum}
                    activity={activity}
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
                  boxShadow: fpIsFooter
                    ? '0 0.5em 0.5em rgba(0, 0, 0, 0.2)'
                    : '0.5em 0 0.5em rgba(0, 0, 0, 0.2)',
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

export default FlexPanel
