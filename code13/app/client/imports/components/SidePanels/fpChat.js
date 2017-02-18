import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Button, Comment, Divider, Input, Form, Header, Icon, List} from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'

import reactMixin from 'react-mixin'
import { Chats } from '/imports/schemas'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import { getLastReadTimestampForChannel, setLastReadTimestampForChannel } from '/imports/schemas/settings-client'

import { logActivity } from '/imports/schemas/activity'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import { 
  parseChannelName, makeChannelName, 
  ChatChannels, 
  currUserCanSend, 
  ChatSendMessageOnChannelName, 
  isChannelNameValid, 
  chatParams, 
  makePresentedChannelName 
} from '/imports/schemas/chats'


const _colors = {
  emptyChannel:      '#aaa',
  unreadChannel:     'orange',
  upToDateChannel:   '#333',

  ownedProjectIcon:  'green',
  memberProjectIcon: 'blue',
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

√ TODO (Phase 3a: Read/Unread)
 √ RPC to support getting aggregates on channels (This is not a fun thing to do as a subscription)
 √ Call the Chats.getLastMessageTimestamps RPC from fpChats when channel selector shown
 √ Implement user settings for most recent message read
 √ Implement color-coding channels by read/unread, and refreshing on channel search ()
 √ Implement updating current channel's read/unread for user if on channel (or if posts to channel)
 √ [Merge] Merge into master and test
 ◊ [Deploy] ya.
 ◊ [More testing] and fix any bad stuff

◊ TODO (Phase 3b: Simple Notifications)
 ◊ Move fpChats._requestChannelTimestampsNow up to App level
 ◊ Add simple way to click a notification icon and go to the channel selector
 ◊ [Merge] Merge into master and test
 ◊ [Deploy] ya.
 ◊ [More testing] and fix any bad stuff
 
TODO (Phase 4: DMs)
 ◊ [Enable] Enable Send-to-DM in currUserCanSend()
 ◊ [Feature] Implement UI to initiate a DM send
 ◊ [Feature] Implement DB stuff to update Notifications/ other records to make a DMs list
 ◊ [Feature] Implement UI to make DM chats findable for a User
 ◊ [Feature] Enable DM list in fpChat
 ◊ [Feature] Implement findObjectNameForChannelName() for DMs
 ◊ ...make this list of detailed work

TODO (Phase 5: Delete message)
 ◊ [feature] Implement core delete Message code for server
 ◊ [feature] Implement core delete Message code for fpChat
 ◊ [feature] Make sure message OWNERS (only) can delete their messages
 ◊ [feature] Make sure Admins (only) can delete any message
 ◊ [feature] Make sure ProjectOwners (only) can delete any message in a project they own
 ◊ [Merge] Merge into master and test
 ◊ [Deploy] ya.
 ◊ [More testing] and fix any bad stuff

TODO (Phase 6: Pinning chats)
 ◊ [feature] Pinning project chat


TODO (Phase 7: Refactor)
 ◊ [Refactor] break into <fpChats> + <ChatChannelSelector> + <ChatChannelMessages>

TODO (Phase 8: Embedded scope-related chat)
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Project Overview (for owners/members)
 ◊ [Enable] Enable Send-to-Asset in currUserCanSend()
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in Asset Overview (for owners/members)
 ◊ [Feature] Implement findObjectNameForChannelName() for Assets
 ◊ [Enable] Enable Send-to-User in currUserCanSend()
 ◊ [Feature] Implement findObjectNameForChannelName() for Users
 ◊ [feature] Allow <ChatChannelMessages> to be embedded in User Profile - for a Wall-style experience

TODO (Phase 9: Forums/Threads)
 ◊ ...make this list of detailed work

*/

const initialMessageLimit = 5
const additionalMessageIncrement = 15

const MessageTopDivider = ( { elementId, content, title } ) => (
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


// Some magic for encoding and expanding asset links that are dragged in.
const _encodeAssetInMsg = asset => `❮${asset.dn_ownerName}:${asset._id}:${asset.name}❯`      // See https://en.wikipedia.org/wiki/Dingbat#Unicode ❮  U276E , U276F  ❯

const ChatMessage = ( { msg } ) => {
  const msg2 = msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const msg3 = msg2.replace(/❮[^❯]*❯/g, function (e) {
    const e2 = e.split(':')
    if (e2.length === 3){
      const userName=e2[0].slice(1)
      const assetId=e2[1]
      const assetName=e2[2].slice(0,-1)
      return `<a href='/u/${userName}/asset/${assetId}'>${userName}:${assetName}</a>`
    }
    else if (e2.length === 2){
      const userName=e2[0].slice(1)
      const assetId=e2[1].slice(0,-1)
      return `<a href='/u/${userName}/asset/${assetId}'>${userName}:${assetId}</a>`
    }
    else {
      return e
    }
  })
  return <span dangerouslySetInnerHTML={{ __html: msg3}} />
}


// This is a simple way to remember the channel key for the flexPanel since there is exactly one of these. 
// Users got annoyed when they always went back to the default channel
// TODO: Push this up to flexPanel.js? or have flexPanel.js provide an optional 'recent state' prop?
let _previousChannelName = null // This should be null or a name know to pass isChannelNameValid() 

export default fpChat = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:                 PropTypes.object,             // Currently Logged in user. Can be null/undefined
    currUserProjects:         PropTypes.array,              // Projects list for currently logged in user
    user:                     PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:               PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:             PropTypes.bool.isRequired,    // Yes if one of core engineering team. Show extra stuff
    subNavParam:              PropTypes.string.isRequired,  // "" or a string that defines the sub-nav within this FlexPanel
    handleChangeSubNavParam:  PropTypes.func.isRequired     // Call this back with the SubNav string (queryParam ?fp=___.subnavStr) to change it
  },

  // Settings context needed for get/setLastReadTimestampForChannel
  contextTypes: {
    settings:    PropTypes.object
  },


  _calculateActiveChannelName: function() {
    const { subNavParam } = this.props  // empty string means "default"
    const channelName = subNavParam   // So this should be something like 'G:MGBBUGS:'.. i.e. a key into ChatChannels{}
    return isChannelNameValid(channelName)? channelName : _previousChannelName || chatParams.defaultChannelName
  },

  getInitialState: function() {
    return {
      view:                                 'comments',           // Exactly one of ['comments', 'channels']
      pendingCommentsRenderForChannelName:  '*',                  // Very explicit way to edge-detect to trigger code on first 
                                                                  // render of a specific chat channel (for handling read/unread 
                                                                  // transitions etc). If null, there is nothing pending.
                                                                  // If '*' then render on whatever the next channelName is.
                                                                  // if any-other-string, then we are waiting for that specific channelName
      pastMessageLimit:                     initialMessageLimit,
      channelTimestamps:                    null                  // as defined by Chats.getLastMessageTimestamps RPC
    }
  },

  componentWillMount() {
    this._requestChannelTimestampsNow()
  },

  // TODO: Move this up somewhere else so it is easy to get to, throttled etc
  _requestChannelTimestampsNow: function () {
    const chanArray = _.concat(
      _.map(ChatChannels.sortedKeys, k => makeChannelName( { scopeGroupName: 'Global', scopeId: k } ) ),
      _.map(this.props.currUserProjects, p => makeChannelName( { scopeGroupName: 'Project', scopeId: p._id } ) )
    )
    Meteor.call( 'Chats.getLastMessageTimestamps', chanArray, ( error, result ) =>
    {
      if (error)
        console.log('unable to invoke Chats.getLastMessageTimestamps()', error )
      else
        this.setState( { channelTimestamps: result } )
    })
  },

  getMeteorData: function() {
    const chatChannelName = this._calculateActiveChannelName()
    const handleForChats = Meteor.subscribe("chats.channelName", chatChannelName, this.state.pastMessageLimit)
    const retval = {
      chats: Chats.find({ toChannelName: chatChannelName }, { sort: { createdAt: 1 } }).fetch(),
      loading: !handleForChats.ready()
    }
    return retval
  },

  changeChannel: function(selectedChannelName)
  {
    joyrideCompleteTag(`mgbjr-CT-fp-chat-channel-select-${selectedChannelName}`)
    if (selectedChannelName && selectedChannelName.length > 0 && selectedChannelName !== this._calculateActiveChannelName())
    {
      _previousChannelName = selectedChannelName
      this.setState( { 
        pastMessageLimit: initialMessageLimit,
        pendingCommentsRenderForChannelName: selectedChannelName
      })
      this.props.handleChangeSubNavParam(selectedChannelName)
    }
  },

  handleChatChannelChange: function (newChannelName) {
    this.changeChannel(newChannelName)
    this.setState( { view: 'comments' } )
  },

  componentDidUpdate: function() {
    const { pendingCommentsRenderForChannelName } = this.state
    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
    if (this.state.view === 'comments' && !this.data.loading)
    {
      const channelName = this._calculateActiveChannelName()
      // Maybe mark channel as read. This uses setLastReadTimestampForChannel() 
      // which will do no work if the value has not changed
      if (this.data.chats && this.data.chats.length > 0)
      {
        const timestamp = _.last(this.data.chats).createdAt
        setLastReadTimestampForChannel(this.context.settings, channelName, timestamp)
      }
      
      if (pendingCommentsRenderForChannelName)
      {
        if (pendingCommentsRenderForChannelName === channelName || '*' === pendingCommentsRenderForChannelName)
        {
          // OK, let's do stuff!

          // 0. First, note that we have done this stuff (so we don't redo it)
          this.setState( { pendingCommentsRenderForChannelName: null } )
      
          // Maybe scroll last message into view
          if (this.state.pastMessageLimit <= initialMessageLimit && this.state.view === 'comments')
            this.refs.bottomOfMessageDiv.scrollIntoView(false)

        }
      }
    }
  },

  doSendMessage: function() {
    const { messageValue } = this.state
    if (!messageValue || messageValue.length < 1)
      return

    const channelName = this._calculateActiveChannelName()
    const channelObj = parseChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName)
    
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message`)
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message-on-${channelName}`)

    // TODO: Set pending?, disable textarea on pending
    ChatSendMessageOnChannelName(channelName, messageValue, (error, result) => {
      if (error)
        showToast("Cannot send message because: " + error.reason, 'error')
      else
      {
        this.setState( { messageValue: '' } )
        if (channelObj.scopeGroupName === 'Global')
          logActivity('user.message', `Sent a message on ${presentedChannelName}`, null, null, { toChatChannelName:  channelName})
      }
    })
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const elementId='mgbjr-fp-chat-channel-get-earlier-messages'
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
    const newMessageLimit = Math.min(chatParams.maxClientChatHistory, this.state.pastMessageLimit + additionalMessageIncrement)
    this.setState({ pastMessageLimit: newMessageLimit} )
  },

  renderMessage: function(c) {
    const ago = moment(c.createdAt).fromNow()
    const to = `/u/${c.byUserName}`

    const absTime = moment(c.createdAt).format('MMMM Do YYYY, h:mm:ss a')
    const currUser = Meteor.user()

    return (
      <Comment key={c._id}>
        <QLink to={to} className="avatar">
          {currUser && currUser._id == c.byUserId &&
            <img src={makeCDNLink(currUser.profile.avatar)} style={{ maxHeight: "3em" }}></img>
          }
          {(!currUser || currUser._id != c.byUserId) &&
            <img src={makeCDNLink(`/api/user/${c.byUserId}/avatar/60`, makeExpireTimestamp(60))} style={{ maxHeight: "3em" }}></img>
          }
        </QLink>
        <Comment.Content>
          <Comment.Author as={QLink} to={to}>{c.byUserName}</Comment.Author>
          <Comment.Metadata>
            <div title={absTime}>{ago}</div>
          </Comment.Metadata>
          <Comment.Text><ChatMessage msg={c.message}/>&nbsp;</Comment.Text>
        </Comment.Content>
      </Comment>
    )
  },

  onDropChatMsg: function (e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      console.log("Drop - NO asset")
      return
    }
    this.setState( {
      messageValue: (this.state.messageValue || '') + _encodeAssetInMsg( asset )
    } )
  },

  handleMessageChange: function(e) {
    this.setState({ messageValue: e.target.value })
  },

  handleToggleChannelSelector: function () {
    if (this.state.view === 'channels')
      this._immediateHandleHideChannelSelector()
    else
      this.handleShowChannelSelector()
  },

  handleShowChannelSelector: function() {
    this.setState( { view: 'channels' } )
    this._requestChannelTimestampsNow()
  },

  /**
   * This will immediately handle the channel selector. If this is
   * initiated by a onBlur from a SUIR component, then use 
   * handleBlurHideChannelSelector() in order to allow clicks within
   * the hidden element to be processed before they get masked
   */
  _immediateHandleHideChannelSelector: function() {
    this.setState( { view: 'comments' } )
  },

  /**
   * SUIR blur events get processed before the clicks, so we need to defer this a frame
   * otherwise we will not get the click actions for the items
   */
  handleBlurHideChannelSelector: function() {
    // TODO(@levithomason): (DGolds says) I don't like the 'magic number' here of 120ms. 
    //                      Numbers like 1ms or 10ms never work, whereas 50ms sometimes does.
    //                      but numbers like 120ms do add an unnecessary lag to the experience.
    //                      @levithomason can you please find a more robust and performant way to
    //                      handle this case
    window.setTimeout(this._immediateHandleHideChannelSelector, 120)
  },

  colorForChannelNameHasUnreads(channelName, channelTimestamps) {
    const latestForChannel = _.find(channelTimestamps, { _id: channelName} )
    if (!latestForChannel)
      return _colors.emptyChannel
    const lastReadByUser = getLastReadTimestampForChannel(this.context.settings, channelName)
    return (
        !lastReadByUser || 
        latestForChannel.lastCreatedAt.getTime() > lastReadByUser.getTime()
      ) ? _colors.unreadChannel : _colors.upToDateChannel
  },

  renderChannelSelector: function() {
    const { currUser, currUserProjects } = this.props

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
              onClick={() => this.handleChatChannelChange(chan.channelName)}
              title={chan.description}
              content={makePresentedChannelName(chan.channelName)}
              style={{ color: this.colorForChannelNameHasUnreads(chan.channelName, this.state.channelTimestamps)}}
              icon={chan.icon}
            />
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

    const projectChannels = (
      <List selection>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>Project Channels</List.Header>
        </List.Item>
        { 
          _.sortBy(
            currUserProjects, p => (p.ownerId === currUser._id ? '' : p.ownerName)
          ).map( project => {
            const isOwner = (project.ownerId === currUser._id)
            const channelName = makeChannelName( { scopeGroupName: 'Project', scopeId: project._id } )
            return (
              <List.Item
                  key={project._id}
                  onClick={() => this.handleChatChannelChange(channelName)} >
                <Icon name='sitemap' color={isOwner ? 'green' : 'blue' } />
                <List.Content>
                  <Icon name='pin' color='grey' style={{ position: 'absolute', right: '1em' }} />
                  <span style={{ color: this.colorForChannelNameHasUnreads(channelName, this.state.channelTimestamps)}}>
                    { !isOwner && project.ownerName + ' : ' }
                    { project.name }
                  </span>
                </List.Content>
              </List.Item>
            )
          } )
        }
      </List>
    )

    return (
      <div>
        {publicChannels}
        {dmChannels}
        {projectChannels}
      </div>
    )
  },

  renderComments: function() {
    const { messageValue } = this.state
    const { currUser } = this.props
    const channelName = this._calculateActiveChannelName()
    const canSend = currUserCanSend(currUser, channelName)

    return (
      <div>
        <Comment.Group className="small">
          { this.renderGetMoreMessages() }
          <div  id='mgbjr-fp-chat-channel-messages'>
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
              onDrop={this.onDropChatMsg}>
            </Form.TextArea>
          </Form.Field>
          <Button
            floated='right'
            color='blue'
            icon='chat'
            labelPosition='left'
            disabled={!canSend}
            content='Send Message'
            onClick={this.doSendMessage} />
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
   * @param {any} channelName
   * @returns
   */
  findObjectNameForChannelName: function (channelName) {
    const channelObj = parseChannelName(channelName)
    if (channelObj.scopeGroupName === 'Global')
      return null // these are handled directly in makePresentedChannelName() which is what this is for
    if (channelObj.scopeGroupName === 'Project')
    {
      const { currUserProjects } = this.props
      const proj = _.find(currUserProjects, { _id: channelObj.scopeId})
      return proj ? proj.name : `Project Chat #${channelObj.scopeId}`
    }

    console.error(`findObjectNameForChannelName() has a ScopeGroupName (${channelObj.scopeGroupName}) that is not in user context. #investigate#`)
    return 'TODO'
  },
 
  render: function () {
    const { view } = this.state
    const channelName = this._calculateActiveChannelName()
    const objName = this.findObjectNameForChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, objName)

    return  (
      <div>
        <label 
            style={{ fontWeight: 'bold' } }
            id='mgbjr-fp-chat-channelDropdown'>
          Channel:
        </label>

        <Input
          fluid
          value={presentedChannelName}
          readOnly
          icon='hashtag'
          size='small'
          iconPosition='left'
          label={{ 
            icon: { 
              name: 'dropdown', 
              fitted: true
            }, 
            basic: true,
            onClick: this.handleToggleChannelSelector
          }}
          labelPosition='right'
          onFocus={this.handleShowChannelSelector}
          onBlur={this.handleBlurHideChannelSelector}
          style={{ marginBottom: '0.5em' }}
          />

        { view === 'channels' && this.renderChannelSelector() }
        { view === 'comments' && this.renderComments() }

        <p ref="bottomOfMessageDiv">&nbsp;</p>
      </div>
    )
  }
})