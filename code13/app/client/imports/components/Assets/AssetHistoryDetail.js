import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import moment from 'moment'
import { Popup, Icon, Label } from 'semantic-ui-react'

const SESSION_MAGIC_TEXT = "BY_SESSION:" 
const _getCurrUserIdentifier = (currUser) => (currUser ? currUser._id : SESSION_MAGIC_TEXT + Meteor.default_connection._lastSessionId)

const ACTIVE_OTHER_PERSON_EDITING_HIGHLIGHT_MS = 1000 * 60    // Highlight if another person changed this in last N seconds. Make this reactive/timed?

const AssetHistoryDetail = ( { assetActivity, currUser } ) => {
  if (!assetActivity)
    return null

  const now = new Date()
  var currUserId = _getCurrUserIdentifier(currUser)
  const numRecentOtherEdits = _.filter(assetActivity, a => (currUserId !== a.byUserId && (now - a.timestamp) < ACTIVE_OTHER_PERSON_EDITING_HIGHLIGHT_MS) ).length

  const changes = _.map(assetActivity, a => { 
    const ago = moment(a.timestamp).fromNow()        // It's just a popup, so no need to make it reactive
    
    return (
      <p key={a._id}>
        <QLink to={`/u/${a.byUserName}`}>{a.byUserName}</QLink>
        : <small>{a.description}</small> <small style={{color: '#c8c8c8'}}>&ensp;{ago}</small>
      </p>
    )
  })
  
  const changesCount = changes.length
  const highlightClass = numRecentOtherEdits > 0 ? 'blue' : 'grey'
  
  const TriggerElement = (
    <Label size='small' basic pointing='below' style={{ borderRadius: '0px' }}>
      <Icon name='lightning' color={highlightClass} />
      <span style={{color: highlightClass}}>
        { changesCount }
      </span>
    </Label>
  )

  return (
    <Popup wide='very' hoverable trigger={TriggerElement} size='tiny'>
      <Popup.Header>
        { changesCount } changes
      </Popup.Header>
      <Popup.Content>
        { changes }
      </Popup.Content>
    </Popup>
  )
}

AssetHistoryDetail.propTypes = {
  assetId:       PropTypes.string.isRequired,        
  assetActivity: PropTypes.array,             // A list of Activity records for an Asset provided via getMeteorData(). Can be empty while being loaded          
  currUser:      PropTypes.object             // currently Logged In user (not always provided)
}

export default AssetHistoryDetail