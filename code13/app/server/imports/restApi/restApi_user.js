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
  'user/enroll',
  { authRequired: false },
  {
    post() {
      'use strict'
      console.log('POST user/enroll', JSON.stringify(this.bodyParams, null, 2))

      const { username, email } = this.bodyParams

      let enrolledUserId
      try {
        enrolledUserId = Accounts.createUser(this.bodyParams)
        try {
          Accounts.sendEnrollmentEmail(enrolledUserId, email)
          console.log(`Successfully enrolled "${username}" and emailed "${email}".`)
        } catch (err) {
          console.log(err)
          const message = `Failed to send enrollment email to "${username}" at "${email}".`
          this.response.writeHead(500)
          this.response.end(message)
          this.done()
        }
      } catch (err) {
        console.log(err)
        const message = `Failed to create user when enrolling "${username}" "${email}".`
        this.response.writeHead(500)
        this.response.end(message)
        this.done()
      }

      const userMakingRequest = Users.findOne(this.userId)

      // just for the record, save the username/email to their profile
      try {
        Users.update(enrolledUserId, {
          $set: {
            'profile.HoC.email': userMakingRequest.email,
            'profile.HoC.username': userMakingRequest.profile.name,
          },
        })
      } catch (err) {
        console.log('Could not update HoC.profile after enrollment:', err)
      }

      return Users.findOne(enrolledUserId)
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
