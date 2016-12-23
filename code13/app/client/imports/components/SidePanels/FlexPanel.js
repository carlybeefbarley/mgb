import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'
import { expectedToolbars,  } from '/client/imports/components/Toolbar/Toolbar'


import fpFeatureLevels from './fpFeatureLevels'
import fpSuperAdmin from './fpSuperAdmin'
import fpActivity from './fpActivity'
import fpKeyboard from './fpKeyboard'
import fpProjects from './fpProjects'
import fpNetwork from './fpNetwork'
import fpAssets from './fpAssets'
import fpSkills from './fpSkills'
import fpGoals from './fpGoals'
import fpUsers from './fpUsers'
import fpChat from './fpChat'

import reactMixin from 'react-mixin'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'

import style from './FlexPanel.css' // TODO(nico): get rid of this css

const flexPanelViews = [
  { tag: 'activity',  lev: 1,  name: 'activity', icon: 'lightning',  hdr: 'Activity',          el: fpActivity,      superAdminOnly: false },
  { tag: 'goals',     lev: 1,  name: 'goals',    icon: 'student',    hdr: 'Goals',             el: fpGoals,         superAdminOnly: false  },
  { tag: 'assets',    lev: 1,  name: 'assets',   icon: 'pencil',     hdr: 'Assets',            el: fpAssets,        superAdminOnly: false },
  { tag: 'chat',      lev: 1,  name: 'chat',     icon: 'chat',       hdr: 'Chat',              el: fpChat,          superAdminOnly: false },
  { tag: 'features',  lev: 1,  name: 'options',  icon: 'options',    hdr: 'Feature Levels',    el: fpFeatureLevels, superAdminOnly: false },

  { tag: 'skills',    lev: 2,  name: 'skills',  icon: 'plus circle', hdr: 'Skills',            el: fpSkills,        superAdminOnly: false  },
  
  { tag: 'users',     lev: 3,  name: 'users',    icon: 'street view',hdr: 'Users',             el: fpUsers,         superAdminOnly: false },
  
  { tag: 'network',   lev: 4,  name: 'network',  icon: 'signal',     hdr: 'Network',           el: fpNetwork,       superAdminOnly: false },

  { tag: 'keys',      lev: 5,  name: 'keys',     icon: 'keyboard',   hdr: 'Keyboard Shortcuts',el: fpKeyboard,      superAdminOnly: false },

  { tag: 'projects',  lev: 6,  name: 'projects', icon: 'sitemap',    hdr: 'Projects',          el: fpProjects,      superAdminOnly: false },

  // SuperAdmin-only:
  { tag: 'super',     lev: 1,  name: 'admin',    icon: 'red bomb',   hdr: 'SuperAdmin',        el: fpSuperAdmin,    superAdminOnly: true  } // ALWAYS SuperAdmin
]

const defaultPanelViewIndex = 0
const DEFAULT_FLEXPANEL_FEATURELEVEL = expectedToolbars.getDefaultLevel('FlexPanel')

export default FlexPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user
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
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
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
      fpFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('FlexPanel')),
      meteorStatus:   Meteor.status() 
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
    const { meteorStatus } = this.data
    
    if ((tag === 'network') && (!meteorStatus || !meteorStatus.connected ))
      return { backgroundColor: 'rgba(255,0,0,0.2)' }

    return {}       // wiggleActivity is done as a class, so it's not in this function. See render()
  },

  getFpButtonSpecialClassForTag: function(tag) {
    const { joyrideSteps } = this.props
    const { wiggleActivity } = this.state

    if (tag === 'activity' && wiggleActivity)
      return ' green animated swing '

    if (tag === 'goals' && joyrideSteps && joyrideSteps.length > 0)
      return ' green animated swing '

    return ''
  },

  getFpButtonAutoShowForTag: function(tag) {
    const { meteorStatus } = this.data
    
    if ((tag === 'network') && (!meteorStatus || !meteorStatus.connected ))
      return true

    return false
  },

  render: function () {
    const { flexPanelWidth, flexPanelIsVisible } = this.props

    const fpFeatureLevel = this.data.fpFeatureLevel || DEFAULT_FLEXPANEL_FEATURELEVEL
    const panelStyle = {
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

    const miniNavStyle = {// This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel
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
      bottom:       '0px',
      right:        '60px',
      width:        '285px',
      overflowY:    'scroll'
    }

    const panelInnerStyle = {
      padding:      '10px',
      paddingBottom: '24px',
      height:       'auto'
    }

    const flexPanelChoice = this._getSelectedFlexPanelChoice()
    const flexPanelHdr = flexPanelChoice.hdr
    const flexPanelIcon = flexPanelChoice.icon
    const ElementFP = (!this.props.isSuperAdmin && flexPanelChoice.superAdminOnly) ? null : flexPanelChoice.el

    if (flexPanelIsVisible && ElementFP !== null)
      joyrideCompleteTag(`mgbjr-CT-flexPanel-${flexPanelChoice.tag}-show`)

    return  (
      <div className="basic segment mgbFlexPanel" style={panelStyle}>
        { flexPanelIsVisible &&
          <div className='animated fadeInRight' style={{animationFillMode: "none"} /*animation fill mode breaks flex panel on ff and mobile chrome (samsung) */ }>

            <div className="flex header">
              <span className="title">
                <i className={flexPanelIcon + " icon"} />&nbsp;&nbsp;{flexPanelHdr}
              </span>
            </div>

            <div style={panelScrollContainerStyle}>
              <div style={panelInnerStyle}>
                { !ElementFP ? <div className="ui fluid label">TODO: {flexPanelHdr} FlexPanel</div> :
                  <ElementFP
                      currUser={this.props.currUser}
                      currUserProjects={this.props.currUserProjects}
                      user={this.props.user}
                      meteorStatus={this.data.meteorStatus}
                      joyrideSteps={this.props.joyrideSteps}
                      joyrideSkillPathTutorial={this.props.joyrideSkillPathTutorial}
                      joyrideOriginatingAssetId={this.props.joyrideOriginatingAssetId}
                      joyrideCurrentStepNum={this.props.joyrideCurrentStepNum}
                      activity={this.props.activity}
                      panelWidth={this.props.flexPanelWidth}
                      isSuperAdmin={this.props.isSuperAdmin}
                      subNavParam={this.getSubNavParam()}
                      handleChangeSubNavParam={this.handleChangeSubNavParam}
                      />
                }
              </div>
            </div>

          </div>
        }
        <div id='mgbjr-flexPanelIcons' className="ui attached vertical icon menu" style={miniNavStyle} >
          { flexPanelViews.map(v => {
            const active = this._viewTagMatchesPropSelectedViewTag(v.tag) ? " active selected " : ""
            if (v.lev > fpFeatureLevel && this.getFpButtonAutoShowForTag(v.tag) !== true)
              return null
            if (v.superAdminOnly && !this.props.isSuperAdmin) 
              return null

            const specialSty = this.getFpButtonSpecialStyleForTag(v.tag)
            const specialClass = this.getFpButtonSpecialClassForTag(v.tag)
            
            return (
              <div
                id={`mgbjr-flexPanelIcons-${v.tag}`}
                key={v.tag}
                style={specialSty}
                className={active +  " item"}
                title={v.name}
                onClick={this.fpViewSelect.bind(this, v.tag)}>
                <i className={v.icon + specialClass + " large icon"}></i>
                <span>{v.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})
