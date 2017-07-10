import React from 'react'
import UserListRoute from '/client/imports/routes/Users/UserListRoute'

export default (fpUsers = () => <UserListRoute initialLimit={20} renderVertical />)
