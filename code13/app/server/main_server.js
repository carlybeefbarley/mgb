import {setUpCloudFront} from './cloudfront/CreateCloudfront.js'

import { Users } from '../imports/schemas'

import { getCurrentReleaseVersionString }  from '/imports/mgbReleaseInfo'

// Import all server-side schema stubs in order to register their Meteor.call() methods
import '/imports/schemas/users'
import '/imports/schemas/chats'
import '/imports/schemas/assets'
import '/imports/schemas/sysvars'
import '/imports/schemas/projects'
import '/imports/schemas/activity'
import '/imports/schemas/activitySnapshots'

import '/imports/schemas/settings'
import { createInitialSettings } from '/imports/schemas/settings-server.js'

import '/imports/schemas/skills'
import { createInitialSkills } from '/imports/schemas/skills-server.js'

import '/imports/schemas/badges'
import '/imports/schemas/badges-server'

// Import rules and publications
import '/imports/schemas/denyRules'
import '/server/imports/publications/publications'

import './EmailTemplates'
import './CreateUser'
import '/server/imports/restApi'
import '/server/imports/jobs'

import '/server/imports/rateLimiter'

// Create fixtures on first time app is launched (useful for dev/test)
import { createUsers } from './fixtures.js'

// remove true after debugging is done
if (true || Meteor.isProduction) {
  setUpCloudFront()
}

if (!Users.find().fetch().length) 
  createUsers()

function userHasLoggedIn(loginInfo)
{
  const u = loginInfo.user
  // loginInfo params.. see http://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
  console.log(`Login: '${u.profile.name}' (${loginInfo.type})   uid:${u._id}   IP: ${loginInfo.connection.clientAddress}`)
  createInitialSkills(u._id)
  createInitialSettings(u._id)
}

Meteor.startup(function () {

  if (Meteor.isProduction)
    Meteor.call('Slack.MGB.productionStartup')

  Accounts.onLogin(userHasLoggedIn)
  
  //sets up keys for social logins
  ServiceConfiguration.configurations.upsert(
    { service: "google" },
    {
      $set: {
        clientId: Meteor.settings.googleClientID,
        loginStyle: "popup",
        secret: Meteor.settings.googleSecret
      }
    }
  )

  ServiceConfiguration.configurations.upsert(
    { service: "facebook" },
    {
      $set: {
        appId: Meteor.settings.facebookClientID,
        loginStyle: "popup",
        secret: Meteor.settings.facebookSecret
      }
    }
  )

  ServiceConfiguration.configurations.upsert(
    { service: "twitter" },
    {
      $set: {
        consumerKey: Meteor.settings.twitterClientID,
        loginStyle: "popup",
        secret: Meteor.settings.twitterSecret
      }
    }
  )

  // process.env.MAIL_URL = 'smtp://shmikucis%40gmail.com:meteormailpsw1@smtp.gmail.com:465';
  process.env.MAIL_URL = 'smtp://guntis%40mycodebuilder.com:meteormailpsw1@smtp.gmail.com:465';
  // process.env.MAIL_URL = 'smtp://info%40mygamebuilder.com:AuEvIDBa2bzbDbibpeCmuSS1/3zCipRXMlIm3cSjYpr8@email-smtp.us-east-1.amazonaws.com:465';

})

// smoke test that these are present
Npm.require;
Assets;

console.log(`
  MGBv2 server running ${Meteor.release}
  Meteor.isProduction: ${Meteor.isProduction}
  Meteor.isDevelopment: ${Meteor.isDevelopment}
  MgbRelease: ${getCurrentReleaseVersionString()}
  
  Meteor.absoluteUrl: ${Meteor.absoluteUrl('')}
  Entry point: main_server.js
  `
)
