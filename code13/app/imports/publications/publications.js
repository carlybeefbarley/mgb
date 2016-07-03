// This file should be imported by the main_server.js file

import { Users, Azzets, Projects, Activity, ActivitySnapshots, Chats } from '../schemas';

import { assetMakeSelector, assetSorters } from '../schemas/assets';
import { projectMakeSelector } from '../schemas/projects';

//
//    USERS
//
//  TODO: Exclude stuff like profile.email doh

Meteor.publish('users', function(limit) {
  //Paginated users.
  if (limit) {
    return Meteor.users.find({}, {limit: limit, sort: {date: -1}});
  }
  return Meteor.users.find({}, {sort: {date: -1}});
});


Meteor.publish('users.byName', function(nameSearch, limit) {
  let selector = {}
  if (nameSearch && nameSearch.length > 0)
  {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector["profile.name"]= {$regex: new RegExp("^.*" + nameSearch, 'i')}
  }
  
  let options = {sort: {date: -1}}
  if (limit) 
    options["limit"] = limit    //Paginated users.

  return Meteor.users.find(selector, options)
});


// This is used for example by the project membership list
Meteor.publish('users.getByIdList', function(idArray) {
  const selector = {_id: {"$in": idArray}}
  return Meteor.users.find(selector);
});

Meteor.publish('user', function(id) {
  return Meteor.users.find(id);
});

//
//   ASSETS  
//

// I originally created this so we can support $text queries on name, but now we are using regex, it's not clear it is of value
// TODO: Consider cost/benefit of this index.. VERY PROBABLY DELETE THIS INDEX
Azzets._ensureIndex({
  "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
});

Azzets._ensureIndex({"isDeleted": 1, "kind": 1})
Azzets._ensureIndex({"isDeleted": 1, "name": 1, "kind": 1})


/** 
 * Can see all assets, but does NOT include the big 'content2' field 
 * @param userId can be undefined or -1 .. indicating don't dilter by user if
 * @param selectedAssetKinds is an array of AssetKindsKeys strings
 * @param nameSearch is going to be stuffed inside a RegEx, so needs to be clean
 *    TODO: cleanse the nameSearch RegExp
 */
Meteor.publish('assets.public', function(
                                    userId, 
                                    selectedAssetKinds, 
                                    nameSearch, 
                                    projectName=null, 
                                    showDeleted=false, 
                                    showStable=false, 
                                    assetSortType,    // one of the keys of assetSorters
                                    limitCount=50) 
{
  let selector = assetMakeSelector(userId, 
                      selectedAssetKinds, 
                      nameSearch, 
                      projectName, 
                      showDeleted, 
                      showStable)
  let assetSorter = assetSorters[assetSortType]
  const findOpts = {
    fields: {content2: 0},
    sort:  assetSorter,
    limit: limitCount
  }
  return Azzets.find(selector, findOpts );
});



// Return one asset. This is a good subscription for AssetEditRoute
Meteor.publish('assets.public.byId.withContent2', function(assetId) {
  return Azzets.find(assetId);
});


//
//    PROJECTS
//


// Return one project. This is a good subscription for ProjectOverviewRoute
Meteor.publish('projects.forProjectId', function(projectId) {
  return Projects.find(projectId);
});



// Return projects relevant to this userId.. This includes owner, member, etc
Meteor.publish('projects.byUserId', function(userId) {
  const selector = projectMakeSelector(userId)
  return Projects.find(selector);
});


//
//    ACTIVITY LOG
//

Meteor.publish('activity.public.recent', function(limitCount=50) {
  let selector = { }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
});

Meteor.publish('activity.public.recent.userId', function(userId, limitCount=50) {
  let selector = { byUserId: userId }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
});

Meteor.publish('activity.public.recent.assetid', function(assetId, limitCount=50) {
  let selector = { toAssetId: assetId }
  let options = { limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options)
});


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
  return ActivitySnapshots.find(selector, options);
});


Meteor.publish('activitysnapshots.userId', function(userId) {
  // Note that we don't put a date range selector in here since it doesn't automatically
  // change reactively. It's simpler just to use Mongo's expireAfterSeconds feature
  // to purge the records.
  let selector = { byUserId: userId }
  let options = {limit: 100, sort: {timestamp: -1} }
  return ActivitySnapshots.find(selector, options);
});

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
Meteor.publish('chats.userId', function(userId, limit=30) {
  // Paginated chats.
  if (limit > 200) 
    limit = 200

  let selector = { } //$or: [ { toOwnerId: null}, {toOwnerId: userId} ] }
  let options = {limit: limit, sort: {createdAt: -1} }

  return Chats.find(selector, options);
});
