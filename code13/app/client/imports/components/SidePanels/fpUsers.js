import React from 'react'
import UserListRoute from '/client/imports/routes/Users/UserListRoute'

const fpUsers = ({ location }) => <UserListRoute initialLimit={20} renderVertical location={location} />

export default fpUsers
