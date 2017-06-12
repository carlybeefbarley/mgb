import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Comment, Divider, Form, Header, Icon, Input, Label, List, Popup } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'
import AssetCardGET from '/client/imports/components/Assets/AssetCardGET'
import ProjectCardGET from '/client/imports/components/Projects/ProjectCardGET'

import { isSameUserId } from '/imports/schemas/users'

import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Chats, Azzets } from '/imports/schemas'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import {
  getLastReadTimestampForChannel,
  setLastReadTimestampForChannel,
  getPinnedChannelNames,
  togglePinnedChannelName
} from '/imports/schemas/settings-client'

import { logActivity } from '/imports/schemas/activity'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import {
  deleteChatRecord,
  restoreChatRecord,
  parseChannelName,
  makeChannelName,
  ChatChannels,
  currUserCanSend,
  ChatSendMessageOnChannelName,
  isChannelNameValid,
  chatParams,
  makePresentedChannelName,
  makePresentedChannelIconName
} from '/imports/schemas/chats'
import SpecialGlobals from '/imports/SpecialGlobals.js'

const unreadChannelIndicatorStyle = {
  marginLeft:   '0.3em',
  marginBottom: '0.9em',
  fontSize:     '0.5rem',
}

import moment from 'moment'

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

 ◊ TODO (Phase 8: Delete message)
 √ [feature] Implement core delete Message code for server
 √ [feature] Implement core delete Message code for fpChat
 √ [feature] Make sure message OWNERS (only) can delete their messages
 √ [feature] Make sure Admins (only) can delete any message
 ◊ [feature] Make sure ProjectOwners (only) can delete any message in a project they own
 √ [Merge] Merge into master and test
 √ [Deploy] ya.
 √ [More testing] and fix any bad stuff

 ◊ TODO (Phase 9: Refactor)
 ◊ [Refactor] break into <fpChats> + <ChatChannelSelector> + <ChatChannelMessages>

 ◊ TODO (Phase 10: Embedded scope-related chat)
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Project Overview (for owners/members)
 ◊ [Enable] Enable Send-to-Asset in currUserCanSend()
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Asset Overview (for owners/members)
 ◊ [Feature] Implement findObjectNameForChannelName() for Users
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in User Profile - for a Wall-style experience

 ◊ TODO (Phase 11: Forums/Threads)
 ◊ ...make this list of detailed work using _topic

 */

const initialMessageLimit = 5
const additionalMessageIncrement = 15

const MessageTopDivider = ({ elementId, content, title }) => (
  <Divider
    id={elementId}
    as={Header}
    color='grey'
    size='small'
    horizontal
    title={title}>
    {content}
  </Divider>
)

/**
 * This is a server-supported solution for getting the AssetNames for
 * pinned Asset Chat channels. See how RPC "Chats.getLastMessageTimestamps" helps out here
 * @param {String} assetId
 */
const _getAssetNameIfAvailable = (assetId, chatChannelTimestamp) => {

  // Hopefully it is in chatChannelTimestamps as returned by RPC Chats.getLastMessageTimestamps

  if (chatChannelTimestamp && chatChannelTimestamp.assetInfo && chatChannelTimestamp.assetInfo.name)
    return chatChannelTimestamp.assetInfo.name  // Sweet!

  // ok, let's see what we've got here.. Maybe we don't have the info we need yet from the server
  const a = Azzets.findOne( assetId )
  return a ? a.name : 'Asset #' + assetId
}

// Some magic for encoding and expanding asset links that are dragged in.
const _encodeAssetInMsg = asset => `❮${asset.dn_ownerName}:${asset._id}:${asset.name}❯`      // See https://en.wikipedia.org/wiki/Dingbat#Unicode ❮  U276E , U276F  ❯

const _doDeleteMessage = chatId => deleteChatRecord( chatId )

const _isCurrUsersWall = (chat, currUser) => {
  const channelInfo = parseChannelName(chat.toChannelName)
  return (currUser.username === channelInfo.scopeId && channelInfo.scopeGroupName === 'User')
}

