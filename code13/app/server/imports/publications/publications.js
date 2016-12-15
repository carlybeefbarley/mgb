// This file should be imported by the main_server.js file

import { Users, Azzets, Projects, Activity, ActivitySnapshots, Chats, Settings, Sysvars, Skills } from '/imports/schemas'
import { assetMakeSelector, allSorters } from '/imports/schemas/assets'
import { userSorters } from '/imports/schemas/users'
import { projectMakeSelector, projectMakeFrontPageListSelector } from '/imports/schemas/projects'
import { chatParams } from '/imports/schemas/chats'
import { defaultDeploymentName } from '/imports/schemas/sysvars'

//
//    USERS
//

const fieldsUserPublic = { username: 1, profile: 1, permissions: 1, createdAt: 1 }

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
//   ASSETS  
//

// I originally created this so we can support $text queries on name, but now we are using regex, it's not clear it is of value
// TODO: Consider cost/benefit of this index.. VERY PROBABLY DELETE THIS INDEX
Azzets._ensureIndex({
  "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
})

Azzets._ensureIndex({"isDeleted": 1, "updatedAt": -1})
Azzets._ensureIndex({"isDeleted": 1, "kind": 1})
Azzets._ensureIndex({"isDeleted": 1, "name": 1, "kind": 1})
Azzets._ensureIndex({"isDeleted": 1, "name": 1, "updatedAt": -1})
Azzets._ensureIndex({"isDeleted": 1, "kind": 1, "updatedAt": -1})
Azzets._ensureIndex({"isDeleted": 1, "ownerId": 1, "kind": 1, "updatedAt": -1})
Azzets._ensureIndex({"isDeleted": 1, "dn_ownerName": 1, "name": 1, "kind": 1})

/** 
 * Can see all assets, but does NOT include the big 'content2' field 
 * @param userId can be undefined or -1 .. indicating don't filter by user if
 * @param selectedAssetKinds is an array of AssetKindsKeys strings
 * @param nameSearch is going to be stuffed inside a RegEx, so needs to be clean
 *    TODO: cleanse the nameSearch RegExp
 */
Meteor.publish('assets.public', function(
                                    userId, 
                                    selectedAssetKinds, 
                                    nameSearch, 
                                    projectName=null,   // BUGBUG: Need to also have projectOwner!!! OMG
                                    showDeleted=false, 
                                    showStable=false, 
                                    assetSortType,    // one of the keys of allSorters
                                    limitCount=50) 
{
  let selector = assetMakeSelector(userId, 
                      selectedAssetKinds, 
                      nameSearch, 
                      projectName,    // BUGBUG: Need to also have projectOwner!!! OMG
                      showDeleted, 
                      showStable)
  let assetSorter = assetSortType ? allSorters[assetSortType] : allSorters["edited"]
  const findOpts = {
    fields: {content2: 0},
    sort:  assetSorter,
    limit: limitCount
  }
  return Azzets.find(selector, findOpts )
})

// Observe assets only - add limit??
// https://medium.com/@MaxDubrovin/workaround-for-meteor-limitations-if-you-want-to-sub-for-more-nested-fields-of-already-received-docs-eb3fdbfe4e07#.k76s2u4cs
Meteor.publish('assets.public.partial.bySelector', function(selector) {
  const cursor = Azzets.find(selector, {fields: {updatedAt: 1, name: 1, kind: 1, dn_ownerName: 1, isDeleted: 1}})
  // publish to another client Collection - as partial data will ruin Azzets collection on the client side
  // I know - this is ugly, but seems that there is no better solution
  Mongo.Collection._publishCursor(cursor, this, 'PartialAzzets')
  this.ready()
})

// Return one asset info only.
Meteor.publish('assets.public.byId', function(assetId) {
  return Azzets.find(assetId, {fields: {content2: 0}})
})

// Return one asset. This is a good subscription for AssetEditRoute
// Removed - as c2 is fetched and cached via ajax / cdn combo
/*Meteor.publish('assets.public.byId.withContent2', function(assetId) {
  return Azzets.find(assetId)
})*/
Meteor.publish('assets.public.owner.name', function(owner, name, kind) {
  const sel = {dn_ownerName: owner, name: name, kind: kind}
  return Azzets.find(sel)
})


//
//    PROJECTS
//

// Return one project. This is a good subscription for ProjectOverviewRoute
Meteor.publish('projects.forProjectId', function(projectId) {
  return Projects.find(projectId)
})


// Return projects relevant to this userId.. This includes owner, member, etc
Meteor.publish('projects.byUserId', function(userId) {
  const selector = projectMakeSelector(userId)
  return Projects.find(selector)
})

Meteor.publish('projects.frontPageList', function (limitCount=5) {
  const selector = projectMakeFrontPageListSelector()
  return Projects.find(selector, { limit: limitCount, sort: {updatedAt: -1} } )
})

Projects._ensureIndex({"updatedAt": -1})
Projects._ensureIndex({"workState": -1})
Projects._ensureIndex({"workState": 1, "updatedAt": -1})

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
//    CHATS
//


// TODO: Make sure userId can't be faked on server. Allow/deny rules required...
Meteor.publish('chats.userId', function(userId, toChannelName, limit=20) {
  // Paginated chats.
  if (limit > chatParams.maxClientChatHistory) 
    limit = chatParams.maxClientChatHistory

  let selector = { toChannelName: toChannelName } //$or: [ { toOwnerId: null}, {toOwnerId: userId} ] }
  let options = {limit: limit, sort: {createdAt: -1} }
  return Chats.find(selector, options)
})

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
