import _ from 'lodash'
import swearjar from '/server/imports/swearjar/swearjar'
import { Chats, Azzets } from '/imports/schemas'
import {
  chatParams,
  parseChannelName,
  makeChannelName,
  isChannelNameWellFormed,
  chatsSchema,
  currUserCanSend,
} from '/imports/schemas/chats'
import { check } from 'meteor/check'
import { lookupIsUseridInProject } from '/imports/schemas/projects-server'
import { isSameUserId } from '/imports/schemas/users'
import { isUserSuperAdmin } from '/imports/schemas/roles'

const CHAT_RATE_MAX_MSGS = 4 // 4 messages per minute.
const CHAT_RATE_PERIOD = 60000 // 1 minute is the period of time we check for the given limit.

/**
 * This function calls lookupIsUseridInProject() so it is server-side only
 *
 * @param {any} currUser
 * @param {any} channelName
 * @returns {Boolean} true if the user can send to this channel
 */
function canUserReallySendToChannel(currUser, channelName) {
  // This is a leaky access check that is used mostly on the client
  const canSend = currUserCanSend(currUser, channelName)
  if (!canSend) return false

  // Now to look for the cases that currUserCanSend() isn't smart about
  // Note that suIsBanned (Suspended Account) is handled in Chats.send RPC
  const channelObj = parseChannelName(channelName)

  // Has the user hit the chat rate limiter? Doesn't apply to admins, they can spam away.
  if (
    Chats.find({
      toChannelName: channelObj.channelName,
      createdAt: { $gt: new Date(new Date().getTime() - CHAT_RATE_PERIOD) },
    }).fetch().length >= CHAT_RATE_MAX_MSGS &&
    !isUserSuperAdmin(currUser)
  ) {
    return false
  }
  // Access check for publication of channels

  switch (channelObj.scopeGroupName) {
    case 'Global':
      return true // It was checked for admin etc in currUserCanSend()

    case 'Project':
      return lookupIsUseridInProject(currUser._id, channelObj.scopeId)

    case 'Asset':
      return Boolean(currUser) // For now

    case 'User':
      return Boolean(currUser) //???

    case 'Classroom':
      console.warn(
        'Reminder: Classroom chat permissions are open to all users. Scope to classroom participants.',
      )
      return Boolean(currUser)

    case 'DirectMessage':

    default:
      console.log(`Unhandled scopeGroupName ${channelObj.scopeGroupName} in canUserReallySendToChannel()`)
      return false
  }
}

function _checkChatSendIsValid(currUser, channelName, message) {
  if (!currUser) throw new Meteor.Error(401, 'Login required')

  if (!message || message.length < 1) throw new Meteor.Error(400, 'Message empty')

  if (message.length > chatParams.maxChatMessageTextLen) throw new Meteor.Error(400, 'Message too long')

  if (!isChannelNameWellFormed(channelName))
    throw new Meteor.Error(400, `Channel name '${channelName}' is not in the expected format`)

  if (!canUserReallySendToChannel(currUser, channelName))
    throw new Meteor.Error(401, 'No access to write to that channel')

  // if(checkUserIsSpammingChannel(currUser, channelName))

  if (
    currUser.suIsBanned // TODO: Allow only chat with Moderator on a TBD special channel
  )
    throw new Meteor.Error(401, 'Your account has been suspended by an Admin')
}

//     Handling delete/restore chats:    //
//
//SuAdmin: can delete any chat by replacing chat text with (removed by admin)
//             to prevent chatowner from restoring it. if chat owner clicks restore
//             they see that message instead
//isWallOwner: can delte messages on their wall, for purposes of preventing chatowner
//             restores the delete is treated the same as SUAdmin delete where
//             message text is replaced with (removed by wall owner) upon restore
//Restores for wall owners and SuAdmins:
//                    the original message is stored in chat table prvBannedMessage
//                    the functionality for SUAdmin or wall owner restore would
//                    be manual restore ex(chat.message = chat.prvbannedmessage)
//                    in the system
//isWallOwner && isSuperAdmin: super admin currently can restore chats on other
//                    users walls UNLESS they are also the owner in which case restore
//                    says removed by wall owner.
// ownerreg user on reg user chats: reg user who is owner of wall can delete another
//                     reg user's chats but cannot restore them. if reg user restores owned chat
//                     one someone elses wall says removed by wall owner.
//
// future implementation possiblities for wallowner chat restore:
//                    currently wall owner cannot restore
//                    an if statement that allows wallowner restore by replacing
//                    chat.message = chat.prvbannedmessage. with possible extra UI
//                    asking if user is sure they want to restore it. they can also
//                    restore but if they click delete again it is removed by admin.
//                    if admin deletes a removed by wall owner replace it is replaced with
//                    .removed by admin does not get repleaced by
//                    removed by wall owner in case of reg user instead button to delete does not appear unless its their own message
//

