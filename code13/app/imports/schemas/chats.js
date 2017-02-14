// Data model for MGB Chats.

// See https://github.com/devlapse/mgb/issues/40 for discussion of requirements

// This file must be imported by main_server.js so that the Meteor method can be registered


/***** Description of updated DB Schema for Chats as of 2/13/1017. 
 * THIS IS NOT CODED YET... 
 * Notably (currently) channelName is just one of ChatChannel.sortedKeys[] WITHOUT THE G: prefix

// 0. There is a SCOPE that defines a context for a set of chat 
//    messages that are handled differently. Scopes are (case-sensitive):
//    'G':   scopeGlobal  - used for the public well-known Global channels
//    'P':   scopeProject - used for project-scoped chat (with projectId).
//    'A':   scopeAsset   - used for asset-scoped chat   (with assetId).
//    'U':   scopeUser    - used for wall-style user-scoped chat   (with userId).
//    'D':   scope_DirectMessage  - used for 1:1 Direct Messages    (with user1+user2 id)

Chats are single-threaded conversations - effectively a linear, time-sorted list of messages. 
The Chats table essentially holds many of these 'chat threads' in the same table.

Channels are a hierarchy of Chats. So each of the messages in a Chat 'thread' has a channelName

TODO:Finalize these channelName formats and make sure they are ok with other constraints
 C1) Avoid use of characters which will be problematic in a URL (since we like to use this key in the 
     URLs such as ?_fp=chat.mgb-bugs)  So for sure,
        avoid  &  since it is a url separator
        use    .  carefully since it is used as a separator by flexPanel.js
        check if + and : are usable at all
        check if the uuids can possibly have anything other than [A-Za-z0-9]
 C2) For the proposed separators in the channelName scheme, 

Chat messages are placed in a channel via their channelName:
Chat.channelName: (Indexed field, non-unique in Chats table, used to group the 'Chat threads')
  Global       G:{publicChannelKey}: // publicChannelKey is one of ChatChannel.sortedKeys[]. 
                                     // These are all public. There will be some user-'karma'
                                     // based policies to allow writing to each (pro users, beta vanguard etc)
  Project      P:{projectId}:        // This one is for Project onwers and project Members. There may be 
                                     // extra topics in future including public ones. Projects are more 
                                     // construction-oriented so this is probably fine.
  Asset        A:{AssetId}:          // Publicly writable. Owner might choose a 'approve comments' policy 
                                     // in future (TODO - needs a comments-policy in asset.js)
  User         U:{UserId}:           // Publicly writable subject to (TODO) policy on User Profile. 
                                     // Owner-user might select an 'approve comments' policy in future
                                     // (TODO - needs a comments-policy in user.js)
  DirectMsg    D:{uid1+uid2}:        // such that uid1 is lexically less than uid2 and + is a separator that will not be in the IDs
The trailing : is to reserve namespacing for a future 'topics' part of a channelKey
which would enable a forum-type level of messages for projects/public chats, and also
could be used as a message-thread within DMs

There are some additional indexed columns used to help find some items from other contexts:
  Chat._id            // Normal Meteor/Mongo UUID for this message in the Chat Table. 
                      // Always exists and unique and indexed
  Chat.createdAt      // Timestamp, set authoritatively on server
  Chat.toAssetId      // always set for scopeAsset. MAY also be set for other messages. 
                      // Allows a way to look for other messages related to an asset
  Chat.toProjectId    // always set for scopeProject. MAY also be set for other messages.  
                      // Allows a way to look for other messages related to a project
  Chat.toOwnerId      // Always set for scopeAsset and scopeProject and scopeUser and 
                      // scopeDirectMsg: Set to the ownerId of that Asset/project/User. 
                      // Allows a way for owners to see activity on stuff they own, and 
                      // supports a wall, and also a way to rebuild other tables for DMs
                      // in case of errors or db conflicts.
  Chat.isDeleted      // true if the message has been deleted. For simplicity this will show
                      // in the UI as '(deleted)' so we don't make counts overly complex
  Chat.FlagId         // non-null / non-empty if there is a Flag record for this message (See Flags.js)

From this it can be seen that the messages in a 'Chat thread' can be found via just constructing 
the channelName for some context and then sorting by Chat.createdAt

Next, for user enumeration of channels related to them, the process is as follows:
  Global        HardCoded in ChatChannels.sortedKeys[]
  Project       Via user's Project ownerships/memberships
  User          Via user's User navigation (profile etc)
  Asset         Via user's Asset ownerships - usually view per asset.. but typically
                we will hide this under Asset navigation/search unless pinned
  DirectMsg     Using the user.DMpartners mentioned below...This requires special code in Chat.Send()

To check read/unread situations, each User has some objects to support this chat model
  User.ChatChannels{}
     key=channelName         // A channel that this user has read a message from, or has received an @mention or DM from
     value={ 
       latestMsgRead: timestamp        // from Chat.createdAt
       isPinned:      Boolean          // true if the user has pinned this channel
       isWatched:     Boolean          // true if the user wants notifications of changes (generated on some timed job. TODO)
      }
     key=...
     value=...

 /////// TODO: Item below needs some more thought.. Maybe just create a Notifications table instead ?
  User.DMpartners[] is an array of the userIds of users who have ever DMed this user. This is set on Chat.Send() using a Mongo add-to-set operation
  User.MentionsPending[] is an array of Chat message ids that mention the user. This is set on Chat.Send() via an append-to-array operation

******/


