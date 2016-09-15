import _ from 'lodash'
import React, { PropTypes } from 'react'

import fpFeatureLevels from './fpFeatureLevels'
import fpSuperAdmin from './fpSuperAdmin'
import fpActivity from './fpActivity'
import fpNetwork from './fpNetwork'
import fpAssets from './fpAssets'
import fpUsers from './fpUsers'
import fpChat from './fpChat'
import fpGoals_Z2 from './fpGoals_Z2'

import style from './FlexPanel_Z2.css' // TODO(nico): get rid of this css

const flexPanelViews = [
  //{ tag: "chat",  name: "chat",  icon: "chat",    el: fpGoals_Z2 },
  //{ tag: "goals", name: "goals", icon: "student", el: fpGoals_Z2 },
  { tag: "activity",  name: "activity", icon: "lightning",  hdr: "Activity",        el: fpActivity,      superAdminOnly: false },
  { tag: "assets",    name: "assets",   icon: "pencil",     hdr: "Assets",          el: fpAssets,        superAdminOnly: false },
  { tag: "users",     name: "users",    icon: "users",      hdr: "Users",           el: fpUsers,         superAdminOnly: false },
  { tag: "chat",      name: "chat",     icon: "chat",       hdr: "Chat",            el: fpChat,          superAdminOnly: false },
  { tag: "features",  name: "options",  icon: "options",    hdr: "Feature Levels",  el: fpFeatureLevels, superAdminOnly: false },
  { tag: "super",     name: "admin",    icon: "red bomb",   hdr: "SuperAdmin",      el: fpSuperAdmin,    superAdminOnly: true  },
  { tag: "network",   name: "network",  icon: "red signal", hdr: "Network",         el: fpNetwork,       superAdminOnly: true  }, // SuperAdmin while being tested
  { tag: "goals",     name: "goals",    icon: "red student",hdr: "Goals",           el: fpGoals_Z2,      superAdminOnly: true  }, // SuperAdmin while being tested
]

const defaultPanelViewIndex = 0


export default FlexPanel = React.createClass({

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the flexPanelViews.tags values (or validtagkeyhere.somesuffix)
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelIsVisible:     PropTypes.bool.isRequired,
    handleFlexPanelToggle:  PropTypes.func.isRequired,    // Callback for enabling/disabling FlexPanel view
    handleFlexPanelChange:  PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    flexPanelWidth:         PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
  },


  statics: {
    getDefaultPanelViewTag: function() { return flexPanelViews[defaultPanelViewIndex].tag }
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
    const panelStyle = {
      position: "fixed",
      right: "0px",
      top: "0px",
      minHeight: "600px",
      marginLeft: "0px",

      bottom: "0px",
      width: flexPanelWidth,
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      borderLeft: "1px solid rgba(0, 0, 0, 0.1)",
    }

    const miniNavStyle = {// This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel
      position: "fixed",
      top: "0px",
      bottom: "0px",
      right: "0px",
      width: "61px",
      border: "none",
      borderLeft: "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: 0,
      marginBottom: 0,
      backgroundColor: "none",
    }

    const panelScrollContainerStyle = {
      position: "fixed",
      top: "50px",                /// TODO calculate this
      bottom: "0px",
      right: "60px",
      width: "285px",
      overflowY: "scroll",
    }

    const panelInnerStyle = {
      padding: "10px",
      paddingBottom: "24px",
      height: "auto"
    }

    const flexPanelChoice = this._getSelectedFlexPanelChoice()
    const flexPanelHdr = flexPanelChoice.hdr
    const flexPanelIcon = flexPanelChoice.icon
    const ElementFP = (!this.props.isSuperAdmin && flexPanelChoice.superAdminOnly) ? null : flexPanelChoice.el

    return  <div className="basic segment mgbFlexPanel" style={panelStyle}>

              { flexPanelIsVisible &&
                <div>

                  <div className="flex header">
                    <span className="title">
                      <i className={flexPanelIcon + " icon"} />&nbsp;&nbsp;{flexPanelHdr}
                    </span>
                  </div>

                  <div style={panelScrollContainerStyle}>
                    <div style={panelInnerStyle}>
                      { !ElementFP ? <div className="ui fluid label">TODO: {flexPanelHdr} FlexPanel</div> :
                        <ElementFP  currUser={this.props.currUser}
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
              <div className="ui attached vertical icon menu" style={miniNavStyle}>
                { flexPanelViews.map(v => {
                  const active = this._viewTagMatchesPropSelectedViewTag(v.tag) ? " active selected " : ""
                  return (v.superAdminOnly && !this.props.isSuperAdmin) ? null :
                    <div
                      key={v.tag}
                      className={active + " item"}
                      title={v.name}
                      onClick={this.fpViewSelect.bind(this, v.tag)}>
                      <i className={v.icon + " large icon"}></i>
                      <span>{v.name}</span>
                    </div>
                  })
                }
              </div>
            </div>
  }

})
