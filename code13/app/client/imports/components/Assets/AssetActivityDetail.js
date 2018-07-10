import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import moment from 'moment'
import { Popup, Icon, Label } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

// This is the VIEWERS ui that shows other active viewers using the activitySnapshots DB

const SESSION_MAGIC_TEXT = 'BY_SESSION:'
const _getCurrUserIdentifier = currUser =>
  currUser ? currUser._id : SESSION_MAGIC_TEXT + Meteor.default_connection._lastSessionId

const AssetActivityDetail = ({ activitySnapshots, currUser }) => {
  if (!activitySnapshots) return null

  var currUserId = _getCurrUserIdentifier(currUser)
  const othersActivities = _.filter(activitySnapshots, a => currUserId !== a.byUserId)
  let viewers = _.map(othersActivities, a => {
    const ago = moment(a.timestamp).fromNow() // TODO: Make reactive
    const isPseudoUser = a.byUserId.indexOf(SESSION_MAGIC_TEXT) === 0
    let detail2 = null
    if (a.toAssetKind === 'code') detail2 = ` at line ${a.passiveAction.position.line + 1}`
    else if (a.toAssetKind === 'graphic') detail2 = ` at frame #${a.passiveAction.selectedFrameIdx + 1}`

    return (
      <p key={a._id}>
        {isPseudoUser ? (
          <small>{a.byUserName}</small>
        ) : (
          <QLink to={`/u/${a.byUserName}`}>{a.byUserName}</QLink>
        )}
        {detail2}
        <small style={{ color: '#c8c8c8' }}>&ensp;{ago}</small>
      </p>
    )
  })

  const viewersCount = viewers.length // Note this excludes ourselves

  if (0 === viewersCount) return null
  const pointing = viewersCount ? 'below' : false
  const highlightClass = viewersCount ? 'blue' : 'grey'

  const TriggerElement = (
    <Label size="small" basic pointing={pointing} style={{ borderRadius: '0px' }}>
      <Icon name="unhide" color={highlightClass} />
      <span style={{ color: highlightClass }}>{viewersCount}</span>
    </Label>
  )
  // marginBottom: '4px'

  return (
    <Popup wide="very" hoverable trigger={TriggerElement} size="tiny" className="animated fadeIn">
      <Popup.Header>{viewersCount} recent viewers</Popup.Header>
      <Popup.Content>{viewersCount ? viewers : <p>It's just us</p>}</Popup.Content>
    </Popup>
  )
}

AssetActivityDetail.propTypes = {
  assetId: PropTypes.string.isRequired,
  activitySnapshots: PropTypes.array, // A list of ActivitySnapshots provided via getMeteorData(), including one by ourself probably. Can be empty while being loaded
  currUser: PropTypes.object, // currently Logged In user (not always provided)
}

export default AssetActivityDetail
