import { RestApi } from './restApi'

// THESE ONES ARE NOT CURRENTLY USED.. parking here since it was hard
// work to get right and MIGHT be useful in future

/****
 *
// These are the APIs for extracting information from the legacy MGBv1 site

import AWS from 'aws-sdk'
import pako from 'pako'
import xml2js from 'xml2js'


// AWS config for MGB1 S3 buckets  ** secrets ** #insecure# ??
const aws_s3_region = 'us-east-1'       // US-East-1 is the 'global' site for S3
AWS.config.update({accessKeyId: '104QCDA4V07YPPSVBKG2', secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn'});



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
// MGBv1 MAP -> MGB2 map on-the-fly (use redirects for tiles)
// eg http://localhost:3000/api/mgb1/map2/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ
// or http://localhost:3000/api/mgb1/map2/foo/project1/chaosMap1
// or http://localhost:3000/api/mgb1/map2/drblakeman/Two%20Cities%20Bother%20and%20Wise/The%20Map3
// or http://localhost:3000/api/mgb1/map2/drblakeman/Two%20Cities%20Bother%20and%20Wise/LOST%20IN%20THE%20OLD%20FOREST - includes rotations/flips
// or http://localhost:3000/api/mgb1/map2/hooliganza/Crab%20Invasion%20II/castle%20room%201
// or http://localhost:3000/api/mgb1/map2/hooliganza/project1/Crab%20Invasion
// TODO: Tileset  imagewidth/imageheight/tileheight/tilewidth params
// TODO: Event layer (layer[3].. the 4th layer. For MGBv1 this is mostly warps/teleports, game-win, and start/stop music)
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

      for (let i = 0; i < layerLen; i++)
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
    for (let a = 1; a < nameMap.toName.length; a++)
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
//          imagewidth:   mgbTilePixels,      // TODO!!!! fix this.. real height needed
//          imageheight:  mgbTilePixels,
          name:         aname,
          tilecount:    1,
//          tileheight:   mgbTilePixels,              // Typically (mgbTilePixels) but could be bigger... TODO
//          tilewidth:    mgbTilePixels
        })
        r.images[aname] = `/api/mgb1/actor/${this.urlParams.account}/${this.urlParams.project}/${aname}?getTilePngRedirect=1`
      }
    }

    // Now do layers[]
    for (let idx = 0; idx < jsonData.mapLayer.length - 1; idx++) {
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
        mgb_tiledrawdirection: "rightdown",   // Tile assumes 'rightup' but mgbv1 does rightdown. ***NOTE*** This is NON STANDARD for Tiled Maps
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



*/
