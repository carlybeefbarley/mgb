import {Users, Azzets} from '../imports/schemas';
import dataUriToBuffer from 'data-uri-to-buffer';

// Import server-side stubs for Meteor.call()
import '../imports/schemas/users.js';
import '../imports/schemas/chats.js';
import '../imports/schemas/assets.js';
import '../imports/schemas/projects.js';
import '../imports/schemas/activity.js';
import '../imports/schemas/activitySnapshots.js';

import '../imports/schemas/denyRules.js';
import '../imports/publications/publications.js';

import './EmailTemplates.js';
import './CreateUser.js';


// Create fixtures on first time app is launched
import {createUsers} from './fixtures.js';


if (!Users.find().fetch().length) {
  createUsers();
}

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
require('fs').readFile.call;


// REST API.  These should match what is in AssetUrlGenerator.js
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
// TODO: Handle case where the frameData has not yet been created
    if (asset)
    {
        // is there more elegent way? e.g. asset/png/:id/:frame?
      const frame = this.queryParams.frame || 0;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png'
        },
        body: dataUriToBuffer(asset.content2.frameData[frame][0])
      }
    }
    else {
      return {
        statusCode: 404                
      }
    }
  }
});


RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    // Return an empty image if there's no thumbnail yet. This from http://png-pixel.com/
    var emptyPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
//      'Cache-Control': 'max-age=5, private'  // Max-age is in seconds?   seems to be over-active :()
      },
      body: dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel )
    }   
  }
})
  

RestApi.addRoute('asset/json/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id);
    if (asset)
    {
      return JSON.parse(asset.content2.src);    // MAKE SURE THIS MATCHES WHAT WE ACTUALLY STORE (ie. object vs string)            
    }
    else {
      return {
        statusCode: 404                
      }
    }
  }
});



// This lets the client easily get user avatar.. e.g http://localhost:3000/api/user/raMDZ9atjHABXu5KG/avatar
RestApi.addRoute('user/:id/avatar', {authRequired: false}, {
  get: function () {
    var user = Meteor.users.findOne(this.urlParams.id);
    if (user)
    {
      return {
        statusCode: 302,    // FOUND (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        headers: {
          'Location': user.profile.avatar
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
        },
        body: {}
      }
    }
    else {
      return {
        statusCode: 404                
      }
    }
  }
});


console.log('\n\nRunning on server only (main_server.js)');
