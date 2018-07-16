import PropTypes from 'prop-types'
import React from 'react'
import { List } from 'semantic-ui-react'
import { AssetKinds } from '/imports/schemas/assets'
import QLink from '/client/imports/routes/QLink'
import moment from 'moment'
import { ActivityTypes } from '/imports/schemas/activity'

const ActivityItem = props => {
  // propTypes: {
  //   activity: PropTypes.object,
  //   hideUser: PropTypes.bool,
  // }

  const { activity, hideUser } = props
  const icon = AssetKinds.getIconName(activity.toAssetKind)
  const iconColor = AssetKinds.getColor(activity.toAssetKind)
  const linkTo = `/u/${activity.toOwnerName}/asset/${activity.toAssetId}`
  const activityBy = activity.byUserName ? activity.byUserName : ''
  const when = moment(activity.timestamp).fromNow()
  const description = ActivityTypes.getDescription(activity.activityType)
  return (
    <List.Item key={activity._id}>
      <List.Icon name={icon} color={iconColor} />
      <List.Content style={{ width: '100%' }}>
        <List.Content floated="right">
          <small style={{ color: 'lightgray' }}>{when}</small>
        </List.Content>
        <List.Header>
          <QLink to={linkTo} className="ui item">
            {activity.toAssetName}
          </QLink>
        </List.Header>
        <List.Description>
          <small>
            {hideUser ? '' : activityBy} {description}
          </small>
        </List.Description>
      </List.Content>
    </List.Item>
  )
}

export default ActivityItem
