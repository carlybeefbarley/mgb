// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Accounts } from 'meteor/accounts-base'
import { Match, check } from 'meteor/check'

import { Users } from '/imports/schemas'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'

const optional = Match.Optional
let count // TODO: IDK why I put this out here. Come back and move it into methods once I'm sure there wasn't some meteor-magic here.

const schema = {
  _id: String,
  createdAt: Date,
  emails: {
    address: String,
    verified: optional(Boolean),
  },
  profile: {
    // TODO: Flatten this out since user.profile is handle specially by Meteor and has security problems
    name: optional(String),
    latestNewsTimestampSeen: optional(String),
    avatar: optional(String), // url for the image that is the user Avatar
    title: optional(String),
    bio: optional(String),
    mgb1name: optional(String), // Added July 2016. This is the user's name in MGBv1 (they claim)
    mgb1namesVerified: optional(String), // Added July 2016. This indicates a comma-separated list of validated MGB1 accounts this user can import from (validation mechanism TBD)
    focusMsg: optional(String), // A message to remind the person of their current focus. Good for ADHD people!
    focusStart: optional(Date), // When that focus message was changed
    images: optional([String]),
    isDeleted: optional(Boolean), // soft delete flag, so we can have an undelete easily
    //    invites: optional([]),             // DEPRECATED
    projectNames: optional([String]), // An array of strings  DEPRECATED, IGNORE+DELETE
  },
  badges: optional([]), // Empty.. or array of badge names (see badges.js)
  badges_count: optional(Number), // Number of badges
  edit_time: optional(Object), // time spent in each of asset editors
  permissions: {
    // TODO: Actually this is modelled as an array of team/??/perm stuff. Look at fixtures for the super-admin example. Needs cleaning up.
    roles: optional([String]), // See in App.js for 'super-admin' handling
  },

  isDeactivated: optional(Boolean), // Added March 2017. Users can choose to deactivate their own accounts. This may get some special workflow in future

  // The su fields can only be changed by a superAdmin User.. They typically relate to workflows or system counts
  suIsBanned: optional(Boolean), // Optional. If true, then this USER has been banned. See suFlagId for the flagging workflow
  suFlagId: optional(String), // Optional. (TODO) non-null / non-empty if there is a Flag record for this message (See Flags.js)
}

export const userSorters = {
  default: { createdAt: -1 }, // Should be same as one of the others..
  badges: { badges_count: -1 },
  createdNewest: { createdAt: -1 },
  createdOldest: { createdAt: 1 },
  nameAscending: { 'profile.name': 1 }, // NOTE: MongoDB doesn't yet support case-insensitive name sorts. grrr
  nameDescending: { 'profile.name': -1 }, // NOTE: MongoDB doesn't yet support case-insensitive name sorts. grrr
  //"mgbRecentsDate":  { "profile.latestNewsTimestampSeen": -1 },   // This can't work until the date strings are replaced with Date() values in the DB
}

Meteor.methods({
  'User.storeProfileImage'(url) {
    check(url, String)
    checkIsLoggedInAndNotSuspended()

    try {
      Users.update(Meteor.userId(), { $push: { 'profile.images': url } })
      Users.update(Meteor.userId(), { $set: { 'profile.avatar': url } })
    } catch (exception) {
      console.log('User.storeProfileImage failed:', exception)
      return exception
    }
  },

  'User.setProfileImage'(url) {
    check(url, String)
    checkIsLoggedInAndNotSuspended()
    Users.update(Meteor.userId(), { $set: { 'profile.avatar': url } })
  },

  'User.updateEmail'(docId, data) {
    check(docId, String)
    checkIsLoggedInAndNotSuspended()

    if (this.userId !== docId) throw new Meteor.Error(401, "You don't have permission to edit this Profile")

    // whitelist what can be updated
    check(data, {
      emails: optional(schema.emails),
    })

    count = Users.update(docId, { $push: data })

    console.log('[User.updateEmail]', count, docId)
    return count
  },

  'User.updateProfile'(docId, data) {
    check(docId, String)
    checkIsLoggedInAndNotSuspended()

    if (this.userId !== docId) throw new Meteor.Error(401, "You don't have permission to edit this Profile")
    // whitelist what can be updated

    if (!_.isUndefined(data.suIsBanned) || !_.isUndefined(data.suFlagId)) checkMgb.checkUserIsSuperAdmin()

    check(data, {
      'profile.name': optional(schema.profile.name), // TODO: Disallow?
      'profile.avatar': optional(schema.profile.avatar),
      'profile.title': optional(schema.profile.title),
      'profile.bio': optional(schema.profile.bio),
      'profile.focusMsg': optional(schema.profile.focusMsg),
      'profile.focusStart': optional(schema.profile.focusStart),
      'profile.mgb1name': optional(schema.profile.mgb1name),
      //    "profile.mgb1namesVerified": optional(schema.profile.mgb1namesVerified),   // TODO: Some server-only validation for this
      // Note that badges and badges_count have their own special api

      'profile.images': optional(schema.profile.images),
      'profile.isDeleted': optional(schema.profile.isDeleted),
      'profile.projectNames': optional(schema.profile.projectNames),
      'profile.latestNewsTimestampSeen': optional(schema.profile.latestNewsTimestampSeen),
      suIsBanned: schema.suIsBanned,
      suFlagId: schema.suFlagId,
    })
    count = Users.update(docId, { $set: data })

    if (Meteor.isServer) console.log('[User.updateProfile]', count, docId)
    return count
  },

  'User.sendVerifyEmail'() {
    if (Meteor.isServer) {
      Accounts.sendVerificationEmail(Meteor.userId(), Meteor.user().emails[0].address)
    }
  },

  'User.addEditTime'(editType, timeSec) {
    checkIsLoggedInAndNotSuspended()
    const editors = ['graphic', 'code', 'map', 'actor', 'actormap', 'sound', 'music']
    // add to time max 60sec per request
    if (_.includes(editors, editType) && timeSec <= 60) {
      const user = Meteor.user()
      const edit_time = _.isEmpty(user.edit_time) ? {} : user.edit_time
      if (!edit_time[editType]) edit_time[editType] = 0
      edit_time[editType] += timeSec
      Users.update({ _id: Meteor.userId() }, { $set: { edit_time } })
    }
  },
})

//
// helper functions
//

export function isSameUser(user1, user2) {
  return user1 && user2 && user1._id && user2._id && user1._id === user2._id
}

export function isSameUserId(id1, id2) {
  return id1 && id2 && id1 === id2
}
