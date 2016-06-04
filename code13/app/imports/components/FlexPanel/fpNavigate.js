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
    const {currUser} = this.props;
    const userContent = !!currUser ?
      (
        <div className="item">
          <div className="header">My stuff</div>
            <div className="menu">
              <Link to={`/user/${currUser._id}/assets`} className="item">My Assets</Link>
              <Link to={`/user/${currUser._id}/projects`} className="item">My Projects</Link>
          </div>
        </div>
      )
      :
      (
        <div className="item">
          <Link to="/join">Get Started</Link>
        </div>
      );


    return (
      <div className="ui vertical inverted menu">
        <div className="item"><b>My Game Builder</b></div>
        <div className="item">
          <div className="header">Home</div>
          <div className="menu">
            <Link to="/" className="item">Home Page</Link>
          </div>
        </div>
        {userContent}
        <div className="item">
          <div className="header">People</div>
          <div className="menu">
            <Link to="/users" className="item">Users</Link>
            <Link to={`/assets`} className="item">Public Assets</Link>
          </div>
        </div>
      </div>
        );
  }

  
})