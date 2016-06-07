import React, {Component, PropTypes} from 'react';
import {Link, browserHistory} from 'react-router';
import {logActivity} from '../../schemas/activity';
import NavRecentGET from './NavRecentGET.js';
import WhatsNew from './WhatsNew.js';

export default Nav = React.createClass({
  
  propTypes: {
    user: PropTypes.object,                             // TODO: Rename this currUser since that would be consistent with usage elsewhere
    handleFlexPanelToggle: PropTypes.func.isRequired,   // Callback for changing view. Causes URL to update
    flexPanelIsVisible: PropTypes.bool.isRequired,
    flexPanelWidth: PropTypes.string.isRequired,        // Typically something like "200px".
    handleToggleSidebar: PropTypes.func.isRequired,     // Callback to allow Sidebar to show/hide
    name: PropTypes.string                              // Page title to show in Nav bar // TODO: Replace this with something more useful
  },

  logout: function() {
    let userName = Meteor.user().profile.name
    logActivity("user.login",  `Logging out "${userName}"`, null, null);         

    Meteor.logout();
    browserHistory.push(`/`);
  },
  
  /** This is called when the WhatsNew popup has been clicked and shown. 
   *  We are to note the current timestamp of the latest release in the user profile 
   */
  handleUserSawNews: function(latestNewsTimestampSeen)
  {
    let user = this.props.user
    
    if (user && user.profile.latestNewsTimestampSeen !== latestNewsTimestampSeen)
    {      
      Meteor.call('User.updateProfile', user._id, {
        "profile.latestNewsTimestampSeen": latestNewsTimestampSeen
      }, (error) => {
        if (error)
          console.log("Could not update profile with news timestamp")      
      });      
      
    }
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
          <a href="#" className="header item" onClick={this.props.handleToggleSidebar}>
            <i className="sidebar icon" ></i>
          </a>

          <WhatsNew user={this.props.user} userSawNewsHandler={this.handleUserSawNews}/>
          
          <div className="item">
            {this.props.name}
          </div>
          
          
          { /* Right Hand Side */ }
          <Link to={user ? `/user/${user._id}/assets`: '/assets'} className="item right">
            <i className="home icon"></i>
          </Link>
          
          
          { user ?
            // If signed in, show Profile, Logout choices as  | username |   dropdown
            [
              <div className="ui simple dropdown author item" key="dropdown" style={{paddingTop: "0px", paddingBottom: "0px"}}>
                <img  className="ui avatar image" 
                      src={user.profile.avatar}>
                </img> 
                &nbsp;{user.profile.name} 
                <i className="dropdown icon"></i>
                <div className="menu simple">
                  <Link to={`/user/${this.props.user._id}`} className="item">
                    <i className="user icon" /> Profile
                  </Link>
                  <Link to={`/user/${this.props.user._id}/assets`} className="item">
                    <i className="home icon" /> My Assets
                  </Link>
                  <Link to={`/user/${this.props.user._id}/projects`} className="item">
                    <i className="sitemap icon" /> My Projects
                  </Link>
                  <div className="divider"></div>
                  <a href="#" onClick={this.logout} className="ui item">
                    <i className="sign out icon" /> Logout
                  </a>
                </div>
              </div>
            ]
            :
            // If signed out, show   | Sign-in, Join |  options inline
            [
              <Link to="/signin" className="item"  key="signin">Login</Link>,
              <Link to="/join" className="item"  key="join">Join</Link>
            ]
          }
          { !this.props.flexPanelIsVisible && 
            <a className="header item" onClick={this.props.handleFlexPanelToggle}>
              <i  className={"chevron " + (this.props.flexPanelIsVisible ? "right" : "left") +" icon"}></i>
            </a>
          }
          <div style={{width: this.props.navPanelWidth}} />

        </div>
    );
  }
})
