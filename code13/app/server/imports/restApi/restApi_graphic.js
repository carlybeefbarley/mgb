import { RestApi } from './restApi'
import { Azzets }  from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'

// TODO: Maybe make this asset/graphic ? Look also at AssetUrlGenerator and generateUrlOptions()

const _retval404 = { statusCode: 404, body: {} }   // body required to correctly show 404 not found header

// Handle case where the spriteData has not yet been created
const _getAssetFrameDataUri = (asset, frame = 0) => {
  if (!asset)
    return null
  const c2 = asset.content2

  if (c2 && c2.spriteData && c2.spriteData[frame])
    return c2.spriteData[frame]
  // Fallback for older assets that didn't auto-create the spriteData. This will only have layer 0 though
  if (c2 && c2.frameData && c2.frameData[frame][0])
    return c2.frameData[frame][0]
  
  console.error(`api/asset/png/${asset._id} has no frameData or spriteDate for frame #${frame}`)
  return null
}

RestApi.addRoute('asset/png/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    if (!asset)
      return _retval404
 
    const dataUri = _getAssetFrameDataUri(asset, this.queryParams.frame)

    if (dataUri)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png'
          // 'cache-control': 'private, must-revalidate, max-age: 30'
        },
        body: dataUriToBuffer(dataUri) 
      }
    else
      return _retval404   // There may be a better error code for frame not found?
  }
})

RestApi.addRoute('asset/png/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({
      kind: "graphic",
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    })
    if (!asset)
      return _retval404
  
    const dataUri = _getAssetFrameDataUri(asset, this.queryParams.frame)
    if (dataUri)
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png'
          // 'cache-control': 'private, must-revalidate, max-age: 30'
        },
        body: dataUriToBuffer(dataUri)
      }
    else
      return _retval404   // There may be a better error code for frame not found?
  }
})

RestApi.addRoute('asset/fullgraphic/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({ name: this.urlParams.name, kind: 'graphic', dn_ownerName: this.urlParams.user, isDeleted: false })
    return asset ? asset : _retval404
  }
})

RestApi.addRoute('asset/tileset-info/:id', { authRequired: false }, {
  get: function () {
    "use strict";
    const asset = Azzets.findOne(this.urlParams.id)
    if (!asset)
      return _retval404
    /* Example...
      firstgid:    1
      image:       "main.png"
      imageheight: 100
      imagewidth:  256
      margin:      0
      name:        "main"
      spacing:     0
      tilecount:   4
      tileheight:  100
      tiles:       Object
      tilewidth:   64
     */
    const c2 = asset.content2
    const tiles = {}
    c2.animations && c2.animations.forEach((anim) => {
      const animation = []
      const duration = (1000 / anim.fps)  // round?
      anim.frames.forEach((frame) => {
        animation.push({
          duration,
          tileid: frame
        })
      })
      tiles[anim.frames[0]] = {
        animation,
        mgb_animation_info: {
          name: anim.name,
          fps: anim.fps
        }
      }
    })

    return {
      image: "/api/asset/tileset/" + this.urlParams.id,
      // don't do that - as image will be cached forever and embedded in the map (phaser don't know how to extract embedded images automatically)
      //image: c2.tileset ? c2.tileset : "/api/asset/tileset/" + this.urlParams.id,
      name:        asset.name,
      imageheight: c2.rows ? c2.rows*c2.height : c2.height,
      imagewidth:  c2.cols ? c2.cols*c2.width : c2.width * c2.frameData.length,
      tilecount:   c2.frameData.length,
      tileheight:  c2.height,
      tilewidth:   c2.width,
      tiles
    }
  }
})

RestApi.addRoute('asset/tileset/:id', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    if (!asset || !asset.content2 || !asset.content2.tileset)
      return _retval404

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
        // TODO: cache
      },
      body: dataUriToBuffer(asset.content2.tileset)
    }
  }
})

RestApi.addRoute('asset/tileset/:user/:name', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne({
      name:         this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted:    false,
      kind:         "graphic"
    })

    if (!asset || !asset.content2 || !asset.content2.tileset)
      return _retval404
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
        // TODO: cache
      },
      body: dataUriToBuffer(asset.content2.tileset)
    }
  }
})
