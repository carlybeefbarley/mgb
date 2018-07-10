import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { createContainer } from 'meteor/react-meteor-data'

import { Activity } from '/imports/schemas'
import DashboardAction from './DashboardAction'

const RecentAssetActionUI = ({ activity, loading, ...rest }) => {
  const recentAsset = _.first(activity)

  if (loading || !recentAsset) return null

  return (
    <DashboardAction
      {...rest}
      color="blue"
      icon="history"
      header="Last time"
      subheader={`You were working on "${recentAsset.toAssetName}".`}
      buttonContent="Continue"
      buttonExtra={`Asset: ${recentAsset.toAssetName}`}
      to={`/u/${recentAsset.toOwnerName}/asset/${recentAsset.toAssetId}`}
    />
  )
}

RecentAssetActionUI.propTypes = {
  currUser: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
}

const RecentAssetAction = createContainer(props => {
  const userId = _.get(props, 'currUser._id')

  let handleActivity = Meteor.subscribe('activity.public.assets.recent.userId', userId, 4)

  return {
    activity: Activity.find(
      { byUserId: userId, toAssetId: { $ne: '' } },
      { sort: { timestamp: -1 }, limit: 1 },
    ).fetch(),
    loading: !handleActivity.ready(),
    ...props,
  }
}, RecentAssetActionUI)

RecentAssetAction.propTypes = RecentAssetActionUI.propTypes

export default RecentAssetAction
