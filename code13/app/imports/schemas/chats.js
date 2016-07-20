// Data model for MGB Chats. 
// See https://github.com/devlapse/mgb/issues/40 for discussion of requirements

// This file must be imported by main_server.js so that the Meteor method can be registered

import { Chats } from '/imports/schemas';
import { check, Match } from 'meteor/check';

const optional = Match.Optional     // Note that Optional does not permit null


var schema = {
  _id: String,              // ID of this chat message

  createdAt: Date,
  updatedAt: Date,          // We may allow edit


  // Identifiers for who sent the chat
  byUserName: String,       // UserName (not ID)
  byUserId: String,         // OK, _this_ one is the ID
 
  // Identifers for scope of the action
  toChannelName: optional(String),    // undefined if global 
  toProjectName: optional(String),    // undefined if not a project-scoped action... oops. what about owner of project
  toAssetId: optional(String),        // If it is an asset-scoped chat - or undefined if not asset-scoped
  toAssetName: optional(String),      // Asset's name If it is an asset-scoped chat (duplicated here for speed)
  toOwnerId: optional(String),        // Owner's user ID if @person. Only one @person... 
  toOwnerName: optional(String),      // Owner's user NAME if @person

  // the actual chat information
  message: String         // Project Name (scoped to owner). Case sensitive
};


export const ChatPosters = {
  SUPERADMIN: "@@superAdmin",
  ACTIVEUSER: "@@activeUser"
}

export const ChatChannels = {
  SYSTEM: { 
    name:         "mgb-announce",
    icon:         "announcement",
    poster:       ChatPosters.SUPERADMIN,
    description:  "Global announcements/alerts from core MGB engineering team",
    subscopes:    {}
  },
  GENERAL: { 
    name:         "general",
    icon:         "world",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "General suggestions, discussions and questions related to MGB",
    subscopes:    {}
  },
  MGBBUGS: { 
    name:         "mgb-bugs",
    icon:         "bug",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Discussions about potential bugs and fixes in MGB",
    subscopes:    {}
  },
  MGBHELP: { 
    name:         "mgb-help",
    icon:         "help circle",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Ask for help in how to use the MGB site",
    subscopes:    {}
  },
  LOOKINGFORGROUP: { 
    name:         "lfg",
    icon:         "users",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Looking for group - message here to find people to work with on MGB projects",
    subscopes:    {}
  },
  RANDOM: {
    name:         "random",
    icon:         "random",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Off-topic discussions not related to MGB",
    subscopes:    {}
  },

  // This one is for testing... 
  //
  // CHATTESTCHANNEL: { 
  //   name:         "mgb-chat-testing",
  //   icon:         "users",
  //   poster:       ChatPosters.SUPERADMIN,
  //   description:  "Hidden channel for chat devs. Mwahaha",
  //   subscopes:    {}
  // },
 
  // ASSET: { 
  //   name:         "asset",
  //   icon:         "write",
  //   description:  "Discussion about the currently viewed/edited asset",
  //   poster:       ChatPosters.ACTIVEUSER,
  //   subscopes:    { assetId: true }
  // },
 
 
  // TODO: Project chat is a bit complex.. will do that later: Limited membership, viewership etc
  // PROJECTMEMBERS: { 
  //   name:         "project-members",
  //   icon:         "",
  //   poster:       "@@projectMember",
  //   description:  "Comments/Discussion by project members about a specific project",
  //   subscopes:    { projectId: true }
  // },

  // PROJECTPUBLIC: { 
  //   name:         "project-public",
  //   icon:         "",
  //   poster:       ChatPosters.ACTIVEUSER,
  //   description:  "Comments/Discussion by anyone about a specific project",
  //   subscopes:    { projectId: true }
  // },
  getIconClass: function (key) { return (ChatChannels.hasOwnProperty(key) ? ChatChannels[key].icon : "warning sign") + " icon"},
  sortedKeys: [ 
    "SYSTEM", 
    "GENERAL", 
    "MGBBUGS", 
    "MGBHELP", 
    "LOOKINGFORGROUP", 
    "RANDOM"
    // "CHATTESTCHANNEL"
  ]
}

export const chatParams = {
  maxChatMessageTextLen: 220,     // Maximum number of chars in a single message
  maxClientChatHistory:  200      // Maximum number of historical messages to send back to client
}

function _userIsSuperAdmin(currUser) {
  let isSuperAdmin = false
  if (currUser && currUser.permissions) {
    currUser.permissions.map((perm) => {
      if (perm.roles[0] === "super-admin")
        isSuperAdmin = true
    })
  }
  return isSuperAdmin
}

export function currUserCanSend(currUser, channelKey) {
  const chatChannel = ChatChannels[channelKey]
  const validPoster = chatChannel.poster
  if (!validPoster)
    return false          // No posters record -> no sends allowed (fail securely)
  switch (validPoster)
  {
    case ChatPosters.SUPERADMIN:
      return _userIsSuperAdmin(currUser)
    case ChatPosters.ACTIVEUSER:
      return !!currUser
    default:
      console.trace("Unknown Permission requirement message posting: ", validPoster)
      return false
  }
}

// Version of lodash/underscore on server doesn't have _.findKey :(
function __findKey(obj, predicate) {
  let keys = _.keys(obj), key
  for (let i = 0, length = keys.length; i < length; i++) {
    key = keys[i]
    if (predicate(obj[key], key, obj)) 
      return key
  }
  return null
}

export function getChannelKeyFromName(cName) {
  return __findKey(ChatChannels, c => (c.name === cName) )
} 


Meteor.methods({

  /** Chats.create
   *  @param data.message        Message to send
   */
  "Chats.send": function(data) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    if (!data.message || data.message.length < 1)
      throw new Meteor.Error(400, "Message empty")

    if (data.message.length > chatParams.maxChatMessageTextLen)
      throw new Meteor.Error(400, "Message too long")

    const channelKey = getChannelKeyFromName(data.toChannelName)

    if (!channelKey)
      throw new Meteor.Error(404, "Channel not known: "+data.toChannelName)

    const currUser = Meteor.user()
    const canSend = currUserCanSend(currUser, channelKey)
    if (!canSend)
      throw new Meteor.Error(401, "No access to write to that channel")

    const now = new Date()
    data.createdAt = now
    data.updatedAt = now
    data.byUserId = this.userId
    data.byUserName = currUser.profile.name
    check(data, _.omit(schema, '_id'))

    let docId = Chats.insert(data)
    if (Meteor.isServer)
      console.log(`  [Chats.send]  "${data.message}"  #${docId}  `)

    return docId
  }
  
});


export function ChatSendMessage(channelKey, msg, completionCallback) {
  const chatChannel = ChatChannels[channelKey]
  if (!msg || msg.length < 1)
  {
    completionCallback({reason: "Message empty"}, null)
    return
  }
  if (msg.length > chatParams.maxChatMessageTextLen)
  {
    completionCallback({reason: ("Message too long. Max length is " + chatParams.maxChatMessageTextLen) }, null)
    return
  }

  const chatMsg = {
    toChannelName: chatChannel.name,
    // toProjectName: null,
    // toAssetId: null,
    // toOwnerName: null,
    // toOwnerId: null,
    message: msg
  }

  Meteor.call('Chats.send', chatMsg, completionCallback)
}