import {Users, Azzets} from '../imports/schemas';
import dataUriToBuffer from 'data-uri-to-buffer';

// Import server-side stubs for Meteor.call()
import '../imports/schemas/users.js';
import '../imports/schemas/assets.js';
import '../imports/schemas/activity.js';

import '../imports/publications/publications.js';

import './EmailTemplates.js';
import './CreateUser.js';

// Create fixtures on first time app is launched
import {createUsers} from './fixtures.js';


if (!Users.find().fetch().length) {
  createUsers();
}

Meteor.startup(function () {
  
  // if (Houston)
  // {
  //   console.log("RUNNING WITH meteor add houston:admin PACKAGE. BE AWARE!")
  //   Houston.add_collection(Meteor.users);
  //   Houston.add_collection(Houston._admins);
  // }
  
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
require('fs').readFile.call;


// REST API
// TODO - move to separate file/folder and then IMPORT
var RestApi = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

RestApi.addRoute('asset/:id', {authRequired: false}, {
    get: function () {
        var asset = Azzets.findOne(this.urlParams.id);
        return asset ? asset : {};
    }
  });

RestApi.addRoute('asset/png/:id', {authRequired: false}, {
    get: function () {
        var asset = Azzets.findOne(this.urlParams.id);
        if (asset)
        {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'image/png'
                },
                body: dataUriToBuffer(asset.content2.frameData[0][0])
            };
        }
        else {
            return {
                statusCode: 404                
            };
        }
    }
  });

RestApi.addRoute('asset/text/:id', {authRequired: false}, {
    get: function () {
        var asset = Azzets.findOne(this.urlParams.id);
        if (asset)
        {
          return JSON.parse(asset.content2.src);    // MAKE SURE THIS MATCHES WHAT WE ACTUALLY STORE (ie. object vs string)            
        }
        else {
            return {
                statusCode: 404                
            };
        }
    }
  });


console.log('\n\nRunning on server only (main_server.js)');
