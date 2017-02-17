import { Chats } from '/imports/schemas'
import { chatParams } from '/imports/schemas/chats'

//
//    CHAT Publications
//

Meteor.publish('chats.channelName', function(toChannelName, limit=20) {

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