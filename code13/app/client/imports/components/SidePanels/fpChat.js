import PropTypes from 'prop-types'
import React, { Component } from 'react'
import QLink from '/client/imports/routes/QLink'
import AssetCardGET from '/client/imports/components/Assets/AssetCardGET'
import ProjectCardGET from '/client/imports/components/Projects/ProjectCardGET'
import ChatMessagesView from './fpChat-messagesView'

import { Azzets } from '/imports/schemas'

import { parseChannelName, isChannelNameValid, chatParams } from '/imports/schemas/chats'
import ChatChannelSelector from './ChatChannelSelector'
import ChatMessageInput from './ChatMessageInput'

const initialMessageLimit = 15

/* TODOs for planned chat work

 √ DONE (Phase 1: base fpChat functionality and deploy):
 √ [Feature] Support new channelName format
 √ [Feature] Show Global and Project chats for now
 √ [Feature] Disable DM list for now
 √ [Feature] Implement toggler for dropdown button
 √ [Disable] Disable Send to User/DM/Asset for now in currUserCanSend()
 √ [DB] Update all old-style channelKeys in Chats collection to the new style
 √ [Merge] Merge into master and test
 √ [Deploy] Deploy it ya

 √ DONE (Phase 1a: Fix activity logs and renderer for the new chatChannels format)
 √ [DB] Support old activity.js: activity.toChatChannelKey
 √ [UI] update activity renderer in fpActivity.js
 √ [Test] look for any _fp=chat.____ stuff and correct it
 √ [More testing] and fix any bad stuff

 √ DONE (Phase 2: Tighten up project chat)
 √ [secure] Make sure it can't be navigated/read by people who don't have access
 √ [secure] Make sure API can't be sent to without access
 √ [secure] Make sure it can't be messaged to by people who don't have access
 √ [secure] Make sure DB records can't be navigated to by people who don't have access
 √ [Merge] Merge into master and test
 √ [Deploy] More deploy ftw.
 √ [More testing] and fix any bad stuff

 √ DONE (Phase 3: Read/Unread)
 √ RPC to support getting aggregates on channels (This is not a fun thing to do as a subscription)
 √ Call the Chats.getLastMessageTimestamps RPC from fpChats when channel selector shown
 √ Implement user settings for most recent message read
 √ Implement color-coding channels by read/unread, and refreshing on channel search ()
 √ Implement updating current channel's read/unread for user if on channel (or if posts to channel)
 √ [Merge] Merge into master and test
 √ [Deploy] ya.
 √ [More testing] and fix any bad stuff

 ~ TODO (Phase 4: Simple Notifications)
 √ Move fpChats._requestChannelTimestampsNow up to App level
 √ Add simple way to click a notification icon and go to the channel selector
 √ [Merge] Merge into master and test
 √ [Deploy] ya.
 √ [More testing] and fix any bad stuff
 ◊ Make the update of the orange chat icon quicker

 ~ TODO (Phase 5: Asset chat)
 √ [Feature] Implement Chat icon is Asset Edit Header
 √ [Feature] Add current Asset id to list of channels we want timestamps for in App.js
 √ [Feature] Implement findObjectNameForChannelName() for Assets
 √ [Enable]  Enable Send-to-User in currUserCanSend() for Assets
 √ [Feature] show Asset Chats in fpChat list of channels.. colorForChannelNameHasUnreads()
 √ [Feature] update the code in fpChat which gets unreadChannel info.. so it includes assets
 √ [Feature] Get the Asset Names/Deleted/owner info from the server when we get the timestamps
 √ [Merge] Merge into master and test
 ◊ [Deploy] ya.

 ~ TODO (Phase 6: Pinning chats)
 √ [feature] Implement Pinning in settings
 √ [feature] Implement Pinning in getMessageTimestamps
 √ [feature] Implement Pinning for Asset Chats
 ◊ [feature] Implement Pinning for Project Chats

 ◊ TODO (Phase 7: DMs)
 ◊ [Enable] Enable Send-to-DM in currUserCanSend()
 ◊ [Feature] Implement UI to initiate a DM send
 ◊ [Feature] Implement DB stuff to update Notifications/ other records to make a DMs list
 ◊ [Feature] Implement UI to make DM chats findable for a User
 ◊ [Feature] Enable DM list in fpChat
 ◊ [Feature] Implement findObjectNameForChannelName() for DMs
 ◊ ...make this list of detailed work

 ~ TODO (Phase 8: Delete message)
 √ [feature] Implement core delete Message code for server
 √ [feature] Implement core delete Message code for fpChat
 √ [feature] Make sure message OWNERS (only) can delete their messages
 √ [feature] Make sure Admins (only) can delete any message
 ◊ [feature] Make sure ProjectOwners (only) can delete any message in a project they own
 √ [Merge] Merge into master and test
 √ [Deploy] ya.
 √ [More testing] and fix any bad stuff

 ~ PARTLY_DONE (Phase 9: Refactor)
 √ [Refactor] break out <ChatChannelMessages>
 √ [Refactor] break out <ChatChannelMessage>
 ◊ [Refactor] break out <ChatChannelSelector>

 ◊ TODO (Phase 10: Embedded scope-related chat)
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Project Overview (for owners/members)
 ◊ [Enable] Enable Send-to-Asset in currUserCanSend()
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Asset Overview (for owners/members)
 ◊ [Feature] Implement findObjectNameForChannelName() for Users
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in User Profile - for a Wall-style experience

 ◊ TODO (Phase 11: Forums/Threads)
 ◊ ...make this list of detailed work using _topic

 */

