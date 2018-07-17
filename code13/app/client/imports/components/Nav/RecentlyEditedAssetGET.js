import PropTypes from 'prop-types'
import React from 'react'
import QLink from '/client/imports/routes/QLink'
import { Activity } from '/imports/schemas'
import { withTracker } from 'meteor/react-meteor-data'

class RecentlyEditedAssetGET extends React.PureComponent {

  static propTypes = {
    userId: PropTypes.string, // User Id we are interested in. Can be null/undefined
    linkText: PropTypes.string,
  }

  render() {
    const { userId, linkText } = this.props
    if (!userId || userId === '') return null
    if (this.props.loading) return <span>...</span>
    const nothin = (
      <span>
        <em>nothing, yet!</em>
      </span>
    )

    if (!this.props.activity || this.props.activity.length === 0) return nothin
    const activity = this.props.activity[0]
    if (!activity) return nothin

    const to = `/u/${activity.toOwnerName}/asset/${activity.toAssetId}`
    return <QLink to={to}>{linkText ? linkText : activity.toAssetName}</QLink>
  }
}

export default withTracker(props => {
  const { userId } = props
  if (!userId || userId === '') return {}

  const handleActivity = Meteor.subscribe('activity.public.assets.recent.userId', userId, 4)

  return {
    ...props,
    activity: Activity.find(
      { byUserId: userId, toAssetId: { $ne: '' } },
      { sort: { timestamp: -1 }, limit: 1 },
    ).fetch(),

    loading: !handleActivity.ready(),
  }
})(RecentlyEditedAssetGET)
