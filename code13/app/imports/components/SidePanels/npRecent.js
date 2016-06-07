import React, { PropTypes } from 'react';
import QLink from '../../routes/QLink';
import NavRecentGET from '../Nav/NavRecentGET.js';

export default npRecent = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },


  render: function () {    
    const {currUser} = this.props;

    return (
      <NavRecentGET user={currUser}/>
    )
  }

  
})