import React from 'react'
import UserListRoute from '/client/imports/routes/Users/List.js'

export default fpUsers = () => (
  <UserListRoute  
    initialLimit={20}
    renderVertical={true} 
    hideTitle={true}/>
  )