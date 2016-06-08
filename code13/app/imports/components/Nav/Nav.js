import React, {Component, PropTypes} from 'react';
import { browserHistory } from 'react-router';
import QLink from "../../routes/QLink";
import {logActivity} from '../../schemas/activity';
import NavRecentGET from './NavRecentGET.js';
import WhatsNew from './WhatsNew.js';

export default Nav = React.createClass({
  
  propTypes: {
    user: PropTypes.object,                             // TODO: Rename this currUser since that would be consistent with usage elsewhere
    handleFlexPanelToggle: PropTypes.func.isRequired,   // Callback for changing view. Causes URL to update
    flexPanelIsVisible: PropTypes.bool.isRequired,
    flexPanelWidth: PropTypes.string.isRequired,        // Typically something like "200px".
    name: PropTypes.string                              // Page title to show in Nav bar // TODO: Replace this with something more useful
  },

  

  render: function() {
    const user = this.props.user;
    
    const sty = {
      borderRadius: "0px", 
      marginRight: this.props.flexPanelWidth,
      marginLeft: this.props.navPanelWidth,
      marginBottom: "0px"
    }
    
    return (
      <div className="ui attached inverted menu" style={sty}>

          <WhatsNew user={this.props.user}/>
          
          <div className="item">
            {this.props.name}
          </div>
         
          { !this.props.flexPanelIsVisible && 
            <a className="header item right" onClick={this.props.handleFlexPanelToggle}>
              <i  className={"chevron " + (this.props.flexPanelIsVisible ? "right" : "left") +" icon"}></i>
            </a>
          }
          <div style={{width: this.props.navPanelWidth}} />

        </div>
    );
  }
})