import _ from 'lodash'
import { Chats } from '/imports/schemas'
import { check, Match } from 'meteor/check'

const optional = Match.Optional       // Note that Optional does NOT permit null!

var schema = {
  _id:           String,              // ID of this chat message

  createdAt:     Date,                // When created
  updatedAt:     Date,                // We may allow edit in future. This will be same is createdAt for messages that have not been edited


  // Identifiers for who sent the chat (always provided)
  byUserName:    String,              // UserName (not ID)
  byUserId:      String,              // OK, _this_ one is the ID

  // Identifers for scope of the action
  toChannelName: optional(String),    // If public scope, then one of the well-known ChatChannel keys in ChatChannels.sortedKeys[]

  toProjectId:   optional(String),    // undefined if not a project-scoped action..

  toAssetId:     optional(String),    // If it is an asset-scoped chat - or undefined if not asset-scoped
  toAssetName:   optional(String),    // Asset's name If it is an asset-scoped chat (duplicated here for speed, but can be stale. Handy to track if the asset got renamed)

  toOwnerId:     optional(String),    // Owner's user ID if @person. Only one @person...
  toOwnerName:   optional(String),    // Owner's user NAME if @person (duplicated here for speed, but can be stale if we ever support user rename)

  // the actual chat information
  message: String         // The actual message
};


export const ChatPosters = {
  SUPERADMIN: "@@superAdmin",
  ACTIVEUSER: "@@activeUser"
}

export const ChatChannels = {
  // SYSTEM: {
  //   name:         "mgb-announce",
  //   icon:         "hashtag",
  //   poster:       ChatPosters.SUPERADMIN,
  //   description:  "Global announcements/alerts from core MGB engineering team",
  //   subscopes:    {}
  // },
  GENERAL: {
    name:         "general",
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "General suggestions, discussions and questions related to MGB",
    subscopes:    {}
  },
  MGBBUGS: {
    name:         "mgb-bugs",
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Discussions about potential bugs and fixes in MGB",
    subscopes:    {}
  },
  MGBHELP: {
    name:         "mgb-help",
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Ask for help in how to use the MGB site",
    subscopes:    {}
  },
  // LOOKINGFORGROUP: {
  //   name:         "lfg",
  //   icon:         "users",
  //   poster:       ChatPosters.ACTIVEUSER,
  //   description:  "Looking for group - message here to find people to work with on MGB projects",
  //   subscopes:    {}
  // },
  RANDOM: {
    name:         "random",
    icon:         "hashtag",
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

  // This one is a future AWESOME plan :)
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
    // "SYSTEM",
    "GENERAL",
    "MGBBUGS",
    "MGBHELP",
    // "LOOKINGFORGROUP",
    "RANDOM"
    // "CHATTESTCHANNEL"
  ],
  defaultChannelKey: "GENERAL"
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
    {
      console.log(`  [Chats.send]  "${data.message}"  #${docId}  `)
      Meteor.call('Slack.Chats.send', currUser.profile.name, data.message, data.toChannelName)
    }
    return docId
  }
})


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
