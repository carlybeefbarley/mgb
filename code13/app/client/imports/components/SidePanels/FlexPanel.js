import _ from 'lodash'
import React, { PropTypes } from 'react'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'


import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { getFeatureLevel } from '/imports/schemas/settings-client'

import fpFeatureLevels from './fpFeatureLevels'
import fpSuperAdmin from './fpSuperAdmin'
import fpActivity from './fpActivity'
import fpKeyboard from './fpKeyboard'
import fpProjects from './fpProjects'
import fpNetwork from './fpNetwork'
import fpAssets from './fpAssets'
import fpGoals from './fpGoals'
import fpUsers from './fpUsers'
import fpChat from './fpChat'

import reactMixin from 'react-mixin'
import { makeLevelKey } from '/client/imports/components/Toolbar/Toolbar'

import style from './FlexPanel.css' // TODO(nico): get rid of this css

const flexPanelViews = [
  { tag: 'activity',  lev: 1,  name: 'activity', icon: 'lightning',  hdr: 'Activity',          el: fpActivity,      superAdminOnly: false },
  { tag: 'assets',    lev: 1,  name: 'assets',   icon: 'pencil',     hdr: 'Assets',            el: fpAssets,        superAdminOnly: false },

  { tag: 'chat',      lev: 1,  name: 'chat',     icon: 'chat',       hdr: 'Chat',              el: fpChat,          superAdminOnly: false },
  { tag: 'features',  lev: 1,  name: 'options',  icon: 'options',    hdr: 'Feature Levels',    el: fpFeatureLevels, superAdminOnly: false },

//{ tag: 'projects',  lev: 2,  name: 'projects', icon: 'sitemap',    hdr: 'Projects',          el: fpProjects,      superAdminOnly: false },
  
  { tag: 'network',   lev: 2,  name: 'network',  icon: 'signal',     hdr: 'Network',           el: fpNetwork,       superAdminOnly: false },
  { tag: 'users',     lev: 3,  name: 'users',    icon: 'street view',hdr: 'Users',             el: fpUsers,         superAdminOnly: false },
  { tag: 'keys',      lev: 4,  name: 'keys',     icon: 'keyboard',   hdr: 'Keyboard Shortcuts',el: fpKeyboard,      superAdminOnly: false },

  // SuperAdmin-only:
  { tag: 'super',     lev: 1,  name: 'admin',    icon: 'red bomb',   hdr: 'SuperAdmin',        el: fpSuperAdmin,    superAdminOnly: true  }, // ALWAYS SuperAdmin
  { tag: 'goals',     lev: 3,  name: 'goals',    icon: 'red student',hdr: 'Goals',             el: fpGoals,         superAdminOnly: true  }  // SuperAdmin while being tested
]

const defaultPanelViewIndex = 0

export default FlexPanel = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
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


  getMeteorData: function() {
    return { fpFeatureLevel: getFeatureLevel(this.context.settings, makeLevelKey('FlexPanel'))}
  },

  componentDidMount: function() {
    registerDebugGlobal( 'fp', this, __filename, 'The global FlexPanel instance')
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
    const P = this.props
    const selectedViewTagParts = this.props.selectedViewTag.split(".")
    const newFullViewTag = selectedViewTagParts[0] + "." + newSubNavParamStr
    P.handleFlexPanelChange(newFullViewTag)
  },

  fpViewSelect(fpViewTag)
  {
    const P = this.props
    if (P.flexPanelIsVisible && this._viewTagMatchesPropSelectedViewTag(fpViewTag))
      P.handleFlexPanelToggle()
    else
      P.handleFlexPanelChange(fpViewTag)
  },


  render: function () {
    const { flexPanelWidth, flexPanelIsVisible } = this.props
    const fpFeatureLevel = this.data.fpFeatureLevel  || 1
    const panelStyle = {
      position:     'fixed',
      right:        '0px',
      top:          '0px',
      minHeight:    '600px',
      marginLeft:   '0px',
      bottom:       '0px',
      width:        flexPanelWidth,
      borderLeft:   '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
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
          <div className='animated fadeInRight' style={{animationFillMode: "none"} /*animation fill breaks flex panel on ff and default samsung browser */ }>

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
            if (v.lev > fpFeatureLevel)
              return null
            if (v.superAdminOnly && !this.props.isSuperAdmin) 
              return null
            return (
              <div
                id={`mgbjr-flexPanelIcons-${v.tag}`}
                key={v.tag}
                className={active + " item"}
                title={v.name}
                onClick={this.fpViewSelect.bind(this, v.tag)}>
                <i className={v.icon + " large icon"}></i>
                <span>{v.name}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})
