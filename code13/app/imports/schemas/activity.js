// Activity log for MGB users. This is a persistent log that we will keep many weeks of history for
// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Activity } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import { isSameUserId } from '/imports/schemas/users'


const _activityIntervalMs = 1000 * 60 * 5   /// 5 minute interval on the activity de-deplicator. TODO: Move to SpecialGlobals.js?

var schema = {
  
  _id: String,            // ID of this activity

  timestamp: Date,
  activityType: String,   // This is a lookup into a compile-time event Info
  priority: Number,       // 1 = highest.  Used for filtering signal:noise
 
  description: String,    // A description field
  thumbnail: String,      // A few activities will have a graphic - this is it
  
  // Identifiers for who did the activity
  byUserName: String,     // UserName (not ID)
  byUserId: String,       // OK, _this_ one is the ID
  byTeamName: String,     // Team Owner's user NAME (FOR FUTURE USE)
  byIpAddress: String,    // Cool! (FOR FUTURE USE)
  byGeo: String,          // TODO - sone kind of lat/long (FOR FUTURE USE)

  // Identifers for scope of the action
  toProjectName: String,  // null if not a project-scoped action
  toOwnerName: String,    // Owner's user NAME
  toOwnerId: String,      // Owner's user ID (Added June 8th 2016)
  toAssetId: String,      // The asset that was changed - or "" if not an asset
  toAssetName: String,    // Asset's name (duplicated here for speed)
  toAssetKind: String,    // Asset's kind (image, map, etc)

  // Others - may not be on all records:

  // DEAD AS OF 2/16/2017:
  toChatChannelKey: Match.Optional(String),  // Chat Channel KEY (no # prefix, using a KEY from ChatChannels - e.g. GENERAL). Added 12/10/2016
  // The above is still here so that we can update records which has that info.

  toChatChannelName: Match.Optional(String),  // Chat Channel Name as defined in makeChannelName() in chats.js. Added  2/16/2017
}

// Info on each type of activity, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const ActivityTypes = {
  "user.join":         { icon: "green user",       pri:  5,  description: "User joined" },
  "user.login":        { icon: "user",             pri:  9,  description: "User Logged In" },
  "user.logout":       { icon: "grey user",        pri:  9,  description: "User Logged Out" },
  "user.changeFocus":  { icon: "green alarm",      pri:  9,  description: "User changed their focus" },
  "user.clearFocus":   { icon: "grey alarm",       pri:  9,  description: "User cleared their focus" },
  "user.message":      { icon: "green chat",       pri:  9,  description: "User sent a public message" }, // Should also include toChatChannelName

  "asset.create":      { icon: "green plus",       pri: 10,  description: "Create new asset" },
  "asset.fork.from":   { icon: "blue fork",        pri: 10,  description: "Forked new asset from this asset" },
  "asset.fork.to":     { icon: "green fork",       pri: 10,  description: "Created new asset by forking existing asset" },
  "asset.fork.revertTo": { icon: "orange fork",    pri: 10,  description: "Reverted asset content to ForkParent's content" },
  "asset.edit":        { icon: "edit",             pri: 15,  description: "Edit asset" },
  "asset.description": { icon: "edit",             pri: 14,  description: "Change asset description" },
  "asset.metadata":    { icon: "edit",             pri: 16,  description: "Change asset metadata" },
  "asset.stable":      { icon: "blue lock",        pri: 6,   description: "Asset marked as Locked" },
  "asset.unstable":    { icon: "grey unlock",      pri: 6,   description: "Asset marked as Unlocked" },
  "asset.workState":   { icon: "orange checkmark", pri: 6,   description: "Asset workState changed" },

  "asset.rename":      { icon: "write",            pri: 11,  description: "Rename asset" },  
  "asset.delete":      { icon: "red trash",        pri: 12,  description: "Delete asset" },
  "asset.license":     { icon: "law",              pri: 11,  description: "Asset license changed" },
  "asset.project":     { icon: "folder sitemap",   pri: 12,  description: "Change Asset's project" },
  "asset.undelete":    { icon: "green trash outline", pri: 12,  description: "Undelete asset" },
  "asset.ban":         { icon: "red bomb",        pri: 12,  description: "Ban Asset" },
  "asset.unban":       { icon: "green bomb",      pri: 12,  description: "Un-ban Asset" },
  "task.approve":      { icon: "green tasks",     pri: 12,  description: "Approve Task" },
  "task.disapprove":   { icon: "grey tasks",      pri: 12,  description: "Disapprove Task" },

  "game.play.start":   { icon: "green play",       pri: 17,  description: "Start game" },

  "project.create":    { icon: "green sitemap",    pri: 3,   description: "Create project" },
  "project.fork":      { icon: "green fork",       pri: 3,   description: "Fork project" },
  "project.addMember": { icon: "sitemap",          pri: 4,   description: "Add Member to project" },
  "project.destroy":   { icon: "red sitemap",      pri: 4,   description: "Destroyed Empty project" },
  "project.removeMember": { icon: "sitemap",       pri: 4,   description: "Remove Member from project" },
  
  // Helper functions that handles unknown asset kinds and gets good defaults for unknown items
  getIconClass: function (key) { return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].icon : "warning sign") + " icon"},
  getPri: function (key) { return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].pri : 0)},
  getDescription:  function (key) { return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].description : "Unknown Activity type (" + key + ")")}
}


