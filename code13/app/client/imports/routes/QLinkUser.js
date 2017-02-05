import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from './QLink'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'
// This is designed primarily for the 'extra content' section of Cards

const QLinkUser = props => {
  const u = props.targetUser
  if (!u) return null

  const userName = _.isString(u) ? u : u.profile.name
  const userShownName = _.isString(u) ? '@'+u : u.profile.name
  const avatarImg = _.isString(u) ? null : u.profile.avatar

  return (
    <QLink to={`/u/${userName}`} altTo={`/u/${userName}/projects`}>
      <div className="right floated author">
        { avatarImg && <img className="ui avatar image" src={makeCDNLink(u.profile.avatar, makeExpireTimestamp(60))}></img> }
        { userShownName }
      </div>
    </QLink>
  )
}

QLinkUser.propTypes = {
  targetUser:  PropTypes.oneOfType([PropTypes.string, PropTypes.object])     // Can be null
}

export default QLinkUser
