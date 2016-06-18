import React, { PropTypes } from 'react';
import UserItem from './UserItem.js';

export default UserList = React.createClass({
  propTypes: {
    users: React.PropTypes.array,
    handleClickUser: PropTypes.func   // Optional. If provided, call this with the userId instead of going to the user Profile Page
  },

  render: function() {    
    let users = this.props.users.map((user) => {      
      return (
        <UserItem
          key={user._id}
          _id={user._id}
          name={user.profile.name}
          profileTitle={user.profile.title}
          profileBio={user.profile.bio}
          profileFocusMsg={user.profile.focusMsg}
          profileFocusStart={user.profile.focusStart}
          createdAt={user.createdAt}
          avatar={user.profile.avatar} 
          handleClickUser={this.props.handleClickUser} />
      );
    })
    
    return (
      <div className="ui middle aligned divided relaxed animated list">
        {users}
      </div>
    )
  }
})
