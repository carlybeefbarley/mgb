import { setUpCloudFront } from './cloudfront/CreateCloudfront'

import { Users } from '../imports/schemas'

import { getCurrentReleaseVersionString } from '/imports/mgbReleaseInfo'

// Import all server-side schema stubs in order to register their Meteor.call() methods
import '/imports/schemas/users'
import '/imports/schemas/users-server'
import '/imports/schemas/chats'
import '/imports/schemas/chats-server'

import '/imports/schemas/assets'
import '/imports/schemas/assets-server-fork'
import '/imports/schemas/assets-server-purge'

import '/imports/schemas/sysvars'
import '/imports/schemas/classrooms'
import '/imports/schemas/projects'
import '/imports/schemas/projects-server'
import '/imports/schemas/activity'
import '/imports/schemas/activitySnapshots'

import '/imports/schemas/settings'
import { createInitialSettings } from '/imports/schemas/settings-server'

import '/imports/schemas/skills'
import { createInitialSkills } from '/imports/schemas/skills-server'

import { createInitialUserAnalytics, uaNoteUserIp, uaNoteUsername } from '/server/imports/user-analytics'

import '/imports/schemas/badges'
import '/imports/schemas/badges-server'

import '/imports/schemas/flags'

// Import rules and publications
import '/imports/schemas/denyRules'
import '/server/imports/publications'

import './EmailTemplates/main'
import './CreateUser'
import '/server/imports/guests'
import '/server/imports/restApi'
import '/server/imports/jobs'

import '/server/imports/rateLimiter'

// Create fixtures on first time app is launched (useful for dev/test)
import { createUsers } from './fixtures'

// sets up cloudfront CDN
setUpCloudFront()

if (!Users.find().fetch().length) createUsers()

function userHasLoggedIn(loginInfo) {
  const u = loginInfo.user
  // loginInfo params.. see http://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
  console.log(
    `Login: '${u.profile.name}' (${loginInfo.type})   uid:${u._id}   IP: ${loginInfo.connection
      .clientAddress}`,
  )
  createInitialSkills(u._id)
  createInitialSettings(u._id)
  createInitialUserAnalytics(u._id)

  uaNoteUserIp(u._id, loginInfo.connection.clientAddress)
  uaNoteUsername(u._id, u.username)
}

// This gets registered with http://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
function userLoginAttempt(attemptInfo) {
  const { user } = attemptInfo
  if (user) {
    if (user.isDeactivated)
      throw new Meteor.Error(
        401,
        `User Account '${user.username}' is deactivated. Contact an Admin to have your account reactivated`,
      )
    // Note that suspended users (suIsBanned) are still allowed to log in but their
    // rights are very limited
  }
  return true
}

Meteor.startup(function() {
  if (Meteor.isProduction) Meteor.call('Slack.MGB.productionStartup')

  Accounts.onLogin(userHasLoggedIn)
  Accounts.validateLoginAttempt(userLoginAttempt)

  //sets up keys for social logins
  ServiceConfiguration.configurations.upsert(
    { service: 'google' },
    {
      $set: {
        clientId: Meteor.settings.googleClientID,
        loginStyle: 'popup',
        secret: Meteor.settings.googleSecret,
      },
    },
  )

  ServiceConfiguration.configurations.upsert(
    { service: 'facebook' },
    {
      $set: {
        appId: Meteor.settings.facebookClientID,
        loginStyle: 'popup',
        secret: Meteor.settings.facebookSecret,
      },
    },
  )

  ServiceConfiguration.configurations.upsert(
    { service: 'twitter' },
    {
      $set: {
        consumerKey: Meteor.settings.twitterClientID,
        loginStyle: 'popup',
        secret: Meteor.settings.twitterSecret,
      },
    },
  )
})

// smoke test that these are present
Npm.require
Assets

console.log(`
  MGBv2 server running ${Meteor.release}
  Meteor.isProduction: ${Meteor.isProduction}
  Meteor.isDevelopment: ${Meteor.isDevelopment}
  MgbRelease: ${getCurrentReleaseVersionString()}

  Meteor.absoluteUrl: ${Meteor.absoluteUrl('')}
  Entry point: main_server.js
  `)

// In order to create move more of the version history JSON out of the compiled codebase..
// var fs = require('fs')
// var mgbReleaseInfo = require('/imports/mgbReleaseInfo').default
// fs.writeFile('../../../../../tmpRelHistory.json', JSON.stringify(mgbReleaseInfo, null, 2))
