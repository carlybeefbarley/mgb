import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ChatMessage, { encodeAssetInMsg } from './fpChat-message'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { showToast } from '/client/imports/modules'
import { Chats } from '/imports/schemas'
import { joyrideStore } from '/client/imports/stores'
import { Button, Comment, Divider, Form, Header, Icon } from 'semantic-ui-react'
import { isSameUserId } from '/imports/schemas/users'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import { logActivity } from '/imports/schemas/activity'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals'
import FlagEntity from '/client/imports/components/Controls/FlagEntityUI'
import ResolveReportEntity from '/client/imports/components/Controls/FlagResolve'
import { setLastReadTimestampForChannel } from '/imports/schemas/settings-client'
import QLink from '/client/imports/routes/QLink'
import moment from 'moment'

import {
  deleteChatRecord,
  restoreChatRecord,
  parseChannelName,
  currUserCanSend,
  ChatSendMessageOnChannelName,
  chatParams,
  makePresentedChannelName,
  getUserNameFromChannelName,
  getUserMentions,
} from '/imports/schemas/chats'

const additionalMessageIncrement = 15
const _noTopMarginSty = { marginTop: 0 }

const MessageTopDivider = ({ id, children, content, title }) => (
  <Divider id={id} horizontal title={title} style={_noTopMarginSty}>
    <Header color="grey" size="tiny">
      {children || content}
    </Header>
  </Divider>
)

const _isCurrUsersWall = (chat, currUser) => {
  const channelInfo = parseChannelName(chat.toChannelName)
  return currUser.username === channelInfo.scopeId && channelInfo.scopeGroupName === 'User'
}

const DeleteChatMessage = ({ chat, currUser, isSuperAdmin }) =>
  currUser &&
  (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin || _isCurrUsersWall(chat, currUser)) &&
  !chat.isDeleted ? (
    <span className="mgb-show-on-parent-hover" onClick={() => deleteChatRecord(chat._id)}>
      &nbsp;
      <Icon color="red" circular link name="delete" />
    </span>
  ) : null

const UndeleteChatMessage = ({ chat, currUser, isSuperAdmin }) =>
  currUser && (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin) && chat.isDeleted ? (
    <span className="mgb-show-on-parent-hover" onClick={() => restoreChatRecord(chat._id)}>
      &nbsp;
      <Icon color="blue" circular link name="undo" />
    </span>
  ) : null

