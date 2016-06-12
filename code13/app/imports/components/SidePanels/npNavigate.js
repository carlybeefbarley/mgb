import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import WhatsNew from '../Nav/WhatsNew';
export default npNavigate = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;
    const userContent = !!currUser ?
      (
        <div className="item">
          <div className="header">My stuff</div>
            <div className="menu">
              <QLink to={`/user/${currUser._id}/assets`} className="item">My Assets</QLink>
              <QLink to={`/user/${currUser._id}/projects`} className="item">My Projects</QLink>
          </div>
        </div>
      )
      :
      (
        <div className="item">
          <QLink to="/join">Get Started</QLink>
        </div>
      );


    return (
      <div className="ui vertical attached inverted fluid menu">
        <div className="item"><b>My Game Builder</b></div>
        <div className="item">
          <div className="header">Home</div>
          <div className="menu">
            <QLink to="/" className="item">Home Page</QLink>
            <QLink to="/whatsnew" className="item">
              What's New<WhatsNew currUser={currUser} />
            </QLink>
          </div>
        </div>
        {userContent}
        <div className="item">
          <div className="header">People</div>
          <div className="menu">
            <QLink to="/users" className="item">Users</QLink>
            <QLink to="/assets" className="item">Public Assets</QLink>
          </div>
        </div>
      </div>
        );
  }

  
})