Meteor.methods({
  /** Chats.send
   *  @param {string} channelName - A channelName generated by makeChannelName()
   *                      according to it's described constraints
   *  @param {string} message - the message to be sent (TBD on validation)
   *
   */
  'Chats.send'(channelName, message, chatMetadata) {
    const currUser = Meteor.user()
    _checkChatSendIsValid(currUser, channelName, message)
    const currUserName = currUser.username

    const now = new Date()
    const data = {
      toChannelName: channelName,
      message: _.trim(message),
      createdAt: now,
      updatedAt: now,
      byUserId: this.userId,
      byUserName: currUserName,
    }

    if (swearjar.profane(message)) {
      const censoredMsg = swearjar.censor(message)
      Meteor.call('Slack.Chats.censored', currUserName, data.message, channelName, censoredMsg)
      // Now throw so we don't store this in chats msg
      throw new Meteor.Error(
        401,
        `Message contains offensive/disrespectful words. Please avoid such words/topics here so that everyone is able to participate comfortably: '${censoredMsg}'`,
      )
    }

    check(data, _.omit(chatsSchema, '_id'))
    let docId = Chats.insert(data)

    if (Meteor.isServer) {
      console.log(`  [Chats.send] @${currUserName} sent "${data.message}" on #${channelName}`)
      Meteor.call('Slack.Chats.send', currUserName, data.message, channelName)
    }
    return { chatId: docId, chatTimestamp: now }
  },

  'Chat.delete'(chatId) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    check(chatId, String)
    const chat = Chats.findOne({ _id: chatId })
    if (!chat) throw new Meteor.Error(404, 'Chat Id does not exist')

    const channelInfo = parseChannelName(chat.toChannelName)
    const isUsersWall =
      Meteor.user().username === channelInfo.scopeId && channelInfo.scopeGroupName === 'User'

    if (!(isSameUserId(chat.byUserId, this.userId) || isUserSuperAdmin(Meteor.user()) || isUsersWall))
      throw new Meteor.Error(401, 'Access not permitted')

    const isAdminDelete = !isSameUserId(chat.byUserId, this.userId) && isUserSuperAdmin(Meteor.user())

    if (chat.isDeleted) throw new Meteor.Error(409, 'Cannot delete message if it has already been deleted')
    const changedData = {
      isDeleted: true,
      updatedAt: new Date(),
    }
    if (isAdminDelete) {
      changedData.prvBannedMessage = chat.message
      changedData.message = '(Removed by Admin)'
    }
    if (isUsersWall) {
      changedData.prvBannedMessage = chat.message
      changedData.message = '(Removed by Wall Owner)'
    }
    const nDeleted = Chats.update({ _id: chatId }, { $set: changedData })

    if (Meteor.isServer) console.log(`  [Chat.delete]  #${chatId}  by: ${chat.byUserName}`)

    return nDeleted
  },
  'Chat.restore'(chatId) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    check(chatId, String)

    const chat = Chats.findOne({ _id: chatId })
    if (!chat) throw new Meteor.Error(404, 'Chat Id does not exist')

    if (!(isSameUserId(chat.byUserId, this.userId) || isUserSuperAdmin(Meteor.user())))
      throw new Meteor.Error(401, 'Access not permitted')

    if (!chat.isDeleted) throw new Meteor.Error(409, 'Cannot restore message if it has not been deleted')
    const changedData = {
      isDeleted: false,
      updatedAt: new Date(),
    }
    const nRestored = Chats.update({ _id: chatId }, { $set: changedData })

    if (Meteor.isServer) console.log(`  [Chat.restore]  #${chatId}  by: ${chat.byUserName}`)

    return nRestored
  },
})

//   Meteor.methods({
//     'dgolds.migrateChatDB': function(isForRealz) {
//       if (!this.userId)
//         throw new Meteor.Error(401, "Login required")
//       if (Meteor.user().username !== 'dgolds')
//         throw new Meteor.Error(401, "You do not have the power")
//       console.log("ONLY you have The Power")

//       const GenKEY = 'GENERAL'
//       const theOldChannelName=ChatChannels[GenKEY].name
//       const sel= { toChannelName: theOldChannelName}
//       const count = Chats.find(sel).count()
//       const newChanName = ChatChannels[GenKEY].channelName
//       console.log(`${count} rows of '${sel.toChannelName}' to change to '${newChanName}'`)

//       if (isForRealz === true)
//         Chats.update(
//           sel,
//           { $set: { toChannelName: newChanName} },
//           { multi: true }
//         )
//       console.log('KTHXBYE')
//     }
//   })

// TODO: Add rate Limiter

Meteor.methods({
  /**
   * Generates a channel status summary such as
      [ { _id: 'G_GENERAL_',
        latestDate: Wed Jun 15 2016 00:38:50 GMT-0700 (PDT),
        latestId: 'oK5fwmvWwkY6YrFze' },
      { _id: 'G_MGBHELP_',
        latestDate: Mon Jul 04 2016 08:45:33 GMT-0700 (PDT),
        latestId: '9untRgRvEG7a328ju' } ]
   *
   * @param {Array} requestedChannelTimestamps Array - augmented with assetInfo for Asset Chat Channels
   * @returns
   */
  'Chats.getLastMessageTimestamps'(channelNamesArray) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    const requestedChannelTimestamps = Chats.aggregate([
      { $match: { toChannelName: { $in: channelNamesArray } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$toChannelName',
          lastCreatedAt: { $first: '$createdAt' },
          lastId: { $first: '$_id' },
          lastSentByUserId: { $first: '$byUserId' },
          lastSentByUserName: { $first: '$byUserName' },
        },
      },
    ])

    // For now, we are getting the AssetInfo for asset channels here as well.
    // It's not ideal but overall this seems relatively efficient? #REVISIT

    const assetIds = _.chain(channelNamesArray) // Start with the list of all Channel names
      .map(parseChannelName) // parse channelName to channelObject
      .filter({ scopeGroupName: 'Asset' }) // We only want the Asset channels for this list
      .map('scopeId')
      .value()

    const assetInfo = Azzets.find(
      { _id: { $in: assetIds } },
      { fields: { name: 1, dn_ownerName: 1, isDeleted: 1 } },
    ).fetch()

    _.forEach(assetInfo, a => {
      const row = _.find(requestedChannelTimestamps, {
        _id: makeChannelName({ scopeGroupName: 'Asset', scopeId: a._id }),
      })
      if (row) row.assetInfo = a
    })

    return requestedChannelTimestamps
  },
})
