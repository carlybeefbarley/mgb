import React, { PropTypes } from 'react';
import QLink, { utilPushTo } from '../../routes/QLink';
import { logActivity } from '../../schemas/activity';

export default npUser = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },


  logout: function() {
    let userName = Meteor.user().profile.name
    logActivity("user.logout",  `Logging out "${userName}"`, null, null);         

    Meteor.logout();
    utilPushTo(this.context.urlLocation.query, "/");
  },

  render: function () {    
    const {currUser} = this.props;

    return (
      <div className="ui vertical inverted fluid menu">
        { currUser ?
          <div>
            <div className="ui item" key="authHdr">
              <h3 className="ui inverted header" style={{textAlign: "center"}}>
                <i className="user icon" />
                {currUser.profile.name}
              </h3>
              <img className="ui centered small image" src={currUser.profile.avatar} />
            </div>
            <QLink to={`/u/${this.props.currUser.profile.name}`} className="item">
              <i className="user icon" /> My Profile
            </QLink>
            <QLink to={`/u/${this.props.currUser.profile.name}/assets`} className="item">
              <i className="pencil icon" /> My Assets
            </QLink>
            <QLink to={`/u/${this.props.currUser.profile.name}/projects`} className="item">
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
            <div className="ui item" key="authHdr">
              <h3 className="ui inverted header" style={{textAlign: "center"}}>
                <i className="user icon" />
                Login
              </h3>
            </div>,
            <QLink to="/signin" className="item" key="login">Login</QLink>,
            <QLink to="/join" className="item" key="join">Join</QLink>
          ]
        }
      </div>
    );
  }

  
})