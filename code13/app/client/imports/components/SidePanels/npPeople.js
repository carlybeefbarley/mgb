import _ from 'lodash';
import React, { PropTypes } from 'react';
import QLink from '/client/imports/routes/QLink';

export default npPeople = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },

  render: function () {    
    return (
      <div className="ui vertical inverted fluid menu">
        <div className="ui item" key="authHdr">
          <h3 className="ui inverted header" style={{textAlign: "center"}}>
            <i className="users icon" />
            People
          </h3>
        </div>
        <QLink to="/users" className="item">
          <i className="users icon" /> All Users
        </QLink>
        <QLink to="/assets" className="item">
          <i className="pencil icon" /> All Assets
        </QLink>
      </div>
    )
  }
})