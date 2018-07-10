import { Activity } from '/imports/schemas'
import { getFeedSelector } from '/imports/schemas/activity'

//
//    ACTIVITY LOG Publication
//

Meteor.publish('activity.public.recent', function(limitCount = 50) {
  let selector = {}
  let options = { limit: limitCount, sort: { timestamp: -1 } }
  return Activity.find(selector, options)
})

Meteor.publish('activity.public.recent.userId', function(userId, limitCount = 50) {
  let selector = { byUserId: userId }
  let options = { limit: limitCount, sort: { timestamp: -1 } }

  return Activity.find(selector, options)
})

Meteor.publish('activity.public.assets.recent.userId', function(userId, limitCount = 50) {
  let selector = { byUserId: userId, toAssetId: { $ne: '' } }
  let options = { limit: limitCount, sort: { timestamp: -1 } }

  return Activity.find(selector, options)
})

Meteor.publish('activity.public.recent.assetid', function(assetId, limitCount = 50) {
  let selector = { toAssetId: assetId }
  let options = { limit: limitCount, sort: { timestamp: -1 } }

  return Activity.find(selector, options)
})

Meteor.publish('activity.public.type.recent.userId', function(userId, activityType, limitCount = 10) {
  let selector = { byUserId: userId, activityType }
  let options = { limit: limitCount, sort: { timestamp: -1 } }

  return Activity.find(selector, options)
})

Meteor.publish('activity.private.feed.recent.userId', function(userId, userName, limitCount = 20) {
  // TODO need some kind of security here Meteor.userId() == userId ?
  let options = { limit: limitCount, sort: { timestamp: -1 } }
  return Activity.find(getFeedSelector(userId, userName), options)
})

//
// ACTIVITY Indexes.
//

Activity._ensureIndex({ timestamp: -1 })
Activity._ensureIndex({ toAssetId: 1, timestamp: -1 })
Activity._ensureIndex({ byUserId: 1, timestamp: -1 })
