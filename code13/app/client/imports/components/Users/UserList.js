import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Header } from 'semantic-ui-react'
import UserCard from './UserCard'

const UserList = ({ users, title, narrowItem, handleClickUser }) => (
  <div>
    {title && <Header as="h3">{title}</Header>}
    <Card.Group>
      {_.map(users, user => (
        <UserCard key={user._id} user={user} narrowItem={narrowItem} handleClickUser={handleClickUser} />
      ))}
    </Card.Group>
  </div>
)

UserList.propTypes = {
  users: PropTypes.array, // Array of Users objects to be rendered
  narrowItem: PropTypes.bool, // if true, this is narrow format (e.g flexPanel)
  handleClickUser: PropTypes.func, // Optional. If provided, call this with the userId instead of going to the user Profile Page
}

export default UserList
