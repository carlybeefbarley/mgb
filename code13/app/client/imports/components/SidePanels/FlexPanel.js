import _ from 'lodash'
import React, { PropTypes } from 'react'
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

import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'

import style from './FlexPanel.css' // TODO(nico): get rid of this css

const flexPanelViews = [
  // default_level is defined in expectedToolbars.js (probably = 6)
  { tag: 'chat',      lev: 1,  name: 'chat',     icon: 'chat',       hdr: 'Chat',          el: fpChat,          superAdminOnly: false, mobileUI: true   },
  { tag: 'assets',    lev: 1,  name: 'assets',   icon: 'pencil',     hdr: 'Assets',        el: fpAssets,        superAdminOnly: false, mobileUI: true   },
  { tag: 'goals',     lev: 1,  name: 'goals',    icon: 'student',    hdr: 'Goals',         el: fpGoals,         superAdminOnly: false, mobileUI: false  },
  { tag: 'skills',    lev: 2,  name: 'skills',   icon: 'plus circle',hdr: 'Skills',        el: fpSkills,        superAdminOnly: false, mobileUI: false  },
  { tag: 'settings',  lev: 3,  name: 'settings', icon: 'settings',   hdr: 'Settings',      el: fpSettings,      superAdminOnly: false, mobileUI: false  },

// Experimental UI for mobile
//{ tag: 'more',      lev: 8,  name: 'more',     icon: 'ellipsis horizontal', hdr: 'More', el: fpMobileMore, superAdminOnly: false, mobileUI: true  },
  { tag: 'projects',  lev: 5,  name: 'projects', icon: 'sitemap',    hdr: 'Projects',      el: fpProjects,      superAdminOnly: false, mobileUI: false },
  { tag: 'users',     lev: 6,  name: 'users',    icon: 'street view',hdr: 'Users',         el: fpUsers,         superAdminOnly: false, mobileUI: false },
//{ tag: 'keys',      lev: 7,  name: 'keys',     icon: 'keyboard',   hdr: 'Keys',          el: fpKeyboard,      superAdminOnly: false, mobileUI: false },
  { tag: 'activity',  lev: 6,  name: 'activity', icon: 'lightning',  hdr: 'Activity',      el: fpActivity,      superAdminOnly: false, mobileUI: true   },

  // SuperAdmin-only:
  { tag: 'super',     lev: 4,  name: 'admin',    icon: 'red bomb',   hdr: 'SuperAdmin',    el: fpSuperAdmin,    superAdminOnly: true, mobileUI: false  } // ALWAYS SuperAdmin
]

const menuItemIndicatorStyle = {
  position: 'absolute',
  top:      '0.4em',
  right:    '0.4em',
  margin:   '0',
}

const defaultPanelViewIndex = 0
const DEFAULT_FLEXPANEL_FEATURELEVEL = expectedToolbars.getDefaultLevel('FlexPanel')

