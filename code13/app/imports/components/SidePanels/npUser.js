import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import { browserHistory } from 'react-router';
import {logActivity} from '../../schemas/activity';

export default npUser = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  logout: function() {
    let userName = Meteor.user().profile.name
    logActivity("user.login",  `Logging out "${userName}"`, null, null);         

    Meteor.logout();
    browserHistory.push(`/`);
  },

  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical inverted fluid menu">
        { currUser ?
          <div>
          
            <div className="ui item" key="authHdr">
              <img className="ui centered small image" src={currUser.profile.avatar} style={{marginTop: "20px"}} />
              <h2 className="ui inverted header" style={{textAlign: "center"}}>{currUser.profile.name}</h2>
            </div>
            <QLink to={`/user/${this.props.currUser._id}`} className="item">
              <i className="user icon" /> My Profile
            </QLink>
            <QLink to={`/user/${this.props.currUser._id}/assets`} className="item">
              <i className="home icon" /> My Assets
            </QLink>
            <QLink to={`/user/${this.props.currUser._id}/projects`} className="item">
              <i className="sitemap icon" /> My Projects
            </QLink>
            <div className="item"></div>
            <a href="#" onClick={this.logout} className="ui item">
              <i className="sign out icon" /> Logout
            </a>
          </div>
          :
          // If signed out, show   | Sign-in, Join |  options inline
          [
            <QLink to="/signin" className="item"  key="signin">Login</QLink>,
            <QLink to="/join" className="item"  key="join">Join</QLink>
          ]
        }
      </div>
    );
  }

  
})