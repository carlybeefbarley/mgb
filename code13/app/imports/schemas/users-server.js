import { Users } from '/imports/schemas'
import { check } from 'meteor/check'
import { checkIsLoggedInAndNotSuspended, checkMgb } from './checkMgb'

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

Meteor.methods({
  /**
   * RPC User.toggleBan
   * Currently only superAdmin can ban/unban an account. The idea is that the
   * discussion with the banned user would happen via email for now.
   */
  'User.toggleBan': function(userId) {
    const u = serverMethodHelper(userId)
    const newIsBanned = !u.suIsBanned
    const count = Meteor.users.update( { _id: userId } , { $set: { suIsBanned: newIsBanned } })
    console.log('[User.toggleBan]', count, userId, `NewValue=${newIsBanned}`)
    return count
  },
  
  /**
   * RPC User.deactivateAccount
   * User or superadmin can mark an account as de-activated
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
