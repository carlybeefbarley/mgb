import React, { PropTypes } from 'react';
import { Link } from 'react-router';


export default fpNavigate = React.createClass({
  
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    flexPanelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },

  render: function () {
    
    return <div class="ui row"><Link to="/">HOME</Link></div>
    
  }

  
})