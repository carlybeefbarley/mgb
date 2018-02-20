import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Header, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Activity } from '/imports/schemas'

const UserLikesListUI = ({ user, likeAct }) => (
  <div>
    <Header
      as="h2"
      content={
        <a>
          <Icon fitted name="thumbs up" color="blue" />
          {`${user ? user.username : '???'}'s recent likes`}
        </a>
      }
    />
    {_.map(likeAct, a => (
      <div key={a._id}>
        <Icon name="thumbs up" color="blue" />
        <span>Liked </span>
        <QLink to={`/u/${a.toOwnerName}/asset/${a.toAssetId}`}>{a.toAssetName}</QLink>
        <span> by </span>
        <QLink to={`/u/${a.toOwnerName}`}>{a.toOwnerName}</QLink>
        &ensp;
        <UX.TimeAgo as="small" style={{ color: '#c8c8c8' }} when={a.timestamp} />
      </div>
    ))}
    {(!likeAct || likeAct.length === 0) && <span>Nothing liked recently...</span>}
  </div>
)

UserLikesListUI.PropTypes = {
  user: PropTypes.object,
  likeAct: PropTypes.array,
}

const UserLikesList = createContainer(props => {
  const userId = props.user._id ? props.user._id : null
  if (userId) {
    let handleActivity = Meteor.subscribe('activity.public.recent.userId')
    let selector = {
      byUserId: userId,
      activityType: 'asset.userLikes',
    }
    let findOpts = { sort: { timestamp: -1 } }
    return {
      likeAct: Activity.find(selector, findOpts).fetch(),
      loading: !handleActivity.ready(),
    }
  }
}, UserLikesListUI)
export default UserLikesList
