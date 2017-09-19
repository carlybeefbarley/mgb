import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Activity } from '/imports/schemas'
import { ReactMeteorData } from 'meteor/react-meteor-data'

const RecentlyEditedAssetGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    userId: PropTypes.string, // User Id we are interested in. Can be null/undefined
  },

  getMeteorData() {
    const { userId } = this.props
    if (!userId || userId === '') return {}

    let handleActivity = Meteor.subscribe('activity.public.assets.recent.userId', userId, 4)

    return {
      activity: Activity.find(
        { byUserId: userId, toAssetId: { $ne: '' } },
        { sort: { timestamp: -1 }, limit: 1 },
      ).fetch(),

      loading: !handleActivity.ready(),
    }
  },

  render() {
    const { userId } = this.props
    if (!userId || userId === '') return null
    if (this.data.loading) return <span>...</span>
    const nothin = (
      <span>
        <em>nothing yet...</em>
      </span>
    )

    if (!this.data.activity || this.data.activity.length === 0) return nothin
    const activity = this.data.activity[0]
    if (!activity) return nothin

    const to = `/u/${activity.toOwnerName}/asset/${activity.toAssetId}`
    return <QLink to={to}>{activity.toAssetName}</QLink>
  },
})

export default RecentlyEditedAssetGET
