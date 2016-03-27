import React, { PropTypes } from 'react';
import UserItem from './UserItem.js';

export default UserList = React.createClass({
  propTypes: {
    users: React.PropTypes.array
  },

  render: function() {
    
    let users = this.props.users.map((user) => {
      let email = user.emails && user.emails[0].address ? user.emails[0].address : 'None@none.com';
      
      return (
        <UserItem
          key={user._id}
          _id={user._id}
          name={user.profile.name}
          createdAt={user.createdAt}
          avatar={user.profile.avatar} />
      );
    })
    return (
      <div className="ui middle aligned divided relaxed animated list">
        {users}
      </div>
    );
  }
})
