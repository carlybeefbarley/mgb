import { RestApi } from './restApi'
import { Azzets }  from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/imports/helpers/generators'

RestApi.addRoute('asset/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset)
  }
})

RestApi.addRoute('asset/content2/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id, {content2: 1})
    return genAPIreturn(this, asset, asset ? asset.content2 : {})
  }
})

RestApi.addRoute('asset/full/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({ name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false })
    return genAPIreturn(this, asset)
  }
})

RestApi.addRoute('asset/json/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    const src = asset.content2.src ? asset.content2.src : asset.content2
    return genAPIreturn(this, asset, asset ? JSON.parse(src) : null)
  }
})

// This is only for testing purposes ..
RestApi.addRoute('asset/raw/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset)
  }
})

// MapEditor tries this while guessing image from imported map
RestApi.addRoute('asset/id/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false}, {fields: {_id: 1}});
    return genAPIreturn(this, asset, asset ? asset._id : null)
  }
})

// Return an empty image if there's no thumbnail yet. This is a transparent 1x1 GIF from https://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/
const emptyPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" //1x1GIF
// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset, dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png'
    })
  }
})
RestApi.addRoute('asset/thumbnail/png/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    return genAPIreturn(this, asset, dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png'
    })
  }
})
