import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import FittedImage from '/client/imports/components/Controls/FittedImage'
import QLink from '/client/imports/routes/QLink'
import { Button, Icon, Image, Popup } from 'semantic-ui-react'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import moment from 'moment'
import SpecialGlobals from '../../imports/SpecialGlobals'

// >>>  import UX from '/client/imports/UX'

// These UiAtoms are SUIR-based UI elements that are
// 1. small (an icon, maybe a few words, possible a simple hover)
// 2. very commonly user ui elements (e.g. username)
// 3. with limited interaction
// 4. Use shallow information about the main MGB schema types (e.g. know about user, not about details of map assets)

const _makeAvatarImgLink = (username, validFor = SpecialGlobals.avatar.validFor) =>
  _.isNumber(validFor)
    ? makeCDNLink(`/api/user/@${username}/avatar/${validFor}`, makeExpireTimestamp(validFor))
    : makeCDNLink(`/api/user/@${username}/avatar/`)
const _makeMascotImgLink = mascotName => makeCDNLink(`/images/mascots/${mascotName}.png`)

const _button2Sty = {
  padding: '5px',
  width: '5em',
  height: '5em',
  margin: '3.5px',
}

const _button2IconSty = {
  marginLeft: 0,
  marginRight: 0,
  marginBottom: '12px',
}

const UX = {
  makeAvatarImgLink: _makeAvatarImgLink,
  makeMascotImgLink: _makeMascotImgLink,

  UserLink: ({ username, prefix }) => (
    <QLink to={`/u/${username}`}>{`${_.isString(prefix) ? prefix : ''}${username}`}</QLink>
  ),

  UserAvatarNoLink: ({ username, validFor, height }) => (
    <FittedImage src={_makeAvatarImgLink(username, validFor)} width="auto" height={height || '3em'} />
  ),

  UserAvatar: ({ username, validFor, height }) => (
    <QLink to={`/u/${username}`}>
      <FittedImage src={_makeAvatarImgLink(username, validFor)} width="auto" height={height || '3em'} />
    </QLink>
  ),

  LinkToChatId: ({ chatId }) => (
    // TODO: @dgolds to decvide on how to reference a specific message
    // Use cases - @mention, notifications, flagging etc/
    // Workitem #10xx to be filed on dgolds
    <QLink query={{ _fp: 'chat' }}>Flagged Chat Id: {chatId}</QLink>
  ),

  LinkToAsset: ({ assetId, ownerUsername }) => (
    <QLink to={`/u/${ownerUsername}/asset/${assetId}`}>Flagged Asset Id: {assetId}</QLink>
  ),

  LinkToFlaggedEntity({ entityType, entityId, ownerUsername }) {
    if (entityType === 'Chats') return <UX.LinkToChatId chatId={entityId} />
    if (entityType === 'Azzets') {
      return <UX.LinkToAsset assetId={entityId} entityType={entityType} ownerUsername={ownerUsername} />
    }
    // TODO for projects
    // TODO for users (naughty names!)
    return <span>TODO</span>
  },

  UserTitle: ({ title }) => (
    <span>
      <Icon fitted size="small" name="quote left" />
      {title || '(no title)'} <Icon fitted size="small" name="quote right" />
    </span>
  ),

  UserWhenJoined({ when, as }) {
    const Element = as || 'span'
    return <Element>Joined {moment(when).format('MMMM DD, YYYY')}</Element>
  },

  UserAvatarName: ({ username, validFor }) => (
    <QLink to={`/u/${username}`} altTo={`/u/${username}/projects`}>
      <span className="right floated author">
        <Image avatar src={_makeAvatarImgLink(username, validFor)} />
        <span>{username}</span>
      </span>
    </QLink>
  ),

  TimeAgo({ when, as, style }) {
    const Element = as || 'span'
    return <Element style={style}>{moment(when).fromNow()}</Element>
  },

  TimeMDY({ when, as }) {
    const Element = as || 'span'
    return <Element>{moment(when).format('MMMM DD, YYYY')}</Element>
  },

  ImageMascot: props => <Image src={_makeMascotImgLink(props.mascotName)} {..._.omit(props, 'mascotName')} />,

  /** A two-row button */
  Button2: props => (
    <Button
      {..._.omit(props, 'underText')}
      style={_button2Sty}
      content={<div>{props.content}</div>}
      icon={<Icon name={props.icon} size="large" style={_button2IconSty} />}
    />
  ),
}

export default UX
