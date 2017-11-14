import PropTypes from 'prop-types'
import React from 'react'
import { List } from 'semantic-ui-react'
import QLink, { utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import { ActivityTypes } from '/imports/schemas/activity'

export default class FeedItem extends React.Component {
  static propTypes = {
    activity: PropTypes.shape({
      activityType: PropTypes.string,
      byUserName: PropTypes.string,
      toAssetId: PropTypes.string,
      toAssetName: PropTypes.string,
      toChatChannelName: PropTypes.string,
      toOwnerName: PropTypes.string,
    }),
    currUser: PropTypes.object,
  }

  openChatChannel = () => utilShowChatPanelChannel(window.location, this.props.activity.toChatChannelName)

  render() {
    const { activity } = this.props
    let text = ''
    let link = ''
    switch (activity.activityType) {
      case 'asset.userLoves':
        text = 'loved your asset'
        link = (
          <QLink to={`/u/${activity.toOwnerName}/asset/${activity.toAssetId}`}>{activity.toAssetName}</QLink>
        )
        break
      // message on wall or owned asset
      case 'user.message':
        if (activity.toChatChannelName.startsWith('U_')) {
          // `U_username_`
          text = 'wrote a comment on'
          link = <a onClick={this.openChatChannel}>your wall</a>
        } else if (activity.toChatChannelName.startsWith('A_')) {
          // `A_assetId_`
          text = 'wrote a comment on'
          let assetId = activity.toChatChannelName.substring(2, activity.toChatChannelName.length - 1)
          link = <QLink to={`/u/${this.props.currUser.username}/asset/${assetId}`}>your asset</QLink>
        }
        break
      case 'user.messageAt':
        text = 'mentioned you'
        link = <a onClick={this.openChatChannel}>in a chat</a>
        break
      case 'project.addMember':
        text = 'added you to a project'
        link = (
          <QLink to={`/u/${activity.toOwnerName}/projects/${activity.toAssetName}`}>
            {activity.toAssetName}
          </QLink>
        )
        break
      case 'project.removeMember':
        text = 'removed you from project'
        link = (
          <QLink to={`/u/${activity.toOwnerName}/projects/${activity.toAssetName}`}>
            {activity.toAssetName}
          </QLink>
        )
        break
      case 'project.leaveMember':
        text = 'left from your project'
        link = (
          <QLink to={`/u/${activity.toOwnerName}/projects/${activity.toAssetName}`}>
            {activity.toAssetName}
          </QLink>
        )
        break
      case 'mgb.announce':
        // TODO need to implement welcome message
        break
      default:
        console.error(`Don't recognize activity type ${activity.activityType}`)
        return null
    }
    return (
      <List.Item>
        <List.Icon name={ActivityTypes[activity.activityType].icon} />
        <List.Content>
          <QLink to={'/u/' + activity.byUserName}>{activity.byUserName}</QLink> {text} {link}
        </List.Content>
      </List.Item>
    )
  }
}

// write to asset chat. toOwnerId is empty
// const assetChat = {
//   _id: '87fS3z4wvn4MerhsC',
//   activityType: 'user.message',
//   byGeo: '',
//   byIpAddress: '127.0.0.1',
//   byTeamName: '',
//   byUserId: 'fijoMML4CZzTAdHuf',
//   byUserName: 'guntis',
//   description: 'Sent a message on ScZYNWcBcMduLDtCf - Asset Chat',
//   priority: 9,
//   thumbnail: '',
//   timestamp: 'Wed Aug 23 2017 13:11:28 GMT+0300 (EEST)',
//   toAssetId: '',
//   toAssetKind: '',
//   toAssetName: '',
//   toChatChannelName: 'A_ScZYNWcBcMduLDtCf_',
//   toOwnerId: '',
//   toOwnerName: '',
//   toProjectName: '',
// }
