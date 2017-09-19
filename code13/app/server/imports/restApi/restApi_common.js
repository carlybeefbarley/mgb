import {
  RestApi,
  emptyPixel,
  emptyPixelBuffer,
  red64x64halfOpacity,
  grey64x64halfOpacity,
  etagFields,
  getContent2,
  err404,
  assetAccessibleProps,
} from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

import _ from 'lodash'

/*
* TODO: most of these routes are not used directly - needs cleanup
* */

RestApi.addRoute(
  'error',
  { authRequired: false },
  {
    get() {
      return this.request.headers
    },
  },
)
RestApi.addRoute(
  'make-error',
  { authRequired: false },
  {
    get() {
      return {
        statusCode: 503,
        headers: {
          location: `${process.env.ROOT_URL}${this.request.url.startsWith('/')
            ? this.request.url
            : '/' + this.request.url}`,
        },
        body: {},
      }
    },
  },
)

const getFullAsset = function(selector) {
  const asset = Azzets.findOne(selector, { fields: { _id: 1, updatedAt: 1 } })
  if (!asset) return err404
  return genAPIreturn(this, asset, partialAsset => {
    return Azzets.findOne(partialAsset._id)
  })
}

RestApi.addRoute(
  'asset/:id',
  { authRequired: false },
  {
    get() {
      return getFullAsset.call(this, this.urlParams.id)
    },
  },
)

RestApi.addRoute(
  'asset/withoutC2/:id',
  { authRequired: false },
  {
    get() {
      var asset = Azzets.findOne(this.urlParams.id)
      delete asset.content2
      return genAPIreturn(this, asset)
    },
  },
)

RestApi.addRoute(
  'asset/full/:user/:name',
  { authRequired: false },
  {
    get() {
      return getFullAsset.call(
        this,
        Object.assign(
          {
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
      )
    },
  },
)

RestApi.addRoute(
  'asset/content2/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      return genAPIreturn(this, asset, getContent2)
    },
  },
)

// this route is not used???
RestApi.addRoute(
  'asset/json/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      return genAPIreturn(this, asset, partialAsset => {
        const asset = Azzets.findOne(partialAsset._id, { _id: 0, content2: 1 })
        const src = asset.content2.src ? asset.content2.src : asset.content2
        return asset ? src : null
      })
    },
  },
)

// MapEditor tries this while guessing image from imported map
RestApi.addRoute(
  'asset/id/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return genAPIreturn(this, asset, asset ? asset._id : null)
    },
  },
)

const _replaceThumbnailIfAppropriate = (api, asset) => {
  if (asset && asset.suIsBanned === true)
    return genAPIreturn(api, asset, () => dataUriToBuffer(red64x64halfOpacity), {
      'Content-Type': 'image/png',
    })
  if (asset && asset.suFlagId)
    return genAPIreturn(api, asset, () => dataUriToBuffer(grey64x64halfOpacity), {
      'Content-Type': 'image/png',
    })
  return null
}

const getThumbnailFromAsset = function(api, asset, extraHeaders) {
  return (
    _replaceThumbnailIfAppropriate(api, asset) ||
    genAPIreturn(
      api,
      asset,
      partialAsset => {
        const asset = Azzets.findOne(partialAsset._id, { fields: { _id: 0, thumbnail: 1 } })
        return asset && asset.thumbnail ? dataUriToBuffer(asset.thumbnail) : emptyPixelBuffer
      },
      Object.assign({ 'Content-Type': 'image/png' }, extraHeaders),
    )
  )
}

const thumbnailProjectionFields = { fields: { suIsBanned: 1, suFlagId: 1, updatedAt: 1 } }
// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute(
  'asset/thumbnail/png/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, thumbnailProjectionFields)
      if (!asset) return err404
      return getThumbnailFromAsset(this, asset)
    },
  },
)
RestApi.addRoute(
  'asset/thumbnail/png/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        thumbnailProjectionFields,
      )

      if (!asset) return err404
      return getThumbnailFromAsset(this, asset)
    },
  },
)

RestApi.addRoute(
  'asset/cached-thumbnail/png/:expires/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, thumbnailProjectionFields)
      if (!asset) return err404
      const expires = this.urlParams.expires || 30
      return getThumbnailFromAsset(this, asset, {
        'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`,
      })
    },
  },
)

RestApi.addRoute(
  'asset/cached-thumbnail/png/:expires/:kind/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            kind: this.urlParams.kind,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        thumbnailProjectionFields,
      )
      if (!asset) return err404
      const expires = this.urlParams.expires || 30
      return getThumbnailFromAsset(this, asset, {
        'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`,
      })
    },
  },
)

// this is guessing....
RestApi.addRoute(
  'asset/cached-thumbnail/png/:expires/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        thumbnailProjectionFields,
      )

      if (!asset) return err404

      const expires = this.urlParams.expires || 30
      return getThumbnailFromAsset(this, asset, {
        'Cache-Control': `public, max-age=${expires}, s-maxage=${expires}`,
      })
    },
  },
)

// mainly used for autocomplete in the codeEditor, but can be used also for something else
RestApi.addRoute(
  'assets/:kind/:owner/',
  { authRequired: false },
  {
    get() {
      const assets = Azzets.find(
        Object.assign(
          {
            dn_ownerName: this.urlParams.owner,
            kind: this.urlParams.kind,
            name: new RegExp('^' + _.escapeRegExp(this.queryParams.query), 'i'),
          },
          assetAccessibleProps,
        ),
        {
          fields: { name: 1, text: 1 },
        },
      )
      return genAPIreturn(this, null, () => assets.map(a => ({ text: a.name, desc: a.text, id: a._id })))
    },
  },
)
