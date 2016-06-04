import React, { PropTypes } from 'react';
import { Link } from 'react-router';

export default fpNavigate = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {
    
    return  <div class="ui row">
              <div className="ui list">
                <div className="item">
                  <i className="home icon"></i>
                  <Link to="/" className="content">Home</Link>
                </div>
                <div className="item">
                  <i className="users icon"></i>
                  <Link to="/users" className="content">Users</Link>
                </div>
                <div className="item">
                  <i className="pencil icon"></i>
                  <Link to="/assets" className="content">All Assets</Link>
                </div>
              </div>
            </div>
    
  }

  
})