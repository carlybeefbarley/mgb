import _ from 'lodash'
import { Chats } from '/imports/schemas'
import { check, Match } from 'meteor/check'

// Data model for MGB Chats.

// See https://github.com/devlapse/mgb/issues/40 for discussion of requirements

// This file must be imported by main_server.js so that the Meteor method can be registered


/***** Description of updated DB Schema for Chats as of 2/13/1017. 
 * THIS IS NOT FULLY CODED YET... 
 * Notably (currently) channelName is just one of ChatChannel.sortedKeys[] 
 * WITHOUT THE G: prefix

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
        (See https://tools.ietf.org/html/rfc3986#section-3.3 for URI definition rules)
        check if + and : are usable at all
        check if the uuids can possibly have anything other than [A-Za-z0-9]
 C2) For the proposed separators in the channelName scheme (: and +) make sure they
     will not conflict with expected characters in the id types described below

*/
const _scopeGroupCharToFriendlyNames = {
  G: 'Global',
  P: 'Project',
  A: 'Asset',
  U: 'User',
  D: 'DirectMessage'
}
const _scopeGroupScopeFriendlyNamesToChars = _.invert(_scopeGroupCharToFriendlyNames)

const _validChannelNameScopeChars = _.keys(_scopeGroupCharToFriendlyNames)
const _validChannelNameScopeFriendlyNames = _.keys(_scopeGroupScopeFriendlyNamesToChars)
const _validChannelPartSeparatorChar = '_'
const _validChannelNamePrefixes = _.map(_validChannelNameScopeChars, c => c+_validChannelPartSeparatorChar) // ['G:', 'P:' etc] 
const _validChannelNameSuffix = _validChannelPartSeparatorChar
const _validDmIdSeparatorChar = '+'  // TODO: Check + is ok

/**
 * This checks the channel name is in the correct format, but does not validate
 * that any scope-specific IDs are valid
 * 
 * @param {String} channelName
 */
const _isChannelNameWellFormed = channelName => (
  _.isString(channelName) &&
  channelName.length > 4 &&     // X:?: is absolute minimum possible channelName format
  _.includes(_validChannelNamePrefixes, channelName.slice(0,2)) &&
  _.last(channelName) === _validChannelNameSuffix
)

export function isChannelNameValid(channelName) {
  // TODO - some more checks on validity of scopeIds etc
  return _isChannelNameWellFormed(channelName)
}
const _isValidScopeGroupName = scopeGroupName => _.includes(_validChannelNameScopeFriendlyNames, scopeGroupName)

const _isChannelObjWellFormed = ( params ) => {
  const { scopeGroupName, scopeId, dmUid1, dmUid2 } = params
  if (!_.isString(scopeGroupName) || !_isValidScopeGroupName(scopeGroupName))
    return false
  if (dmUid1 || dmUid2)
  {
    if (!_.isString(dmUid1) || !_.isString(dmUid2) || dmUid1.length < 16 || dmUid2.length < 16 )
      return false
  }
  else if (!_.isString(scopeId) || scopeId.length < 2) // let's have at least two charaters, even for global ones guys :) 
    return false
  // still here? sounds cool guys
  return true
}

/*
Chat messages are placed in a channel via their channelName:
Chat.channelName: (Indexed field, non-unique in Chats table, used to group the 'Chat threads')
  Global       G_{publicChannelKey}_ // publicChannelKey is one of ChatChannel.sortedKeys[]. 
                                     // These are all public. There will be some user-'karma'
                                     // based policies to allow writing to each (pro users, beta vanguard etc)
  Project      P_{projectId}_        // This one is for Project onwers and project Members. There may be 
                                     // extra topics in future including public ones. Projects are more 
                                     // construction-oriented so this is probably fine.
  Asset        A_{AssetId}_          // Publicly writable. Owner might choose a 'approve comments' policy 
                                     // in future (TODO - needs a comments-policy in asset.js)
  User         U_{UserId}_           // Publicly writable subject to (TODO) policy on User Profile. 
                                     // Owner-user might select an 'approve comments' policy in future
                                     // (TODO - needs a comments-policy in user.js)
  DirectMsg    D_{uid1+uid2}_        // such that uid1 is lexically less than uid2 and + is a separator
                                     // that will not be in the IDs

The trailing _ is to reserve namespacing for a future 'topics' part of a channelName
which would enable a forum-type level of messages for projects/public chats, and also
could be used as a message-thread within DMs

   The following functions provide safe ways to parse and generate channelNames:
*/

