
// This file must be imported by main_server.js so that the Meteor method can be registered

import { Users } from '/imports/schemas'
import { Match, check } from 'meteor/check' 

const optional = Match.Optional
let count                                // TODO: IDK why I put this out here. Come back and move it into methods once I'm sure there wasn't some meteor-magic here.

const schema = {
  _id: String,
  createdAt: Date,
  emails: {
    address: String,
    verified: optional(Boolean)
  },
  profile: {                             // TODO: Flatten this out since user.profile is handle specially by Meteor and has security problems
    name: optional(String),
    latestNewsTimestampSeen: optional(String),    
    avatar: optional(String),            // url for the image that is the user Avatar
    title: optional(String),
    bio: optional(String),
    mgb1name: optional(String),          // Added July 2016. This is the user's name in MGBv1 (they claim)
    mgb1nameVerified: optional(Boolean), // Added July 2016. This indicates it has been verified (mechanism TBD)
    focusMsg: optional(String),          // A message to remind the person of their current focus. Good for ADHD people!
    focusStart: optional(Date),          // When that focus message was changed
    images: optional([String]),
    isDeleted: optional(Boolean),        // soft delete flag, so we can have an undelete easily
//    invites: optional([]),             // DEPRECATED
    projectNames: optional([String])     // An array of strings  DEPRECATED, IGNORE+DELETE
  },
  badges: optional([]),
  permissions: {                         // TODO: Actually this is modelled as an array of team/??/perm stuff. Look at fixtures for the super-admin example. Needs cleaning up.
    roles: optional([String])            // See in App.js for 'super-admin' handling 
  }
}


export const userSorters = { 
  "default":         { createdAt: -1 },    // Should be same as one of the others..
  "createdNewest":   { createdAt: -1 }, 
  "createdOldest":   { createdAt: 1 }, 
  "nameAscending":   { "profile.name": 1  }, 
  "nameDescending":  { "profile.name": -1 }
//"mgbRecentsDate":  { "profile.latestNewsTimestampSeen": -1 },   // This can't work until the date strings are replaced with Date() values in the DB
}


Meteor.methods({
  "User.storeProfileImage": function( url ) {
    check( url, String )

    try {
      Meteor.users.update(Meteor.userId(), { $push: {"profile.images": url }} )
      Meteor.users.update(Meteor.userId(), { $set:  {"profile.avatar": url }} )
    } catch ( exception ) {
      console.log("User.storeProfileImage failed:", exception)
      return exception
    }
  },

  "User.setProfileImage": function ( url ) {
    check( url, String )
    Meteor.users.update(Meteor.userId(), { $set: {"profile.avatar": url }} )
  },

  "User.updateEmail": function(docId, data) {
    check(docId, String)
    if (!this.userId) throw new Meteor.Error(401, "Login required")
    if (this.userId !== docId) throw new Meteor.Error(401, "You don't have permission to edit this Profile")

    // whitelist what can be updated
    check(data, {
      "emails": optional(schema.emails)
    })

    count = Meteor.users.update(docId, {$push: data})

    console.log("[User.updateEmail]", count, docId)
    return count
  },

// TODO: Enable this once I know it is actually safe!
  // "User.setPasswordIfDoesNotExist": function(userId, newPassword) {
  //   // Yikes!!!
  //   Accounts.setPassword(userId, newPassword)
  // },


  "User.updateProfile": function(docId, data) {

    check(docId, String)
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
      "profile.mgb1name": optional(schema.profile.mgb1name),
//    "profile.mgb1nameVerified": optional(schema.profile.mgb1nameVerified),   // TODO: Some server-only validation for this
      "profile.images": optional(schema.profile.images),
      "profile.isDeleted": optional(schema.profile.isDeleted),
      "profile.projectNames": optional(schema.profile.projectNames),
      "profile.latestNewsTimestampSeen": optional(schema.profile.latestNewsTimestampSeen)
    });

    data.updatedAt = Date.now()
    count = Meteor.users.update(docId, {$set: data})

    if (Meteor.isServer)
      console.log("[User.updateProfile]", count, docId)
    return count
  }
})


// helper functions
export function isSameUser(user1, user2)
{
  return user1 && user2 && user1._id && user2._id && user1._id === user2._id
}



// helper functions
export function isSameUserId(id1, id2)
{
  return id1 && id2 && id1 === id2
}
