import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { showToast } from '/client/imports/routes/App'

import reactMixin from 'react-mixin'
import { Chats } from '/imports/schemas'
import { ChatChannels, currUserCanSend, ChatSendMessage, chatParams, getChannelKeyFromName } from '/imports/schemas/chats'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { logActivity } from '/imports/schemas/activity'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

import moment from 'moment'

const initialMessageLimit = 5
const additionalMessageIncrement = 15

// This is a little more complicated than it should be because Semantic UI has some peculiarities with the 
// 'dropdown' control. In order to have it so pretty, they take some liberties with the <option> element.
// The result for us is that we can't set it in render() directly. We have to set it in componentDidMount()/
// componentDidUpdate() and then we also have to explicitly squash any idemponent changes creating loops.
// 
// So.. this is ok whilst I understand it, but if it gets any more complex it may be worth looking at a less
// 'special' ui control than 'ui dropdown'


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

let _recentChannelKey = null

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

  // returns the current channelName WITHOUT THE HASH prefix. It can also return "" for default
  _getRawChannelName: function() { 
    return this.props.subNavParam              // This is something like mgb-announce.. i.e a valid ChatChannels[something].name
  },


  _calculateActiveChannelKey: function() {    
    const channelName = this._getRawChannelName()
    const channelKey = getChannelKeyFromName(channelName)   // So this should be something like 'MGBBUGS'.. i.e. a key into ChatChannels{}
    if (channelKey)
      _recentChannelKey = channelKey
    return channelKey || _recentChannelKey || ChatChannels.defaultChannelKey
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

  componentDidMount: function() {
    const $dropDown = $(".fpChatDropDown")

    // TODO: See how to set this in render() instead. See comment at start of file for some context on this.
    $dropDown.dropdown( 'set exactly', this._calculateActiveChannelName() )

    // Callback to handle changes in channel Name. This is overactive because of the 'set exactly' 
    // operations, hence the squishing in this.changeChannel()
    $dropDown.dropdown( {  onChange: selectedChannelName => this.changeChannel(selectedChannelName) })
    this.latestMessage = null
  },

  componentDidUpdate: function(prevProps) {
    if (this.state.pastMessageLimit <= initialMessageLimit)
      this.refs.bottomOfMessageDiv.scrollIntoView(false)

    // TODO: See how to set this in render() instead. 
    const $dropDown = $(".fpChatDropDown")    
    if (prevProps.subNavParam !== this.props.subNavParam)
      $dropDown.dropdown( 'set exactly', this._calculateActiveChannelName() )  // See notes above to see how we avoid infite loops on this
  },

// DEAD CODE!?
  // show notification with latest message if chat window is closed
  getLatestMessage: function() {
debugger   // DEAD CODE?
    // TODO: get msg
    const msg = null
    if (this.latestMessage != msg) {
      this.latestMessage = msg
      this.showNotification(msg)
    }
  },

  showNotification: function(msg) {
debugger   // DEAD CODE?
    Notification.requestPermission().then((result) => {
      const n = new Notification(msg.toChannelName, {
        body: msg.byUserName + " says:\n" + msg.message
      })
      // focus window and close notification
      n.onclick = (e) => {
        window.focus()
        n.close()
      }
    })
  },

  doSendMessage: function() {    
    const msg = this.refs.theMessage.value
    if (!msg || msg.length < 1)
      return

    const friendlyChannelName = this._calculateActiveChannelName()
    const channelKey = this._calculateActiveChannelKey()
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message`)
    joyrideCompleteTag(`mgbjr-CT-fp-chat-send-message-on-${friendlyChannelName}`)
    
    // TODO: Set pending?
    ChatSendMessage(channelKey, msg, (error, result) => {
      if (error) 
        showToast("Cannot send message because: " + error.reason, 'error')
      else
      {
        this.refs.theMessage.value = ''
        logActivity("user.message",  `Sent a message on #${friendlyChannelName}`, null, null, { toChatChannelKey:  channelKey})
      }
    })
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const maxH = chatParams.maxClientChatHistory
    const elementId='mgbjr-fp-chat-channel-get-earlier-messages'
    if (this.data.loading)
      return <p>loading...</p>

    if (!chats)
      return null

    if (chats.length < this.state.pastMessageLimit)
      return <div id={elementId} className="ui horizontal divider tiny header"
                title={`There are no earlier messages in this channel`}>
                  (start of topic)
              </div>

    if (chats.length >= maxH)
      return <div id={elementId} className="ui horizontal divider tiny header"
                title={`You may only go back ${maxH} messages`}>
                  (history limit reached)
              </div>

    return <a id={elementId} title={`Currently showing most recent ${chats.length} messages. Click here to get up to ${additionalMessageIncrement} earlier messages`}
              onClick={this.doGetMoreMessages}>
                Get earlier messages..
            </a>
  },

  doGetMoreMessages() {
    const newMessageLimit = Math.min(chatParams.maxClientChatHistory, this.state.pastMessageLimit + additionalMessageIncrement)
    this.setState({ pastMessageLimit: newMessageLimit} )
  },
 
  renderMessage: function(c) {
    const ago = moment(c.createdAt).fromNow()
    const to = `/u/${c.byUserName}`

    const absTime = moment(c.createdAt).format('MMMM Do YYYY, h:mm:ss a')
    return (
      <div className="comment animated fadeInRight" key={c._id}>
        <QLink to={to} className="avatar">
          <img src={`/api/user/${c.byUserId}/avatar`}></img>
        </QLink>
        <div className="content">
          <QLink to={to} className="author">{c.byUserName}</QLink>
          <div className="metadata">
            <span className="date" title={absTime}>{ago}</span>
          </div>
          <div className="text"><ChatMessage msg={c.message}/></div>
        </div>
      </div>
    )
  },

  
  
  onDropChatMsg: function (e) { 
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      console.log("Drop - NO asset")
      return
    }
    this.refs.theMessage.value += _encodeAssetInMsg(asset)
  },

  render: function () {    

    const channelKey = this._calculateActiveChannelKey()
    const channelName = this._calculateActiveChannelName()

    const canSend = currUserCanSend(this.props.currUser, channelKey)
    var disabler = cls => ( (canSend ? "" : "disabled ") + cls)

    return  (
      <div>
        <div className="ui fluid tiny search selection dropdown fpChatDropDown" id='mgbjr-fp-chat-channelDropdown'>
          <input type="hidden" name="channels" value={channelName}></input>
          <i className="dropdown icon"></i>
          <div className="default text">All Channels</div>
          <div className="menu">
            {
              ChatChannels.sortedKeys.map( k => { 
                const chan = ChatChannels[k]
                return !chan ? null : 
                  <div className="item" 
                        title={chan.description} 
                        key={k}
                        data-value={chan.name} >
                    <i className={chan.icon + " icon"}></i>{chan.name}
                  </div>                      
              })
            }
          </div>
        </div>
        
        <div className="ui small comments" >
        { this.renderGetMoreMessages() }
        { this.data.chats && this.data.chats.map( c => (this.renderMessage(c))) }
        <span id='mgbjr-fp-chat-channel-messages' />
        </div>

        <form className="ui small form">
          <div className={disabler("field")} id='mgbjr-fp-chat-messageInput'>
            <textarea 
                rows="3" 
                placeholder="your message..." 
                ref="theMessage" 
                maxLength={chatParams.maxChatMessageTextLen} 
                onDragOver={DragNDropHelper.preventDefault}
                onDrop={this.onDropChatMsg}>
            </textarea>
          </div>
          <div className={disabler("ui blue right floated labeled submit icon button")} ref="sendChatMessage" onClick={this.doSendMessage}>
            <i className="chat icon"></i> Send Message
          </div>
        </form>

        <p ref="bottomOfMessageDiv">&nbsp;</p> 
      </div>
    )
  }  
})
