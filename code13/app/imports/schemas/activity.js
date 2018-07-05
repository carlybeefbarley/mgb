// Activity log for MGB users. This is a persistent log that we will keep many weeks of history for
// This file must be imported by main_server.js so that the Meteor method can be registered

import _ from 'lodash'
import { Activity, Azzets } from '/imports/schemas'
import { check, Match } from 'meteor/check'
import { isUserSuperAdmin } from '/imports/schemas/roles'
import { isSameUserId } from '/imports/schemas/users'

const _activityIntervalMs = 1000 * 60 * 5 /// 5 minute interval on the activity de-deplicator. TODO: Move to SpecialGlobals.js?

var schema = {
  _id: String, // ID of this activity

  timestamp: Date,
  activityType: String, // This is a lookup into a compile-time event Info
  priority: Number, // 1 = highest.  Used for filtering signal:noise

  description: String, // A description field
  thumbnail: String, // A few activities will have a graphic - this is it

  // Identifiers for who did the activity
  byUserName: String, // UserName (not ID)
  byUserId: String, // OK, _this_ one is the ID
  byTeamName: String, // Team Owner's user NAME (FOR FUTURE USE)
  byIpAddress: String, // Cool! (FOR FUTURE USE)
  byGeo: String, // TODO - sone kind of lat/long (FOR FUTURE USE)

  // Identifers for scope of the action
  toProjectName: String, // null if not a project-scoped action
  toOwnerName: String, // Owner's user NAME
  toOwnerId: String, // Owner's user ID (Added June 8th 2016)
  toAssetId: String, // The asset that was changed - or "" if not an asset
  toAssetName: String, // Asset's name (duplicated here for speed)
  toAssetKind: String, // Asset's kind (image, map, etc)

  // Others - may not be on all records:

  // DEAD AS OF 2/16/2017:
  toChatChannelKey: Match.Optional(String), // Chat Channel KEY (no # prefix, using a KEY from ChatChannels - e.g. GENERAL). Added 12/10/2016
  // The above is still here so that we can update records which has that info.

  toChatChannelName: Match.Optional(String), // Chat Channel Name as defined in makeChannelName() in chats.js. Added  2/16/2017
  toUserId: Match.Optional(String), // user id interacted with (for example added to project) Added 08/28/2017
  toUserName: Match.Optional(String), // user name interacted with (for example added to project) Added 08/28/2017

  unread: Boolean, // flag if user (toUserId) read activity. Used only for interactions (mention in chat, adding to project, loved assets) with users. Added 12/27/2017
}

// Info on each type of activity, as the UI cares about it
// .icon is as defined in http://semantic-ui.com/elements/icon.html
export const ActivityTypes = {
  'user.join': { icon: 'green user', pri: 5, description: 'Joing My Game Builder' },
  'user.login': { icon: 'user', pri: 9, description: 'Logged In' },
  'user.logout': { icon: 'grey user', pri: 9, description: 'Logged Out' },
  'user.changeFocus': { icon: 'green alarm', pri: 9, description: 'Changed Focus' },
  'user.clearFocus': { icon: 'grey alarm', pri: 9, description: 'Cleared Focus' },
  'user.message': { icon: 'chat', pri: 9, description: 'Sent a Public Message' }, // Should also include toChatChannelName
  'user.messageAt': { icon: 'at', pri: 5, description: 'Was Mentioned in a Message' }, // Should also include toChatChannelName
  'user.awardedSkill': { icon: 'green student', pri: 7, description: 'Awarded a New Skill' },
  'user.learnedSkill': { icon: 'student', pri: 9, description: 'Learned New Skill' },
  'user.earnBadge': { icon: 'green trophy', pri: 6, description: 'Earned a Badge' },

  'asset.create': { icon: 'green plus', pri: 10, description: 'Created New Asset' },
  'asset.fork.from': { icon: 'blue fork', pri: 10, description: 'Forked an Asset' },
  /*'asset.fork.to': {
      icon: 'green fork',
      pri: 10,
      description: 'Created new asset by forking existing asset',
    },
    'asset.fork.revertTo': {
      icon: 'orange fork',
      pri: 10,
      description: "Reverted asset content to ForkParent's content",
    }, */
  'asset.edit': { icon: 'edit', pri: 15, description: 'Edited an Asset' },
  'asset.description': { icon: 'edit', pri: 14, description: "Changed an Asset's Description" },
  'asset.metadata': { icon: 'edit', pri: 16, description: "Changed an Asset's Metadata" },
  'asset.stable': { icon: 'blue lock', pri: 6, description: 'Locked an Asset' },
  'asset.unstable': { icon: 'grey unlock', pri: 6, description: 'Unlocked an Asset' },
  /* 'asset.workState': { icon: 'orange checkmark', pri: 6, description: 'Changed Asset Work State' }, */

  'asset.rename': { icon: 'write', pri: 11, description: 'Renamed an Asset' },
  'asset.delete': { icon: 'red trash', pri: 12, description: 'Deleted an Asset' },
  'asset.license': { icon: 'law', pri: 11, description: "Changed an Asset's License" },
  'asset.project': { icon: 'folder sitemap', pri: 12, description: "Changed an Asset's Project" },
  'asset.undelete': { icon: 'green trash outline', pri: 12, description: 'Undeleted an Asset' },
  'asset.userLoves': { icon: 'heart', pri: 12, description: 'Loved an Asset' },
  'asset.ban': { icon: 'red bomb', pri: 12, description: 'Banned an Asset' },
  'asset.unban': { icon: 'green bomb', pri: 12, description: 'Unbanned an Asset' },
  'task.askReview': { icon: 'grey tasks', pri: 12, description: 'Asked for a Task review' },
  'task.approve': { icon: 'green tasks', pri: 12, description: 'Approved a Task' },
  'task.disapprove': { icon: 'grey tasks', pri: 12, description: 'Diapproved a Task' },

  'game.play.start': { icon: 'green play', pri: 17, description: 'Started a Game' },

  'project.create': { icon: 'green sitemap', pri: 3, description: 'Created a Project' },
  'project.fork': { icon: 'green fork', pri: 3, description: 'Forked a Project' },
  'project.addMember': { icon: 'sitemap', pri: 4, description: 'Added a Member to a Project' },
  'project.destroy': { icon: 'red sitemap', pri: 4, description: 'Destroyed an Empty Project' },
  /* 'project.removeMember': { icon: 'sitemap', pri: 4, description: 'Removed a Membeer from a Project' }, */
  'project.leaveMember': { icon: 'sitemap', pri: 4, description: 'Left a Project' },
  'project.workState': { icon: 'orange checkmark', pri: 6, description: 'Changed Project Work State'},
  // Helper functions that handles unknown asset kinds and gets good defaults for unknown items
  getIconClass(key) {
    return (ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].icon : 'warning sign') + ' icon'
  },
  getPri(key) {
    return ActivityTypes.hasOwnProperty(key) ? ActivityTypes[key].pri : 0
  },
  getDescription(key) {
    return ActivityTypes.hasOwnProperty(key)
      ? ActivityTypes[key].description
      : 'Unknown Activity type (' + key + ')'
  },
}

