// REST api for MGBv2

// This file should be imported by /server/main_server.js

import { Azzets } from '../schemas';
import dataUriToBuffer from 'data-uri-to-buffer';
import AWS from 'aws-sdk';
import pako from 'pako';
import xml2js from 'xml2js';

const aws_s3_region = 'us-east-1'       // US-East-1 is the 'global' site for S3

AWS.config.update({accessKeyId: '104QCDA4V07YPPSVBKG2', secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn'});

// REST API.  These should match what is in AssetUrlGenerator.js
// Note that Restivus's default url prefix is /api
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


// MGBv1 TILE
// eg http://localhost:3000/api/mgb1/tile/.acey53/Club+Penguin+Agents+Under+Attack/100+coins

RestApi.addRoute('mgb1/tile/:account/:project/:name', {authRequired: false}, {
  get: function () {
    let newUrl = `https://s3.amazonaws.com/JGI_test1/${this.urlParams.account}/${this.urlParams.project}/tile/${this.urlParams.name}`
    return {
      statusCode: 301,    // MOVED (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
      headers: {
        'Location': newUrl
        // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
      },
      body: {}
    }
  }
})


// MGBv1 ACTOR
// eg http://localhost:3000/api/mgb1/actor/.acey53/Club%20Penguin%20Agents%20Under%20Attack/100coins
//or http://localhost:3000/api/mgb1/actor/.acey53/Club%20Penguin%20Agents%20Under%20Attack/100coins?getTilePngRedirect=1 to get just the tile PNG as a redirect (2 bounces but let's optimize later)

RestApi.addRoute('mgb1/actor/:account/:project/:name', {authRequired: false}, {
  get: function () {
    let s3Key = `${this.urlParams.account}/${this.urlParams.project}/actor/${this.urlParams.name}`
    var s3 = new AWS.S3({region: aws_s3_region, maxRetries: 3})
    var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
    var response = {}, savedError = {}
    try {
      response = getObjectSync({Bucket: 'JGI_test1', Key: s3Key})
    }
    catch (err)
    {
      savedError = err    // We're gonan report everything as 404 really
      console.dir(err)
    }

    if (savedError && savedError.code)
      return {
        statusCode: 404,
        headers: { },
        body: { }
      }


    if (this.queryParams.getTilePngRedirect)
    {
      return {
        statusCode: 301,    // MOVED (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        headers: {
          'Location': `/api/mgb1/tile/${this.urlParams.account}/${this.urlParams.project}/${response.Metadata.tilename}`
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
        },
        body: { }
      }
    }


    // At this point, the required data should be in response.Body and response.Metadata

    // response.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
    var byteArray = new Uint8Array(response.Body)
    var data2 = pako.inflate(byteArray)
    var data3 = new Uint16Array(data2)
    var strData = String.fromCharCode.apply(null, data3)
    while (strData[0] !== "{" && strData.length > 0)
      strData = strData.substring(1);
    strData = strData.replace(/{{{/g, "<").replace(/}}}/g, ">");

    var jsonData    
    xml2js.parseString(strData, { explicitArray: false, async: false}, function (e, r) { 
      var animT = r.actor.animationTable
      r.actor.animationTable = animT.split("#")
      r.actor.animationTable = _.map(r.actor.animationTable, function (x) { var a= x.split("|"); return {action: a[0], tileName: a[1], effect: a[2]} })
      jsonData = r    // since we requested with async:false we know that this callback completes before we get to then next line of the outer scope
    })

    jsonData.metadata = response.Metadata

    return {
      statusCode: 200,    // just for now...
      body: jsonData,
      headers: {
        'Content-Type': 'application/json'
        // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
      }
    }
  }
})


// MGBv1 MAP
// eg http://localhost:3000/api/mgb1/map/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ

RestApi.addRoute('mgb1/map/:account/:project/:name', {authRequired: false}, {
  get: function () {
    let s3Key = `${this.urlParams.account}/${this.urlParams.project}/map/${this.urlParams.name}`
    var s3 = new AWS.S3({region: aws_s3_region, maxRetries: 3})
    var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
    var response = {}, savedError = {}
    try {
      response = getObjectSync({Bucket: 'JGI_test1', Key: s3Key})
    }
    catch (err)
    {
      savedError = err    // We're gonan report everything as 404 really
    }

    if (savedError && savedError.code)
      return {
        statusCode: 404,
        headers: { },
        body: { }
      }

    // At this point, the required data should be in response.Body and response.Metadata

    // response.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
    var jsonData = {}   // This is where we will put the result
    var byteArray = new Uint8Array(response.Body)
    var data2 = pako.inflate(byteArray)
    var b = new Buffer(data2)
    var offset = 0
    var maxLayers = b.readUInt32BE(offset)
    offset+=4
    jsonData.maxLayers = maxLayers
    jsonData.mapLayer = []
    for (var layer=0; layer < maxLayers ; layer++)
    {
      jsonData.mapLayer[layer] = [];
      var layerLen = b.readInt32BE(offset)
      offset += 4

      for (var i = 0; i < layerLen; i++)
      {
        var strLen = b.readInt16BE(offset)
        offset += 2
        if (strLen > 0)
        {
          var str = b.toString('utf8', offset, offset+strLen)
          offset += strLen
          jsonData.mapLayer[layer].push(str)
        }
        else
          jsonData.mapLayer[layer].push("")
      }
    }
   
    jsonData.metadata = response.Metadata

    return {
      statusCode: 200,    // just for now...
      body: jsonData,
      headers: {
        'Content-Type': 'application/json'
        // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
      }
    }
  }
})


function _makeNameMap(layers)
{
  var r = {}
  var arr = []
  var idx = 1
  _.each(layers, (l,levelIdx) => {
    levelIdx < 3 && _.each(l, cell => {
      if (cell !== "" && !r[cell]) { 
        r[cell] = idx
        arr[idx] = cell
        idx++
      }
    }) 
  })
  return { toIdx: r, toName: arr}
}

// SECOND ATTEMPT - goal is to get VERY close to TMX/JSON format that our map editor uses
// MGBv1 MAP
// eg http://localhost:3000/api/mgb1/map2/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ
// or http://localhost:3000/api/mgb1/map2/foo/project1/chaosMap1
RestApi.addRoute('mgb1/map2/:account/:project/:name', {authRequired: false}, {
  get: function () {
    let s3Key = `${this.urlParams.account}/${this.urlParams.project}/map/${this.urlParams.name}`
    var s3 = new AWS.S3({region: aws_s3_region, maxRetries: 3})
    var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
    var response = {}, savedError = {}
    try {
      response = getObjectSync({Bucket: 'JGI_test1', Key: s3Key})
    }
    catch (err)
    {
      savedError = err    // We're gonna report everything as 404 really
    }

    if (savedError && savedError.code)
      return {
        statusCode: 404,
        headers: { },
        body: { }
      }

    // At this point, the required data should be in response.Body and response.Metadata

    // response.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
    let jsonData = {}   // This is where we will put the result
    const byteArray = new Uint8Array(response.Body)
    const data2 = pako.inflate(byteArray)
    let b = new Buffer(data2)
    let offset = 0
    const maxLayers = b.readUInt32BE(offset)
    offset+=4
    jsonData.maxLayers = maxLayers
    jsonData.mapLayer = []
    for (let layer=0; layer < maxLayers ; layer++)
    {
      jsonData.mapLayer[layer] = [];
      var layerLen = b.readInt32BE(offset)
      offset += 4

      for (var i = 0; i < layerLen; i++)
      {
        var strLen = b.readInt16BE(offset)
        offset += 2
        if (strLen > 0)
        {
          var str = b.toString('utf8', offset, offset+strLen)
          offset += strLen
          jsonData.mapLayer[layer].push(str)
        }
        else
          jsonData.mapLayer[layer].push("")
      }
    }
   
    const mgb1LayerNames=["Background", "Active", "Foreground", "Event"]
    var nameMap = _makeNameMap(jsonData.mapLayer)
    jsonData.metadata = response.Metadata

    // ok, let's build map2...
    // example of the JSON/TMX format at http://localhost:3000/api/asset/map/b8bkHbjrQBJNPBXZp
    let w = parseInt(jsonData.metadata.width)    // mapWidth in tiles
    let h = parseInt(jsonData.metadata.height)   // mapHeight in tiles
    const mgbTilePixels = 32              // Fixed map tile width/height for all MGB1 maps
    let r = {
      version:      1,
      width:        w,
      height:       h,
      orientation:  "orthogonal",
      renderorder:  "right-down",
      tileheight:   mgbTilePixels,
      tilewidth:    mgbTilePixels,
      nextobjectid: nameMap.toName.length,

      // Will fill these in below...
      tilesets:     [],                 
      layers:       [],
      images:       {}
    }

    // Now do tilesets[] and images{}
    for (var a = 1; a < nameMap.toName.length; a++)
    {
      var aname = nameMap.toName[a]       // actor Name
      if (aname !== "")
      {
        r.tilesets.push({
          columns:      1,
          firstgid:     a,
          image:        aname,
          spacing:      0,
          margin:       0,
          imagewidth:   mgbTilePixels,      // TODO!!!! fix this.. real height needed
          imageheight:  mgbTilePixels,
          name:         aname,
          tilecount:    1,
          tileheight:   mgbTilePixels,              // Typically (mgbTilePixels) but could be bigger... TODO
          tilewidth:    mgbTilePixels
        })
        r.images[aname] = `/api/mgb1/actor/${this.urlParams.account}/${this.urlParams.project}/${aname}?getTilePngRedirect=1`
      }
    }

    // Now do layers[]
    for (var idx = 0; idx < jsonData.mapLayer.length - 1; idx++) {
      var l = jsonData.mapLayer[idx]
      var layer = {
        name: mgb1LayerNames[idx],
        draworder: "topdown",
        width: w,
        height: h,
        type: "tilelayer",
        visible: true,
        x: 0,
        y: 0,
        tileStartDrawPosition: "rightup",
        tiledrawdirection: "rightdown",   // Tile assumes 'leftup' but mgbv1 does rightdown. ***NOTE*** This is NON STANDARD for Tiled Maps
        data: []
      }
      _.each(l, cell => { layer.data.push(cell === "" ? 0 : nameMap.toIdx[cell]) } ) 
      r.layers.push(layer)
    }
    
    // Now return it
    return {
      statusCode: 200,    // just for now...
      body: r,
      headers: {
        'Content-Type': 'application/json'
        // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200 
      }
    }
  }
})

