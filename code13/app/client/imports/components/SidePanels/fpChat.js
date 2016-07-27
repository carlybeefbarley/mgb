import _ from 'lodash';
import React, { PropTypes } from 'react';
import QLink from '/client/imports/routes/QLink';

import reactMixin from 'react-mixin';
import { Chats } from '/imports/schemas';
import { ChatChannels, currUserCanSend, ChatSendMessage, chatParams, getChannelKeyFromName } from '/imports/schemas/chats';
import moment from 'moment';

const initialMessageLimit = 5
const additionalMessageIncrement = 15

// This is a little more complicated than it should be because Semantic UI has some peculiarities with the 
// 'dropdown' control. In order to hve it so pretty, they take some liberties with the <option> element.
// The result for us is that we can't set it in render() directly. We have to set it in componentDidMount()/
// componentDidUpdate() and then we also have to explicitly squash any idemponent changes creating loops.
// 
// So.. this is ok while I understand it, but if it gets any more complex it may be worth looking at a less
// 'special' ui control than dropdown

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
    const channelName = this.props.subNavParam              // This is something like mgb-announce.. i.e a valid ChatChannels[something].name
    const channelKey = getChannelKeyFromName(channelName)   // So this should be something like 'MGBBUGS'.. i.e. a key into ChatChannels{}
    return channelKey || "GENERAL"
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
    }
  },


  componentDidMount: function() {
    const $dropDown = $(".fpChatDropDown")

    // TODO: See how to set this in render() instead. See comment at start of file for some context on this.
    $dropDown.dropdown( 'set exactly', this._calculateActiveChannelName() )

    // Callback to handle changes in channel Name. This is overactive because of the 'set exactly' 
    // operations, hence the squishing in this.changeChannel()
    $dropDown.dropdown( {  onChange: selectedChannelName => this.changeChannel(selectedChannelName) })
  },


  componentDidUpdate: function(prevProps) {
    if (this.state.pastMessageLimit <= initialMessageLimit)
      this.refs.bottomOfMessageDiv.scrollIntoView(false)

    // TODO: See how to set this in render() instead. 
    const $dropDown = $(".fpChatDropDown")    
    if (prevProps.subNavParam !== this.props.subNavParam)
      $dropDown.dropdown( 'set exactly', this._calculateActiveChannelName() )  // See notes above to see how we avoid infite loops on this
  },


  doSendMessage: function() {    
    const msg = this.refs.theMessage.value
    if (!msg || msg.length < 1)
      return

    ChatSendMessage(this._calculateActiveChannelKey(), msg, (error, result) => {
      if (error) 
        alert("cannot send message because: " + error.reason)
      else
        this.refs.theMessage.value = ""
    })
  },

  renderGetMoreMessages() {
    const { chats } = this.data
    const maxH = chatParams.maxClientChatHistory
    if (this.data.loading)
      return <p>loading...</p>

    if (!chats)
      return null

    if (chats.length < this.state.pastMessageLimit)
      return <div className="ui horizontal divider tiny header"
                title={`There are no earlier messages in this channel`}>
                  (start of topic)
              </div>

    if (chats.length >= maxH)
      return <div className="ui horizontal divider tiny header"
                title={`You may only go back ${maxH} messages`}>
                  (history limit reached)
              </div>

    return <a title={`Currently showing most recent ${chats.length} messages. Click here to get up to ${additionalMessageIncrement} earlier messages`}
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
    return  <div className="comment" key={c._id}>
              <QLink to={to} className="avatar">
                <img src={`/api/user/${c.byUserId}/avatar`}></img>
              </QLink>
              <div className="content">
                <QLink to={to} className="author">{c.byUserName}</QLink>
                <div className="metadata">
                  <span className="date" title={absTime}>{ago}</span>
                </div>
                <div className="text">{c.message}&nbsp;</div>
              </div>
            </div>
  },


  render: function () {    

    const channelKey = this._calculateActiveChannelKey()
    const channelName = this._calculateActiveChannelName()

    const canSend = currUserCanSend(this.props.currUser, channelKey)
    var disabler = cls => ( (canSend ? "" : "disabled ") + cls)

    return  <div>
              <div className="ui fluid tiny search selection dropdown fpChatDropDown">
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
              
              
              <div className="ui small comments">
              { this.renderGetMoreMessages() }
              { this.data.chats && this.data.chats.map( c => (this.renderMessage(c))) }
              </div>

              <form className="ui small form">
                <div className={disabler("field")}>
                  <textarea rows="3" placeholder="your message..." ref="theMessage" maxLength={chatParams.maxChatMessageTextLen}></textarea>
                </div>
                <div className={disabler("ui blue right floated labeled submit icon button")} ref="sendChatMessage" onClick={this.doSendMessage}>
                  <i className="chat icon"></i> Send Message
                </div>
              </form>

             <p ref="bottomOfMessageDiv">&nbsp;</p> 
            </div>
  }  
})