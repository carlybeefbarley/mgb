// This file should be imported by the main_server.js file

import {Users, Azzets, Activity, ActivitySnapshots } from '../schemas';

//
//    USERS
//

Meteor.publish('users', function(limit) {
  //Paginated users.
  if (limit) {
    return Meteor.users.find({}, {limit: limit, sort: {date: -1}});
  }
  return Meteor.users.find({}, {sort: {date: -1}});
});

Meteor.publish('user', function(id) {
  return Meteor.users.find(id);
});

//
//   ASSETS  
//

Azzets._ensureIndex({
  "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
});


// Can see all assets belonging to user
// selectedAssetKinds is an array of AssetKindsKeys strings
Meteor.publish('assets.auth', function(userId, selectedAssetKinds, nameSearch, projectName=null,  showDeleted=false, showStable=false) {
  let selector = {
    isDeleted: showDeleted,
    ownerId: userId
  }
  
  if (projectName && projectName.length > 0)
    selector["projectNames"] = projectName
  
  if (showStable === true)  // This means ONLY show stable assets
    selector["isCompleted"] = showStable;
    
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )

  if (nameSearch && nameSearch.length > 0)
    selector["$text"]= {$search: nameSearch}

  return Azzets.find(selector, {fields: {content2: 0}});
});


//Can see all assets
// selectedAssetKinds is an array of AssetKindsKeys strings
Meteor.publish('assets.public', function(userId, selectedAssetKinds, nameSearch, projectName=null, showDeleted=false, showStable=false) {
  let selector = {
    isDeleted: showDeleted,
  }
  
  if (showStable === true)  // This means ONLY show stable assets
    selector["isCompleted"] = showStable

  if (projectName && projectName.length > 0)
    selector["projectNames"] = projectName

  if (userId && userId !== -1)
    selector["ownerId"] = userId
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )  // TODO: Could use $in ?

  if (nameSearch && nameSearch.length > 0)
    selector["$text"]= {$search: nameSearch}

  return Azzets.find(selector, {fields: {content2: 0}} );
});


//Can see all assets
// selectedAssetKinds is an array of AssetKindsKeys strings
Meteor.publish('assets.public.withContent2', function(userId, selectedAssetKinds, nameSearch, projectName=null, showDeleted=false, showStable=false) {
  let selector = {
    isDeleted: showDeleted,
  }
  
  if (showStable === true)  // This means ONLY show stable assets
    selector["isCompleted"] = showStable

  if (userId && userId !== -1)
    selector["ownerId"] = userId
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )  // TODO: Could use $in ?

  if (nameSearch && nameSearch.length > 0)
    selector["$text"]= {$search: nameSearch}

  return Azzets.find(selector);
});


//
//    ACTIVITY LOG
//

Meteor.publish('activity.public.recent', function(limitCount) {
  let selector = { }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options);
});


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

// NOTE THAT THE expireAfterSeconds value cannot be changed! 
// You have to drop the index to change it (or use the complicated collMod approach)
// Here's how to drop it using the CLI: 
//     $ meteor mongo
//     > use meteor
//     > db.activity_snapshots.dropIndexes()
//     > db.activity_snapshots.getIndexes()   // check it is dropped ok
ActivitySnapshots._ensureIndex( { "timestamp": 1 }, { expireAfterSeconds: 60*5 } )
