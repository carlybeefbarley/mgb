import { Users, Azzets } from '../imports/schemas';

// Import all server-side schema stubs in order to resgister their Meteor.call() methods
import '../imports/schemas/users.js';
import '../imports/schemas/chats.js';
import '../imports/schemas/assets.js';
import '../imports/schemas/projects.js';
import '../imports/schemas/activity.js';
import '../imports/schemas/activitySnapshots.js';

// Import rules and publications
import '../imports/schemas/denyRules.js';
import '../imports/publications/publications.js';

import './EmailTemplates.js';
import './CreateUser.js';

import '../imports/restApi/restApi.js';

// Create fixtures on first time app is launched (useful for dev/test)
import { createUsers } from './fixtures.js';
if (!Users.find().fetch().length) 
  createUsers()


Meteor.startup(function () {
  
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
  );
  ServiceConfiguration.configurations.upsert(
    { service: "facebook" },
    {
      $set: {
        appId: Meteor.settings.facebookClientID,
        loginStyle: "popup",
        secret: Meteor.settings.facebookSecret
      }
    }
  );
  ServiceConfiguration.configurations.upsert(
    { service: "twitter" },
    {
      $set: {
        consumerKey: Meteor.settings.twitterClientID,
        loginStyle: "popup",
        secret: Meteor.settings.twitterSecret
      }
    }
  );
});

// smoke test that these are present
Npm.require;
Assets;

console.log('\n\nRunning on server only (Entry point: main_server.js)');
