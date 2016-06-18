
// This file must be imported by main_server.js so that the Meteor method can be registered

import {Users} from '../schemas';
import {Match,check} from 'meteor/check'; 

const optional = Match.Optional;
let count;

const schema = {
  _id: String,
  createdAt: Date,
  emails: {
    address: String,
    verified: optional(Boolean)
  },
  profile: {                          // TODO: Flatten this out since user.profile is handle specially by Meteor and has security problems
    name: optional(String),
    latestNewsTimestampSeen: optional(String),    
    avatar: optional(String),
    title: optional(String),
    bio: optional(String),
    focusMsg: optional(String),          // A message to remind the person of their current focus. Good for ADHD people!
    focusStart: optional(Date),          // When that focus message was changed
    images: optional([String]),
    isDeleted: optional(Boolean), //soft delete
    invites: optional([]),
    projectNames: optional([String])   // An array of strings  
  },
  permissions: {                      // DEPRACATED. TODO: Replace with real permissions system
    teamId: optional(String),
    teamName: optional(String),
    roles: optional([String])
  }
};

Meteor.methods({
  "User.storeProfileImage": function( url ) {
    check( url, String );

    try {
      Meteor.users.update(Meteor.userId(), {$push: {"profile.images": url}})
      Meteor.users.update(Meteor.userId(), {$set: {"profile.avatar": url }})
    } catch( exception ) {
      return exception;
    }
  },

  "User.setProfileImage": function ( url ) {
    check( url, String );
    Meteor.users.update(Meteor.userId(), {$set: {"profile.avatar": url }})
  },

  "User.updateEmail": function(docId, data) {

    check(docId, String);
    if (!this.userId) throw new Meteor.Error(401, "Login required")
    if (this.userId !== docId) throw new Meteor.Error(401, "You don't have permission to edit this Profile")

    // whitelist what can be updated
    check(data, {
      "emails": optional(schema.emails)
    });

    count = Meteor.users.update(docId, {$push: data})

    console.log("[User.update]", count, docId);
    return count;
  },

  "User.setPasswordIfDoesNotExsit": function(userId, newPassword) {
    Accounts.setPassword(userId, newPassword);
  },

  "User.updateProfile": function(docId, data) {

    check(docId, String);
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")
    if (this.userId !== docId)
      throw new Meteor.Error(401, "You don't have permission to edit this Profile")
    // whitelist what can be updated
    
    check(data, {
      "profile.name": optional(schema.profile.name),
      "profile.avatar": optional(schema.profile.avatar),
      "profile.title": optional(schema.profile.title),
      "profile.bio": optional(schema.profile.bio),
      "profile.focusMsg": optional(schema.profile.focusMsg),
      "profile.focusStart": optional(schema.profile.focusStart),
      "profile.images": optional(schema.profile.images),
      "profile.isDeleted": optional(schema.profile.isDeleted),
      "profile.projectNames": optional(schema.profile.projectNames),
      "profile.latestNewsTimestampSeen": optional(schema.profile.latestNewsTimestampSeen)
    });

    count = Meteor.users.update(docId, {$set: data});

    console.log("[User.update]", count, docId);
    return count;
  }
});
