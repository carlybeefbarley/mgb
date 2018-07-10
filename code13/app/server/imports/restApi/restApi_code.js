import { RestApi, getContent2, getFullAsset, etagFields, assetAccessibleProps, err404 } from './restApi'
import { Azzets } from '/imports/schemas'
import makeCodeBundle from '/imports/helpers/makeCodeBundle'
import { genAPIreturn, assetToCdn } from '/server/imports/helpers/generators'

const makeBundleFields = { fields: { _id: 0, dn_ownerName: 1, name: 1, 'content2.bundle': 1 } }
const c2srcFieldOnly = { fields: { 'content2.src': 1, _id: 0 } }
const c2es5FieldOnly = { fields: { 'content2.es5': 1, _id: 0 } }
const c2bundleFieldOnly = { fields: { 'content2.bundle': 1, _id: 0 } }
const updateAndNameFields = { fields: { _id: 1, updatedAt: 1, name: 1 } }

function _makeBundle(api, asset) {
  return genAPIreturn(
    api,
    asset,
    partialAsset => {
      const asset = Azzets.findOne(partialAsset._id, makeBundleFields)
      return asset ? makeCodeBundle(asset, api.queryParams.origin) : null
    },
    {
      'Content-Type': 'text/html',
      'file-name': asset ? asset.name : api.urlParams.name || '',
    },
  )
}

const getSrc = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, c2srcFieldOnly)
  return partialAsset && asset && asset.content2 ? asset.content2.src || '' : null
}
const getEs5 = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, c2es5FieldOnly)
  return partialAsset && asset && asset.content2 ? asset.content2.es5 || '' : null
}
const getBundle = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, c2bundleFieldOnly)
  return partialAsset && asset && asset.content2 ? asset.content2.bundle || '' : null
}
// get tutorial by id OR by ownerName:assetName. See joyrideStore.addJoyrideSteps() for use case.
RestApi.addRoute(
  'asset/tutorial/:id',
  { authRequired: false },
  {
    get() {
      const idParts = this.urlParams.id.split(':')

      const asset =
        idParts.length === 2
          ? Azzets.findOne(
              Object.assign(
                {
                  dn_ownerName: idParts[0],
                  name: idParts[1],
                  kind: 'tutorial',
                },
                assetAccessibleProps,
              ),
              updateAndNameFields,
            ) // owner:name
          : Azzets.findOne(this.urlParams.id, updateAndNameFields)
      if (!asset) return err404

      return genAPIreturn(this, asset, getSrc, {
        'Content-Type': 'text/plain',
        'file-name': asset ? asset.name : this.urlParams.name,
      })
    },
  },
)

// get code by id - tmp used for es6 import
RestApi.addRoute(
  'asset/code/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, updateAndNameFields)
      if (!asset) return err404

      return genAPIreturn(this, asset, getSrc, {
        'Content-Type': 'text/plain',
        'file-name': asset ? asset.name : this.urlParams.name,
      })
    },
  },
)

// TODO: permission check ?
// TODO: cleanup - make single function that requires assets ? DRY?
// used in codeEdit - import X from '/owner/codeName'
RestApi.addRoute(
  'asset/code/:owner/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            dn_ownerName: this.urlParams.owner,
            name: this.urlParams.name,
            kind: 'code',
          },
          assetAccessibleProps,
        ),
        updateAndNameFields,
      )
      if (!asset) return err404

      // this can be cached - probably no-go - need better solution (or adjust cloudfront headers)
      // nice trick to respond browser with his accepted type - e.g. css
      let contentType = 'text/plain'
      if (this.request.headers.accept) contentType = this.request.headers.accept.split(',').shift()

      return genAPIreturn(this, asset, getSrc, {
        'Content-Type': contentType,
        'file-name': asset ? asset.name : this.urlParams.name,
      })
    },
  },
)

RestApi.addRoute(
  'asset/code/bundle/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, updateAndNameFields)
      if (!asset) return err404

      return _makeBundle(this, asset)
    },
  },
)

RestApi.addRoute(
  'asset/code/bundle/cdn/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, updateAndNameFields)
      if (!asset) return err404

      return assetToCdn(this, asset, '/api/asset/code/bundle/' + this.urlParams.id)
    },
  },
)

// this tries to locate asset, if asset is deleted - tries to find new asset with same name
RestApi.addRoute(
  'asset/code/bundle/cdn/:id/:username/:codename',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        {
          $or: [
            Object.assign(
              {
                _id: this.urlParams.id,
              },
              assetAccessibleProps,
            ),
            Object.assign(
              {
                dn_ownerName: this.urlParams.username,
                name: this.urlParams.codename,
                kind: 'code',
              },
              assetAccessibleProps,
            ),
          ],
        },
        updateAndNameFields,
      )
      if (!asset) return err404

      return assetToCdn(this, asset, '/api/asset/code/bundle/' + asset._id)
    },
  },
)

// why there is 'u' in the middle ?
RestApi.addRoute(
  'asset/code/bundle/:username/:codename',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            dn_ownerName: this.urlParams.username,
            name: this.urlParams.codename,
            kind: 'code',
          },
          assetAccessibleProps,
        ),
        updateAndNameFields,
      )
      if (!asset) return err404

      return _makeBundle(this, asset)
    },
  },
)

RestApi.addRoute(
  'asset/code/bundle/script/:username/:codename',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            dn_ownerName: this.urlParams.username,
            name: this.urlParams.codename,
            kind: 'code',
          },
          assetAccessibleProps,
        ),
        updateAndNameFields,
      )
      if (!asset) return err404

      let contentType = 'text/plain'
      if (this.request.headers.accept) {
        contentType = this.request.headers.accept.split(',').shift()
      }
      return genAPIreturn(this, asset, getBundle, {
        'Content-Type': contentType,
        'file-name': asset ? asset.name : this.urlParams.name,
      })
    },
  },
)

RestApi.addRoute(
  'asset/code/es5/:username/:codename',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            dn_ownerName: this.urlParams.username,
            name: this.urlParams.codename,
            kind: 'code',
          },
          assetAccessibleProps,
        ),
        updateAndNameFields,
      )
      if (!asset) return err404

      let contentType = 'text/plain'
      if (this.request.headers.accept) {
        contentType = this.request.headers.accept.split(',').shift()
      }
      return genAPIreturn(this, asset, getEs5, {
        'Content-Type': contentType,
        'file-name': asset ? asset.name : this.urlParams.name,
      })
    },
  },
)

RestApi.addRoute(
  'asset/code/bundle/cdn/:username/:codename',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            dn_ownerName: this.urlParams.username,
            name: this.urlParams.codename,
            kind: 'code',
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return assetToCdn(
        this,
        asset,
        `/api/asset/code/bundle/${this.urlParams.username}/${this.urlParams.codename}`,
      )
    },
  },
)
