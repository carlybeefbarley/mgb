import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Feed, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import SpecialGlobals from '/imports/SpecialGlobals'
import QLink from '/client/imports/routes/QLink'
import { ActivityTypes, deleteActivityRecord } from '/imports/schemas/activity'

import { AssetKinds } from '/imports/schemas/assets'
import { ChatChannels, makePresentedChannelName, parseChannelName } from '/imports/schemas/chats'
import { isSameUserId } from '/imports/schemas/users'
import Thumbnail from '/client/imports/components/Assets/Thumbnail'

const _propTypes = {
  currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
  activity: PropTypes.array.isRequired, // An activity Stream passed down from the App and passed on to interested components
  isSuperAdmin: PropTypes.bool.isRequired, // Yes if one of core engineering team. Show extra stuff
}

const ActivityExtraDetail = ({ act }) => {
  // CHAT
  // CHAT (handle old toChatChannelKey that was prior to 2/16/2016)
  if (_.isString(act.toChatChannelKey) && act.toChatChannelKey.length > 0) {
    const chan = ChatChannels[act.toChatChannelKey]
    return (
      <Feed.Extra text>
        <Icon name="chat" />
        <QLink query={{ _fp: `chat.${chan.channelName}` }}>#{chan.name}</QLink>
      </Feed.Extra>
    )
  }
  // CHAT (handle new toChatChannelName that was after 2/16/2016)
  if (_.isString(act.toChatChannelName) && act.toChatChannelName.length > 0) {
    const chName = act.toChatChannelName
    const channelObj = parseChannelName(chName)
    // Currently, only global messsages are sent on the public channels and they are super-easy to get a friendly name for:
    const friendlyName = makePresentedChannelName(chName, channelObj.scopeId)
    return (
      <Feed.Extra text>
        <Icon name="chat" />
        <QLink query={{ _fp: `chat.${chName}` }}>#{friendlyName}</QLink>
      </Feed.Extra>
    )
  }

  // ASSET or GAME
  if (act.activityType.startsWith('asset.') || act.activityType.startsWith('game.')) {
    const assetKindIconName = AssetKinds.getIconName(act.toAssetKind)
    const assetKindColor = AssetKinds.getColor(act.toAssetKind)
    const assetName = act.toAssetName || `(untitled ${AssetKinds.getName(act.toAssetKind)})`
    const linkTo = act.toOwnerId
      ? `/u/${act.toOwnerName}/asset/${act.toAssetId}` // New format as of Jun 8 2016
      : `/assetEdit/${act.toAssetId}` // Old format. (LEGACY ROUTES for VERY old activity records). TODO: Nuke these and the special handlers

    return (
      <div>
        <Feed.Extra text>
          <Icon color={assetKindColor} name={assetKindIconName} />
          <QLink to={linkTo}>
            {act.toOwnerId === act.byUserId ? assetName : `${act.toOwnerName}:${assetName}`}
          </QLink>
        </Feed.Extra>

        <Feed.Extra images>
          <QLink to={linkTo}>
            <Thumbnail assetId={act.toAssetId} constrainHeight="60px" expires={5} />
          </QLink>
        </Feed.Extra>
      </div>
    )
  }

  return null
}

const _doDeleteActivity = activityId => deleteActivityRecord(activityId)

const DeleteActivity = ({ act, currUser, isSuperAdmin }) =>
  currUser && (isSameUserId(act.byUserId, currUser._id) || isSuperAdmin) ? (
    <span className="mgb-show-on-parent-hover" onClick={() => _doDeleteActivity(act._id)}>
      &nbsp;
      <Icon color="red" circular link name="delete" />
    </span>
  ) : null

const RenderOneActivity = ({ act, currUser, isSuperAdmin }) => {
  const { byUserName, timestamp } = act
  const iconClass = ActivityTypes.getIconClass(act.activityType)

  return (
    <Feed.Event style={{ borderBottom: 'thin solid rgba(0,0,0,0.10)' }}>
      <Feed.Label content={<UX.UserAvatar username={byUserName} />} />

      <Feed.Content>
        <Feed.Summary>
          <Feed.User as="div">
            <UX.UserLink username={byUserName} />
          </Feed.User>
          <UX.TimeAgo as={Feed.Date} when={timestamp} />
          <DeleteActivity act={act} currUser={currUser} isSuperAdmin={isSuperAdmin} />
        </Feed.Summary>

        <Feed.Meta>
          <i className={iconClass} />&nbsp;{act.description}
        </Feed.Meta>

        <ActivityExtraDetail act={act} />
      </Feed.Content>
    </Feed.Event>
  )
}

const fpActivity = ({ activity, currUser, isSuperAdmin }) => (
  <Feed size="small">
    {_.map(
      _.slice(activity, 0, SpecialGlobals.activity.activityHistoryLimit), // beyond the activityHistoryLimit it gets polluted with ones loaded for userProfile stuff and that looks like no-one used it for ages.. hence slice.
      act => <RenderOneActivity act={act} key={act._id} currUser={currUser} isSuperAdmin={isSuperAdmin} />,
    )}
  </Feed>
)

fpActivity.propTypes = _propTypes
export default fpActivity