const DeleteChatMessage = ( { chat, currUser, isSuperAdmin } ) => (
  ( (currUser &&
     (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin  || _isCurrUsersWall(chat, currUser))) &&
     !chat.isDeleted
    ) ?
    <span className='mgb-show-on-parent-hover' onClick={() => _doDeleteMessage(chat._id)}>
      &nbsp;
      <Icon color='red' circular link name='delete'/>
    </span>
    :
    null
)
const _unDeleteMessage = chatId => restoreChatRecord( chatId )

const UndeleteChatMessage = ( { chat, currUser, isSuperAdmin} ) => (
  ( (currUser && (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin)) && chat.isDeleted) ?
    <span className='mgb-show-on-parent-hover' onClick={() => _unDeleteMessage(chat._id)}>
      &nbsp;
      <Icon color='blue' circular link name='undo'/>
    </span>
    :
    null
)
// Render a Chat message nicely using React
const ChatMessage = ( { msg } ) => {
  let begin = 0
  let chunks = []
  msg.replace( /❮[^❯]*❯|@[a-zA-Z0-9]+/g, function(e, offset, str) {
    chunks.push( <span key={chunks.length}>{str.slice( begin, offset )}</span> )
    begin = offset + e.length
    const e2 = e.split( ':' )
    if (e2.length === 3) {
      const userName = e2[0].slice( 1 )
      const assetId = e2[1]
      const assetName = e2[2].slice( 0, -1 )
      const link = <QLink key={chunks.length} to={`/u/${userName}/asset/${assetId}`}>{userName}:{assetName}</QLink>
      chunks.push( link )
      return e
    }
    else if (e2.length === 2) {
      const userName = e2[0].slice( 1 )
      const assetId = e2[1].slice( 0, -1 )
      const link = <QLink key={chunks.length} to={`/u/${userName}/asset/${assetId}`}>{userName}:{assetId}</QLink>
      chunks.push( link )
      return e
    }
    else if (e[0] === '@') {
      const userName = e.slice( 1 )
      chunks.push(<QLink key={chunks.length} to={`/u/${userName}`}>@{userName}</QLink>)
      return e
    }
    else  
      return e
  } )
  chunks.push( <span key={chunks.length}>{msg.slice( begin )}</span> )
  return <span>{chunks}</span>
}

// This is a simple way to remember the channel key for the flexPanel since there is exactly one of these.
// Users got annoyed when they always went back to the default channel
// TODO: Push this up to flexPanel.js? or have flexPanel.js provide an optional 'recent state' prop?
let _previousChannelName = null // This should be null or a name known to succeed with isChannelNameValid()

