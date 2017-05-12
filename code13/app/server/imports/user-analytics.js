/* global Mongo, Meteor */

// This file contains the code to update the MongoDB user_analytics record.
// This contains some interesting analytics info related to that userId.
// So far, the only one of use is the list of IP addresses they have been seen from

// This information is kept out of the User record in order to make 
// leakage to clients very unlikely, and also to avoid any memory use 
// from user-record publications

const UserAnalytics = new Mongo.Collection('user_analytics')

var schema = {
  // ID of this settings object. 
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:user-analytics
  _id: String,

  ipAddresses: Array,
  referrers: Array,
  usernames: Array,
}

export const uaNoteUserIp = (userId, ipAddress) =>
    UserAnalytics.update( { _id: userId }, { $addToSet: { 'ipAddresses': ipAddress } } )

export const uaNoteUsername = (userId, username) =>
    UserAnalytics.update( { _id: userId }, { $addToSet: { 'usernames': username } } )


export const uaNoteUserReferrer = (userId, referrer) =>
    UserAnalytics.update( { _id: userId }, { $addToSet: { 'referrers': referrer } } )


export function createInitialUserAnalytics(userId) {
  if (!Meteor.isServer || !userId) 
    return

  const ua = UserAnalytics.findOne(userId)
  if (ua)
  {
    console.log(`UserAnalytics object already exists for #${userId}`)
    return  // No need to create one
  }

  // Ok, so let's create an empty settings object..
  let data = {
    _id:          userId,   // Settings._id is SAME as User._id 
    ipAddresses:  [],
    referrers:    [],
    usernames:    []
  }

  let docId = UserAnalytics.insert(data)
  console.log(`  createInitialUserAnalytics(${data._id}) -> #${docId}`)
}