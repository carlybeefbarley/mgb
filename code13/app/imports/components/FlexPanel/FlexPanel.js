import React, { PropTypes } from 'react';
import fpNavigate from './fpNavigate';
import fpActivity from './fpActivity';


const flexPanelViews = [
  { tag: "nav",       icon: "compass",    hdr: "Navigate",  el: fpNavigate },
  { tag: "activity",  icon: "lightning",  hdr: "Activity",  el: fpActivity },
  { tag: "focuser",   icon: "university", hdr: "Focuser"    },
  { tag: "users",     icon: "users",      hdr: "Users"    },
  { tag: "pins",      icon: "pin",        hdr: "Pins"     },
  { tag: "chat",      icon: "chat",       hdr: "Chat"     },
  { tag: "assets",    icon: "pencil",     hdr: "Assets"   },
  { tag: "projects",  icon: "sitemap",    hdr: "Projects" }
]

// TODO 0   Implement Activity FlexPanel (simply for now)
// TODO 1   Implement Nav FlexPanel (simply for now)
// TODO 2   Implement Assets FlexPanel (simply for now)
// TODO 3   IMPLEMENT DragAndDrop interface for fpNavigate
// TODO 4   Update all links to preserve app-level query params!

export default FlexPanel = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    selectedViewTag:        PropTypes.string,             // One of the flexPanelViews.tags values
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelIsVisible:     PropTypes.bool.isRequired,
    handleFlexPanelToggle:  PropTypes.func.isRequired,    // Callback for changing view. Causes URL to update
    handleFlexPanelChange:  PropTypes.func.isRequired,    // Callback to change pane - records it in URL
    flexPanelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  getDefaultState: function()
  {
    return {
      selectedViewTag: "chat"
    }
  },

    
  fpViewSelect(fpViewTag)
  {
    this.props.handleFlexPanelChange(fpViewTag)
  },  
  
    
  render: function () {    
    const {flexPanelWidth} = this.props
    const panelStyle = {
      position: "absolute", 
      right: "0px", 
      top: "0px", 
      minHeight: "600px", 
      height: "100%",
      width: flexPanelWidth, 
      backgroundColor: "#ddd"
    }
      
    const miniNavStyle = {
      borderRadius: 0, 
      marginLeft: "1px", 
      width: flexPanelWidth, 
      marginBottom: 0
    }
    
    const panelInnerStyle = {
      padding: "4px"
    }
    
    // The the flex Panel choice isn't recognized, just default to using our first one
    const flexPanelChoice = _.find(flexPanelViews, ['tag', this.props.selectedViewTag]) || flexPanelViews[0]
    const flexPanelHdr = flexPanelChoice.hdr      
    const flexPanelIcon = flexPanelChoice.icon 
    const ElementFP = flexPanelChoice.el    // Can be null
      
    return  <div className="basic segment" style={panelStyle}>
              <div className="ui attached inverted menu" style={miniNavStyle}>
                <div className="ui simple dropdown item" key="dropdown">
                  <i className="chevron down icon" ></i>
                  <div className="menu simple">
                    { flexPanelViews.map(v => { 
                        return  <div 
                                  key={v.tag}
                                  className="item" 
                                  onClick={this.fpViewSelect.bind(this, v.tag)}>
                                  <i className={v.icon + " icon"} /> {v.hdr}
                                </div>
                        })
                    }
                  </div>
                </div>
                <div className="ui borderless right floated item">
                  <i className={flexPanelIcon + " icon"} /> {flexPanelHdr}
                </div>
                <a className="ui right floated item" onClick={this.props.handleFlexPanelToggle}>
                  <i  className={"chevron " + (this.props.flexPanelIsVisible ? "right" : "left") +" icon"}></i>
                </a>               
              </div>
              <div style={panelInnerStyle}>
                
                { !ElementFP ? <div className="ui label">TODO: {flexPanelHdr} FlexPanel</div> : 
                  <ElementFP  currUser={this.props.currUser} 
                            user={this.props.user} 
                            activity={this.props.activity}
                            flexPanelWidth={this.props.flexPanelWidth} /> 
                }
              </div>
            </div>  
  }
  
})