/**
 * This is a server-supported solution for getting the AssetNames for
 * pinned Asset Chat channels. See how RPC "Chats.getLastMessageTimestamps" helps out here
 * @param {String} assetId
 */
const _getAssetNameIfAvailable = (assetId, chatChannelTimestamp) => {
  // Hopefully it is in chatChannelTimestamps as returned by RPC Chats.getLastMessageTimestamps

  if (chatChannelTimestamp && chatChannelTimestamp.assetInfo && chatChannelTimestamp.assetInfo.name)
    return chatChannelTimestamp.assetInfo.name // Sweet!

  // ok, let's see what we've got here.. Maybe we don't have the info we need yet from the server
  const a = Azzets.findOne(assetId)
  return a ? a.name : 'Asset #' + assetId
}

// This is a simple way to remember the channel key for the flexPanel since there is exactly one of these.
// Users got annoyed when they always went back to the default channel
// TODO: Push this up to flexPanel.js? or have flexPanel.js provide an optional 'recent state' prop?
let _previousChannelName = null // This should be null or a name known to succeed with isChannelNameValid()

class fpChat extends Component {
  static propTypes = {
    // Currently Logged in user. Can be null/undefined
    currUser: PropTypes.object,
    // Projects list for currently logged in user
    currUserProjects: PropTypes.array,
    // User object for context we are navigation to in main page. Can be null/undefined. Can be
    // same as currUser, or different user
    user: PropTypes.object,
    // Typically something like "200px".
    panelWidth: PropTypes.string.isRequired,
    // Yes if one of core engineering team. Show extra stuff
    isSuperAdmin: PropTypes.bool.isRequired,
    // "" or a string that defines the sub-nav within this FlexPanel
    subNavParam: PropTypes.string.isRequired,
    // Call this back with the SubNav string (queryParam
    // ?fp=___.subnavStr) to change it
    handleChangeSubNavParam: PropTypes.func.isRequired,
    // chat stuff
    hazUnreadChats: PropTypes.array, // As defined in App.js:state
  }

  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  static contextTypes = {
    settings: PropTypes.object,
  }