/**
 * parseChannelName()
 * Example usage
 * console.log(parseChannelName("D_djkask+dasjd_"))
 * console.log(parseChannelName("U_alfkjsdafljsadlfj_"))
 * 
 * @param {string} channelName
 * @returns { channelName, scopeChar, scopeGroupName, scopeId, dmUid1, dmUid2, _topic }
 */
export const parseChannelName = channelName => {
  if (!_isChannelNameWellFormed(channelName))
    return null
  const [_scopeChar, scopeId, _topic] = channelName.split(_validChannelPartSeparatorChar)
  const scopeGroupName = _scopeGroupCharToFriendlyNames[_scopeChar]
  const [dmUid1, dmUid2] = _scopeChar === 'D' ? _.split(scopeId, _validDmIdSeparatorChar) : [null, null]
  return { 
    channelName, 
    _scopeChar, 
    scopeGroupName, 
    scopeId, 
    dmUid1, 
    dmUid2, 
    _topic }
}


/**
 * makeChannelName()
 * Example usage:
 *   console.log(makeChannelName( { scopeGroupName: 'DirectMessage', dmUid1:'QX4a9Hn7wmxCtuXw4', dmUid2: 'AX4a9Hn7wmxCtuXw4' }))
 *   console.log(makeChannelName( { scopeGroupName: 'User', scopeId:'djkask' }))
 * 
 * @param {Object} params
 * @returns {string}
 */
export const makeChannelName = ( params ) => {
  if (!_isChannelObjWellFormed( params ))
    return null
  const { scopeGroupName, scopeId, dmUid1, dmUid2 } = params
  const cNprefix = _scopeGroupScopeFriendlyNamesToChars[scopeGroupName] + _validChannelPartSeparatorChar
  const encodedScopeId = (scopeGroupName !== _scopeGroupCharToFriendlyNames.D) ? scopeId : 
            ( dmUid1 < dmUid2 ? dmUid1 + _validDmIdSeparatorChar + dmUid2 
            : dmUid2 + _validDmIdSeparatorChar + dmUid1
            )
  return cNprefix + encodedScopeId + _validChannelNameSuffix
}


/*

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
  Chat.flagId         // non-null / non-empty if there is a Flag record for this message (See Flags.js)

From this it can be seen that the messages in a 'Chat thread' can be found via just constructing 
the channelName for some context and then sorting by Chat.createdAt

Next, for user enumeration of channels related to them, the process is as follows:
  Global        HardCoded in ChatChannels.sortedKeys[]
  Project       Via user's Project ownerships/memberships
  User          Via user's User navigation (profile etc)
  Asset         Via user's Asset ownerships - usually view per asset.. but typically
                we will hide this under Asset navigation/search unless pinned
  DirectMsg     Using the user.ChatChannels mentioned below...This requires special code in Chat.Send()

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

  There is special handling in Chat.Send() on the server to drive notifications and enumerations
  (TODO) @mentions: adds to a (TODO) Notifications table. This is set on Chat.Send() using a Mongo add-to-set operation
  (TODO) DMs: adds a ToUser.ChatChannels['D:id1+id2']={ latestMsgReadDate: 0 } record if one does not already exist. 
  (TODO) This is set on Chat.Send() using a Mongo add-to-set operation

  There will also be a notifications table. This is separate from User so that
  we can support more specialized Notification systems in future.
  (TODO)
  Notifications.MentionsPending[] is an array of Chat message ids that mention the user. This is set on Chat.Send() via an append-to-array operation

******/



const optional = Match.Optional       // Note that Optional does NOT permit null!

