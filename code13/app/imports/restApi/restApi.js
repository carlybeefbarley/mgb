// REST api for MGBv2

// This file should be imported by /server/main_server.js

import { Users, Azzets } from '../schemas';
import dataUriToBuffer from 'data-uri-to-buffer';


// REST API.  These should match what is in AssetUrlGenerator.js
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

RestApi.addRoute('asset/map/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id);
    if (asset){
      // map editor stores some info in the meta - e.g. camera position / active tool etc
      delete asset.content2.meta;
      // TODO: content2 will be moved
      return asset.content2;
    }
    else {
      return {
        statusCode: 404
      }
    }
  }
});

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