export default FlexPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    fpIsFooter:             PropTypes.bool.isRequired,    // If true, then flexPanel is fixed page footer
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user

    chatChannelTimestamps:  PropTypes.array,              // as defined by Chats.getLastMessageTimestamps RPC
    hazUnreadChats:         PropTypes.array,              // This is just a subset of the data in chatChannelTimestamps,
                                                          // but simplified - just an Array of chat channelNames with at
                                                          // least one unread message. Handy for notification UIs, and quicker to parse
    requestChatChannelTimestampsNow: PropTypes.func.isRequired,   // It does what it says on the box. Used by fpChat
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    joyrideSteps:           PropTypes.array,              // As passed to Joyride. If non-empty, a joyride is active
    joyrideSkillPathTutorial: PropTypes.string,           // Null, unless it is one of the builtin skills tutorials which is currently active
    joyrideCurrentStepNum:  PropTypes.number,             // Step number (IFF joyrideSteps is not an empty array)
    joyrideOriginatingAssetId: PropTypes.object,          // Used to support nice EditTutorial button in fpGoals ONLY. Null, or, if set, an object: origAsset: { ownerName: asset.dn_ownerName, id: asset._id }. THIS IS NOT USED FOR LOAD, JUST FOR OTHER UI TO ENABLE A EDIT-TUTORIAL BUTTON
    selectedViewTag:        PropTypes.string,             // One of the flexPanelViews.tags values (or validtagkeyhere.somesuffix)
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelIsVisible:     PropTypes.bool.isRequired,
    handleFlexPanelToggle:  PropTypes.func.isRequired,    // Callback for enabling/disabling FlexPanel view
    handleFlexPanelChange:  PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    flexPanelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:           PropTypes.bool.isRequired,    // Yes if one of core engineering team. Show extra stuff
    currentlyEditingAssetInfo: PropTypes.object.isRequired// An object with some info about the currently edited Asset - as defined in App.js' this.state
  },

  contextTypes: {
    settings:    PropTypes.object                         // Used so some panels can be hidden by user
  },

  statics: {
    getDefaultPanelViewTag: function() { return flexPanelViews[defaultPanelViewIndex].tag }
  },

  getInitialState: function() {
    return {
      wiggleActivity: false
    }
  },

  getMeteorData: function() {
    return {
      fpFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('FlexPanel'))
    }
  },

  componentDidMount: function() {
    registerDebugGlobal( 'fp', this, __filename, 'The global FlexPanel instance')
  },

  componentWillReceiveProps (nextProps) {
    const a1 = this.props.activity
    const a2 = nextProps.activity
    if (a1 && a1.length > 0 && a2 && a2.length > 0)
    {
      if (a1[0]._id !== a2[0]._id && this.state.wiggleActivity === false)
      {
        this.setState( { wiggleActivity: true } )
        window.setTimeout(() => { this.setState( { wiggleActivity: false } ) }, 5*1000)
      }
    }
  },

  _viewTagMatchesPropSelectedViewTag: function(viewTag)
  {
    if (!this.props.selectedViewTag)
      return false

    const selectedViewTagParts = this.props.selectedViewTag.split(".")
    return selectedViewTagParts[0] === viewTag
  },

  _getSelectedFlexPanelChoice: function()
  {
    const defaultReturnValue = flexPanelViews[defaultPanelViewIndex]
    if (!this.props.selectedViewTag)
      return defaultReturnValue

    const selectedViewTagParts = this.props.selectedViewTag.split(".")
    // If the FlexPanel choice isn't recognized, just default to using our default one
    return _.find(flexPanelViews, [ 'tag', selectedViewTagParts[0] ]) || defaultReturnValue
  },

  // Return the suffix (if any) of this.props.selectedViewTag.. For example 'chats.general' will return "general";    but 'chats' will return ""
  getSubNavParam: function()
  {
    const selectedViewTagParts = this.props.selectedViewTag.split(".")
    return selectedViewTagParts[1] || ""
  },

  handleChangeSubNavParam: function(newSubNavParamStr)
  {
    const { handleFlexPanelChange, selectedViewTag } = this.props
    const selectedViewTagParts = selectedViewTag.split(".")
    const newFullViewTag = selectedViewTagParts[0] + "." + newSubNavParamStr
    handleFlexPanelChange(newFullViewTag)
  },

  fpViewSelect(fpViewTag)
  {
    const { handleFlexPanelToggle, flexPanelIsVisible, handleFlexPanelChange } = this.props
    if (flexPanelIsVisible && this._viewTagMatchesPropSelectedViewTag(fpViewTag))
      handleFlexPanelToggle()
    else
      handleFlexPanelChange(fpViewTag)
  },

  getFpButtonSpecialStyleForTag: function(tag) {
    return {}       // wiggleActivity is done as a class, so it's not in this function. See render()
  },

  getFpButtonSpecialClassForTag: function(tag) {
    const { joyrideSteps, hazUnreadChats } = this.props
    const { wiggleActivity } = this.state

    if (tag === 'chat' && hazUnreadChats.length > 0)
      return ' animated swing '

    if (tag === 'activity' && wiggleActivity)
      return ' green animated swing '

    if (tag === 'goals' && joyrideSteps && joyrideSteps.length > 0)
      return ' animated swing '

    return ''
  },


  getFpButtonExtraLabelForTag: function(tag) {
    const { joyrideSteps, hazUnreadChats } = this.props

    if (tag === 'chat' && hazUnreadChats.length > 0)
      return <Label color='red' size='mini' circular style={menuItemIndicatorStyle} content={hazUnreadChats.length} />

    if (tag === 'goals' && joyrideSteps && joyrideSteps.length > 0)
      return <Label color='orange' empty circular style={menuItemIndicatorStyle} />

    return null
  },


  getFpButtonAutoShowForTag: function(tag) {
    if (this.props.selectedViewTag == tag)
      return true

    return false
  },

  render: function () {
    const { flexPanelWidth, flexPanelIsVisible, handleFlexPanelToggle, fpIsFooter, hazUnreadChats } = this.props

    const isMobileUI = fpIsFooter
    const fpFeatureLevel = this.data.fpFeatureLevel || DEFAULT_FLEXPANEL_FEATURELEVEL
    const panelStyle = fpIsFooter ?
    {
      position:     'fixed',
      top:          flexPanelIsVisible ? '0px' : undefined,
      bottom:       '61px',
      width:        flexPanelWidth,
      right:        '0px',
      border:       'none',
      borderRadius: 0,
      marginBottom: 0,
      backgroundColor: 'rgba(242, 242, 242, 1)'
      //zIndex:       90    // Temp Hack - this forces onscreen controller to be behind controls
    }
    :
    {
      position:     'fixed',
      right:        '0px',
      top:          '0px',
      minHeight:    '600px',
      marginLeft:   '0px',
      bottom:       '0px',
      width:        flexPanelWidth,
      borderLeft:   '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(242, 242, 242, 1)'   //making this non-opaque solves the overlap issues on very narrow screens
    }

    const miniNavClassNames = fpIsFooter
      ? 'ui horizontal six item icon fluid menu'
      : 'ui attached vertical horizontally fitted labeled icon menu'
    const miniNavStyle = fpIsFooter ?
    {
      position:     'fixed',
      bottom:       '0px',
      left:         '0px',
      right:        '0px',
      height:       '61px',
      border:       'none',
      borderTop:   '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: 0,
      marginBottom: 0,
      backgroundColor: 'none',
      zIndex:       300     // Temp Hack

    }
    :
    {// This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel
      position:     'fixed',
      top:          '0px',
      bottom:       '0px',
      right:        '0px',
      width:        '61px',
      border:       'none',
      borderLeft:   '1px solid rgba(0, 0, 0, 0.1)',
      borderRadius: 0,
      marginBottom: 0,
      backgroundColor: 'none'
    }

    const panelScrollContainerStyle = {
      position:     'fixed',
      top:          '50px',                /// TODO calculate this
      bottom:       fpIsFooter ? '60px' : '0px',
      right:        fpIsFooter ? '0px'  : '60px',
      width:        '285px',
      overflowY:    'scroll',
      zIndex:       301     // Temp Hack

    }

    const panelInnerStyle = {
      padding:      '10px',
      paddingBottom: '24px',
      height:       'auto',
      zIndex:       302     // Temp Hack
    }

    const flexHeaderStyle = {
      float: 'right',
      marginRight: fpIsFooter ? '0px' : '60px',
      width:        '285px',
      zIndex:       301     // Temp Hack
    }

    const flexPanelChoice = this._getSelectedFlexPanelChoice()
    const flexPanelHdr = flexPanelChoice.hdr
    const flexPanelIcon = flexPanelChoice.icon
    const ElementFP = (!this.props.isSuperAdmin && flexPanelChoice.superAdminOnly) ? null : flexPanelChoice.el

    if (flexPanelIsVisible && ElementFP !== null)
      joyrideCompleteTag(`mgbjr-CT-flexPanel-${flexPanelChoice.tag}-show`)

    return  (
      <div className="basic segment mgbFlexPanel" style={panelStyle} id='mgbjr-flexPanelArea'>
        { flexPanelIsVisible &&
          <div>

            <div className="flex header" style={flexHeaderStyle}>
              <span className="title">
                <i className={flexPanelIcon + " icon"} />&nbsp;&nbsp;{flexPanelHdr}
              </span>
              <span style={{ float: "right", cursor: "pointer", padding: "3px"}} onClick={handleFlexPanelToggle}>
                <i className="ui grey small close icon"/>
              </span>
            </div>

            <div style={panelScrollContainerStyle}>
              <div style={panelInnerStyle}>
                { !ElementFP ? <div className="ui fluid label">TODO: {flexPanelHdr} FlexPanel</div> :
                  <ElementFP
                      currUser={this.props.currUser}
                      currUserProjects={this.props.currUserProjects}
                      user={this.props.user}
                      chatChannelTimestamps={this.props.chatChannelTimestamps}
                      hazUnreadChats={hazUnreadChats}
                      requestChatChannelTimestampsNow={this.props.requestChatChannelTimestampsNow}
                      joyrideSteps={this.props.joyrideSteps}
                      joyrideSkillPathTutorial={this.props.joyrideSkillPathTutorial}
                      joyrideOriginatingAssetId={this.props.joyrideOriginatingAssetId}
                      joyrideCurrentStepNum={this.props.joyrideCurrentStepNum}
                      activity={this.props.activity}
                      panelWidth={this.props.flexPanelWidth}
                      isSuperAdmin={this.props.isSuperAdmin}
                      currentlyEditingAssetInfo={this.props.currentlyEditingAssetInfo}
                      subNavParam={this.getSubNavParam()}
                      handleChangeSubNavParam={this.handleChangeSubNavParam}
                      />
                }
              </div>
            </div>

          </div>
        }
        <div id='mgbjr-flexPanelIcons' className={miniNavClassNames} style={miniNavStyle} >
          { flexPanelViews.map(v => {  /* TODO: WORK OUT HOW TO HANDLE 5 equally space buttons */
            const active = this._viewTagMatchesPropSelectedViewTag(v.tag) ? " active selected " : ""
            if (isMobileUI && !v.mobileUI )
              return null
            if (v.lev > fpFeatureLevel && this.getFpButtonAutoShowForTag(v.tag) !== true)
              return null
            if (v.superAdminOnly && !this.props.isSuperAdmin)
              return null
            if (fpIsFooter && v.lev > 4)
              return null

            const specialSty = this.getFpButtonSpecialStyleForTag(v.tag)
            const specialClass = this.getFpButtonSpecialClassForTag(v.tag)

            return (
              <a
                id={`mgbjr-flexPanelIcons-${v.tag}`}
                key={v.tag}
                style={specialSty}
                className={active +  " item"}
                title={v.name}
                onClick={this.fpViewSelect.bind(this, v.tag)}>
                <i className={v.icon + ' ' + specialClass + ' large icon'}></i>
                { fpIsFooter ? null : v.name }
                { this.getFpButtonExtraLabelForTag(v.tag) }
              </a>
            )
          })}
        </div>
      </div>
    )
  }
})