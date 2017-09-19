// The goal of this ActivitySnapshot system is to allow users to see other activity
// happening on the same asset - both read-only actions, and also modification/commentary
// actions. For example a UI could show people viewing the asset in order to enable some
// kind of pairing, or for a learner to just watching someone more experienced at
// work in order to learn from them. It is a complementary system to the write-oriented
// activity log in Activity.js

// Very importantly, ActivitySnapshot only stores the MOST RECENT entry for any
// {assetId, userId} key pair.. So it is not an activity log, it is a snapshot of the
// current action a user has taken

// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { ActivitySnapshots } from '/imports/schemas'
import { check, Match } from 'meteor/check'

var schema = {
  // Much of this is similar to Activity..
  _id: String, // ID of this activity
  timestamp: Date, // When changed

  // Identifiers for who did the activity
  byUserName: String, // UserName (not ID)
  byUserId: String, // OK, _this_ one is the ID
  byTeamName: String, // Team Owner's user NAME (FOR FUTURE USE)
  byIpAddress: String, // Cool! (FOR FUTURE USE)
  byGeo: String, // TODO - some kind of lat/long (FOR FUTURE USE)

  // Identifers for scope of the action
  toProjectName: String, // null if not a project-scoped action (BROKEN, needs to handle multiple)
  toOwnerName: String, // Owner's user NAME
  toOwnerId: String, // Owner's user ID (Added June 8th 2016)
  toAssetId: String, // The asset being observed/changed - or null if not an asset
  toAssetName: String, // Asset's name (duplicated here for speed)
  toAssetKind: String, // Asset's kind (image, map, etc)

  // BUT THE FOLLOWING is UNIQUE for ActivitySnapshot:
  passiveAction: Object, // Format depends on asset kind (code, sprite etc) and is handled by the editorComponent for that asset kind
  currentUrl: String, // This enables a simple 'follow-them' experience to be implemented
}

Meteor.methods({
  'ActivitySnapshot.setSnapshot'(data) {
    // Note that this DOES NOT require login.
    // TODO: Consider DDoS vectors here

    data.timestamp = new Date()
    data.byGeo = '' // TODO
    let actualUserId = Meteor.userId()
    if (actualUserId) data.byUserId = actualUserId
    else {
      return // As of Jan 2016, no activity snapshots for guest users - it is bad for load and privacy
      //data.byUserId = "BY_SESSION:" + (Meteor.isServer ? this.connection.id : Meteor.default_connection._lastSessionId)
    }

    if (Meteor.isServer) {
      // TODO: Make sure user id info looks legit. Don't trust client
      data.byIpAddress = this.connection.clientAddress
      if (!actualUserId) data.byUserName = `<guest@${data.byIpAddress}>`
    } else data.byIpAddress = ''

    check(data, _.omit(schema, '_id'))

    // TODO: Handle byUserId being null. Could use client IP/SessionHash in those cases?
    // TODO: Handle case of multiple Windows for byUserId? Or just use most recent (do nothing)
    let selector = {
      toAssetId: data.toAssetId,
      byUserId: data.byUserId,
    }
    var upsertResult = ActivitySnapshots.upsert(selector, data)
    if (Meteor.isServer)
      console.log(
        `  [ActivitySnapshot.setSnapshot]  by: ${data.byUserName}/${data.byUserId}  from: ${data.byIpAddress} with url ${data.currentUrl}`,
      )

    return upsertResult
  },
})

// Helper function to invoke a snapshotActivity function.
const _snapshotActivity = (asset, passiveAction, url) => {
  //console.trace("snapshot", passiveAction)
  let mUser = Meteor.user()
  let username = mUser ? mUser.profile.name : '<guest>'

  var snapData = {
    // Identifiers for the user/team that initiated the activity
    byUserName: username, // TODO - server will also validate
    byTeamName: '', // TODO - server will also validate

    // Identifers for target of the activity
    toProjectName: asset && asset.projectName ? asset.projectName : '',
    toOwnerName: asset && asset.dn_ownerName ? asset.dn_ownerName : '',
    toOwnerId: asset && asset.ownerId ? asset.ownerId : '',
    toAssetId: asset && asset._id ? asset._id : '',
    toAssetName: asset && asset.name ? asset.name : '',
    toAssetKind: asset && asset.kind ? asset.kind : '',

    passiveAction,
    currentUrl: url ? url : window.location.href,
  }

  //  console.trace(`  [ActivitySnapshot.setSnapshot]  by: ${snapData.byUserName}/${snapData.byUserId}  from: ${snapData.byIpAddress} with url ${snapData.currentUrl}`)

  Meteor.call('ActivitySnapshot.setSnapshot', snapData, (err, res) => {
    if (err) console.log('Could not set ActivitySnapshot: ', err.reason)
  })
}

export const snapshotActivity = _.debounce(_snapshotActivity, 1500, { maxWait: 5000 })
