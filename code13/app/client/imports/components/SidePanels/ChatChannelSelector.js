import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Icon, Input, Label, List } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

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
} from '/imports/schemas/chats'
import { makePresentedChannelIconName } from '/imports/schemas/chats'

const unreadChannelIndicatorStyle = {
  marginLeft: '0.3em',
  marginBottom: '0.9em',
  fontSize: '0.5rem',
}

const initialMessageLimit = 15

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

class ChatChannelSelector extends Component {
  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
    // User object for context we are navigation to in main page. Can be null/undefined. Can be
    // same as currUser, or different user
    user: PropTypes.object,
    // "" or a string that defines the sub-nav within this FlexPanel
    subNavParam: PropTypes.string.isRequired,
    // Call this back with the SubNav string (queryParam
    // ?fp=___.subnavStr) to change it
    handleChangeSubNavParam: PropTypes.func.isRequired,
    // chat stuff
    chatChannelTimestamps: PropTypes.array, // as defined by Chats.getLastMessageTimestamps RPC
    // requestChatChannelTimestampsNow: PropTypes.func.isRequired, // It does what it says on the box. Used by
  }

  //  = Settings context needed for get/setLastReadTimestampForChannel and the pin/unpin lis=> t
  static contextTypes = {
    settings: PropTypes.object,
  }

  state = {
    open: false,
    pendingCommentsRenderForChannelName: '*',
    // Very explicit way to edge-detect to trigger code on first
    // render of a specific chat channel (for handling read/unread
    // transitions etc). If null, there is nothing pending.
    // If '*' then render on whatever the next channelName is.
    // if any-other-string, then we are waiting for that specific channelName
    pastMessageLimit: initialMessageLimit,
  }

  componentWillMount = () => {
    document.addEventListener('keydown', this.handleDocumentKeyDown)
    document.addEventListener('click', this.handleDocumentClick)
  }

  // componentDidUpdate = () => {
  //   const { pendingCommentsRenderForChannelName } = this.state
  //   // There are some tasks to do the first time a comments/chat list has been rendered for a particular channel
  //   if (this.state.view === 'comments') {
  //     const channelName = this._calculateActiveChannelName()
  //     // Make sure _previousChannelName is updated so async things
  //     // like setLastReadTimestampForChannel() in the ChatMessagesView are correct
  //     _previousChannelName = channelName
  //
  //     if (pendingCommentsRenderForChannelName) {
  //       if (
  //         pendingCommentsRenderForChannelName === channelName ||
  //         '*' === pendingCommentsRenderForChannelName
  //       ) {
  //         // OK, let's do stuff!
  //
  //         // 0. First, note that we have done this stuff (so we don't redo it)
  //         this.setState({ pendingCommentsRenderForChannelName: null })
  //
  //         // 1. Refresh the chat notifications
  //         this.props.requestChatChannelTimestampsNow()
  //       }
  //     }
  //   }
  // }

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.handleDocumentKeyDown)
    document.removeEventListener('click', this.handleDocumentClick)
  }

  _calculateActiveChannelName = () => {
    const { subNavParam } = this.props // empty string means "default"
    const channelName = subNavParam // So this should be something like 'G_MGBBUGS_'.. i.e. a key into ChatChannels{}
    return isChannelNameValid(channelName)
      ? channelName
      : _previousChannelName || chatParams.defaultChannelName
  }

  changeChannel = selectedChannelName => {
    console.log('changeChannel()')
    joyrideStore.completeTag(`mgbjr-CT-fp-chat-channel-select-${selectedChannelName}`)

    if (
      selectedChannelName &&
      selectedChannelName.length > 0 &&
      selectedChannelName !== this._calculateActiveChannelName()
    ) {
      _previousChannelName = selectedChannelName
      this.setState({
        pastMessageLimit: initialMessageLimit,
        // pendingCommentsRenderForChannelName: selectedChannelName,
      })
      this.props.handleChangeSubNavParam(selectedChannelName)
    }
  }

  /**
   * This is intended to generate the 2nd objectName param that is required by
   * makePresentedChannelName() for objects that are not the global ones.
   * It's done here since we don't want the generic code in chats.js to have to
   * re-get the objects in order to get their names. It's more efficient to get the
   * names locally
   * @param {String} channelName
   * @returns {String} something like project.name or asset.name or user.name
   */
  findObjectNameForChannelName = channelName => {
    const channelObj = parseChannelName(channelName)

    // Global channels are a special case since they are a fixed mapping in chats.js
    if (channelObj.scopeGroupName === 'Global') return null // these are handled directly in makePresentedChannelName()
    // which is what we are generating this data for

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

    // user wall - no mapping required: scopeID for wall posts is the user id (for user friendlines, and user rename is
    // unsupported currently and may never be)
    if (channelObj.scopeGroupName === 'User') return `User "${channelObj.scopeId}"`

    // Catch-all error to remind us that we forgot to write this when adding a new channel time (DMs etc)
    console.error(
      `findObjectNameForChannelName() has a ScopeGroupName (${channelObj.scopeGroupName}) that is not in user context. #investigate#`,
    )
    return 'TODO'
  }

  handleChatChannelChange = newChannelName => {
    console.log('handleChatChannelChange()')
    this.changeChannel(newChannelName)
    this.close()
  }

  handleDocumentKeyDown = e => {
    console.log('handleDocumentKeyDown()')
    if (e.keyCode === 27) this.close()
  }

  handleDocumentClick = () => {
    console.log('handleDocumentClick()')
    this.close()
  }

  close = () => {
    console.log('close()')
    this.setState({ open: false })
  }

  open = () => {
    console.log('open()')
    this.setState({ open: true })
  }

  toggle = () => {
    console.log('toggle()')
    this.setState({ open: !this.state.open })
  }

  doesChannelHaveUnreads = (channelName, channelTimestamps) => {
    const latestForChannel = _.find(channelTimestamps, { _id: channelName })
    if (!latestForChannel) return false

    const lastReadByUser = getLastReadTimestampForChannel(this.context.settings, channelName)

    return !lastReadByUser || latestForChannel.lastCreatedAt.getTime() > lastReadByUser.getTime()
  }

  renderUnreadChannelIndicator = (channelName, channelTimeStamps) => {
    if (!this.doesChannelHaveUnreads(channelName, channelTimeStamps)) return null

    return <Label empty circular color="red" size="mini" style={unreadChannelIndicatorStyle} />
  }

  renderMyWall = () => {
    const { currUser, chatChannelTimestamps } = this.props
    const wallChannelName = currUser
      ? makeChannelName({ scopeGroupName: 'User', scopeId: currUser.username })
      : null

    if (!currUser) {
      return null
    }

    return (
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
  }

  renderPublicChannels = () => {
    const { chatChannelTimestamps } = this.props
    const { open } = this.state

    return (
      <List selection className={`mgbjr-chat-channel-select-public-${open ? 'open' : 'closed'}`}>
        <List.Item>
          <List.Header disabled style={{ textAlign: 'center' }}>
            Public Channels
          </List.Header>
        </List.Item>
        {ChatChannels.sortedKeys.map(k => {
          const chan = ChatChannels[k]
          return (
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
          )
        })}
      </List>
    )
  }

  renderDMChannels = () => {
    return null

    // return (
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
  }

  renderProjectChannels = () => {
    const { currUser, currUserProjects, chatChannelTimestamps } = this.props

    return (
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
  }

  renderAssetChannels = () => {
    const { chatChannelTimestamps } = this.props
    const { settings } = this.context

    const pinnedChannelNames = getPinnedChannelNames(settings)
    const assetChannelObjects = _.chain([this.props.subNavParam]) // Current channel at top of this list
      .concat(pinnedChannelNames) // Add the other pinned Channels
      .uniq() // Remove dupes
      .map(parseChannelName) // parse channelName to channelObject
      .filter({ scopeGroupName: 'Asset' }) // We only want the Asset channels for this list
      .value()

    return (
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
  }

  handleInputClick = e => {
    e.nativeEvent.stopImmediatePropagation()
    this.toggle()
  }

  render() {
    const { open } = this.state

    const channelName = this._calculateActiveChannelName()
    const objName = this.findObjectNameForChannelName(channelName)
    const presentedChannelName = makePresentedChannelName(channelName, objName)
    const presentedChannelIconName = makePresentedChannelIconName(channelName)

    const style = { flex: '0 0 auto' }
    const inputContainerStyle = { position: 'relative' }

    const menuStyle = {
      position: 'absolute',
      transition: 'transform 200ms, opacity 200ms',
      top: '100%',
      left: 0,
      right: 0,
      height: '80vh',
      overflowX: 'hidden',
      overflowY: 'scroll',
      transform: open ? 'translateY(0)' : 'translateY(-0.5em)',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
      opacity: +open,
      pointerEvents: open ? 'all' : 'none',
      zIndex: '100',
    }

    return (
      <div style={style}>
        <div style={inputContainerStyle}>
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
              onClick: this.handleInputClick,
            }}
            onClick={this.handleInputClick}
          />
          <div style={menuStyle}>
            {this.renderMyWall()}
            {this.renderPublicChannels()}
            {this.renderDMChannels()}
            {this.renderProjectChannels()}
            {this.renderAssetChannels()}
          </div>
        </div>
      </div>
    )
  }
}

export default ChatChannelSelector
