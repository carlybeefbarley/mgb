import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from './QLink'

// This is designed primarily for the 'extra content' section of Cards

export default QLinkUser = React.createClass({

  propTypes: {
    targetUser:  PropTypes.oneOfType([PropTypes.string, PropTypes.object])     // Can be null
  },


  render: function () {
    const u = this.props.targetUser
    if (!u) return null

    const userName = _.isString(u) ? '@'+u : u.profile.name
    const avatarImg = _.isString(u) ? null : u.profile.avatar
    

    const to = `/u/${userName}`

    return (
      <QLink to={to}>
        <div className="right floated author">
          { avatarImg && <img className="ui avatar image" src={u.profile.avatar}></img> }
          {userName}
        </div>
      </QLink>
    )
  }
})