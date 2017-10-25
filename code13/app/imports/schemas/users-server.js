import _ from 'lodash'
import { Activity, Azzets, Chats, Flags, Projects, Settings, Users } from '/imports/schemas'
import { check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import { Mailgun } from '/imports/helpers/mailgun/mailgun'
import { Accounts } from 'meteor/accounts-base'
import { markUserAnalyticsAsEradicated, eradicateReasons } from '/server/imports/user-analytics'
import { makeChannelName } from '/imports/schemas/chats'

// This file is NOT included on the client

/**
 * This will throw an Error if userId is not a string, if userId is is not a valid userId,
 * or if the userId is banned. It's only possible return value is a valid User record
 * @param {String} userId of User to validate operation console
 */
const _serverMethodHelper = userId => {
  check(userId, String)
  checkIsLoggedInAndNotSuspended()
  const sel = { _id: userId }
  const u = Users.findOne(sel)
  if (!u) throw new Meteor.Error(404, `User #${userId} not found`)
  return u
}

// TODO(@dgolds): Enable this once I know it how to fully secure and audit it
// "User.setPasswordIfDoesNotExist": function(userId, newPassword) {
//   Accounts.setPassword(userId, newPassword)
// },

Meteor.methods({
  'User.sendSignUpEmail'(email) {
    console.log('############## User.sendSignUpEmail...', email)
    console.log('userId', Meteor.userId())

    // var mailgun = new Mailgun()

    // // TODO how to get current domain to send it as a verify link?
    // // TODO actually verify email
    // var mailgunData = {
    //   from: 'MyGameBuilder Team <info@mygamebuilder.com>',
    //   to: email,
    //   subject: 'Verify your email',
    //   'o:tag': 'Signup email',
    //   html: '<p>You have registered to MyGameBuilder. Please verify your email.</p><p><a href="https://v2.mygamebuilder.com">Click to Verify Email</a></p><br/><br/><br/><br/>'
    // }

    // mailgun.request('POST', '/messages', mailgunData, function (error, body) {
    //   if (error)
    //     console.error(" User.sendSignUpEmail: Error: ", error)
    //   else
    //     console.log(" User.sendSignUpEmail: bodyResponse: ", body);
    // })

    Accounts.sendVerificationEmail(Meteor.userId())
  },

  /**
   * RPC User.update.mgb1namesVerified
   * Currently only superAdmin can do this. Self-validation system "coming soon"
   */
  'User.update.mgb1namesVerified'(userId, newMgb1namesVerified) {
    const u = _serverMethodHelper(userId)
    check(newMgb1namesVerified, String)
    checkMgb.checkUserIsSuperAdmin()
    const count = Users.update(
      { _id: userId },
      { $set: { 'profile.mgb1namesVerified': newMgb1namesVerified } },
    )
    console.log(
      '[User.update.mgb1namesVerified]',
      count,
      userId,
      `Changed from '${u.profile.mgb1namesVerified}' to '${newMgb1namesVerified}'`,
    )
    return count
  },

  /**
   * RPC User.toggleBan
   * Currently only superAdmin can ban/unban an account. The idea is that the
   * discussion with the banned user would happen via email for now.
   */
  'User.toggleBan'(userId) {
    const u = _serverMethodHelper(userId)
    checkMgb.checkUserIsSuperAdmin()
    const newIsBanned = !u.suIsBanned
    const count = Users.update({ _id: userId }, { $set: { suIsBanned: newIsBanned } })
    console.log('[User.toggleBan]', count, userId, `NewValue=${newIsBanned}`)
    return count
  },

  /**
   * RPC User.deactivateAccount
   * Only owning-User or superadmin can mark an account as de-activated
   */
  'User.deactivateAccount'(userId) {
    const u = _serverMethodHelper(userId)
    if (this.userId !== userId) checkMgb.checkUserIsSuperAdmin()
    if (u.isDeactivated === true) throw new Meteor.Error(500, `User #${userId} is already deactivated`)
    const count = Users.update({ _id: userId }, { $set: { isDeactivated: true } })
    console.log('[User.deactivateAccount]', count, userId)
    return count
  },

  /**
   * RPC User.reactivateAccount
   * Currently only superAdmin can re-activate an account. We don't yet have a full
   * Deactivate/Reactivate user account flow, but this is done for now from fpSuperAdmin
   */
  'User.reactivateAccount'(userId) {
    const u = _serverMethodHelper(userId)
    checkMgb.checkUserIsSuperAdmin()
    if (u.isDeactivated !== true) throw new Meteor.Error(500, `User #${userId} is not deActivated`)
    const count = Users.update({ _id: userId }, { $set: { isDeactivated: false } })
    console.log('[User.reactivateAccount]', count, userId)
    return count
  },

  /**
   * RPC User.eradicateAccountBrutally
   * Only owning-User or superadmin can eradicate an account
   *
   * THIS IS BRUTAL AND SHOULD JUST BE USED TO GET RID OF
   * TEST ACCOUNTS AND REPEAT-SPAMMERS
   */
  'User.eradicateAccountBrutally'(userNameToNuke, eradicateReason = 'spammer') {
    if (!_.has(eradicateReasons, eradicateReason))
      throw new Meteor.Error(401, `Unknown eradication reason: ${eradicateReason}`)

    checkMgb.checkUserIsSuperAdmin()
    const userRecord = Users.findOne({ username: userNameToNuke })
    if (!userRecord) throw new Meteor.Error(404, `Username to eradicate not found: '${userNameToNuke}'`)

    const userIdToNuke = userRecord._id

    // Be careful. We are going to nuke {userIdToNuke}, NOT {this.userId}
    const u = _serverMethodHelper(userIdToNuke)
    const now = new Date()
    // 1. Look for any assets they own, including isDeleted=true
    let assetsDeletedCount = 0
    const assetsToNuke = Azzets.find(
      { ownerId: userIdToNuke },
      {
        fields: {
          // Fields needed for basic processing of this flow
          _id: 1,
          isDeleted: 1,
          projectNames: 1,
          // Fields Needed for nice logging using logActivity()
          name: 1,
          kind: 1,
          ownerId: 1,
          dn_ownerName: 1,
        },
      },
    ).fetch()
    _.forEach(assetsToNuke, a => {
      const sel = { _id: a._id }
      if (!a.isDeleted) {
        assetsDeletedCount += Azzets.update(sel, {
          $set: { updatedAt: now, projectNames: [], isDeleted: true },
        })
      }
    })

    console.log(`User.eradicateAccountBrutally - Deleted ${assetsToNuke.length} assets`)

    // 2. Look for projects they are members of; for now just bail if they are.

    const selProjMemberOf = { memberIds: { $in: [userIdToNuke] } }
    const projectsMemberOf = Projects.find(selProjMemberOf, {
      fields: { _id: 1, name: 1, memberIds: 1, ownerId: 1 },
    }).fetch()
    if (projectsMemberOf && projectsMemberOf.length > 0)
      throw new Meteor.Error(
        500,
        "Can't yet handle removeMember() from other projects.. Uncommon case for spammer",
      )

    // 3. Look for Projects they own; Remove members; delete the projects

    const selProj = { ownerId: userIdToNuke }
    const projectsToNuke = Projects.find(selProj, {
      fields: { _id: 1, name: 1, memberIds: 1, ownerId: 1 },
    }).fetch()

    console.log(`User.eradicateAccount(${u.username}): Project Info`, projectsToNuke)
    if (projectsToNuke.length > 10)
      throw new Error(500, 'User.eradicateAccountBrutally - runaway Control triggered. #DevOpsInvestigate')

    console.log(`User.eradicateAccountBrutally - Deleting ${projectsToNuke.length} projects`)

    projectsToNuke.forEach(p => {
      if (p.ownerId !== userIdToNuke)
        throw new Error(
          500,
          'User.eradicateAccountBrutally - Paranoia Check (projectOwner) triggered. #DevOpsInvestigate',
        )
      if (p.memberIds && p.memberIds.length > 0) Meteor.call('Projects.update', p._id, { memberIds: [] })

      Meteor.call('Projects.deleteProjectId', p._id, true)
    })
    console.log(`User.eradicateAccountBrutally - Deleted ${projectsToNuke.length} projects`)

    // 4. Delete all flagIds involving them
    const flagsSel = { ownerUserId: userIdToNuke }
    const flagsDeletedCount = Flags.remove(flagsSel)
    console.log(`User.eradicateAccountBrutally - Deleted ${flagsDeletedCount} flags`)

    // 5. Delete all chat messages they have written
    const chatsDeletedCount = Chats.remove({ byUserId: userIdToNuke })
    console.log(`User.eradicateAccountBrutally - Deleted ${chatsDeletedCount} Chat Messages`)

    // 6. Delete all contents of their wall

    const wallChatChannelName = makeChannelName({ scopeGroupName: 'User', scopeId: u.username })
    console.log('Deleting Wall chat channel:', wallChatChannelName)
    const wallChatsDeletedCount = Chats.remove({ toChannelName: wallChatChannelName })

    // 7. Delete all their activity records

    const activityDeletedCount = Activity.remove({ byUserId: userIdToNuke })
    console.log(`User.eradicateAccountBrutally - Deleted ${activityDeletedCount} Activity Records`)

    // 8. Delete the User record

    const userDeletedCount = Users.remove({ _id: userIdToNuke })
    console.log(`User.eradicateAccountBrutally - Deleted ${userDeletedCount} User Records`)

    // 9. Delete the Settings record
    const settingsDeletedCount = Settings.remove({ _id: userIdToNuke })
    console.log(`User.eradicateAccountBrutally - Deleted ${settingsDeletedCount} Settings Records`)

    // 10. Delete the UserAnalytics record? Or just mark as SPAMMER
    markUserAnalyticsAsEradicated(userIdToNuke, eradicateReason)

    // 11. Describe what we did in the activity log and in Slack

    const results = {
      eradicateReason,
      assetsDeletedCount,
      flagsDeletedCount,
      chatsDeletedCount,
      wallChatsDeletedCount,
      activityDeletedCount,
      userDeletedCount,
      settingsDeletedCount,
      email: u.emails ? u.emails[0] : '(not provided)',
    }
    console.log('[User.eradicateAccount]', results)
    Meteor.call('Slack.User.eradicated', u.username, results)

    return results
  },
})
