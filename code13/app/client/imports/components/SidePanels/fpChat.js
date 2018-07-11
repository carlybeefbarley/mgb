import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Icon, Input, Label, List, Popup } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import AssetCardGET from '/client/imports/components/Assets/AssetCardGET'
import ProjectCardGET from '/client/imports/components/Projects/ProjectCardGET'
import ChatMessagesView from './fpChat-messagesView'
import { isUserSuperAdmin, isUserTeacher } from '/imports/schemas/roles'

import { Azzets } from '/imports/schemas'
import {
  getLastReadTimestampForChannel,
  getPinnedChannelNames,
  togglePinnedChannelName,
} from '/imports/schemas/settings-client'

import { joyrideStore } from '/client/imports/stores'
import {
  parseChannelName,
  makeChannelName,
  ChatChannels,
  isChannelNameValid,
  chatParams,
  makePresentedChannelName,
  makePresentedChannelIconName,
} from '/imports/schemas/chats'

const unreadChannelIndicatorStyle = {
  marginLeft: '0.3em',
  marginBottom: '0.9em',
  fontSize: '0.5rem',
}

const initialMessageLimit = 5

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

const fpChat = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
    user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
    isSuperAdmin: PropTypes.bool.isRequired, // Yes if one of core engineering team. Show extra stuff
    subNavParam: PropTypes.string.isRequired, // "" or a string that defines the sub-nav within this FlexPanel
    handleChangeSubNavParam: PropTypes.func.isRequired, // Call this back with the SubNav string (queryParam ?fp=___.subnavStr) to change it
    // chat stuff
    chatChannelTimestamps: PropTypes.array, // as defined by Chats.getLastMessageTimestamps RPC
    requestChatChannelTimestampsNow: PropTypes.func.isRequired, // It does what it says on the box. Used by fpChat
    hazUnreadChats: PropTypes.array, // As defined in App.js:state
  },

  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  contextTypes: {
    settings: PropTypes.object,
  },

  _calculateActiveChannelName() {
    const { subNavParam } = this.props // empty string means "default"
    const channelName = subNavParam // So this should be something like 'G_MGBBUGS_'.. i.e. a key into ChatChannels{}
    return isChannelNameValid(channelName)
      ? channelName
      : _previousChannelName || chatParams.defaultChannelName
  },

  getInitialState() {
    return {
      view: 'comments', // Exactly one of ['comments', 'channels']
      pendingCommentsRenderForChannelName: '*', // Very explicit way to edge-detect to trigger code on first
      // render of a specific chat channel (for handling read/unread
      // transitions etc). If null, there is nothing pending.
      // If '*' then render on whatever the next channelName is.
      // if any-other-string, then we are waiting for that specific channelName
      pastMessageLimit: initialMessageLimit,
    }
  },

  changeChannel(selectedChannelName) {
    joyrideStore.completeTag(`mgbjr-CT-fp-chat-channel-select-${selectedChannelName}`)
    if (
      selectedChannelName &&
      selectedChannelName.length > 0 &&
      selectedChannelName !== this._calculateActiveChannelName()
    ) {
      _previousChannelName = selectedChannelName
      this.setState({
        pastMessageLimit: initialMessageLimit,
        pendingCommentsRenderForChannelName: selectedChannelName,
      })
      this.props.handleChangeSubNavParam(selectedChannelName)
    }
  },

  handleChatChannelChange(newChannelName) {
    this.changeChannel(newChannelName)
    this.setState({ view: 'comments' })
  },

  handleDocumentKeyDown(e) {
    if (e.keyCode === 27 && this.state.view === 'channels') this.setState({ view: 'comments' })
  },

  handleDocumentClick() {
    if (this.state.view === 'channels') this.setState({ view: 'comments' })
  },

  componentWillMount() {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
    document.addEventListener('click', this.handleDocumentClick)
  },

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
    document.removeEventListener('click', this.handleDocumentClick)
  },

  componentDidUpdate() {
    const { pendingCommentsRenderForChannelName } = this.state
    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
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
          if (this.state.pastMessageLimit <= initialMessageLimit && this.state.view === 'comments')
            this.refs.bottomOfMessageDiv.scrollIntoView(false)
        }
      }
    }
  },

  handleToggleChannelSelector(e) {
    // prevent document click from immediately closing the menu on toggle open
    e.preventDefault()
    e.nativeEvent.stopImmediatePropagation()
    const { view } = this.state

    this.setState({ view: view === 'comments' ? 'channels' : 'comments' })
  },

  doesChannelHaveUnreads(channelName, channelTimestamps) {
    const latestForChannel = _.find(channelTimestamps, { _id: channelName })
    if (!latestForChannel) return false

    const lastReadByUser = getLastReadTimestampForChannel(this.context.settings, channelName)

    return !lastReadByUser || latestForChannel.lastCreatedAt.getTime() > lastReadByUser.getTime()
  },

  renderUnreadChannelIndicator(channelName, channelTimeStamps) {
    if (!this.doesChannelHaveUnreads(channelName, channelTimeStamps)) return null

    return <Label empty circular color="red" size="mini" style={unreadChannelIndicatorStyle} />
  },

  /** Render the channel chooser list. This is shown when this.state.view == 'channels'
   *
   */
  renderChannelSelector() {
    const { view } = this.state
    const { currUser, currUserProjects, chatChannelTimestamps } = this.props
    const { settings } = this.context
    const wallChannelName = currUser
      ? makeChannelName({ scopeGroupName: 'User', scopeId: currUser.username })
      : null
    const isOpen = view === 'channels'

    // My Wall
    const myWall = !currUser ? null : (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>
            My Wall
          </List.Header>
        </List.Item>
        <List.Item onClick={() => this.handleChatChannelChange(wallChannelName)} title="My Wall">
          <Icon name="user" />
          <List.Content>
            {makePresentedChannelName(wallChannelName, currUser.username)}
            {this.renderUnreadChannelIndicator(wallChannelName, chatChannelTimestamps)}
          </List.Content>
        </List.Item>
      </List>
    )

    // PUBLIC (GLOBAL) CHANNELS
    const publicChannels = (
      <List selection className={`mgbjr-chat-channel-select-public-${isOpen ? 'open' : 'closed'}`}>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>
            Public Channels
          </List.Header>
        </List.Item>
        {ChatChannels.sortedKeys.map(k => {
          const chan = ChatChannels[k]
          const showThisOption =
            !chan.hideFromPublic || (isUserSuperAdmin(currUser) || isUserTeacher(currUser))
          return showThisOption ? (
            <List.Item
              key={k}
              onClick={() => this.handleChatChannelChange(chan.channelName)}
              title={chan.description}
            >
              <Icon name={chan.icon} />
              <List.Content>
                {makePresentedChannelName(chan.channelName)}
                {this.renderUnreadChannelIndicator(chan.channelName, chatChannelTimestamps)}
              </List.Content>
            </List.Item>
          ) : null
        })}
      </List>
    )

    const dmChannels = null
    // (
    //   <List selection>
    //     <List.Item>
    //       <List.Header disabled style={{ textAlign: 'center' }}>Direct Messages</List.Header>
    //     </List.Item>
    //     {/* TODO stub func for dgolds to get DM channels*/}
    //     {/* TODO onClick this.handleChatChannelChange */}
    //     {[
    //       <List.Item key='@dgolds'>
    //         <Image avatar src='/api/user/iCyqxrbq8K9oLGx7h/avatar/60' />
    //         <List.Content>
    //           @dgolds
    //           <Icon name='pin' color='grey' style={{ position: 'absolute', right: '1em' }} />
    //         </List.Content>
    //       </List.Item>,
    //       <List.Item key='@levithomason'>
    //         <Image avatar src='http://www.gravatar.com/avatar/833ca628e2a682683f916adb954b8db3?s=50&d=mm' />
    //         <List.Content>
    //           @levithomason
    //           <Icon name='pin' color='grey' style={{ position: 'absolute', right: '1em' }} />
    //         </List.Content>
    //       </List.Item>,
    //     ]}
    //   </List>
    // )

    // PROJECT CHANNELS
    const projectChannels = (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>
            Project Channels
          </List.Header>
        </List.Item>
        {_.sortBy(
          currUserProjects,
          p => (currUser && p.ownerId === currUser._id ? '' : p.ownerName),
        ).map(project => {
          const isOwner = currUser && project.ownerId === currUser._id
          const channelName = makeChannelName({ scopeGroupName: 'Project', scopeId: project._id })
          return (
            <List.Item key={project._id} onClick={() => this.handleChatChannelChange(channelName)}>
              <Icon
                title={`Navigate to ${isOwner ? 'your' : 'their'} project`}
                as={QLink}
                elOverride="i"
                to={`/u/${project.ownerName}/projects/${project.name}`}
                name="sitemap"
                color={isOwner ? 'green' : 'blue'}
                onClick={e => e.nativeEvent.stopImmediatePropagation()}
              />
              <List.Content title="Select Channel">
                {!isOwner && project.ownerName + ' : '}
                {project.name}
                {this.renderUnreadChannelIndicator(channelName, chatChannelTimestamps)}
              </List.Content>
            </List.Item>
          )
        })}
      </List>
    )

    // ASSET CHANNELS
    const pinnedChannelNames = getPinnedChannelNames(settings)
    const assetChannelObjects = _.chain([this.props.subNavParam]) // Current channel at top of this list
      .concat(pinnedChannelNames) // Add the other pinned Channels
      .uniq() // Remove dupes
      .map(parseChannelName) // parse channelName to channelObject
      .filter({ scopeGroupName: 'Asset' }) // We only want the Asset channels for this list
      .value()

    const assetChannels = (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>
            Asset Channels
          </List.Header>
        </List.Item>

        {_.map(assetChannelObjects, aco => (
          <List.Item key={aco.channelName} onClick={() => this.handleChatChannelChange(aco.channelName)}>
            <Icon
              title={`View/Edit Asset`}
              as={QLink}
              elOverride="i"
              to={`/assetEdit/${aco.scopeId}`}
              name="pencil"
              color="blue"
              onClick={e => e.nativeEvent.stopImmediatePropagation()}
            />
            <List.Content>
              <Icon
                name="pin"
                color={_.includes(pinnedChannelNames, aco.channelName) ? 'green' : 'grey'}
                onClick={e => {
                  togglePinnedChannelName(settings, aco.channelName)
                  e.stopPropagation()
                  e.preventDefault()
                }}
                style={{ position: 'absolute', right: '1em' }}
              />
              {/* !isAssetOwner && assetOwnerName + ' : ' */}
              {_getAssetNameIfAvailable(aco.scopeId, _.find(chatChannelTimestamps, { _id: aco.channelName }))}
              {this.renderUnreadChannelIndicator(aco.channelName, chatChannelTimestamps)}
            </List.Content>
          </List.Item>
        ))}

        <List.Item>
          <List.Content>
            Pin an 'Asset Chat' channel here to enable chat notifications for that Asset
          </List.Content>
        </List.Item>
      </List>
    )

    const style = {
      position: 'absolute',
      overflow: 'auto',
      margin: '0 10px',
      top: '5em',
      bottom: '0.5em',
      left: '0',
      right: '0',
      transition: 'transform 200ms, opacity 200ms',
      transform: isOpen ? 'translateY(0)' : 'translateY(-3em)',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
      opacity: +isOpen,
      pointerEvents: isOpen ? 'all' : 'none',
      zIndex: '100',
    }

    return (
      <div style={style}>
        {myWall}
        {publicChannels}
        {dmChannels}
        {projectChannels}
        {assetChannels}
      </div>
    )
  },

  /**
   * This is intended to generate the 2nd objectName param that is required by
   * makePresentedChannelName() for objects that are not the global ones.
   * It's done here since we don't want the generic code in chats.js to have to
   * re-get the objects in order to get their names. It's more efficient to get the
   * names locally
   * @param {String} channelName
   * @returns {String} something like project.name or asset.name or user.name
   */
  findObjectNameForChannelName(channelName) {
    const channelObj = parseChannelName(channelName)

    // Global channels are a special case since they are a fixed mapping in chats.js
    if (channelObj.scopeGroupName === 'Global') return null // these are handled directly in makePresentedChannelName() which is what we are generating this data for

    // map project_id to project.name
    if (channelObj.scopeGroupName === 'Project') {
      const { currUserProjects } = this.props
      const proj = _.find(currUserProjects, { _id: channelObj.scopeId })
      return proj ? proj.name : `Project Chat #${channelObj.scopeId}`
    }

    // map asset_id to asset.name
    if (channelObj.scopeGroupName === 'Asset')
      return _getAssetNameIfAvailable(
        channelObj.scopeId,
        _.find(this.props.chatChannelTimestamps, { _id: channelName }),
      )

    // user wall - no mapping required: scopeID for wall posts is the user id (for user friendlines, and user rename is unsupported currently and may never be)
    if (channelObj.scopeGroupName === 'User') return `User "${channelObj.scopeId}"`

    // Catch-all error to remind us that we forgot to write this when adding a new channel time (DMs etc)
    console.error(
      `findObjectNameForChannelName() has a ScopeGroupName (${channelObj.scopeGroupName}) that is not in user context. #investigate#`,
    )
    return 'TODO'
  },

  render() {
    const { currUser, isSuperAdmin, user } = this.props
    const { view, pastMessageLimit } = this.state
    const channelName = this._calculateActiveChannelName()
    const channelObj = parseChannelName(channelName)
    const objName = this.findObjectNameForChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, objName)
    const presentedChannelIconName = makePresentedChannelIconName(channelName)

    return (
      <div>
        <div>
          <Input
            fluid
            value={presentedChannelName}
            readOnly
            icon={presentedChannelIconName}
            size="small"
            id="mgbjr-fp-chat-channelDropdown"
            iconPosition="left"
            action={{
              icon: 'dropdown',
              onClick: this.handleToggleChannelSelector,
            }}
            labelPosition="right"
            onClick={this.handleToggleChannelSelector}
          />
        </div>

        <div>
          {this.renderChannelSelector()}
          {view === 'comments' && (
            <ChatMessagesView
              currUser={currUser}
              user={user}
              pastMessageLimit={pastMessageLimit}
              isSuperAdmin={isSuperAdmin}
              handleExtendMessageLimit={newLimit => {
                this.setState({ pastMessageLimit: newLimit })
              }}
              channelName={channelName}
              MessageContextComponent={
                channelObj.scopeGroupName === 'Global' ? null : (
                  <Popup
                    on="hover"
                    size="small"
                    hoverable
                    position="left center"
                    trigger={<Button active icon={presentedChannelIconName} />}
                  >
                    <Popup.Header>Public Chat Channel for this {channelObj.scopeGroupName}</Popup.Header>
                    <Popup.Content>
                      <div style={{ minWidth: '300px' }}>
                        {channelObj.scopeGroupName === 'Asset' && (
                          <AssetCardGET assetId={channelObj.scopeId} renderView="s" />
                        )}
                        {channelObj.scopeGroupName === 'Project' && (
                          <ProjectCardGET projectId={channelObj.scopeId} />
                        )}
                        {channelObj.scopeGroupName === 'User' && (
                          <span>
                            User Wall for <QLink to={`/u/${channelObj.scopeId}`}>@{channelObj.scopeId}</QLink>
                          </span>
                        )}
                      </div>
                    </Popup.Content>
                  </Popup>
                )
              }
            />
          )}
        </div>

        <p ref="bottomOfMessageDiv">&nbsp;</p>
      </div>
    )
  },
})

export default fpChat
