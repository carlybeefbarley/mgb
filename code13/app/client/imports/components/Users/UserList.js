import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Card } from 'semantic-ui-react'
import UserCard from './UserCard'

const sortByNumBadgesFn = u => (u.badges ? -u.badges.length : 0)

const UserList = ({ users, narrowItem, handleClickUser }) => (
  <Card.Group>
    {_.map(_.sortBy(users, sortByNumBadgesFn), user => (
      <UserCard key={user._id} user={user} narrowItem={narrowItem} handleClickUser={handleClickUser} />
    ))}
  </Card.Group>
)

UserList.propTypes = {
  users: PropTypes.array, // Array of Users objects to be rendered
  narrowItem: PropTypes.bool, // if true, this is narrow format (e.g flexPanel)
  handleClickUser: PropTypes.func, // Optional. If provided, call this with the userId instead of going to the user Profile Page
}

export default UserList
