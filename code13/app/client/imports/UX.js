import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Icon, Popup } from 'semantic-ui-react'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals'
import moment from 'moment'


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

const UX = {

  UserLink: ( { username, prefix } ) => (
    <QLink to={`/u/${username}`}>
      { `${_.isString(prefix) ? prefix : ''}${username}` }
    </QLink>
  ),
  
  UserAvatar: ( { username, validFor } ) => (
    <QLink to={`/u/${username}`}> 
      <FittedImage 
        src={ _makeAvatarImgLink(username, validFor) }
        width='auto'
        height="3em"
        />
    </QLink>
  ),

  TimeAgo: ( { when, as } ) => {
    const Element = as || 'span'
    return (
      <Element>
        {moment(when).fromNow()}
      </Element>
    )
  }

}

export default UX