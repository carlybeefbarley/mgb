import _ from 'lodash'
import { Accounts } from 'meteor/accounts-base'
import validate from '/imports/schemas/validate'
import md5 from 'blueimp-md5'

// This is all server-only code

Meteor.methods({
  'AccountsHelp.userNameTaken'(username) {
    return !!Accounts.findUserByUsername(username)
  },
})

Meteor.methods({
  'AccountsHelp.emailTaken'(email) {
    return !!Accounts.findUserByEmail(email)
  },
})

Meteor.methods({
  'AccountsCreate.teacher'(data) {
    let userId = Accounts.createUser(data)
    console.log('Teacher User Id:', userId)
  },
})

const getGravatarUrl = email => '//www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?s=155&d=mm'

Accounts.validateNewUser(function(user) {
  const { emails, username, profile } = user
  if (!emails || !_.isArray(emails) || emails.length === 0)
    throw new Meteor.Error(403, 'Server response: new user emails array is invalid')

  console.log(`  [validateNewUser] name=${username} email=${username} profile=${JSON.stringify(profile)}`)

  if (!username || username.length < 3)
    throw new Meteor.Error(403, 'Username must have at least 3 characters')

  if (profile.name !== username)
    throw new Meteor.Error(403, 'Internal error: Mismatched username and profile.name')

  _.each(emails, emailEntry => {
    const r = validate.emailWithReason(emailEntry.address)
    if (r) throw new Meteor.Error(403, `Server response: ${r}`)
  })

  console.log(`  [validateNewUser]  OK  name=${username}   email=${emails[0].address} `)

  try {
    if (Meteor.isProduction && !profile.isGuest) {
      Meteor.call('Slack.User.create', username, emails[0].address)
    }
  } catch (err) {
    console.log('  [validateNewUser]  failed to call Slack: ', err.toString())
  }

  return true
})

Accounts.onCreateUser(function(options, user) {
  console.log(
    `  [CreateUser] name=${user.username} email=${user.username} profile=${JSON.stringify(user.profile)}`,
  )

  if (user.services.twitter) {
    if (options.profile) {
      options.profile.avatar = user.services.twitter.profile_image_url
      user.profile = options.profile
      user.profile.images = user.profile.images || []
      user.profile.images.push(options.profile.avatar)
    }
  }

  if (user.services.facebook) {
    if (options.profile) {
      options.profile.avatar =
        'http://graph.facebook.com/' + user.services.facebook.id + '/picture/?width=50&height=50'
      user.profile = options.profile
      user.profile.images = user.profile.images || []
      user.profile.images.push(options.profile.avatar)
    }

    if (user.services.facebook.email) {
      user.emails = user.emails || []
      user.emails.push({ address: user.services.facebook.email, verified: true })
    }
  }

  if (user.services.google) {
    if (options.profile) {
      options.profile.avatar = user.services.google.picture
      user.profile = options.profile
      user.profile.images = user.profile.images || []
      user.profile.images.push(options.profile.avatar)
    }

    if (user.services.google.email) {
      user.emails = user.emails || []
      user.emails.push({ address: user.services.google.email, verified: true })
    }
  }

  // handle when enrolling user without a password (!user.services)
  // handle user sign up with the password service
  if (_.isEmpty(user.services) || user.services.password) {
    if (options.profile) {
      const gravatarUrl = getGravatarUrl(user.emails[0].address)
      // Extra checks for validity like is done in Meteor.call("User.updateProfile")" ?
      user.profile = options.profile
      // actual image picked by user to display
      user.profile.avatar = gravatarUrl
      // collection of images in users account
      user.profile.images = [gravatarUrl]
    }
  }

  return user
})
