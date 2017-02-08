import { RestApi, emptyPixel } from './restApi'
import { Azzets }  from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

RestApi.addRoute('error', { authRequired: false }, {
  get: function () {
    return this.request.headers
  }
})
RestApi.addRoute('make-error', { authRequired: false }, {
  get: function () {
    return {
      statusCode: 503,
      headers:{
        location:`${process.env.ROOT_URL}${this.request.url.startsWith('/') ? this.request.url : '/'+this.request.url}`
      },
      body: {}
    }
  }
})
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
    return genAPIreturn(this, asset, () => asset ? JSON.parse(src) : null)
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

// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset, () => dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png'
    })
  }
})
RestApi.addRoute('asset/cached-thumbnail/png/:expires/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    const expires = this.urlParams.expires || 30
    return genAPIreturn(this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`

    })
  }
})

RestApi.addRoute('asset/thumbnail/png/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    return genAPIreturn(this, asset, () => dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png'
    })
  }
})
// mainly used for autocomplete in the codeEditor, but can be used also for something else
RestApi.addRoute('assets/:kind/:owner/', {authRequired: false}, {
  get: function () {
    const assets = Azzets.find({
      dn_ownerName: this.urlParams.owner,
      kind: this.urlParams.kind,
      name: new RegExp('^'+this.queryParams.query, 'i'),
      isDeleted: false
    }, {
      fields: {name: 1, text: 1}
    })
    return genAPIreturn(this, null, () => assets.map(a => {
      return {text: a.name, desc: a.text}
    }))
  }
})
