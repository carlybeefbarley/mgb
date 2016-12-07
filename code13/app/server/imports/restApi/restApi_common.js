import { RestApi } from './restApi'
import { Azzets }  from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genetag, genAPIreturn } from '/imports/helpers/generators'

RestApi.addRoute('asset/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset)
  }
})

RestApi.addRoute('asset/content2/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id, {content2: 1})
    return genAPIreturn(this, asset ? asset.content2 : {}, asset)
  }
})

RestApi.addRoute('asset/full/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({ name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false })
    return asset ? asset : { statusCode: 404, body: {} }
  }
})

RestApi.addRoute('asset/json/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    const src = asset.content2.src ? asset.content2.src : asset.content2
    return asset ? JSON.parse(src) : { statusCode: 404, body: {} }
  }
})

// This is only for testing purposes ..
RestApi.addRoute('asset/raw/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return asset ? asset : { statusCode: 404, body: {} }
  }
})

// MapEditor tries this while guessing image from imported map
RestApi.addRoute('asset/id/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false}, {fields: {_id: 1}});
    if (asset)
    {
      return asset._id
    }
    else {
      // without body returns 200 and json: {statusCode: 404}
      return {statusCode: 404, body:{}};
    }
  }
})

// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    // Return an empty image if there's no thumbnail yet. This is a transparent 1x1 GIF from https://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/
    var emptyPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" //1x1GIF

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
RestApi.addRoute('asset/thumbnail/png/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    // Return an empty image if there's no thumbnail yet. This is a 1x1 green pixel from http://png-pixel.com/
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
