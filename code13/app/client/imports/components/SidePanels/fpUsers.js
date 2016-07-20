import React, { PropTypes } from 'react';
import UserListRoute from '/client/imports/routes/Users/List.js';

export default fpUsers = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },

  handleClickUser: function(userId, userName)
  {
    // TODO
  },

  render: function () {    

    return (
           <UserListRoute  
                  handleClickUser={this.handleClickUser}
                  initialLimit={20}
                  renderVertical={true} 
                  hideTitle={true}/>
          )
  }  
})