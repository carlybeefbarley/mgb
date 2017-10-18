import { RestApi } from './restApi'
import { genAPIreturn } from '/server/imports/helpers/generators'
import { Users } from '/imports/schemas'

const parseCookies = cookieStr => {
  const cookieParts = cookieStr.split(';')
  const cookies = {}
  cookieParts.forEach(c => {
    const parts = c.trim().split('=')
    cookies[parts[0]] = parts[1]
  })
  return cookies
}
// get user by name
RestApi.addRoute(
  'user/name/:name',
  { authRequired: false },
  {
    get() {
      'use strict'

      const user = Users.findOne({ 'profile.name': this.urlParams.name })
      const returnData = {}
      if (user) {
        returnData._id = user._id
        returnData.profile = user.profile
        returnData.username = user.username
        returnData.badges = user.badges
        returnData.badges_count = user.badges_count
        returnData.updatedAt = user.updatedAt
      }
      return genAPIreturn(this, returnData)
    },
  },
)

// get user by name
RestApi.addRoute(
  'user/active',
  { authRequired: false },
  {
    get() {
      const cookies = parseCookies(this.request.headers.cookie)
      return cookies.activeUser ? { username: cookies.activeUser } : {}
    },
  },
)