Meteor.methods({

  "Activity.log": function(data) {
    
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    data.timestamp = new Date()
    data.byUserId = Meteor.userId()    // We re-assert it is correct on server in case client is hacked
    
    if (Meteor.isServer)
    {
      // TODO: Make sure user id info looks legit. Don't trust client
      data.byIpAddress = this.connection.clientAddress
      data.byGeo = ''      // TODO
      // data.byUserName    TODO: VALIDATE+FIX
      // data.byTeamName    TODO: VALIDATE+FIX
    }
    else
    {
      data.byIpAddress = ''
      data.byGeo = ''
    }
    
    check(data, _.omit(schema, '_id'))

    var docId = Activity.insert(data)
    if (Meteor.isServer)
      console.log(`  [Activity.log]  #${docId}  ${data.activityType}  by: ${data.byUserName}   from: ${data.byIpAddress}`)
    return docId
  },

  "Activity.delete": function(activityId) {
    
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    check(activityId, String)

    const act = Activity.findOne( { _id: activityId } )
    if (!act)
      throw new Meteor.Error(404, "Activity Id does not exist")

    if (!(isSameUserId(act.byUserId, this.userId) || isUserSuperAdmin(Meteor.user()) ) )
      throw new Meteor.Error(401, "Access not permitted")

    const nRemoved = Activity.remove( { _id: activityId } )

    if (Meteor.isServer)
      console.log(`  [Activity.delete]  #${activityId}  by: ${act.byUserName}`)
    
    return nRemoved
  }
})

var priorLog   // The prior activity that was logged - for simplistic de-dupe purposes

// Helper function to invoke a logActivity function. If called from client it has a VERY 
// limited co-allesce capability for duplicate activities.
// Support otherData fields such as { toChatChannelName }
export function logActivity(activityType, description, thumbnail, asset, otherData = {}) {
 
  const user = Meteor.user()

  if (!user)
  {
    console.trace('Attempted to logActivity when not logged in')
    return
  }

  const username = user.profile.name  
  var logData = {
    "activityType":         activityType, // One of the keys of the ActivityTypes object defined above
    "priority":             ActivityTypes.getPri(activityType),

    "timestamp":            new Date(),             // We do it here also so it will be in the priorLog data
    
    "description":          description || "",  
    "thumbnail":            thumbnail || "",        // TODO - use this in future as a cheap versioning technique?

    // Identifiers for the user/team that initiated the activity
    byUserName:             username,           // TODO - server will also validate
    byTeamName:             "",                 // TODO - server will also validate

    // Identifers for target of the activity
    toProjectName:          (asset && asset.projectName ?  asset.projectName : ""), 
    toOwnerName:            (asset && asset.dn_ownerName ?  asset.dn_ownerName : ""),
    toOwnerId:              (asset && asset.ownerId ? asset.ownerId : ""),    
    toAssetId:              (asset && asset._id ? asset._id : ""),
    toAssetName:            (asset && asset.name ? asset.name : ""),
    toAssetKind:            (asset && asset.kind ? asset.kind : "")    
  }
  if (otherData.toChatChannelName)
    logData.toChatChannelName = otherData.toChatChannelName

  let fSkipLog = false

  if (priorLog && !Meteor.isServer && 
      priorLog.activityType === logData.activityType &&
      logData.timestamp - priorLog.timestamp < _activityIntervalMs &&
      //priorLog.description === logData.description &&  // This can be a bit noisy for edit.
      priorLog.toAssetId === logData.toAssetId)
    fSkipLog = true
  
  if (!priorLog || !fSkipLog)
    priorLog = logData  // Only do on skip or no-prior, otherwise the priorLog.timestamp will keep updating.
  
  if (!fSkipLog)
    Meteor.call('Activity.log', logData, (err, res) => {
      if (err)
        console.log("Could not log Activity: ", err.reason)
    }) 
}

export function deleteActivityRecord(activityId) {
  Meteor.call( "Activity.delete", activityId )
}