import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import UserListRoute from '../../routes/Users/List.js';

export default fpUsers = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    flexPanelWidth:         PropTypes.string.isRequired   // Typically something like "200px". 
  },

  handleClickUser: function(userId, userName)
{},

  render: function () {    
    const {currUser} = this.props;


    return (
           <UserListRoute  
                  handleClickUser={this.handleClickUser}
                  initialLimit={20}
                  renderVertical={true} 
                  hideTitle={true}/>        );
  }

  
})