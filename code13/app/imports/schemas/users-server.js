import { Users } from '/imports/schemas'
import { check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'
import { Mailgun } from '/imports/helpers/mailgun/mailgun'
import { Accounts } from 'meteor/accounts-base'

// This file is NOT included on the client

/**
 * This will throw an Error if userId is not a string, if userId is is not a valid userId,
 * or if the userId is banned. It's only possible return value is a valid User record
 * @param {String} userId of User to validate operation console
 */
const serverMethodHelper = userId => {
  check(userId, String)
  checkIsLoggedInAndNotSuspended()
  const sel = { _id: userId }
  const u = Meteor.users.findOne(sel)
  if (!u)
    throw new Meteor.Error(404, `User #${userId} not found`)
  return u
}

// TODO(@dgolds): Enable this once I know it how to fully secure and audit it
// "User.setPasswordIfDoesNotExist": function(userId, newPassword) {
//   Accounts.setPassword(userId, newPassword)
// },

Meteor.methods({

  "User.sendSignUpEmail": function (email) {
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
    //   html: '<p>You have registered to MyGameBuilder. Please verify your email.</p><p><a href="https://mygamebuilder.com">Click to Verify Email</a></p><br/><br/><br/><br/>'
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
  'User.update.mgb1namesVerified': function(userId, newMgb1namesVerified) {
    const u = serverMethodHelper(userId)
    check(newMgb1namesVerified, String)
    checkMgb.checkUserIsSuperAdmin()
    const count = Meteor.users.update( { _id: userId } , { $set: { 'profile.mgb1namesVerified': newMgb1namesVerified } })
    console.log('[User.update.mgb1namesVerified]', count, userId, `Changed from '${u.profile.mgb1namesVerified}' to '${newMgb1namesVerified}'`)
    return count
  },

    /**
   * RPC User.toggleBan
   * Currently only superAdmin can ban/unban an account. The idea is that the
   * discussion with the banned user would happen via email for now.
   */
  'User.toggleBan': function(userId) {
    const u = serverMethodHelper(userId)
    checkMgb.checkUserIsSuperAdmin()
    const newIsBanned = !u.suIsBanned
    const count = Meteor.users.update( { _id: userId } , { $set: { suIsBanned: newIsBanned } })
    console.log('[User.toggleBan]', count, userId, `NewValue=${newIsBanned}`)
    return count
  },

  /**
   * RPC User.deactivateAccount
   * Only owning-User or superadmin can mark an account as de-activated
   */
  'User.deactivateAccount': function(userId) {
    const u = serverMethodHelper(userId)
    if (this.userId !== userId)
      checkMgb.checkUserIsSuperAdmin()
    if (u.isDeactivated === true)
      throw new Meteor.Error(500, `User #${userId} is already deactivated`)
    const count = Meteor.users.update( { _id: userId }, { $set: { isDeactivated: true } })
    console.log('[User.deactivateAccount]', count, userId)
    return count
  },

  /**
   * RPC User.reactivateAccount
   * Currently only superAdmin can re-activate an account. We don't yet have a full
   * Deactivate/Reactivate user account flow, but this is done for now from fpSuperAdmin
   */
  'User.reactivateAccount': function(userId) {
    const u = serverMethodHelper(userId)
    checkMgb.checkUserIsSuperAdmin()
    if (u.isDeactivated !== true)
      throw new Meteor.Error(500, `User #${userId} is not deActivated`)
    const count = Meteor.users.update( { _id: userId }, { $set: { isDeactivated: false } })
    console.log('[User.reactivateAccount]', count, userId)
    return count
  }
})
