import React, {Component, PropTypes} from 'react';
import {Link, browserHistory} from 'react-router';
import {logActivity} from '../../schemas/activity';

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

  render: function() {
    const user = this.props.user;
    let back = null
    // this.props.back;
    // if (back === "!user-assets") 
    //   back = user ? ("/user/" + user._id + "/assets") : ("/assets");
    
    return (
      <div className="ui attached inverted menu">
          {back ?
            <Link to={back} className="header item">
              <i className="arrow left icon"  ></i>
            </Link>
              :
            <a href="#" className="header item" onClick={this.props.handleToggleSidebar}>
              <i className="sidebar icon" ></i>
            </a>
          }
          <div className="item">
            {this.props.name}
          </div>
          { user ?
            <Link to={`/user/${this.props.user._id}/assets`} className="item right"><i className="search icon"></i></Link>
            :
            <Link to={`/assets`} className="item right"><i className="search icon"></i></Link>
          }
          

          { user ?
            // If signed in, show Profile, Logout choices as  | username |   dropdown
            [
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
