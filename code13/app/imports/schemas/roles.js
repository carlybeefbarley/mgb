// Roles helpers. 

// Currently very simplistic but interface supports some future needs

export const roleSuperAdmin = "super-admin"

export function doesUserHaveRole(user, roleStr) {
  // This is kind of simple while we only have one role group and one role type :)
  console.log(arguments)
  return  user && 
          user.permissions && 
          user.permissions.length > 0 &&
          user.permissions[0].roles[0] === roleStr
}

export function isUserSuperAdmin(user) {
  return doesUserHaveRole(user, roleSuperAdmin)
}
