import { Chats } from '/imports/schemas'
import { chatParams, parseChannelName } from '/imports/schemas/chats'
import { lookupIsUseridInProject } from '/imports/schemas/projects-server'

//
//    CHAT Publications
//
const fieldsChatPublic = {
  createdAt: 1,
  updatedAt: 1,
  byUserName: 1,
  byUserId: 1,
  toChannelName: 1,
  toAssetId: 1,
  toAssetName: 1,
  toOwnerId: 1,
  toOwnerName: 1,
  message: 1,
  isDeleted: 1,
  suFlagId: 1,
  suIsBanned: 1,
}

Meteor.publish('chats.channelName', function(toChannelName, limit = 20) {
  const channelObj = parseChannelName(toChannelName)
  // Access check for publication of channels
  switch (channelObj.scopeGroupName) {
    case 'Global':
      // Everyone can read these
      break

    case 'Project':
      if (!lookupIsUseridInProject(this.userId, channelObj.scopeId)) return this.ready()
      break

    case 'Asset':
      break // For now make these publicly readable. Maybe tighten up later

    case 'User':
      break // For now make these publicly readable. Maybe tighten up later

    case 'DirectMessage':
    default:
      console.log(`Unhandled scopeGroupName ${channelObj.scopeGroupName} in chats.channelName`)
  }

  if (limit > chatParams.maxClientChatHistory) limit = chatParams.maxClientChatHistory

  let selector = { toChannelName }
  let options = {
    limit,
    sort: { createdAt: -1 },
    fields: fieldsChatPublic,
  }

  return Chats.find(selector, options)
})

//
//    CHAT Indexes
//

Chats._ensureIndex({ toChannelName: 1, createdAt: -1 })
