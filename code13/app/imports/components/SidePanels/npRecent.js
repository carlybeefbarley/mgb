import React, { PropTypes } from 'react';
import NavRecentGET from '../Nav/NavRecentGET.js';

export default npRecent = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object              // Currently Logged in user. Can be null/undefined
  },

  render: function () {    
    return <NavRecentGET currUser={this.props.currUser}/>
  }  
})