var schema = {
  _id:           String,              // ID of this chat message

  createdAt:     Date,                // When created
  updatedAt:     Date,                // We may allow edit in future. This will be same is createdAt for messages that have not been edited


  // Identifiers for who sent the chat (always provided)
  byUserName:    String,              // UserName (not ID)
  byUserId:      String,              // OK, _this_ one is the ID

  // Identifers for scope of the action
  toChannelName: String,              // A channelName generated
                                      // by makeChannelName() according to it's described constraints

  toAssetId:     optional(String),    // If it is an asset-scoped chat - or undefined if not asset-scoped
  toAssetName:   optional(String),    // Asset's name If it is an asset-scoped chat (duplicated here for speed, but can be stale. Handy to track if the asset got renamed)

  toProjectId:   optional(String),    // undefined if not a project-scoped action..

  toOwnerId:     optional(String),    // Owner's user ID if @person. Only one @person...
  toOwnerName:   optional(String),    // Owner's user NAME if @person (duplicated here for speed, but can be stale if we ever support user rename)

  // the actual chat information
  message:       String,              // The actual message

  // other special states
  isDeleted:    optional(Boolean),    // If true then show as '(deleted)'
  flagId:       optional(String)      // (TODO) non-null / non-empty if there is a Flag record for this message (See Flags.js)
}

export const ChatPosters = {
  SUPERADMIN: "@@superAdmin",
  ACTIVEUSER: "@@activeUser"
}

// TODO: Rename this as PublicChatChannels
export const ChatChannels = {
  GENERAL: {
    name:         "general",      // name is the Presented name, but not a key
    channelName:  makeChannelName( { scopeGroupName: 'Global', scopeId: 'GENERAL' } ),
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "General suggestions, discussions and questions related to MGB",
    subscopes:    {}
  },
  MGBBUGS: {
    name:         "mgb-bugs",
    channelName:  makeChannelName( { scopeGroupName: 'Global', scopeId: 'MGBBUGS' } ),
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Discussions about potential bugs and fixes in MGB",
    subscopes:    {}
  },
  MGBHELP: {
    name:         "mgb-help",
    channelName:  makeChannelName( { scopeGroupName: 'Global', scopeId: 'MGBHELP' } ),
    icon:         "hashtag",
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Ask for help in how to use the MGB site",
    subscopes:    {}
  },
  RANDOM: {
    name:         "random",
    icon:         "hashtag",
    channelName:  makeChannelName( { scopeGroupName: 'Global', scopeId: 'RANDOM' } ),
    poster:       ChatPosters.ACTIVEUSER,
    description:  "Off-topic discussions not related to MGB",
    subscopes:    {}
  },
  ANNOUNCE: {
    name:         "mgb-announce",
    icon:         "hashtag",
    channelName:  makeChannelName( { scopeGroupName: 'Global', scopeId: 'ANNOUNCE' } ),
    poster:       ChatPosters.SUPERADMIN,
    description:  "Global announcements/alerts from the MGB engineering team",
    subscopes:    {}
  },
  
  getIconClass: function (key) { return (ChatChannels.hasOwnProperty(key) ? ChatChannels[key].icon : "warning sign") + " icon"},
  sortedKeys: [
    "GENERAL",
    "MGBBUGS",
    "MGBHELP",
    "RANDOM",
    "ANNOUNCE"
  ]
}

