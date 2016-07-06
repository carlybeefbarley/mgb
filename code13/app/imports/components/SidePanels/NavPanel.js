import React, { PropTypes } from 'react';
import npHome from './npHome';
import npUser from './npUser';
import npPeople from './npPeople';
import npHistory from './npHistory';
import npProjects from './npProjects';


const navPanelViews = [
  { tag: "home",      icon: "home",       hdr: "Home",      el: npHome,     hideIfNoUser: false  },
  { tag: "user",      icon: "user",       hdr: "User",      el: npUser,     hideIfNoUser: false  },
  { tag: "history",   icon: "history",    hdr: "History",   el: npHistory,  hideIfNoUser: true   },
//{ tag: "pins",      icon: "pin",        hdr: "Pins",      el: npPins,     hideIfNoUser: true   },
  { tag: "projects",  icon: "sitemap",    hdr: "Projects",  el: npProjects, hideIfNoUser: true  },
  { tag: "people",    icon: "users",      hdr: "People",    el: npPeople,   hideIfNoUser: false  }

  // { tag: "skills",    icon: "university", hdr: "Skills" }
]

const defaultPanelViewIndex = 0

export default NavPanel = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:       PropTypes.array,              // Projects list for currently logged in user
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the navPanelViews.tags values
    navPanelIsVisible:      PropTypes.bool.isRequired,
    handleNavPanelToggle:   PropTypes.func.isRequired,    // Callback for enabling/disabling NavPanel view
    handleNavPanelChange:   PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    navPanelWidth:          PropTypes.string.isRequired,  // Typically something like "200px". 
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
  },

  statics: {
    getDefaultPanelViewTag: function() { return navPanelViews[defaultPanelViewIndex].tag }
  },

  npViewSelect(npViewTag)
  {
    if (npViewTag === this.props.selectedViewTag)
      this.props.handleNavPanelChange("-" + npViewTag)
    else 
      this.props.handleNavPanelChange(npViewTag)
  },  


  render: function () {    
    const { navPanelWidth } = this.props
    const panelStyle = {    // This is the overall NavPanel with either just the first column (just icons, always shown), or 1st and 2nd columns
      position: "fixed", 
      left: "0px", 
      top: "0px", 
      bottom: "0px",
      width: navPanelWidth, 
      backgroundColor: "#000"
    }
      
    const miniNavStyle = {  // This is the First column of the NavPanel (just icons, always shown). It is logically nested within the outer panel 
      position: "fixed",
      top: "0px",
      bottom: "0px",
      left: "0px",
      width: "60px", 
      borderRadius: 0, 
      marginRight: "1px", 
      marginBottom: "0px"
    }

    const panelScrollContainerStyle = {
      position: "absolute", 
      left: "62px", 
      right: "2px",
      top: "0px", 
      bottom: "0px",
      paddingTop: "8px",
      backgroundColor: "#1b1c1d",       // TODO: Use the less variables from the .ui.inverted.menu style, or see how to stretch this with semanticUI
      overflowY: "crop" 
    }
    
    const miniNavItemStyle = {
      borderRadius: "0px"           // Otherwise active first-item / last-item is rounded
    }
        
    // If the nav Panel choice isn't recognized, just default to using our 'default' one
    const navPanelChoice = _.find(navPanelViews, ['tag', this.props.selectedViewTag]) || navPanelViews[defaultPanelViewIndex]
    const navPanelHdr = navPanelChoice.hdr      
    const ElementNP = navPanelChoice.el    // Can be null
      
    return  <div className="basic segment mgbNavPanel" style={panelStyle}>
    
              <div className="ui inverted attached borderless vertical big icon menu" style={miniNavStyle}>
                { navPanelViews.map(v => { 
                  if (v.hideIfNoUser && !this.props.currUser)
                    return null
                  const actv = (v.tag===this.props.selectedViewTag) ? " active " : ""
                  return  <div 
                            key={v.tag}
                            className={actv + "item"} 
                            style={miniNavItemStyle}
                            onClick={this.npViewSelect.bind(this, v.tag)}>
                            <i className={v.icon + actv + " big icon"} />
                          </div>
                  })
                }
              </div>

              { this.props.navPanelIsVisible && 
                <div style={panelScrollContainerStyle}>
                  { !ElementNP ? <div className="ui fluid label">TODO: {navPanelHdr} navPanel</div> : 
                    <ElementNP  currUser={this.props.currUser} 
                                currUserProjects={this.props.currUserProjects}
                                user={this.props.user} 
                                panelWidth={this.props.navPanelWidth} /> 
                  }
                </div>
              }
            </div>  
  }
  
})
