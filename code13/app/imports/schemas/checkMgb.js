// These are some check helpers for use in the Meteor.method RPCs

// "checks are a variant of the validators in validate.js, except they 
// throw Meteor Errors (much like the Meteor/check package) instead of returning
// error codes

/* example import:
import { checkIsLoggedIn, checkMgb } from './checkMgb.js'
*/

import validate from './validate'
import { isUserSuperAdmin } from './roles'

/**
 * Check if user is Logged in. Throw Meteor.Error() if not logged in
 * @returns {void} or throws Meteor.Error()
 * @export
 */
export function checkIsLoggedIn() {
  if (!Meteor.user()) 
    throw new Meteor.Error(401, "Login required")
}

export const checkMgb = {
  /**
   * Check projectName is valid. Throw Meteor.Error() if not valid
   * @returns {void} or throws Meteor.Error()
   */
  projectName: function (name) {
    if (!validate.projectName(name))
      throw new Meteor.Error(403, "Invalid Project Name")
  },

  projectDescription: function (description) {
    if (!validate.projectDescription(description))
      throw new Meteor.Error(403, "Invalid Project Description")
  },
  
  assetName: function (name) {
    if (!validate.assetName(name))
      throw new Meteor.Error(403, "Invalid Asset Name")
  },

  assetDescription: function (description) {
    if (!validate.assetDescription(description))
      throw new Meteor.Error(403, "Invalid Asset Description")
  },

  checkUserIsSuperAdmin: function() {
    if (!isUserSuperAdmin(Meteor.user()))
      throw new Meteor.Error(401, "Requires SuperAdmin powers")
  }
}