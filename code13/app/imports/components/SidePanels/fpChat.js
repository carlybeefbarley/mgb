import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import { Chats } from '../../schemas';
import { ChatChannels, currUserCanSend, ChatSendMessage, chatParams } from '../../schemas/chats';
import moment from 'moment';

const initialMessageLimit = 5
const additionalMessageIncrement = 15

export default fpChat = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired,  // Typically something like "200px". 
    isSuperAdmin:           PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff    
  },

  getInitialState: function() {
    return {
      activeChannelKey: "GENERAL",
      pastMessageLimit: initialMessageLimit
    }
  },

  getMeteorData: function() {
    const chatChannel = ChatChannels[this.state.activeChannelKey]
    const uid = this.props.currUser ? this.props.currUser._id : null
    const handleForChats = Meteor.subscribe("chats.userId", uid, chatChannel.name, this.state.pastMessageLimit)

    return {
      chats: Chats.find({}, {sort: {createdAt: 1}}).fetch(),
      loading: !handleForChats.ready()
    }
  },

  changeChannel: function(selectedChannelKey)
  {
    this.setState( {
      activeChannelKey: selectedChannelKey,
      pastMessageLimit: initialMessageLimit
    })
  },

  componentDidMount: function() {
    const $dropDown = $(".fpChatDropDown")
    $dropDown.dropdown( 'set exactly', this.state.activeChannelKey)
    $dropDown.dropdown( {  onChange: selectedChannelKey => this.changeChannel(selectedChannelKey) })
  },


  componentDidUpdate: function() {
    if (this.state.pastMessageLimit <= initialMessageLimit)
      this.refs.bottomOfMessageDiv.scrollIntoView(false)
  },


  doSendMessage: function() {    
    const msg = this.refs.theMessage.value
    if (!msg || msg.length < 1)
      return

    ChatSendMessage(this.state.activeChannelKey, msg, (error, result) => {
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
    const absTime = moment(c.createdAt).format('MMMM Do YYYY, h:mm:ss a')
    return  <div className="comment" key={c._id}>
              <a className="avatar">
                <img src={`/api/user/${c.byUserId}/avatar`}></img>
              </a>
              <div className="content">
                <a className="author">{c.byUserName}</a>
                <div className="metadata">
                  <span className="date" title={absTime}>{ago}</span>
                </div>
                <div className="text">{c.message}&nbsp;</div>
              </div>
            </div>
  },


  render: function () {    
    const canSend = currUserCanSend(this.props.currUser, this.state.activeChannelKey)
    var disabler = cls => ( (canSend ? "" : "disabled ") + cls)

    return  <div>
              <div className="ui fluid tiny search selection dropdown fpChatDropDown">
                <input type="hidden" name="channels" defaultValue=""></input>
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
                             data-value={k} >
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