const fpChat = React.createClass( {
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:                        PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:                PropTypes.array,              // Projects list for currently logged in user
    user:                            PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:                      PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:                    PropTypes.bool.isRequired,    // Yes if one of core engineering team. Show extra stuff
    subNavParam:                     PropTypes.string.isRequired,  // "" or a string that defines the sub-nav within this FlexPanel
    handleChangeSubNavParam:         PropTypes.func.isRequired,    // Call this back with the SubNav string (queryParam ?fp=___.subnavStr) to change it
    // chat stuff
    chatChannelTimestamps:           PropTypes.array,              // as defined by Chats.getLastMessageTimestamps RPC
    requestChatChannelTimestampsNow: PropTypes.func.isRequired,   // It does what it says on the box. Used by fpChat
    hazUnreadChats:                  PropTypes.array               // As defined in App.js:state
  },

  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  contextTypes: {
    settings: PropTypes.object
  },

  _calculateActiveChannelName: function() {
    const { subNavParam } = this.props  // empty string means "default"
    const channelName = subNavParam   // So this should be something like 'G_MGBBUGS_'.. i.e. a key into ChatChannels{}
    return isChannelNameValid( channelName ) ? channelName : _previousChannelName || chatParams.defaultChannelName
  },

  getInitialState: function() {
    return {
      view:                                'comments',           // Exactly one of ['comments', 'channels']
      pendingCommentsRenderForChannelName: '*',                  // Very explicit way to edge-detect to trigger code on first
                                                                 // render of a specific chat channel (for handling read/unread
                                                                 // transitions etc). If null, there is nothing pending.
                                                                 // If '*' then render on whatever the next channelName is.
                                                                 // if any-other-string, then we are waiting for that specific channelName
      pastMessageLimit:                    initialMessageLimit,
      isMessagePending:                    false
    }
  },

  getMeteorData: function() {
    const chatChannelName = this._calculateActiveChannelName()
    const handleForChats = Meteor.subscribe( "chats.channelName", chatChannelName, this.state.pastMessageLimit )
    const retval = {
      chats:   Chats.find( { toChannelName: chatChannelName }, { sort: { createdAt: 1 } } ).fetch(),
      loading: !handleForChats.ready()
    }
    return retval
  },

  changeChannel: function(selectedChannelName) {
    joyrideCompleteTag( `mgbjr-CT-fp-chat-channel-select-${selectedChannelName}` )
    if (selectedChannelName && selectedChannelName.length > 0 && selectedChannelName !== this._calculateActiveChannelName()) {
      _previousChannelName = selectedChannelName
      this.setState( {
        pastMessageLimit:                    initialMessageLimit,
        pendingCommentsRenderForChannelName: selectedChannelName
      } )
      this.props.handleChangeSubNavParam( selectedChannelName )
    }
  },

  handleChatChannelChange: function(newChannelName) {
    this.changeChannel( newChannelName )
    this.setState( { view: 'comments' } )
  },

  handleDocumentKeyDown: function(e) {
    if (e.keyCode === 27 && this.state.view === 'channels') {
      this.setState( { view: 'comments' } )
    }
  },

  handleDocumentClick: function(e) {
    if (this.state.view === 'channels') {
      this.setState( { view: 'comments' } )
    }
  },

  componentWillMount: function() {
    document.addEventListener( 'keydown', this.handleDocumentKeyDown )
    document.addEventListener( 'click', this.handleDocumentClick )
  },

  componentWillUnmount: function() {
    document.removeEventListener( 'keydown', this.handleDocumentKeyDown )
    document.removeEventListener( 'click', this.handleDocumentClick )
  },

  componentDidUpdate: function() {
    const { pendingCommentsRenderForChannelName } = this.state
    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
    if (this.state.view === 'comments' && !this.data.loading) {
      const channelName = this._calculateActiveChannelName()
      // Maybe mark channel as read. This uses setLastReadTimestampForChannel()
      // which will do no work if the value has not changed
      if (this.data.chats && this.data.chats.length > 0) {
        const timestamp = _.last( this.data.chats ).createdAt
        setLastReadTimestampForChannel( this.context.settings, channelName, timestamp )
      }

      if (pendingCommentsRenderForChannelName) {
        if (pendingCommentsRenderForChannelName === channelName || '*' === pendingCommentsRenderForChannelName) {
          // OK, let's do stuff!

          // 0. First, note that we have done this stuff (so we don't redo it)
          this.setState( { pendingCommentsRenderForChannelName: null } )

          // 1. Refresh the chat notifications
          this.props.requestChatChannelTimestampsNow()

          // 2. Maybe scroll last message into view
          if (this.state.pastMessageLimit <= initialMessageLimit && this.state.view === 'comments')
            this.refs.bottomOfMessageDiv.scrollIntoView( false )

        }
      }
    }
  },

  doSendMessage: function() {
    const { messageValue } = this.state
    if (!messageValue || messageValue.length < 1)
      return
    const channelName = this._calculateActiveChannelName()
    const channelObj = parseChannelName( channelName )
    const presentedChannelName = makePresentedChannelName( channelName, channelObj.scopeId )

    joyrideCompleteTag( `mgbjr-CT-fp-chat-send-message` )
    joyrideCompleteTag( `mgbjr-CT-fp-chat-send-message-on-${channelName}` )

    // TODO: Set pending?, disable textarea on pendings
    this.setState( {isMessagePending: true} )
    ChatSendMessageOnChannelName( channelName, messageValue, (error, result) => {
      this.setState( { isMessagePending: false } )
      if (error)
        showToast( "Cannot send message because: " + error.reason, 'error' )
      else {
        this.setState( { messageValue: '' } )
        if (channelObj.scopeGroupName === 'Global' || channelObj.scopeGroupName === 'User')
          logActivity( 'user.message', `Sent a message on ${presentedChannelName}`, null, null, { toChatChannelName: channelName } ) //
      }
    } )
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const elementId = 'mgbjr-fp-chat-channel-get-earlier-messages'
    if (this.data.loading)
      return <p id={elementId}>loading...</p>

    if (!chats || chats.length === 0)
      return (
        <MessageTopDivider
          elementId={elementId}
          title='There are no messages or comments here yet'
          content='(no messages yet)' />
      )

    if (chats.length < this.state.pastMessageLimit)
      return (
        <MessageTopDivider
          elementId={elementId}
          title={`There are no earlier available messages in this channel`}
          content='(start of topic)' />
      )
    if (chats.length >= chatParams.maxClientChatHistory)
      return (
        <MessageTopDivider
          elementId={elementId}
          title={`You may only go back ${chatParams.maxClientChatHistory} messages`}
          content='(history limit reached)' />
      )

    return (
      <a
        id={elementId}
        title={`Currently showing most recent ${chats.length} messages. Click here to get up to ${additionalMessageIncrement} earlier messages`}
        style={{ cursor: 'pointer' }}
        onClick={this.doGetMoreMessages}>
        Get earlier messages..
      </a>
    )
  },

  doGetMoreMessages() {
    const newMessageLimit = Math.min( chatParams.maxClientChatHistory, this.state.pastMessageLimit + additionalMessageIncrement )
    this.setState( { pastMessageLimit: newMessageLimit } )
  },

  renderMessage: function(c) {
    const ago = moment( c.createdAt ).fromNow()
    const to = `/u/${c.byUserName}`
    const {isSuperAdmin} = this.props
    const absTime = moment( c.createdAt ).format( 'MMMM Do YYYY, h:mm:ss a' )
    const currUser = Meteor.user()

    return (
      <Comment key={c._id}>
        <QLink to={to} className="avatar">
          {currUser && currUser._id == c.byUserId &&
          <img src={makeCDNLink( currUser.profile.avatar )} style={{ maxHeight: "3em" }}></img>
          }
          {(!currUser || currUser._id !== c.byUserId) &&
          <img src={makeCDNLink( `/api/user/${c.byUserId}/avatar/${SpecialGlobals.avatar.validFor}`, makeExpireTimestamp( SpecialGlobals.avatar.validFor ) )}
               style={{ maxHeight: "3em" }}></img>
          }
        </QLink>
        <Comment.Content>
          <Comment.Author as={QLink} to={to}>{c.byUserName}</Comment.Author>
          <Comment.Metadata>
            <div title={absTime}>{ago}</div>
            <DeleteChatMessage chat={c} currUser={currUser} isSuperAdmin={isSuperAdmin} />
            <UndeleteChatMessage chat={c} currUser={currUser} isSuperAdmin={isSuperAdmin} />
          </Comment.Metadata>
          <Comment.Text>
            <ChatMessage msg={c.isDeleted ? '(deleted)' : c.message} />&nbsp;
          </Comment.Text>
        </Comment.Content>
      </Comment>
    )
  },

  onDropChatMsg: function(e) {
    const asset = DragNDropHelper.getAssetFromEvent( e )
    if (!asset) {
      console.log( "Drop - NO asset" )
      return
    }
    this.setState( {
      messageValue: (this.state.messageValue || '') + _encodeAssetInMsg( asset )
    } )
  },

  handleMessageChange: function(e) {
    this.setState( { messageValue: e.target.value } )
  },

  handleToggleChannelSelector: function(e) {
    // prevent document click from immediately closing the menu on toggle open
    e.preventDefault()
    e.nativeEvent.stopImmediatePropagation()
    const { view } = this.state

    this.setState( { view: view === 'comments' ? 'channels' : 'comments' } )
  },

  doesChannelHaveUnreads: function(channelName, channelTimestamps) {
    const latestForChannel = _.find( channelTimestamps, { _id: channelName } )
    if (!latestForChannel)
      return false

    const lastReadByUser = getLastReadTimestampForChannel( this.context.settings, channelName )

    return !lastReadByUser || latestForChannel.lastCreatedAt.getTime() > lastReadByUser.getTime()
  },

  renderUnreadChannelIndicator: function(channelName, channelTimeStamps) {
    if (!this.doesChannelHaveUnreads( channelName, channelTimeStamps ))
      return null

    return <Label empty circular color='red' size='mini' style={unreadChannelIndicatorStyle} />
  },

  /** Render the channel chooser list. This is shown when this.state.view == 'channels'
   *
   */
  renderChannelSelector: function() {
    const { view } = this.state
    const { currUser, currUserProjects, chatChannelTimestamps } = this.props
    const { settings } = this.context
    const wallChannelName = currUser ? makeChannelName( { scopeGroupName: 'User', scopeId: currUser.username } ) : null

    // My Wall
    const myWall = ( !currUser ? null :
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>My Wall</List.Header>
        </List.Item>
        <List.Item
          onClick={() => this.handleChatChannelChange( wallChannelName )}
          title='My Wall'
        >
          <Icon name='user' />
          <List.Content>
            {makePresentedChannelName( wallChannelName, currUser.username )}
            {this.renderUnreadChannelIndicator( wallChannelName, chatChannelTimestamps )}
          </List.Content>
        </List.Item>
      </List>
    )

    // PUBLIC (GLOBAL) CHANNELS
    const publicChannels = (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>Public Channels</List.Header>
        </List.Item>
        {ChatChannels.sortedKeys.map( k => {
          const chan = ChatChannels[k]
          return (
            <List.Item
              key={k}
              onClick={() => this.handleChatChannelChange( chan.channelName )}
              title={chan.description}
            >
              <Icon name={chan.icon} />
              <List.Content>
                {makePresentedChannelName( chan.channelName )}
                {this.renderUnreadChannelIndicator( chan.channelName, chatChannelTimestamps )}
              </List.Content>
            </List.Item>
          )
        } )}
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
          <List.Header disabled style={{ textAlign: 'center' }}>Project Channels</List.Header>
        </List.Item>
        {
          _.sortBy(
            currUserProjects, p => (currUser && p.ownerId === currUser._id ? '' : p.ownerName)
          ).map( project => {
            const isOwner = (currUser && project.ownerId === currUser._id)
            const channelName = makeChannelName( { scopeGroupName: 'Project', scopeId: project._id } )
            return (
              <List.Item key={project._id} onClick={() => this.handleChatChannelChange( channelName )}>
                <Icon
                  title={`Navigate to ${isOwner ? 'your' : 'their'} project`}
                  as={QLink}
                  elOverride='i'
                  to={`/u/${project.ownerName}/projects/${project.name}`}
                  name='sitemap'
                  color={isOwner ? 'green' : 'blue' }
                  onClick={e => e.nativeEvent.stopImmediatePropagation()}
                />
                <List.Content title='Select Channel'>
                  { !isOwner && project.ownerName + ' : ' }
                  { project.name }
                  {this.renderUnreadChannelIndicator( channelName, chatChannelTimestamps )}
                </List.Content>
              </List.Item>
            )
          } )
        }
      </List>
    )

    // ASSET CHANNELS
    const pinnedChannelNames = getPinnedChannelNames( settings )
    const assetChannelObjects = _
      .chain( [this.props.subNavParam] )      // Current channel at top of this list
      .concat( pinnedChannelNames )           // Add the other pinned Channels
      .uniq()                                 // Remove dupes
      .map( parseChannelName )                // parse channelName to channelObject
      .filter( { scopeGroupName: 'Asset' } )  // We only want the Asset channels for this list
      .value()

    const assetChannels = (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>Asset Channels</List.Header>
        </List.Item>

        { _.map( assetChannelObjects, aco => (
          <List.Item
            key={aco.channelName}
            onClick={() => this.handleChatChannelChange( aco.channelName )}>
              <Icon
                title={`View/Edit Asset`}
                as={QLink}
                elOverride='i'
                to={`/assetEdit/${aco.scopeId}`}
                name='pencil'
                color='blue'
                onClick={e => e.nativeEvent.stopImmediatePropagation()}
              />
            <List.Content>
              <Icon
                name='pin'
                color={ _.includes( pinnedChannelNames, aco.channelName ) ? 'green' : 'grey' }
                onClick={e => {
                  togglePinnedChannelName( settings, aco.channelName )
                  e.stopPropagation()
                  e.preventDefault()
                } }
                style={{ position: 'absolute', right: '1em' }} />
              { /* !isAssetOwner && assetOwnerName + ' : ' */ }
              { _getAssetNameIfAvailable( aco.scopeId, _.find( chatChannelTimestamps, { _id: aco.channelName } ) ) }
              {this.renderUnreadChannelIndicator( aco.channelName, chatChannelTimestamps )}
            </List.Content>
          </List.Item>
        ) ) }

        <List.Item>
          <List.Content>
            Pin an 'Asset Chat' channel here to enable chat notifications for that Asset
          </List.Content>
        </List.Item>

      </List>
    )

    const isOpen = view === 'channels'

    const style = {
      position:      'absolute',
      overflow:      'auto',
      margin:        '0 10px',
      top:           '5em',
      bottom:        '0.5em',
      left:          '0',
      right:         '0',
      transition:    'transform 200ms, opacity 200ms',
      transform:     isOpen ? 'translateY(0)' : 'translateY(-3em)',
      background:    '#fff',
      boxShadow:     '0 1px 4px rgba(0, 0, 0, 0.2)',
      opacity:       +isOpen,
      pointerEvents: isOpen ? 'all' : 'none',
      zIndex:        '100',
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
   * @param {React.Component} MessageContextComponent - A react component that will be rendered to the left of the 'Send Message' Button as context for the message send
   */
  renderComments: function(MessageContextComponent) {
    const { messageValue } = this.state
    const { currUser } = this.props
    const channelName = this._calculateActiveChannelName()
    const canSend = currUserCanSend( currUser, channelName )

    return (
      <div>
        <Comment.Group className="small">
          { this.renderGetMoreMessages() }
          <div id='mgbjr-fp-chat-channel-messages'>
            { // Always have at least one div so we will be robust with a '#mgbjr-fp-chat-channel-messages div:first' css selector for tutorials
              this.data.chats ? this.data.chats.map( this.renderMessage ) : <div></div>
            }
          </div>
          <span />
        </Comment.Group>

        <Form size='small' onSubmit={e => e.preventDefault()}>
          <Form.Field id='mgbjr-fp-chat-messageInput' disabled={!canSend}>
            <Form.TextArea
              rows="3"
              name='message' // this is to squelch form submit warning
              placeholder="your message..."
              value={messageValue}
              onChange={this.handleMessageChange}
              maxLength={chatParams.maxChatMessageTextLen}
              onDragOver={DragNDropHelper.preventDefault}
              onKeyUp={this.handleMessageKeyUp}
              onDrop={this.onDropChatMsg}>
            </Form.TextArea>
          </Form.Field>
          <div>
            { MessageContextComponent }
            <Button
              floated='right'
              color='blue'
              icon={ this.state.isMessagePending ? { loading: false, name: 'spinner' } : 'chat' }
              labelPosition='left'
              disabled={!canSend || this.state.isMessagePending}
              content={this.state.isMessagePending ? 'Sending Message...' : 'Send Message' }
              data-tooltip="Shortcut: Ctrl-ENTER to send"
              data-position="bottom right"
              data-inverted=""
              onClick={this.doSendMessage} />
          </div>
        </Form>
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
  findObjectNameForChannelName: function(channelName) {
    const channelObj = parseChannelName( channelName )

    // Global channels are a special case since they are a fixed mapping in chats.js
    if (channelObj.scopeGroupName === 'Global')
      return null // these are handled directly in makePresentedChannelName() which is what we are generating this data for

    // map project_id to project.name
    if (channelObj.scopeGroupName === 'Project') {
      const { currUserProjects } = this.props
      const proj = _.find( currUserProjects, { _id: channelObj.scopeId } )
      return proj ? proj.name : `Project Chat #${channelObj.scopeId}`
    }

    // map asset_id to asset.name
    if (channelObj.scopeGroupName === 'Asset')
      return _getAssetNameIfAvailable(
        channelObj.scopeId,
        _.find( this.props.chatChannelTimestamps, { _id: channelName } )
      )

    // user wall - no mapping required: scopeID for wall posts is the user id (for user friendlines, and user rename is unsupported currently and may never be)
    if (channelObj.scopeGroupName === 'User'){
      return `User "${channelObj.scopeId}"`}

    // Catch-all error to remind us that we forgot to write this when adding a new channel time (DMs etc)
    console.error( `findObjectNameForChannelName() has a ScopeGroupName (${channelObj.scopeGroupName}) that is not in user context. #investigate#` )
    return 'TODO'
  },

  handleMessageKeyUp: function(e)
  {
    if (e.keyCode === 13 && e.ctrlKey)
      this.doSendMessage()
  },

  render: function() {
    const { view } = this.state
    const channelName = this._calculateActiveChannelName()
    const channelObj = parseChannelName( channelName )
    const objName = this.findObjectNameForChannelName( channelName )
    const presentedChannelName = makePresentedChannelName( channelName, objName )
    const presentedChannelIconName = makePresentedChannelIconName( channelName )


    return (
      <div>
        <label
          style={{ fontWeight: 'bold' } }>
          Channel:
        </label>

        <Input
          fluid
          value={presentedChannelName}
          readOnly
          icon={presentedChannelIconName}
          size='small'
          id='mgbjr-fp-chat-channelDropdown'
          iconPosition='left'
          action={{
            icon:    'dropdown',
            onClick: this.handleToggleChannelSelector
          }}
          labelPosition='right'
          onClick={this.handleToggleChannelSelector}
          style={{ marginBottom: '0.5em', marginTop: '0.2em' }}
        />

        { this.renderChannelSelector() }
        { view === 'comments' && this.renderComments( channelObj.scopeGroupName === 'Global' ? null :
            <Popup
              on='hover'
              size='small'
              hoverable
              positioning='left center'
              trigger={(
                <Icon
                    style={{ padding: '4px 0px 0px 16px' }}
                    size='big'
                    color='grey'
                    name={presentedChannelIconName}/>
              )}
              >
              <Popup.Header>
                Public Chat Channel for this {channelObj.scopeGroupName }
              </Popup.Header>
              <Popup.Content>
                <div style={{minWidth: '300px'}}>
                  { channelObj.scopeGroupName === 'Asset' &&
                      <AssetCardGET assetId={channelObj.scopeId} allowDrag={true} renderView='s' />
                  }
                  { channelObj.scopeGroupName === 'Project' &&
                      <ProjectCardGET projectId={channelObj.scopeId} />
                  }
                  { channelObj.scopeGroupName === 'User' &&
                      <span>User Wall for <QLink to={`/u/${channelObj.scopeId}`} >@{channelObj.scopeId}</QLink></span>
                  }

                </div>
              </Popup.Content>
            </Popup>
          )
        }

        <p ref="bottomOfMessageDiv">&nbsp;</p>
      </div>
    )
  }
} )

export default fpChat
