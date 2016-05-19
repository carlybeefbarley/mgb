import React, {Component, PropTypes} from 'react';
import {Link, browserHistory} from 'react-router';
import {logActivity} from '../../schemas/activity';
import NavRecent from './NavRecent.js';
import WhatsNew from './WhatsNew.js';

export default Nav = React.createClass({
  
  propTypes: {
    user: PropTypes.object
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
    
    return (
      <div className="ui attached inverted menu">
          <a href="#" className="header item" onClick={this.props.handleToggleSidebar}>
            <i className="sidebar icon" ></i>
          </a>

          <WhatsNew user={this.props.user} userSawNewsHandler={this.handleUserSawNews}/>
          
          <div className="item">
            {this.props.name}
          </div>
          
          
          { /* Right Hand Side */ }
          <Link to={user ? `/user/${user._id}/assets`: '/assets'} className="item right">
            <i className="search icon"></i>
          </Link>
          
          
          { user ?
            // If signed in, show Profile, Logout choices as  | username |   dropdown
            [
              <NavRecent user={this.props.user} key="navr"/>,
              <div className="ui simple dropdown item" key="dropdown">
                {user.profile.name} <i className="dropdown icon"></i>
                <div className="menu simple">
                  <Link to={`/user/${this.props.user._id}`} className="item">
                    <i className="user icon" /> Profile
                  </Link>
                  <Link to={`/user/${this.props.user._id}/assets`} className="item">
                    <i className="pencil icon" /> My Assets
                  </Link>
                  <a href="#" onClick={this.logout} className="ui item">
                    <i className="sign out icon" /> Logout
                  </a>
                </div>
              </div>,
              <img src={user.profile.avatar} className="ui circular image floated" key="avatar"></img>
            ]
            :
            // If signed out, show   | Sign-in, Join |  options inline
            [
              <Link to="/signin" className="item"  key="signin">Login</Link>,
              <Link to="/join" className="item"  key="join">Join</Link>
            ]
          }
        </div>
    );
  }
})
