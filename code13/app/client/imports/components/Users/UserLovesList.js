import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import QLink from '/client/imports/routes/QLink'
import { withTracker } from 'meteor/react-meteor-data'

import { Activity } from '/imports/schemas'

const UserLovesListUI = ({ user, loveAct }) => (
  <div>
    <Header
      as="h2"
      content={
        <a>
          <Icon fitted name="heart" color="red" />
          {`${user ? user.username : '???'}'s recent loves`}
        </a>
      }
    />
    {_.map(loveAct, a => (
      <div key={a._id}>
        <Icon name="heart" color="red" />
        <span>Loved </span>
        <QLink to={`/u/${a.toOwnerName}/asset/${a.toAssetId}`}>{a.toAssetName}</QLink>
        <span> by </span>
        <QLink to={`/u/${a.toOwnerName}`}>{a.toOwnerName}</QLink>
        &ensp;
        <UX.TimeAgo as="small" style={{ color: '#c8c8c8' }} when={a.timestamp} />
      </div>
    ))}
    {(!loveAct || loveAct.length === 0) && <span>Nothing loved recently...</span>}
  </div>
)

UserLovesListUI.PropTypes = {
  user: PropTypes.object,
  loveAct: PropTypes.array,
}

const UserLovesList = withTracker(props => {
  const userId = props.user._id ? props.user._id : null
  if (userId) {
    let handleActivity = Meteor.subscribe('activity.public.recent.userId')
    let selector = {
      byUserId: userId,
      activityType: 'asset.userLoves',
    }
    let findOpts = { sort: { timestamp: -1 } }
    return {
      loveAct: Activity.find(selector, findOpts).fetch(),
      loading: !handleActivity.ready(),
    }
  }
})(UserLovesListUI)

export default UserLovesList
