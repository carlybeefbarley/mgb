// This file should be imported by the main_server.js file

import {Plans, Users, Teams, Todos, Azzets} from '../schemas';

//only super-admins can see all plans. Everyone else gets the public plans only
Meteor.publish('plans', function(isSuperAdmin) {
  if (isSuperAdmin) {
    return Plans.find();
  } else {
    return Plans.find();
  }
});

Meteor.publish('teams', function(limit) {
  return Teams.find({}, {limit: limit, sort: {date: -1}});
});

//Publish roles fields (normally its hidden. Meteor publishes only email and profile
//fields on the user by default)
Meteor.publish(null, function() {   // null here is a special case for Meteor's universal publications.
  return Meteor.users.find({_id: this.userId}, {fields: {permissions: 1}});
});

Meteor.publish('users.belongingToTeam', function(teamId) {
  //This still returns all users because of the publication below publishing all
  //users.
  return Users.find({'permissions.teamId': teamId });
});

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

//Can see all todos belonging to user/team
Meteor.publish('todos.auth', function(userId, teamId) {
  if (userId) {
    return Todos.find({
      isDeleted: false,
      ownerId: userId,
    });
  } else {
    return Todos.find({
      isDeleted: false,
      teamId: teamId
    });
  }
});


if (Meteor.isServer) {
  Azzets._ensureIndex({
    "name": "text"        // Index the name field. See https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor
  });
}

//Can see all assets belonging to user/team
// selectedAssetKinds is an array of AssetKindsKeys strings
Meteor.publish('assets.auth', function(userId, selectedAssetKinds, nameSearch) {
  let selector = {
    isDeleted: false,
    ownerId: userId
  }
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )

  if (nameSearch && nameSearch.length > 0)
    selector["$text"]= {$search: nameSearch}

  return Azzets.find(selector);
  }
);

//Can see all assets
// selectedAssetKinds is an array of AssetKindsKeys strings
Meteor.publish('assets.public', function(userId, selectedAssetKinds, nameSearch) {
  let selector = {
    isDeleted: false,
  }
  if (userId && userId !== -1)
    selector["ownerId"] = userId
  if (selectedAssetKinds && selectedAssetKinds.length > 0)
    selector["$or"] = _.map(selectedAssetKinds, (x) => { return { kind: x} } )  // TODO: Could use $in ?

  if (nameSearch && nameSearch.length > 0)
    selector["$text"]= {$search: nameSearch}

  return Azzets.find(selector);
  }
);

//Can only see todos not marked as private
Meteor.publish('todos.public', function(userId, teamId) {
  if (userId) {
    return Todos.find({
      isDeleted: false,
      ownerId: userId,
      isPrivate: false
    });
  } else {
    return Todos.find({
      isDeleted: false,
      teamId: teamId,
      isPrivate: false
    });
  }
});
