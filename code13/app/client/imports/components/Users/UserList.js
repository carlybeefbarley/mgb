import React, { PropTypes } from 'react'
import UserItem from './UserItem'


import { Card } from 'semantic-ui-react'

const UserList = ( { users, narrowItem, handleClickUser } ) => (  
  <Card.Group animated>
    {
      users.map(user => (
        <UserItem
            key={user._id}
            user={user}
            narrowItem={narrowItem}
            handleClickUser={handleClickUser} />
      ))
    }
  </Card.Group>
)

UserList.propTypes = {
  users:            PropTypes.array,      // Array of Users objects to be rendered
  narrowItem:       PropTypes.bool,       // if true, this is narrow format (e.g flexPanel)
  handleClickUser:  PropTypes.func        // Optional. If provided, call this with the userId instead of going to the user Profile Page
}

export default UserList