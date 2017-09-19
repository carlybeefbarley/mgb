// These are some check helpers for use in the Meteor.method RPCs

// "checks are a variant of the validators in validate.js, except they
// throw Meteor Errors (much like the Meteor/check package) instead of returning
// error codes

/* example import:
import { checkIsLoggedIn, checkMgb } from './checkMgb.js'
*/

import _ from 'lodash'
import validate from './validate'
import { isUserSuperAdmin } from './roles'

/**
 * Check if user is Logged in. Throw Meteor.Error() if not logged in
 * @returns {void} or throws Meteor.Error()
 * @export
 */
export function checkIsLoggedIn() {
  if (!Meteor.user()) throw new Meteor.Error(401, 'Login required')
}

export function checkIsLoggedInAndNotSuspended() {
  const u = Meteor.user()
  if (!u) throw new Meteor.Error(401, 'Login required')
  if (u.suIsBanned) throw new Meteor.Error(401, 'Operation not permitted for Suspended Account')
}

export const checkMgb = {
  /**
   * Check userId is valid (at least a string of chars or more. This is NOT a username)
   * Throw Meteor.Error() if not valid
   * @returns {void} or throws Meteor.Error()
   */
  userId(userId) {
    if (!_.isString(userId) || userId.length < 8) throw new Meteor.Error(403, 'Invalid UserId')
  },

  /**
   * Check projectName is valid. Throw Meteor.Error() if not valid
   * @returns {void} or throws Meteor.Error()
   */
  projectName(name) {
    if (!validate.projectName(name)) throw new Meteor.Error(403, 'Invalid Project Name')
  },

  projectDescription(description) {
    if (!validate.projectDescription(description)) throw new Meteor.Error(403, 'Invalid Project Description')
  },

  assetName(name) {
    if (!validate.assetName(name)) throw new Meteor.Error(403, 'Invalid Asset Name')
  },

  assetDescription(description) {
    if (!validate.assetDescription(description)) throw new Meteor.Error(403, 'Invalid Asset Description')
  },

  checkUserIsSuperAdmin() {
    if (!isUserSuperAdmin(Meteor.user())) throw new Meteor.Error(401, 'Requires SuperAdmin powers')
  },
}
