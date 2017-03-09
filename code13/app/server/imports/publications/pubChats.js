import { Chats } from '/imports/schemas'
import { chatParams, parseChannelName } from '/imports/schemas/chats'
import { lookupIsUseridInProject } from '/imports/schemas/projects-server'

//
//    CHAT Publications
//

Meteor.publish('chats.channelName', function(toChannelName, limit=20) {

  const channelObj = parseChannelName(toChannelName)
  // Access check for publication of channels
  switch (channelObj.scopeGroupName)
  {
  case 'Global':
    // Everyone can read these
    break
  case 'Project':
    if (!lookupIsUseridInProject(this.userId, channelObj.scopeId))
      return this.ready()
    break
  case 'Asset':
    break   // For now. May tighten up later
  case 'User':
  case 'DirectMessage':
  default:
    console.log(`Unhandled scopeGroupName ${channelObj.scopeGroupName} in chats.channelName`)
  }

  if (limit > chatParams.maxClientChatHistory)
    limit = chatParams.maxClientChatHistory

  let selector = { toChannelName: toChannelName }
  let options =  { limit: limit, sort: { createdAt: -1 } }

  return Chats.find(selector, options)
})

//
//    CHAT Indexes
//

Chats._ensureIndex( { "toChannelName": 1, "createdAt": -1 } )