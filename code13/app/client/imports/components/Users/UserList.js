import React, { PropTypes } from 'react'
import UserItem from './UserItem'


import { List } from 'semantic-ui-react'

const UserList = ( { users, narrowItem, handleClickUser } ) => (  
  <List relaxed divided animated verticalAlign='middle'>
    {
      users.map(user => (
        <UserItem
            key={user._id}
            user={user}
            narrowItem={narrowItem}
            handleClickUser={handleClickUser} />
      ))
    }
  </List>
)

UserList.propTypes = {
  users:            PropTypes.array,      // Array of Users objects to be rendered
  narrowItem:       PropTypes.bool,       // if true, this is narrow format (e.g flexPanel)
  handleClickUser:  PropTypes.func        // Optional. If provided, call this with the userId instead of going to the user Profile Page
}

export default UserList