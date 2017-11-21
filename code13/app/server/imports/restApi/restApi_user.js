import { HTTP } from 'meteor/http'
import { RestApi } from './restApi'
import { genAPIreturn } from '/server/imports/helpers/generators'
import { Users } from '/imports/schemas'

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

RestApi.addRoute(
  'validate-recaptcha/:recaptchaResponse',
  { authRequired: false },
  {
    get() {
      'use strict'

      const result = HTTP.call('POST', 'https://www.google.com/recaptcha/api/siteverify', {
        params: {
          secret: '6LdDrTkUAAAAAOMbWNV_Bxwohue0mwO2j_Yvq6dN',
          response: this.urlParams.recaptchaResponse,
        },
      })

      return result.data.success
    },
  },
)