  state = {
    view: 'comments', // Exactly one of ['comments', 'channels']
    pendingCommentsRenderForChannelName: '*', // Very explicit way to edge-detect to trigger code on first
    // render of a specific chat channel (for handling read/unread
    // transitions etc). If null, there is nothing pending.
    // If '*' then render on whatever the next channelName is.
    // if any-other-string, then we are waiting for that specific channelName
    pastMessageLimit: initialMessageLimit,
  }

  _calculateActiveChannelName = () => {
    const { subNavParam } = this.props // empty string means "default"
    const channelName = subNavParam // So this should be something like 'G_MGBBUGS_'.. i.e. a key into ChatChannels{}
    return isChannelNameValid(channelName)
      ? channelName
      : _previousChannelName || chatParams.defaultChannelName
  }

  componentDidUpdate() {
    const { pendingCommentsRenderForChannelName } = this.state
    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel

    // TODO TODO TODO TODO TODO
    // This is prev channel !== curr channel
    // fpChat should hold the channel, ChatChallenSelector calls back here onChannelChange
    // TODO TODO TODO TODO TODO
    if (this.state.view === 'comments') {
      const channelName = this._calculateActiveChannelName()
      // Make sure _previousChannelName is updated so async things
      // like setLastReadTimestampForChannel() in the ChatMessagesView are correct
      _previousChannelName = channelName

      if (pendingCommentsRenderForChannelName) {
        if (
          pendingCommentsRenderForChannelName === channelName ||
          '*' === pendingCommentsRenderForChannelName
        ) {
          // OK, let's do stuff!

          // 0. First, note that we have done this stuff (so we don't redo it)
          this.setState({ pendingCommentsRenderForChannelName: null })

          // 1. Refresh the chat notifications
          this.props.requestChatChannelTimestampsNow()

          // 2. Maybe scroll last message into view
          // if (this.state.pastMessageLimit <= initialMessageLimit && this.state.view === 'comments')
          //   this.refs.bottomOfMessageDiv.scrollIntoView(false)
        }
      }
    }
  }

  render() {
    const {
      chatChannelTimestamps,
      currUser,
      currUserProjects,
      handleChangeSubNavParam,
      isSuperAdmin,
      requestChatChannelTimestampsNow,
      subNavParam,
      user,
    } = this.props
    const { pastMessageLimit } = this.state
    const channelName = this._calculateActiveChannelName()
    const channelObj = parseChannelName(channelName)

    const style = {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      bottom: '0',
      right: '5em',
      height: '30vh',
      zIndex: '999',
    }

    return (
      <div style={style}>
        <ChatChannelSelector
          chatChannelTimestamps={chatChannelTimestamps}
          currUser={currUser}
          currUserProjects={currUserProjects}
          handleChangeSubNavParam={handleChangeSubNavParam}
          requestChatChannelTimestampsNow={requestChatChannelTimestampsNow}
          subNavParam={subNavParam}
        />
        <ChatMessagesView
          currUser={currUser}
          user={user}
          pastMessageLimit={pastMessageLimit}
          isSuperAdmin={isSuperAdmin}
          handleExtendMessageLimit={newLimit => this.setState({ pastMessageLimit: newLimit })}
          channelName={channelName}
        />

        <ChatMessageInput channelName={channelName} currUser={currUser} />

        {channelObj.scopeGroupName === 'Global' ? null : (
          <div>
            <strong>Public Chat Channel for this {channelObj.scopeGroupName}</strong>
            <div style={{ minWidth: '300px' }}>
              {channelObj.scopeGroupName === 'Asset' && (
                <AssetCardGET assetId={channelObj.scopeId} renderView="s" />
              )}
              {channelObj.scopeGroupName === 'Project' && <ProjectCardGET projectId={channelObj.scopeId} />}
              {channelObj.scopeGroupName === 'User' && (
                <span>
                  User Wall for <QLink to={`/u/${channelObj.scopeId}`}>@{channelObj.scopeId}</QLink>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default fpChat