// TODO: Move to SpecialGlobals.js
export const chatParams = {
  maxChatMessageTextLen: 220,     // Maximum number of chars in a single message
  maxClientChatHistory:  200,     // Maximum number of historical messages to send back to client
  defaultChannelName:    ChatChannels['GENERAL'].channelName
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

export function currUserCanSend(currUser, channelName) {
  const channelObj = parseChannelName(channelName)
  if (!channelObj)
    return false          // Can't parse it..
  if (channelObj.scopeGroupName === 'Global')
  {
    const chatChannel = ChatChannels[channelObj.scopeId]
    if (!chatChannel || !chatChannel.poster)
      return false          // No posters record -> no sends allowed (fail securely)

    const validPoster = chatChannel.poster
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
  if (channelObj.scopeGroupName === 'Project')
  {
    console.log("TODO: Project-chat currUserCanSend()")
    return true
  }
  console.log("TODO: [Asset/User/DM]-chat currUserCanSend()")
  return false
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

/**
 * 
 * Make a nice human friendly channel name like 'MyProject - Member chat' instead
 * of the formal channelNames which look like P_64hGKGGVJH75r45_ and aren't pretty
 * or useful to human beenz.
 * 
 * We ask for the caller to provide the objectName since we don't want this generic
 * code in chats.js to have to re-get the objects in order to get their names. 
 * It's more efficient to get the names locally. The exception is the Global scope
 * which is just a hard-coded list
 *  
 * @export
 * @param {String} channelName - as defined above and constructed by makeChannelName()
 * @param {String} objectName - a current object name for the scope instance. 
 *                              Used for scopes like 'Project', 'Asset', 'User'
 * @returns {String} human-friendly, but non-parseable Presented Channel Name
 */
export function makePresentedChannelName(channelName, objectName) {
  const channelObj = parseChannelName(channelName)
  if (!channelObj)
    return `(Unknown Channel: '${channelName}')`          // Can't parse it..
  switch (channelObj.scopeGroupName)
  {
  case 'Global':
    var chatChannel = ChatChannels[channelObj.scopeId]
    if (!chatChannel)
      return `(Unknown GlobalChannel: '${channelName}')`
    return chatChannel.name
    // break
  case 'Project':
    return `${objectName} - Member chat`
  case 'Asset':
    return `Asset Chat`
  case 'User':
    return `User Chat`
  case 'DirectMessage':
    return 'DirectMessage '
  default:
    console.trace("Unexpected ChatScope in channelName=",channelName)
  }
}

Meteor.methods({

  /** Chats.create
   *  @param {string} channelName
   * 
   */
  "Chats.send": function(channelName, message, chatMetadata) {
    if (!this.userId)
      throw new Meteor.Error(401, "Login required")

    if (!message || message.length < 1)
      throw new Meteor.Error(400, "Message empty")

    if (message.length > chatParams.maxChatMessageTextLen)
      throw new Meteor.Error(400, "Message too long")

    if (!_isChannelNameWellFormed(channelName))
      throw new Meteor.Error(400, `Channel name '${channelName}' is not in the expected format`)

    const data = { 
      toChannelName: channelName,
      message:       _.trim(message)
    }

    const currUser = Meteor.user()
    const canSend = currUserCanSend(currUser, channelName)
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


export function ChatSendMessageOnChannelName( channelName, msg, completionCallback)
{
  if (!msg || msg.length < 1)
  {
    completionCallback( { reason: "Message empty" }, null)
    return false
  }
  if (msg.length > chatParams.maxChatMessageTextLen)
  {
    completionCallback( { reason: ("Message too long. Max length is " + chatParams.maxChatMessageTextLen) }, null)
    return false
  }

  const chatMetadata = {
    // toProjectId: null,
    // toAssetId: null,
    // toOwnerName: null,
    // toOwnerId: null
  }

  Meteor.call('Chats.send', channelName, msg, chatMetadata, completionCallback)
  return true
}

// if (Meteor.isServer)
// {
//   Meteor.methods({
//     'dgolds.migrateChatDB': function() {
//       if (!this.userId)
//         throw new Meteor.Error(401, "Login required")
//       if (Meteor.user().username !== 'dgolds')
//         throw new Meteor.Error(401, "You do not have the power")
//       console.log("ONLY you have The Power")


//       const GenKEY = 'RANDOM'
//       const theOldChannelName=ChatChannels[GenKEY].name
//       const sel= { toChannelName: theOldChannelName}
//       const count = Chats.find(sel).count()
//       const newChanName = ChatChannels[GenKEY].channelName
//       console.log(`${count} rows of '${sel.toChannelName}' to change to '${newChanName}'`)

//       // Chats.update( 
//       //   sel, 
//       //   { $set: { toChannelName: newChanName} }, 
//       //   { multi: true }
//       // )
//     }
//   })
// }