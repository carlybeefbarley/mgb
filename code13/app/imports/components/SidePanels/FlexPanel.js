import React, { PropTypes } from 'react';
import fpActivity from './fpActivity';
import fpAssets from './fpAssets';
import fpUsers from './fpUsers';
import fpChat from './fpChat';
import fpSuperAdmin from './fpSuperAdmin';


const flexPanelViews = [
  { tag: "activity",  icon: "lightning",  hdr: "Activity",   el: fpActivity,   superAdminOnly: false },
  { tag: "assets",    icon: "pencil",     hdr: "Assets",     el: fpAssets,     superAdminOnly: false },
  { tag: "users",     icon: "users",      hdr: "Users",      el: fpUsers,      superAdminOnly: false },
  { tag: "chat",      icon: "chat",       hdr: "Chat",       el: fpChat,       superAdminOnly: false },
  { tag: "super",     icon: "red bomb",   hdr: "SuperAdmin", el: fpSuperAdmin, superAdminOnly: true }
]

export default FlexPanel = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the flexPanelViews.tags values
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelIsVisible:     PropTypes.bool.isRequired,
    handleFlexPanelToggle:  PropTypes.func.isRequired,    // Callback for enabling/disabling FlexPanel view
    handleFlexPanelChange:  PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    flexPanelWidth:         PropTypes.string.isRequired,  // Typically something like "200px". 
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
  },


  getDefaultState: function()
  {
    return {
      selectedViewTag: "activity"
    }
  },

    
  fpViewSelect(fpViewTag)
  {
    const P = this.props
    if (P.flexPanelIsVisible && P.selectedViewTag === fpViewTag)
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
      backgroundColor: "#ddd"
    }
      
    const miniNavStyle = {// This is the Rightmost column of the FlexPanel (just icons, always shown). It is logically nested within the outer panel 
      position: "fixed",
      top: "0px",
      bottom: "0px",
      right: "0px",
      width: "45px", 

      borderRadius: 0, 
      marginBottom: 0
    }

    const panelScrollContainerStyle = {
      position: "fixed",
      top: "40px",                /// TODO calculate this 
      bottom: "0px",
      right: "45px",
      width: "225px", 
      overflow: "scroll"
    }
    
    const panelInnerStyle = {
      padding: "8px",
      paddingBottom: "24px",
      height: "auto" 
    }
    
    // If the FlexPanel choice isn't recognized, just default to using our first one
    const flexPanelChoice = _.find(flexPanelViews, ['tag', this.props.selectedViewTag]) || flexPanelViews[0]
    const flexPanelHdr = flexPanelChoice.hdr      
    const flexPanelIcon = flexPanelChoice.icon 
    const ElementFP = (!this.props.isSuperAdmin && flexPanelChoice.superAdminOnly) ? null : flexPanelChoice.el
      
    return  <div className="basic segment mgbFlexPanel" style={panelStyle}>
    
              { flexPanelIsVisible && 
                <div>

                  <div className="ui grey attached inverted menu" >
                    <div className="ui borderless item">
                      <i className={flexPanelIcon + " icon"} /> {flexPanelHdr}
                    </div>
                  </div>

                  <div style={panelScrollContainerStyle}>
                    <div style={panelInnerStyle}>           
                      { !ElementFP ? <div className="ui fluid label">TODO: {flexPanelHdr} FlexPanel</div> : 
                        <ElementFP  currUser={this.props.currUser} 
                                  user={this.props.user} 
                                  activity={this.props.activity}
                                  panelWidth={this.props.flexPanelWidth} 
                                  isSuperAdmin={this.props.isSuperAdmin}
                                  /> 
                      }
                    </div>
                  </div>

                </div>
              }
              <div className="ui grey inverted attached borderless vertical icon menu" style={miniNavStyle}>
                { flexPanelViews.map(v => { 
                  const actv = (v.tag===this.props.selectedViewTag) ? " active " : ""
                  return  (v.superAdminOnly && !this.props.isSuperAdmin) ? null : 
                    <div 
                          key={v.tag}
                          className={actv + "item"} 
                          title={v.hdr}
                          onClick={this.fpViewSelect.bind(this, v.tag)}>
                      <i className={v.icon + " icon"} />
                  </div>
                  })
                }
              </div>

            </div>  
  }
  
})