Meteor.methods({
  'Activity.log'(
    data, // Proposed Activity record
    override_byUser, // If admin, the user _id and username we want to force so we can do log-on-behalf-of
  ) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    data.timestamp = new Date()
    data.unread = true // by default all activities are unread. We do use unread only for interactions

    if (_.isPlainObject(override_byUser)) {
      if (!isUserSuperAdmin(Meteor.user()))
        throw new Meteor.Error(401, 'Only admins/mods can log Activity on behalf of others')
      data.byUserId = override_byUser._id
      data.byUserName = override_byUser.username
    } else {
      // We re-assert it is correct on server in case muggle client tried to forge it
      data.byUserId = Meteor.userId()
      data.byUserName = Meteor.user().username
    }

    if (Meteor.isServer) {
      // TODO: Make sure user id info looks legit. Don't trust client
      data.byIpAddress = this.connection.clientAddress
      data.byGeo = '' // TODO
      // data.byUserName    TODO: VALIDATE+FIX
      // data.byTeamName    TODO: VALIDATE+FIX
    } else {
      data.byIpAddress = ''
      data.byGeo = ''
    }

    check(data, _.omit(schema, '_id'))

    var docId = Activity.insert(data)
    if (Meteor.isServer)
      console.log(
        `  [Activity.log]  #${docId}  ${data.activityType}  by: ${data.byUserName}   from: ${data.byIpAddress}`,
      )
    return docId
  },

  'Activity.delete'(activityId) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    check(activityId, String)

    const act = Activity.findOne({ _id: activityId })
    if (!act) throw new Meteor.Error(404, 'Activity Id does not exist')

    if (!(isSameUserId(act.byUserId, this.userId) || isUserSuperAdmin(Meteor.user())))
      throw new Meteor.Error(401, 'Access not permitted')

    const nRemoved = Activity.remove({ _id: activityId })

    if (Meteor.isServer) console.log(`  [Activity.delete]  #${activityId}  by: ${act.byUserName}`)

    return nRemoved
  },

  // marks unread activities as read
  'Activity.readLog'() {
    const currUser = Meteor.user()
    if (currUser) {
      const options = { limit: 20, sort: { timestamp: -1 } }
      const query = { $and: [{ unread: true }, getFeedSelector(currUser._id, currUser.profile.name)] }
      const update = { $set: { unread: false } }
      Activity.update(query, update, options)
    }
  },

  'Activity.getUnreadLog'(limitCount = 20) {
    const currUser = Meteor.user()
    if (currUser) {
      const options = { limit: limitCount, sort: { timestamp: -1 } }
      const unread = []
      const activities = Activity.find(getFeedSelector(currUser._id, currUser.profile.name), options).fetch()
      _.map(activities, activity => {
        if (activity.unread) unread.push(activity)
      })
      return unread
    }
  },

  'Activity.getNotifications'(limitCount = 30) {
    const currUser = Meteor.user()
    if (currUser) {
      let options = { limit: limitCount, sort: { timestamp: -1 } }
      return Activity.find(getFeedSelector(currUser._id, currUser.profile.name), options).fetch()
    }
  },

  'Activity.getActivitiesByProjectName'(projectName, limit = 10) {
    const options = { limit, sort: { timestamp: -1 } }
    const assetsIdArr = []
    const assetsArr = []
    // getting all assets in project
    const assets = Azzets.find({ projectNames: [projectName] }).fetch()
    _.map(assets, asset => {
      assetsIdArr.push(asset._id)
      assetsArr.push({
        _id: asset._id,
        name: asset.name,
        kind: asset.kind,
        dn_ownerName: asset.dn_ownerName,
      })
    })
    // getting latest activities for assets in project
    const activities = Activity.find({ toAssetId: { $in: assetsIdArr } }, options).fetch()
    _.map(activities, activity => {
      const i = assetsIdArr.indexOf(activity.toAssetId)
      if (i > -1) activity.asset = assetsArr[i]
    })

    return activities
  },
})

