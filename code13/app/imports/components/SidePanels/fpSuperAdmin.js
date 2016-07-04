import React, { PropTypes } from 'react';

export default fpSuperAdmin = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },

  render: function () {    
    return  <div>
              <div className="ui header">MAD POWERS</div>
              <div className="ui sub header">...COMING SOON...</div>
            </div>
  }  
})