import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {Chats} from '../../schemas';
import moment from 'moment';


export default fpChat = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },


  getMeteorData: function() {
    let uid = this.props.currUser ? this.props.currUser._id : null
    let handleForChats = Meteor.subscribe("chats.userId", uid)

    return {
      chats: Chats.find({}, {sort: {createdAt: 1}}).fetch(),
      loading: !handleForChats.ready()
    }
  },


  componentDidMount: function() {
    $(".fpChatDropDown").dropdown()
  },


  sendMessage: function() {
    const msg = this.refs.theMessage.value
    if (!msg || msg.length < 1)
      return

    const chatMsg = {
      // toChannelName: null,
      // toProjectName: null,
      // toAssetId: null,
      // toOwnerName: null,
      // toOwnerId: null,
      message: msg
    }

    Meteor.call('Chats.send', chatMsg, (error, result) => {
      if (error) 
        alert("cannot send message because: " + error.reason)
      else
        this.refs.theMessage.value = ""
    })
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
    return  <div>
              <div className="ui fluid mini search multiple selection dropdown fpChatDropDown">
                <input type="hidden" name="channels" defaultValue=""></input>
                <i className="dropdown icon"></i>
                <div className="default text">All Channels</div>
                <div className="menu">
                  <div className="item" title="Chat only about the currently viewed/edited asset" data-value="asset"><i className="pencil icon"></i>Asset</div>
                  <div className="item" title="Chat about projects you are involved in" data-value="project"><i className="sitemap icon"></i>Projects</div>
                  <div className="item" title="MGB Site development Team" data-value="mgb"><i className="home icon"></i>MGB Team</div>
                </div>
              </div>

              <div className="ui small comments">
              { this.data.chats && this.data.chats.map( c => (this.renderMessage(c))) }
              </div>

              <form className="ui small form">
                <div className="field">
                  <textarea placeholder="message..." ref="theMessage"></textarea>
                </div>
                <div className="ui blue right floated labeled submit icon button" onClick={this.sendMessage}>
                  <i className="chat icon"></i> Send Message
                </div>
              </form>
            </div>
  }  
})