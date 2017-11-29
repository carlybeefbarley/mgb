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

const getGravatarUrl = email => '//www.gravatar.com/avatar/' + md5(email.trim().toLowerCase()) + '?s=155&d=mm'

Accounts.validateNewUser(function(user) {
  if (!user.emails || !_.isArray(user.emails) || user.emails.length === 0)
    throw new Meteor.Error(403, 'Server response: new user emails array is invalid')

  console.log(`  [validateNewUser]  ..  name=${user.username}   email=${user.emails[0].address}`)

  if (!user.username || user.username.length < 3)
    throw new Meteor.Error(403, 'Username must have at least 3 characters')

  if (user.profile.name !== user.username)
    throw new Meteor.Error(403, 'Internal error: Mismatched username and profile.name')

  _.each(user.emails, emailEntry => {
    const r = validate.emailWithReason(emailEntry.address)
    if (r) throw new Meteor.Error(403, `Server response: ${r}`)
  })

  console.log(`  [validateNewUser]  OK  name=${user.username}   email=${user.emails[0].address} `)

  try {
    if (Meteor.isProduction && !user.profile.isGuest) {
      Meteor.call('Slack.User.create', user.username, user.emails[0].address)
    }
  } catch (err) {
    console.log('  validateNewUser]  failed to call Slack: ', err.toString())
  }

  return true
})

Accounts.onCreateUser(function(options, user) {
  console.log(`  [CreateUser]  ${user.username}   email: ${user.emails[0].address}`)

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

  if (user.services.password) {
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
