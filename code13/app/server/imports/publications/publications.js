// This file should be imported by the main_server.js file

import { Users, Activity, ActivitySnapshots, Settings, Sysvars, Skills } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'
import { defaultDeploymentName } from '/imports/schemas/sysvars'

//
//    USERS
//

const fieldsUserPublic = { username: 1, profile: 1, permissions: 1, createdAt: 1, badges: 1 }

Meteor.users._ensureIndex({"profile.name": 1})
Meteor.users._ensureIndex({"createdAt": 1})

// This is for Meteor.user()   See http://www.east5th.co/blog/2015/03/16/user-fields-and-universal-publications/
Meteor.publish(null, function() {
  if (this.userId)
    return Meteor.users.find( { _id: this.userId }, { fields: fieldsUserPublic } )
  else
    return null
})

Meteor.publish('users.byName', function(nameSearch, limitCount, userSortType) {
  let selector = {}
  let userSorter = userSortType ? userSorters[userSortType] : userSorters.default
  if (nameSearch && nameSearch.length > 0)
  {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector["profile.name"]= {$regex: new RegExp("^.*" + nameSearch, 'i')}
  }

  let findOpts = {
    fields: fieldsUserPublic,
    sort:   userSorter
  }
  if (limitCount)
    findOpts.limit = limitCount

  return Meteor.users.find(selector, findOpts)
})


// This is used for example by the project membership list. There is no limit, so no sort is supported. The client can sort
Meteor.publish('users.getByIdList', function(idArray) {
  const selector = {_id: {"$in": idArray}}
  return Meteor.users.find(selector, { fields: fieldsUserPublic } )
})

// get Exactly one user - by id
Meteor.publish('user', function(id) {
  return Meteor.users.find(id, { fields: fieldsUserPublic } )
})

// get Exactly one user - by profile.name
Meteor.publish('user.byName', function(username) {
  let selector = { "profile.name": username }
  return Meteor.users.find(selector, { fields: fieldsUserPublic } )
})


//
//    ACTIVITY LOG
//

Meteor.publish('activity.public.recent', function(limitCount=50) {
  let selector = { }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
})

Meteor.publish('activity.public.recent.userId', function(userId, limitCount=50) {
  let selector = { byUserId: userId }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
})

Meteor.publish('activity.public.assets.recent.userId', function(userId, limitCount=50) {
  let selector = { byUserId: userId, toAssetId: {"$ne": "" } }
  let options = { limit: limitCount, sort: {timestamp: -1} }

  return Activity.find(selector, options)
})


Meteor.publish('activity.public.recent.assetid', function(assetId, limitCount=50) {
  let selector = { toAssetId: assetId }
  let options = { limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
})


// ACTIVITY Indexes. These were built based on the stats at https://mlab.com/clusters/rs-ds021730#slowqueries

Activity._ensureIndex({"timestamp": -1})
Activity._ensureIndex({"toAssetId": 1, "timestamp": -1})
Activity._ensureIndex({"byUserId": 1, "timestamp": -1})

//
//    ACTIVITY SNAPSHOTS (and purge)
//

Meteor.publish('activitysnapshots.assetid', function(assetId) {
  // Note that we don't put a date range selector in here since it doesn't automatically
  // change reactively. It's simpler just to use Mongo's expireAfterSeconds feature
  // to purge the records.
  let selector = { toAssetId: assetId }
  let options = {limit: 100, sort: {timestamp: -1} }
  return ActivitySnapshots.find(selector, options)
})


Meteor.publish('activitysnapshots.userId', function(userId) {
  // Note that we don't put a date range selector in here since it doesn't automatically
  // change reactively. It's simpler just to use Mongo's expireAfterSeconds feature
  // to purge the records.
  let selector = { byUserId: userId }
  let options = {limit: 100, sort: {timestamp: -1} }
  return ActivitySnapshots.find(selector, options)
})

// SPECIAL INDEX TO AUTO_DELETE ITEMS
// NOTE THAT THE expireAfterSeconds value cannot be changed!
// You have to drop the index to change it (or use the complicated collMod approach)
// Here's how to drop it using the CLI:
//     $ meteor mongo
//     > use meteor
//     > db.activity_snapshots.dropIndexes()
//     > db.activity_snapshots.getIndexes()   // check it is dropped ok
ActivitySnapshots._ensureIndex( { "timestamp": 1 }, { expireAfterSeconds: 60*5 } )

// Normal INDEXES for Activity Snapshots
ActivitySnapshots._ensureIndex( {"byUserId": 1, "toAssetId": 1} )
ActivitySnapshots._ensureIndex( {"toAssetId": 1, "timestamp": -1} )


//
//    SETTINGS (keyed by user._id)
//

// TODO: Make sure userId can't be faked on server. Allow/deny rules required...
Meteor.publish('settings.userId', function(userId) {
  return Settings.find(userId)
})



//
//    SKILLS (keyed by user._id)
//


// TODO: Make sure userId can't be faked on server. Allow/deny rules required...
Meteor.publish('skills.userId', function(userId) {
  return Skills.find(userId)
})


//
//    SYSVARS (will be keyed by deploymentName (in future))
//

Meteor.publish('sysvars', function() {
  return Sysvars.find({ deploymentName: defaultDeploymentName })
})