const ChatMessagesView = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    channelName: PropTypes.string.isRequired,
    pastMessageLimit: PropTypes.number.isRequired,
    handleExtendMessageLimit: PropTypes.func.isRequired, // Call this with new desired pastMessageLimit
    MessageContextComponent: PropTypes.node, // - A react component that will be rendered to the left of the 'Send Message' Button as context for the message send
  },

  getInitialState() {
    return {
      isMessagePending: false,
    }
  },

  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  contextTypes: {
    settings: PropTypes.object,
  },

  getMeteorData() {
    const { channelName, pastMessageLimit } = this.props
    const handleForChats = Meteor.subscribe('chats.channelName', channelName, pastMessageLimit)
    const retval = {
      chats: Chats.find({ toChannelName: channelName }, { sort: { createdAt: 1 } }).fetch(),
      loading: !handleForChats.ready(),
    }
    return retval
  },

  componentDidUpdate() {
    const { channelName } = this.props
    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
    if (!this.data.loading) {
      // First.. Maybe mark channel as read. This uses setLastReadTimestampForChannel()
      // which will do no work if the value has not changed
      if (this.data.chats && this.data.chats.length > 0) {
        const timestamp = _.last(this.data.chats).createdAt
        setLastReadTimestampForChannel(this.context.settings, channelName, timestamp)
      }
    }
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const { pastMessageLimit } = this.props
    const elementId = 'mgbjr-fp-chat-channel-get-earlier-messages'
    if (this.data.loading) return <p id={elementId}>loading...</p>

    if (!chats || chats.length === 0)
      return (
        <MessageTopDivider
          id={elementId}
          title="There are no messages or comments here yet"
          content="(no messages yet)"
        />
      )

    if (chats.length < pastMessageLimit)
      return (
        <MessageTopDivider
          id={elementId}
          title={`There are no earlier available messages in this channel`}
          content="(start of topic)"
        />
      )
    if (chats.length >= chatParams.maxClientChatHistory)
      return (
        <MessageTopDivider
          id={elementId}
          title={`You may only go back ${chatParams.maxClientChatHistory} messages`}
          content="(history limit reached)"
        />
      )

    return (
      <MessageTopDivider
        id={elementId}
        title={`Currently showing most recent ${chats.length} messages. Click here to get up to ${additionalMessageIncrement} earlier messages`}
        content={
          <a style={{ cursor: 'pointer', textTransform: 'none' }} onClick={this.doGetMoreMessages}>
            <Icon name="history" style={{ margin: 0 }} /> Get older messages
          </a>
        }
      />
    )
  },

  doSendMessage() {
    const { messageValue } = this.state
    const { channelName } = this.props
    if (!messageValue || messageValue.length < 1) return
    const channelObj = parseChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, channelObj.scopeId)

    joyrideStore.completeTag(`mgbjr-CT-fp-chat-send-message`)
    joyrideStore.completeTag(`mgbjr-CT-fp-chat-send-message-on-${channelName}`)

    // TODO: Set pending?, disable textarea on pendings
    this.setState({ isMessagePending: true })
    ChatSendMessageOnChannelName(channelName, messageValue, (error, result) => {
      this.setState({ isMessagePending: false })
      if (error) showToast.error('Cannot send message because: ' + error.reason)
      else {
        this.setState({ messageValue: '' })
        setLastReadTimestampForChannel(this.context.settings, channelName, result.chatTimestamp)
        if (
          channelObj.scopeGroupName === 'Global' ||
          channelObj.scopeGroupName === 'User' ||
          channelObj.scopeGroupName === 'Asset'
        ) {
          const otherData = { toChatChannelName: channelName }
          const toUserName = getUserNameFromChannelName(channelName, this.props.user)
          if (toUserName) otherData.toUserName = toUserName
          logActivity('user.message', `Sent a message on ${presentedChannelName}`, null, null, otherData)
          const userName = getUserMentions(messageValue)
          if (userName) {
            otherData.toUserName = userName // it is ok, because mentioned user can differ from wall user or asset owner
            logActivity(
              'user.messageAt',
              `Mentioned ${userName} on ${presentedChannelName}`,
              null,
              null,
              otherData,
            )
          }
        }
      }
    })
  },

  doGetMoreMessages() {
    const newMessageLimit = Math.min(
      chatParams.maxClientChatHistory,
      this.props.pastMessageLimit + additionalMessageIncrement,
    )
    this.props.handleExtendMessageLimit(newMessageLimit)
  },

  renderMessage(c) {
    const ago = moment(c.createdAt).fromNow()
    const to = `/u/${c.byUserName}`
    const { isSuperAdmin } = this.props
    const absTime = moment(c.createdAt).format('MMMM Do YYYY, h:mm:ss a')
    const currUser = Meteor.user()
    //const isModerator = isUserModerator(currUser)
    return (
      <Comment key={c._id}>
        <QLink to={to} className="avatar">
          {currUser &&
          currUser._id == c.byUserId && (
            <img src={makeCDNLink(currUser.profile.avatar)} style={{ maxHeight: '3em' }} />
          )}
          {(!currUser || currUser._id !== c.byUserId) && (
            <img
              src={makeCDNLink(
                `/api/user/${c.byUserId}/avatar/${SpecialGlobals.avatar.validFor}`,
                makeExpireTimestamp(SpecialGlobals.avatar.validFor),
              )}
              style={{ maxHeight: '3em' }}
            />
          )}
        </QLink>
        <Comment.Content>
          <Comment.Author as={QLink} to={to}>
            {c.byUserName}
          </Comment.Author>
          <Comment.Metadata>
            <div title={absTime}>{ago}</div>
            {!(c.suIsBanned === true) &&
            !c.suFlagId && <DeleteChatMessage chat={c} currUser={currUser} isSuperAdmin={isSuperAdmin} />}
            <UndeleteChatMessage chat={c} currUser={currUser} isSuperAdmin={isSuperAdmin} />
            <FlagEntity entity={c} currUser={currUser} tableCollection={'Chats'} />
            {isSuperAdmin && (
              <ResolveReportEntity
                entity={c}
                currUser={currUser}
                tableCollection={'Chats'}
                isSuperAdmin={isSuperAdmin}
              />
            )}
          </Comment.Metadata>
          <Comment.Text>
            {c.suFlagId && !c.suIsBanned ? (
              <span>(flagged, waiting review)</span>
            ) : (
              <ChatMessage msg={c.isDeleted ? '(deleted)' : c.message} />
            )}
            &nbsp;
          </Comment.Text>
        </Comment.Content>
      </Comment>
    )
  },

  onDropChatMsg(e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      console.log('Drop - NO asset')
      return
    }
    this.setState({
      messageValue: (this.state.messageValue || '') + encodeAssetInMsg(asset),
    })
  },

  handleMessageChange(e) {
    this.setState({ messageValue: e.target.value })
  },

  render() {
    const { messageValue } = this.state
    const { currUser, channelName, MessageContextComponent } = this.props
    const canSend = currUserCanSend(currUser, channelName)
    const isOpen = true

    const style = {
      position: 'absolute',
      overflow: 'auto',
      margin: '0',
      padding: '0 8px 0 8px',
      top: '5em',
      bottom: '0.5em',
      left: '0',
      right: '0',
      transition: 'transform 200ms, opacity 200ms',
      transform: isOpen ? 'translateY(0)' : 'translateY(-3em)',
      opacity: +isOpen,
      zIndex: '100',
    }

    return (
      <div style={style}>
        <Comment.Group className="small">
          {this.renderGetMoreMessages()}
          <div id="mgbjr-fp-chat-channel-messages">
            {// Always have at least one div so we will be robust with a '#mgbjr-fp-chat-channel-messages div:first' css selector for tutorials
            this.data.chats ? this.data.chats.map(this.renderMessage) : <div />}
          </div>
          <span />
        </Comment.Group>

        <Form size="small">
          <Form.Field id="mgbjr-fp-chat-messageInput" disabled={!canSend}>
            <Form.TextArea
              rows={3}
              name="message" // this is to squelch form submit warning
              placeholder="your message..."
              value={messageValue}
              onChange={this.handleMessageChange}
              maxLength={chatParams.maxChatMessageTextLen}
              onDragOver={DragNDropHelper.preventDefault}
              onKeyUp={this.handleMessageKeyUp}
              onDrop={this.onDropChatMsg}
            />
          </Form.Field>
          <div>
            {MessageContextComponent}
            <Button
              floated="right"
              color="blue"
              icon={this.state.isMessagePending ? { loading: false, name: 'spinner' } : 'chat'}
              labelPosition="left"
              disabled={!canSend || this.state.isMessagePending}
              content={this.state.isMessagePending ? 'Sending Message...' : 'Send Message'}
              data-tooltip="Shortcut: Ctrl-ENTER to send"
              data-position="bottom right"
              data-inverted=""
              onClick={this.doSendMessage}
            />
          </div>
        </Form>
      </div>
    )
  },

  handleMessageKeyUp(e) {
    if (e.keyCode === 13 && e.ctrlKey) this.doSendMessage()
  },
})

export default ChatMessagesView
