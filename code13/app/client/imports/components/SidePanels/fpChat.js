import React, { PropTypes } from 'react'
import {
  Button,
  Comment,
  Divider,
  Dropdown,
  Form,
  Header,
} from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'

import reactMixin from 'react-mixin'
import { Chats } from '/imports/schemas'
import { ChatChannels, currUserCanSend, ChatSendMessage, chatParams, getChannelKeyFromName } from '/imports/schemas/chats'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { logActivity } from '/imports/schemas/activity'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'

import moment from 'moment'

const initialMessageLimit = 5
const additionalMessageIncrement = 15

// Some magic for encoding and expanding asset links that are dragged in.
const _encodeAssetInMsg = asset => `❮${asset.dn_ownerName}:${asset._id}:${asset.name}❯`      // See https://en.wikipedia.org/wiki/Dingbat#Unicode ❮  U276E , U276F  ❯

const ChatMessage = ( { msg } ) => {

  let msg2 = ''
  msg2 = msg.replace(/❮[^❯]*❯/g, function (e) {
    const e2 = e.split(':')
    if (e2.length !== 3)
      return e
    const userName=e2[0].slice(1)
    const assetId=e2[1]
    const assetName=e2[2].slice(0,-1)
    return `<a href='/u/${userName}/asset/${assetId}'>${userName}:${assetName}</a>`
  })
  return <span dangerouslySetInnerHTML={{ __html: msg2}} />
}

let _previousChannelKey = null

export default fpChat = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:                 PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                     PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:               PropTypes.string.isRequired,  // Typically something like "200px".
    isSuperAdmin:             PropTypes.bool.isRequired,    // Yes if one of core engineering team. Show extra stuff
    subNavParam:              PropTypes.string.isRequired,  // "" or a string that defines the sub-nav within this FlexPanel
    handleChangeSubNavParam:  PropTypes.func.isRequired     // Call this back with the SubNav string (queryParam ?fp=___.subnavStr) to change it
  },

  _calculateActiveChannelKey: function() {
    const { subNavParam } = this.props  // empty string means "default"

    const channelKey = getChannelKeyFromName(subNavParam)   // So this should be something like 'MGBBUGS'.. i.e. a key into ChatChannels{}
    if (channelKey)
      _previousChannelKey = channelKey
    return channelKey || _previousChannelKey || ChatChannels.defaultChannelKey
  },

  _calculateActiveChannelName: function() {
    return ChatChannels[this._calculateActiveChannelKey()].name
  },

  getInitialState: function() {
    return {
      pastMessageLimit: initialMessageLimit
    }
  },

  getMeteorData: function() {
    const chatChannel = ChatChannels[this._calculateActiveChannelKey()]
    const uid = this.props.currUser ? this.props.currUser._id : null
    const handleForChats = Meteor.subscribe("chats.userId", uid, chatChannel.name, this.state.pastMessageLimit)

    return {
      chats: Chats.find({}, {sort: {createdAt: 1}}).fetch(),
      loading: !handleForChats.ready()
    }
  },

  changeChannel: function(selectedChannelName)
  {
    // Magic and important squishing of idempotent changes below. See comment at start of file for some context on this.
    if (selectedChannelName && selectedChannelName.length > 0 && selectedChannelName !== this._calculateActiveChannelName())
    {
      this.setState( { pastMessageLimit: initialMessageLimit })
      this.props.handleChangeSubNavParam(selectedChannelName)
      joyrideCompleteTag(`mgbjr-CT-fp-chat-channel-select-${selectedChannelName}`)
    }
  },

  componentDidUpdate: function(prevProps) {
    if (this.state.pastMessageLimit <= initialMessageLimit)
      this.refs.bottomOfMessageDiv.scrollIntoView(false)
  },

  doSendMessage: function() {
    const { messageValue } = this.state
    if (!messageValue || messageValue.length < 1)
      return

    const friendlyChannelName = this._calculateActiveChannelName()
    const channelKey = this._calculateActiveChannelKey()
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message`)
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message-on-${friendlyChannelName}`)

    // TODO: Set pending?, disable textarea on pending
    ChatSendMessage(channelKey, messageValue, (error, result) => {
      if (error)
        showToast("Cannot send message because: " + error.reason, 'error')
      else
      {
        this.setState({ messageValue: '' })
        logActivity("user.message",  `Sent a message on #${friendlyChannelName}`, null, null, { toChatChannelKey:  channelKey})
      }
    })
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const elementId='mgbjr-fp-chat-channel-get-earlier-messages'
    if (this.data.loading)
      return <p>loading...</p>

    if (!chats)
      return null

    if (chats.length < this.state.pastMessageLimit)
      return (
        <Divider
          id={elementId}
          as={Header}
          color='grey'
          horizontal
          title={`There are no earlier messages in this channel`}>
          (start of topic)
        </Divider>
      )
    if (chats.length >= chatParams.maxClientChatHistory)
      return (
        <Divider
          id={elementId}
          as={Header}
          color='grey'
          horizontal
          title={`You may only go back ${chatParams.maxClientChatHistory} messages`}>
          (history limit reached)
        </Divider>
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
            <img src={makeCDNLink(currUser.profile.avatar)}></img>
          }
          {(!currUser || currUser._id != c.byUserId) &&
            <img src={makeCDNLink(`/api/user/${c.byUserId}/avatar/60`, makeExpireTimestamp(60))}></img>
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
      messageValue: this.state.messageValue + _encodeAssetInMsg( asset )
    } )
  },

  handleChatChannelChange: function (e, { value }) {
    this.changeChannel(value)
  },

  handleMessageChange: function(e) {
    this.setState({ messageValue: e.target.value })
  },

  render: function () {
    const channelKey = this._calculateActiveChannelKey()
    const channelName = this._calculateActiveChannelName()
    const { messageValue } = this.state
    const canSend = currUserCanSend(this.props.currUser, channelKey)

    return  (
      <div>
        <Dropdown
          id='mgbjr-fp-chat-channelDropdown'
          fluid
          search
          selection
          onChange={this.handleChatChannelChange}
          value={channelName}
          options={ChatChannels.sortedKeys.map( k => {
            const chan = ChatChannels[k]
            return !chan ? null : {
                key: k,
                // TODO this should be a popup, need options shorthand so we can return a Dropdown.Item
                // https://github.com/Semantic-Org/Semantic-UI-React/pull/1038
                title: chan.description,
                text: chan.name,
                value: chan.name,
                icon: chan.icon,
              }
          })}
        />

        <Comment.Group className="small" >
        { this.renderGetMoreMessages() }
        { this.data.chats && this.data.chats.map(this.renderMessage) }
        <span id='mgbjr-fp-chat-channel-messages' />
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
            onClick={this.doSendMessage}/>
        </Form>

        <p ref="bottomOfMessageDiv">&nbsp;</p>
      </div>
    )
  }
})