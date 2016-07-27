import _ from 'lodash';
import React, { PropTypes } from 'react';
import NavRecentGET from '../Nav/NavRecentGET.js';

export default npHistory = React.createClass({
  
  propTypes: {
    currUser:           PropTypes.object              // Currently Logged in user. Can be null/undefined
  },

  render: function () {    
    return (
      <NavRecentGET 
        styledForNavPanel={true} 
        currUser={this.props.currUser} />
    )
  }  
})