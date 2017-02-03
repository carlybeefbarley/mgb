import React, { PropTypes, Component } from 'react'
import { showToast } from '/client/imports/routes/App'

import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'


export default UserBashes = React.createClass({

  propTypes: {
    params: PropTypes.object,           // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,             // Maybe absent if route is /assets
    currUser: PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array, 
    ownsProfile: PropTypes.bool,
    location: PropTypes.object          // We get this from react-router
  },

  render: function(){
    return (
      <div>
        <h1>Testing 4th and 5th of February</h1>
        For those who want code there is a list of simple examples of concepts:
        <br/>
        <b>Basics</b>
        <ul>
          <li>example link</li>
        </ul>
      </div>
    )
  },

})