import { ActivitySnapshots } from '/imports/schemas'

//
//    ACTIVITY SNAPSHOTS (and MAGIC purge)
//

Meteor.publish('activitysnapshots.assetid', function(assetId) {
  // Note that we don't put a date range selector in here since it doesn't automatically
  // change reactively. It's simpler just to use Mongo's expireAfterSeconds feature
  // to purge the records.
  let selector = { toAssetId: assetId }
  let options = { limit: 100, sort: { timestamp: -1 } }
  return ActivitySnapshots.find(selector, options)
})

Meteor.publish('activitysnapshots.userId', function(userId) {
  // Note that we don't put a date range selector in here since it doesn't automatically
  // change reactively. It's simpler just to use Mongo's expireAfterSeconds feature
  // to purge the records.
  let selector = { byUserId: userId }
  let options = { limit: 100, sort: { timestamp: -1 } }
  return ActivitySnapshots.find(selector, options)
})

//
// ***SPECIAL*** INDEX TO AUTO-DELETE ITEMS!!!
//

// NOTE THAT THE expireAfterSeconds value cannot be changed!
// You have to drop the index to change it (or use the complicated collMod approach)
// Here's how to drop it using the CLI:
//     $ meteor mongo
//     > use meteor
//     > db.activity_snapshots.dropIndexes()
//     > db.activity_snapshots.getIndexes()   // check it is dropped ok
ActivitySnapshots._ensureIndex({ timestamp: 1 }, { expireAfterSeconds: 60 * 5 })

//
// Activity Snapshots: Normal Indexes
//
ActivitySnapshots._ensureIndex({ byUserId: 1, toAssetId: 1 })
ActivitySnapshots._ensureIndex({ toAssetId: 1, timestamp: -1 })
