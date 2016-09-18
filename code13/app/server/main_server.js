import { Users, Azzets } from '../imports/schemas'

// Import all server-side schema stubs in order to register their Meteor.call() methods
import '/imports/schemas/users.js'
import '/imports/schemas/chats.js'
import '/imports/schemas/assets.js'
import '/imports/schemas/projects.js'
import '/imports/schemas/activity.js'
import '/imports/schemas/activitySnapshots.js'
import '/imports/schemas/skills.js'
import '/imports/schemas/settings.js'
import { createInitialSettings } from '/imports/schemas/settings-server.js'

// Import rules and publications
import '/imports/schemas/denyRules.js'
import '/server/imports/publications/publications'

import './EmailTemplates.js'
import './CreateUser.js'

import '/server/imports/restApi/restApi.js'

// Create fixtures on first time app is launched (useful for dev/test)
import { createUsers } from './fixtures.js'
if (!Users.find().fetch().length) 
  createUsers()


function userHasLoggedIn(loginInfo)
{
  const u = loginInfo.user
  // loginInfo params.. see http://docs.meteor.com/api/accounts-multi.html#AccountsServer-validateLoginAttempt
  console.log(`Login: '${u.profile.name}' (${loginInfo.type})   uid:${u._id}   IP: ${loginInfo.connection.clientAddress}`)
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

})

// smoke test that these are present
Npm.require;
Assets;

console.log(`
  MGBv2 server running ${Meteor.release}
  Meteor.isProduction: ${Meteor.isProduction}
  Meteor.isDevelopment: ${Meteor.isDevelopment}
  Entry point: main_server.js
  `
)
