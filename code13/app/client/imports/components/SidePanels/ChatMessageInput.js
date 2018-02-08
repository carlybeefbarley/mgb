import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Form, Progress, TextArea } from 'semantic-ui-react'

import { showToast } from '/client/imports/modules'
import { joyrideStore } from '/client/imports/stores'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { encodeAssetInMsg } from './fpChat-message'
import { logActivity } from '/imports/schemas/activity'
import { setLastReadTimestampForChannel } from '/imports/schemas/settings-client'

import {
  parseChannelName,
  currUserCanSend,
  ChatSendMessageOnChannelName,
  chatParams,
  makePresentedChannelName,
  getUserNameFromChannelName,
  getUserMentions,
} from '/imports/schemas/chats'

class ChatMessageInput extends Component {
  static propTypes = {
    currUser: PropTypes.oneOfType([PropTypes.object.isRequired, PropTypes.oneOf([null])]),
    channelName: PropTypes.string.isRequired,
  }

  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  static contextTypes = {
    settings: PropTypes.object,
  }

  state = {
    isMessagePending: false,
  }

  sendMessage = () => {
    const { value } = this.state
    const { channelName } = this.props

    if (_.isEmpty(_.trim(value))) return

    const channelObj = parseChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, channelObj.scopeId)

    joyrideStore.completeTag(`mgbjr-CT-fp-chat-send-message`)
    joyrideStore.completeTag(`mgbjr-CT-fp-chat-send-message-on-${channelName}`)

    // TODO: Set pending?, disable textarea on pendings
    this.setState({ isMessagePending: true })
    ChatSendMessageOnChannelName(channelName, value, (error, result) => {
      this.setState({ isMessagePending: false })
      if (error) showToast.error('Cannot send message because: ' + error.reason)
      else {
        this.setState({ value: '' })
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
          const userName = getUserMentions(value)
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
  }

  handleTextAreaChange = e => {
    this.setState({ value: e.target.value })
  }

  handleTextAreaDrop = e => {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      console.log('Drop - NO asset')
      return
    }
    this.setState({
      value: (this.state.value || '') + encodeAssetInMsg(asset),
    })
  }

  handleTextAreaKeyDown = e => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault()
      this.setState(({ value }) => ({ value: _.trim(value) }), this.sendMessage)
    }
  }

  render() {
    const { value } = this.state
    const { currUser, channelName, style } = this.props
    const canSend = currUserCanSend(currUser, channelName)

    const channelObj = parseChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, channelObj.scopeId)

    const currMessageLen = _.get(value, 'length', 0)
    const { maxChatMessageTextLen } = chatParams

    const mergedStyle = {
      ...style,
      flex: '0 0 auto',
    }

    const textAreaStyle = {
      maxHeight: '10em',
      border: '2px solid rgba(0, 0, 0, 0.35)',
      borderRadius: '0.25em',
    }

    return (
      <div style={mergedStyle}>
        <Form size="small">
          <Form.Field>
            <TextArea
              id="mgbjr-fp-chat-messageInput"
              disabled={!canSend}
              autoHeight
              rows={1}
              style={textAreaStyle}
              placeholder={'Message ' + presentedChannelName}
              value={value}
              onChange={this.handleTextAreaChange}
              maxLength={maxChatMessageTextLen}
              onDragOver={DragNDropHelper.preventDefault}
              onKeyDown={this.handleTextAreaKeyDown}
              onDrop={this.handleTextAreaDrop}
            />
            {/*
            Old send button
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
            */}
            {currMessageLen >= maxChatMessageTextLen * 0.5 && (
              <Progress
                size="tiny"
                color="orange"
                total={maxChatMessageTextLen}
                value={currMessageLen}
                error={currMessageLen >= maxChatMessageTextLen}
              />
            )}
            {/*
            Old help text and characters left indicator
            <small style={{ display: 'block', padding: '0 0.5em', overflow: 'hidden' }}>
              <div style={{ float: 'right' }}>
                <strong>{maxChatMessageTextLen - currMessageLen}</strong> characters
                left
              </div>
              <div style={{ float: 'left' }}>
                <strong>Enter:</strong> send
                <br />
                <strong>Shift + Enter:</strong> newline
              </div>
            </small>
            */}
          </Form.Field>
        </Form>
      </div>
    )
  }
}

export default ChatMessageInput
