// This file should be imported by the main_server.js file

import {Users, Azzets, Activity} from '../schemas';

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


if (Meteor.isServer) {
  Azzets._ensureIndex({
    "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
  });
}

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
  }
);

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
  }
);

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
  }
);

Meteor.publish('activity.public.recent', function(limitCount) {
  let selector = { }
  let options = {limit: limitCount, sort: {timestamp: -1}}

  return Activity.find(selector, options);
  }
);

