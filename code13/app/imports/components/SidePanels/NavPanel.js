import React, { PropTypes } from 'react';
import npNavigate from './npNavigate';
import npUser from './npUser';
import npUsers from './npUsers';
import npRecent from './npRecent';


const navPanelViews = [
  { tag: "nav",       icon: "compass",    hdr: "Navigate",  el: npNavigate },
  { tag: "user",      icon: "user",       hdr: "User",      el: npUser     },
  { tag: "users",     icon: "users",      hdr: "Users",     el: npUsers    },
  { tag: "recent",    icon: "time",       hdr: "Recent",    el: npRecent   }

  // { tag: "projects",  icon: "sitemap",    hdr: "Projects" },
  // { tag: "skills",    icon: "university", hdr: "Skills" }
]


export default NavPanel = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the navPanelViews.tags values
    navPanelIsVisible:      PropTypes.bool.isRequired,
    handleNavPanelToggle:   PropTypes.func.isRequired,    // Callback for enabling/disabling NavPanel view
    handleNavPanelChange:   PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    navPanelWidth:          PropTypes.string.isRequired   // Typically something like "200px". 
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
    const panelStyle = {
      position: "absolute", 
      left: "0px", 
      top: "0px", 
      minHeight: "600px", 
      height: "100%",
      width: navPanelWidth, 
      backgroundColor: "#000"
    }
      
    const miniNavStyle = {
      borderRadius: 0, 
      marginRight: "1px", 
      width: "60px", 
      marginBottom: 0
    }

    const panelScrollContainerStyle = {
      height: "100%", 
      overflow: "scroll"
    }
    
    const panelInnerStyle = {
      position: "absolute", 
      left: "62px", 
      right: "2px",
      top: "0px", 
      minHeight: "600px",       
      height: "auto" 
    }
    
    // If the nav Panel choice isn't recognized, just default to using our first one
    const navPanelChoice = _.find(navPanelViews, ['tag', this.props.selectedViewTag]) || navPanelViews[0]
    const navPanelHdr = navPanelChoice.hdr      
    const ElementNP = navPanelChoice.el    // Can be null
      
    return  <div className="basic segment" style={panelStyle}>
    
              <div className="ui inverted vertical big icon menu" style={miniNavStyle}>
                { navPanelViews.map(v => { 
                  const actv = (v.tag===this.props.selectedViewTag) ? " active " : ""
                  return  <div 
                            key={v.tag}
                            className={actv + "item"} 
                            onClick={this.npViewSelect.bind(this, v.tag)}>
                            <i className={v.icon + actv + " big icon"} />
                          </div>
                  })
                }
              </div>

              { this.props.navPanelIsVisible && 
                <div style={panelScrollContainerStyle}>
                  <div style={panelInnerStyle}>           
                    { !ElementNP ? <div className="ui fluid label">TODO: {navPanelHdr} navPanel</div> : 
                      <ElementNP  currUser={this.props.currUser} 
                                  user={this.props.user} 
                                  panelWidth={this.props.navPanelWidth} /> 
                    }
                  </div>
                </div>
              }
            </div>  
  }
  
})