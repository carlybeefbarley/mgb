/* global Mongo, Meteor */
import _ from 'lodash'
import { checkMgb } from '/imports/schemas/checkMgb'

// This file contains the code to update the MongoDB user_analytics record.
// This contains some interesting analytics info related to that userId.
// So far, the only one of use is the list of IP addresses they have visited from
// (it will be nice to have a geo-lookup cache for those)

// This information is kept out of the User record in order to make
// leakage to clients very unlikely, and also to avoid any memory use
// from user-record publications

// PERF note:
// In future this table could be quite 'hot' for updates so we should
// avoid change-driven subscriptions on this table. Use Meteor.call()
// or have a polled subscription.

// CONTENT note:
// We will want to avoid duplicating data we have via
// the Activity table.. but we might do some batched data updates
// from that and other info like asset count, # projects etc into here.

const UserAnalytics = new Mongo.Collection('user_analytics')

export const eradicateReasons = {
  spammer: 'spammer',
  testAccount: 'testAccount',
}

var schema = {
  // ID of this settings object.
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:user-analytics
  _id: String,

  eradicatedAt: Date, // Optional. If it exists, then it was eradicated.
  eradicatedByUsername: String, // Optional. It it exists, the username (not id) who eradicated it
  eradicatedReason: String, // Optional. It it exists, then one of the eradicateReason{} KEYS

  ipAddresses: Array, // Array of strings, e.g. [ "1.2.3.4", "12.12.11.10" ]
  referrers: Array,
  usernames: Array,
}

export const uaNoteUserIp = (userId, ipAddress) =>
  UserAnalytics.update({ _id: userId }, { $addToSet: { ipAddresses: ipAddress } })

export const uaNoteUsername = (userId, username) =>
  UserAnalytics.update({ _id: userId }, { $addToSet: { usernames: username } })

export const uaNoteUserReferrer = (userId, referrer) =>
  UserAnalytics.update({ _id: userId }, { $addToSet: { referrers: referrer } })

/** Used by main_server to lazily create this record if it does not already exist
 *
 */
export function createInitialUserAnalytics(userId) {
  if (!Meteor.isServer || !userId) return

  const ua = UserAnalytics.findOne(userId)
  if (ua) {
    console.log(`UserAnalytics object already exists for #${userId}`)
    return // No need to create one
  }

  // Ok, so let's create an empty settings object..
  let data = {
    _id: userId, // Settings._id is SAME as User._id
    ipAddresses: [],
    referrers: [],
    usernames: [],
  }

  let docId = UserAnalytics.insert(data)
  console.log(`  createInitialUserAnalytics(${data._id}) -> #${docId}`)
}

Meteor.methods({
  /** This is ONLY for superAdmins to be nosey. See fpSuperAdmin which uses this */
  'User.su.analytics.info'(userId) {
    checkMgb.checkUserIsSuperAdmin()
    checkMgb.userId(userId)
    const sel = { _id: userId }
    const ua = UserAnalytics.findOne(sel)
    const user = Meteor.users.findOne(sel)
    return {
      ua,
      u: { emails: user.emails },
    }
  },
})

export function markUserAnalyticsAsEradicated(userId, reasonKey) {
  console.log('markUserAnalyticsAsEradicated(): ', { userId, reasonKey })
  if (!Meteor.isServer || !userId) return
  checkMgb.checkUserIsSuperAdmin()
  checkMgb.userId(userId)

  if (!_.has(eradicateReasons, reasonKey)) {
    console.log('markUserAnalyticsAsEradicated: invalid reason:', reasonKey)
    return
  }

  const ua = UserAnalytics.findOne(userId)
  if (!ua) {
    console.log(`UserAnalytics object does not exist for #${userId}`)
    return
  }

  // Ok, so let's create an empty settings object..
  let data = {
    eradicatedAt: Date.now(),
    eradicatedByUsername: Meteor.user().username,
    eradicatedReason: reasonKey,
  }

  const updateCount = UserAnalytics.update({ _id: userId }, data)
  return updateCount
}
