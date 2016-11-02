import React, { PropTypes } from 'react';
import UserItem from './UserItem.js';

export default UserList = React.createClass({
  propTypes: {
    users:            PropTypes.array,      // Array of Users objects to be rendered
    narrowItem:       PropTypes.bool,       // if true, this is narrow format (e.g flexPanel)
    handleClickUser:  PropTypes.func        // Optional. If provided, call this with the userId instead of going to the user Profile Page
  },


  render: function() {    
    let users = this.props.users.map((user) => {      
      return (
        <UserItem
          key={user._id}
          user={user}
          narrowItem={this.props.narrowItem}
          handleClickUser={this.props.handleClickUser} />
      )
    })
    
    return (
      <div className="ui middle aligned divided relaxed animated list ">
        {users}
      </div>
    )
  }
})
