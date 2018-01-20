import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Comment, Divider, Icon } from 'semantic-ui-react'

import FlagEntity from '/client/imports/components/Controls/FlagEntityUI'
import ResolveReportEntity from '/client/imports/components/Controls/FlagResolve'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import { withMeteorData } from '/client/imports/hocs'
import QLink from '/client/imports/routes/QLink'

import { Chats } from '/imports/schemas'
import { deleteChatRecord, restoreChatRecord, parseChannelName, chatParams } from '/imports/schemas/chats'
import { isSameUserId } from '/imports/schemas/users'
import { setLastReadTimestampForChannel } from '/imports/schemas/settings-client'
import SpecialGlobals from '/imports/SpecialGlobals'

import ChatMessage from './fpChat-message'

const _isCurrUsersWall = (chat, currUser) => {
  const channelInfo = parseChannelName(chat.toChannelName)
  return currUser.username === channelInfo.scopeId && channelInfo.scopeGroupName === 'User'
}

const DeleteChatMessage = ({ chat, currUser, isSuperAdmin }) =>
  currUser &&
  (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin || _isCurrUsersWall(chat, currUser)) &&
  !chat.isDeleted ? (
    <span className="mgb-show-on-parent-hover" onClick={() => deleteChatRecord(chat._id)}>
      <Icon color="red" circular link name="delete" />
    </span>
  ) : null

const UndeleteChatMessage = ({ chat, currUser, isSuperAdmin }) =>
  currUser && (isSameUserId(chat.byUserId, currUser._id) || isSuperAdmin) && chat.isDeleted ? (
    <span className="mgb-show-on-parent-hover" onClick={() => restoreChatRecord(chat._id)}>
      <Icon color="blue" circular link name="undo" />
    </span>
  ) : null

class ChatMessagesViewUI extends Component {
  // Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin list
  static contextTypes = {
    settings: PropTypes.object,
  }

  static propTypes = {
    channelName: PropTypes.string.isRequired,
    pastMessageLimit: PropTypes.number.isRequired,
    handleExtendMessageLimit: PropTypes.func.isRequired, // Call this with new desired pastMessageLimit
    MessageContextComponent: PropTypes.node, // - A react component that will be rendered to the left of the 'Send
    // Message' Button as context for the message send
  }

  state = {
    isMessagePending: false,
  }

  componentDidUpdate() {
    const { channelName, chats, loading } = this.props

    // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
    if (!loading) {
      // First.. Maybe mark channel as read. This uses setLastReadTimestampForChannel()
      // which will do no work if the value has not changed
      if (!_.isEmpty(chats)) {
        const last = _.last(chats).createdAt
        const timestamp = last.createdAt
        setLastReadTimestampForChannel(this.context.settings, channelName, timestamp)

        // scroll to latest message
        if (!_.isEqual(this.prevLatestMessage, last._id)) {
          this.ref.scrollTo(0, this.ref.scrollHeight)
        }

        this.prevLatestMessage = last._id
      }
    }
  }

  renderGetMoreMessages = () => {
    const { chats, loading, pastMessageLimit } = this.props

    const props = {}

    if (!chats || chats.length === 0) {
      props.content = '(no messages yet)'
      props.disabled = true
    } else if (chats.length < pastMessageLimit) {
      props.content = '(start of topic)'
      props.disabled = true
    } else if (chats.length >= chatParams.maxClientChatHistory) {
      props.content = '(history limit reached)'
      props.disabled = true
    } else {
      props.icon = 'history'
      props.content = 'Get older messages'
      props.onClick = this.doGetMoreMessages
    }

    return (
      <Button
        id={'mgbjr-fp-chat-channel-get-earlier-messages'}
        loading={loading}
        size="small"
        fluid
        compact
        {...props}
      />
    )
  }

  doGetMoreMessages = () => {
    const { handleExtendMessageLimit, pastMessageLimit } = this.props
    const newLimit = Math.min(chatParams.maxClientChatHistory, pastMessageLimit + 15)

    handleExtendMessageLimit(newLimit)
  }

  renderMessages = () => {
    const { chats } = this.props
    // group chat objects into days, so we can put a divider between each day
    const grouped = _.groupBy(chats, c => moment(c.createdAt).format('L'))

    const messages = _.flatMap(grouped, (chatsForDate, date) => {
      return (
        [
          <Divider key={chatsForDate[0].createdAt.toString()} horizontal section>
            {moment(chatsForDate[0].createdAt).calendar(null, {
              sameDay: '[Today]',
              nextDay: '[Tomorrow]',
              nextWeek: 'Next dddd',
              lastDay: '[Yesterday]',
              lastWeek: 'dddd',
              sameElse: 'ddd, MMM D',
            })}
          </Divider>,
        ]
          // within each date group, aggregate consecutive chats by the same user
          // this way, we can display consecutive chats under one avatar and name
          .concat(
            chatsForDate
              .reduce((acc, next) => {
                const prev = _.last(acc)

                if (prev && prev.byUserId === next.byUserId) {
                  prev.consecutiveChats.push(next)
                } else {
                  next.consecutiveChats = []
                  acc.push(next)
                }

                return acc
              }, [])
              .map(c => {
                // turn each chat message into an array of consecutive chat messages by user
                const $createdAt = moment(c.createdAt)
                const time = $createdAt.format('h:mm a')
                const to = `/u/${c.byUserName}`
                const { isSuperAdmin } = this.props
                const absTime = $createdAt.format('MMMM Do YYYY, h:mm:ss a')
                const currUser = Meteor.user()

                return (
                  <Comment key={c._id}>
                    <QLink to={to} className="avatar">
                      {currUser &&
                      currUser._id === c.byUserId && (
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
                        <div title={absTime}>{time}</div>
                        {!(c.suIsBanned === true) &&
                        !c.suFlagId && (
                          <DeleteChatMessage chat={c} currUser={currUser} isSuperAdmin={isSuperAdmin} />
                        )}
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
                      </Comment.Text>
                      {_.map(c.consecutiveChats, chat => (
                        <Comment.Text key={chat._id} style={{ position: 'relative' }}>
                          <span
                            className="metadata mgb-show-on-parent-hover"
                            style={{
                              position: 'absolute',
                              margin: '0 0.25em 0 0',
                              right: '100%',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {moment(chat.createdAt).format('h:mm a')}
                          </span>
                          {chat.suFlagId && !chat.suIsBanned ? (
                            <span>(flagged, waiting review)</span>
                          ) : (
                            <ChatMessage msg={chat.isDeleted ? '(deleted)' : chat.message} />
                          )}
                        </Comment.Text>
                      ))}
                    </Comment.Content>
                  </Comment>
                )
              }),
          )
      )
    })

    return <div id="mgbjr-fp-chat-channel-messages">{messages}</div>
  }

  handleRef = c => {
    this.ref = c
  }

  render() {
    const style = {
      overflowX: 'hidden',
      overflowY: 'auto',
      whiteSpace: 'pre-wrap',
    }

    return (
      <div style={style} ref={this.handleRef}>
        <Comment.Group className="small">
          {this.renderGetMoreMessages()}
          {this.renderMessages()}
        </Comment.Group>
      </div>
    )
  }
}

export default withMeteorData(({ channelName, pastMessageLimit }) => {
  const handleForChats = Meteor.subscribe('chats.channelName', channelName, pastMessageLimit)

  return {
    chats: Chats.find({ toChannelName: channelName }, { sort: { createdAt: 1 } }).fetch(),
    loading: !handleForChats.ready(),
  }
})(ChatMessagesViewUI)
