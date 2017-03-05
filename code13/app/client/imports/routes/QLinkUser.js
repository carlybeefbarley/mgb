import React, { PropTypes } from 'react'
import QLink from './QLink'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
// This is designed primarily for the 'extra content' section of Cards

const QLinkUser = ( { userName, userId, avatarUrl } ) => (
//
  <QLink to={`/u/${userName}`} altTo={`/u/${userName}/projects`}>
    <div className="right floated author">
      <img 
        className="ui avatar image" 
        src={makeCDNLink(avatarUrl ||  `/api/user/${userId}/avatar/60`, makeExpireTimestamp(60))}>
      </img>
      <span>{userName}</span>
    </div>
  </QLink>
)

QLinkUser.propTypes = {
  userName:  PropTypes.string.isRequired,
  userId:    PropTypes.string.isRequired,
  avatarUrl: PropTypes.string
}

export default QLinkUser
