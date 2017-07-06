import { RestApi, emptyPixel, red64x64halfOpacity, grey64x64halfOpacity } from './restApi'
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

const _replaceThumbnailIfAppropriate = (api, asset) => {
  if (asset && (asset.suIsBanned===true))
    return genAPIreturn(api, asset, () => dataUriToBuffer(red64x64halfOpacity), { 'Content-Type': 'image/png' } )
  if (asset && (asset.suFlagId))
    return genAPIreturn(api, asset, () => dataUriToBuffer(grey64x64halfOpacity), { 'Content-Type': 'image/png' } )
  return null
}

// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return (
      _replaceThumbnailIfAppropriate(this, asset) ||
      genAPIreturn(
        this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ),
        { 'Content-Type': 'image/png' })
    )
  }
})
RestApi.addRoute('asset/thumbnail/png/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    return (
      _replaceThumbnailIfAppropriate( this, asset) ||
      genAPIreturn(
        this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ),
        { 'Content-Type': 'image/png' })
    )
  }
})

RestApi.addRoute('asset/cached-thumbnail/png/:expires/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    const expires = this.urlParams.expires || 30
    return (
      _replaceThumbnailIfAppropriate(this, asset) ||
      genAPIreturn(
        this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ),
        { 'Content-Type': 'image/png',
          'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}` })
    )
  }
})

RestApi.addRoute('asset/cached-thumbnail/png/:expires/:kind/:user/:name', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({name: this.urlParams.name, kind: this.urlParams.kind, dn_ownerName: this.urlParams.user, isDeleted: false})
    const expires = this.urlParams.expires || 30
    return genAPIreturn(this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`
    })
  }
})

// this is guessing....
RestApi.addRoute('asset/cached-thumbnail/png/:expires/:user/:name', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    const expires = this.urlParams.expires || 30
    return genAPIreturn(this, asset, () => dataUriToBuffer(asset && asset.thumbnail ? asset.thumbnail : emptyPixel ), {
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`
    })
  }
})