var priorLog // The prior activity that was logged - for simplistic de-dupe purposes

// Helper function to invoke a logActivity function. If called from client it has a VERY
// limited co-allesce capability for duplicate activities.
// Support otherData fields such as
// {
//   toChatChannelName
//   override_byUser      Only usable by admin users - use .username and ._id to override byUser___
// }
export function logActivity(activityType, description, thumbnail, asset, otherData = {}) {
  const user = Meteor.user()

  if (!user) {
    console.trace('Attempted to logActivity when not logged in')
    return
  }

  const username = user.profile.name
  var logData = {
    activityType, // One of the keys of the ActivityTypes object defined above
    priority: ActivityTypes.getPri(activityType),

    timestamp: new Date(), // We do it here also so it will be in the priorLog data

    description: description || '',
    thumbnail: thumbnail || '', // TODO - use this in future as a cheap versioning technique?

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
  }
  if (otherData.toChatChannelName) logData.toChatChannelName = otherData.toChatChannelName
  if (otherData.toUserId) logData.toUserId = otherData.toUserId
  if (otherData.toUserName) logData.toUserName = otherData.toUserName

  if (_.isPlainObject(otherData.override_byUser)) {
    if (!isUserSuperAdmin(Meteor.user()))
      throw new Meteor.Error(401, 'Only admins/mods can log Activity on behalf of others')
    logData.byUserName = otherData.override_byUser.username
    logData.byUserId = otherData.override_byUser.username
  }

  let fSkipLog = false

  if (
    priorLog &&
    !Meteor.isServer &&
    priorLog.activityType === logData.activityType &&
    logData.timestamp - priorLog.timestamp < _activityIntervalMs &&
    //priorLog.description === logData.description &&  // This can be a bit noisy for edit.
    priorLog.toAssetId === logData.toAssetId
  )
    fSkipLog = true

  if (!priorLog || !fSkipLog) priorLog = logData // Only do on skip or no-prior, otherwise the priorLog.timestamp will keep updating.

  if (!fSkipLog)
    Meteor.call('Activity.log', logData, otherData.override_byUser, (err, res) => {
      if (err) console.log('Could not log Activity: ', err.reason)
    })
}

export function deleteActivityRecord(activityId) {
  Meteor.call('Activity.delete', activityId)
}

export const feedActivityTypesByOthers = [
  'asset.userLoves',
  'project.leaveMember',
  'mgb.announce',
  'task.approve',
  'task.disapprove',
]

export const feedActivityTypesByMe = ['project.addMember', 'project.removeMember']

export const feedActivityTypesByName = ['user.message', 'user.messageAt']

export const getFeedSelector = (userId, userName) => {
  // guntis - actually we can simplify this query if each activity would have toUserId fields
  // the problem with current design is that toOwnerId don't always mean that this was user action. For example adding/removing from project doesn't save user to toOwnerId
  const byOthersArr = []
  feedActivityTypesByOthers.forEach(type => byOthersArr.push({ activityType: type }))
  const byOthersQuery = { $and: [{ toOwnerId: userId }, { $or: byOthersArr }] }
  const byMeArr = []
  feedActivityTypesByMe.forEach(type => byMeArr.push({ activityType: type }))
  const byMeQuery = { $and: [{ toUserId: userId }, { $or: byMeArr }] }

  // Guntis - commenting out this part of query as it duplicates with chat notifications.
  // But keeping it here if we decide to get it back
  // const byNameArr = []
  // feedActivityTypesByName.forEach(type => byNameArr.push({ activityType: type }))
  // const byNameQuery = { $and: [{ toUserName: userName }, { $or: byNameArr }] }
  // return { $or: [byOthersQuery, byMeQuery, byNameQuery] }
  return { $or: [byOthersQuery, byMeQuery] }
}
