import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Icon, Image, Popup } from 'semantic-ui-react'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import moment from 'moment'

// >>>  import UX from '/client/imports/UX'

// These UiAtoms are SUIR-based UI elements that are
// 1. small (an icon, maybe a few words, possible a simple hover)
// 2. very commonly user ui elements (e.g. username)
// 3. with limited interaction
// 4. Use shallow information about the main MGB schema types (e.g. know about user, not about details of map assets)

const _makeAvatarImgLink = ( username, validFor ) => (
  ( _.isNumber(validFor) ? 
      makeCDNLink(`/api/user/@${username}/avatar/${validFor}`, makeExpireTimestamp(validFor))
    :
      makeCDNLink(`/api/user/@${username}/avatar/`)
    )
)

const _UserJoinedSty = { color: "rgb(0, 176, 224)" }

const UX = {

  UserLink: ( { username, prefix } ) => (
    <QLink to={`/u/${username}`}>
      { `${_.isString(prefix) ? prefix : ''}${username}` }
    </QLink>
  ),

  UserAvatarNoLink: ( { username, validFor, height } ) => (
    <FittedImage 
      src={ _makeAvatarImgLink(username, validFor) }
      width='auto'
      height={height || '3em'}
      />
  ),
  
  UserAvatar: ( { username, validFor, height } ) => (
    <QLink to={`/u/${username}`}> 
      <FittedImage 
        src={ _makeAvatarImgLink(username, validFor) }
        width='auto'
        height={height || '3em'}
        />
    </QLink>
  ),

  UserTitleSpan: ( { title } ) => (
    <span>
      <Icon name="quote left" color='blue'/>
      <big>
        {title || "(no title)"}
        &nbsp;
      </big>
      <Icon name="quote right" color='blue'/>
    </span>  
  ),

  UserWhenJoined: ( { when, as } ) => {
    const Element = as || 'span'
    return (
      <Element style={_UserJoinedSty}>
        Joined {moment(when).format('MMMM DD, YYYY')}
      </Element>
    )
  },

  UserAvatarName: ( { username, validFor } ) => (
    <QLink to={`/u/${username}`} altTo={`/u/${username}/projects`}>
      <span className="right floated author">
      <Image 
          avatar
          src={ _makeAvatarImgLink(username, validFor) }
          />
      <span>{username}</span>
      </span>
    </QLink>
  ),

  TimeAgo: ( { when, as, style } ) => {
    const Element = as || 'span'
    return (
      <Element style={style}>
        {moment(when).fromNow()}
      </Element>
    )
  },

  TimeMDY: ( { when, as } ) => {
    const Element = as || 'span'
    return (
      <Element>
        {moment(when).format('MMMM DD, YYYY')}
      </Element>
    )
  }
  

}

export default UX