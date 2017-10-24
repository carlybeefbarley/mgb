// Roles helpers.
import _ from 'lodash'
import { isSameUserId } from '/imports/schemas/users'
// Currently very simplistic but interface supports some future needs

export const roleSuperAdmin = 'super-admin'

export const fAllowSuperAdminToEditAnything = false // TODO: PUT IN SERVER POLICY?

export function doesUserHaveRole(user, roleStr) {
  if (!user || _.isEmpty(user.permissions)) return false

  return _.some(user.permissions, permission => _.some(permission.roles, role => role === roleStr))
}
/**
 * This checks if the user can edit asset
 * @export
 * @param { Asset } asset - partial asset only required - {_id, ownerId, projectNames}
 * @param { [Projects] } projects - user projects - partial project only required - {name, ownerId}
 * @param { Meteor.User } user
 */
export function canUserEditAssetIfUnlocked(asset, projects, user) {
  if (!user || !asset) return false
  if (asset.suFlagId || asset.suIsBanned === true) return false
  if (isSameUserId(asset.ownerId, user._id) || (fAllowSuperAdminToEditAnything && user.isSuperAdmin))
    return true // Owner can always edit

  // Is Asset a member of any of user's projects?
  const apn = asset.projectNames // Shorthand
  return _.findIndex(projects, p => isSameUserId(p.ownerId, asset.ownerId) && _.includes(apn, p.name)) > -1
}

export function isUserSuperAdmin(user) {
  return doesUserHaveRole(user, roleSuperAdmin)
}

export function isUserModerator(user) {
  // For now, enable a specific API so we can start using this
  // access check.
  // TODO@dgolds implement a way to assign moderators
  return isUserSuperAdmin(user, roleSuperAdmin)
}
