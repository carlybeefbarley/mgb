import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import makeCodeBundle from '/imports/helpers/makeCodeBundle'
import { genAPIreturn, assetToCdn } from '/server/imports/helpers/generators'

function _makeBundle(api, asset){
  return genAPIreturn(api, asset, () => asset ? makeCodeBundle(asset, api.queryParams.origin) : null, {
    'Content-Type': "text/html",
    'file-name':  asset ? asset.name : api.urlParams.name
  })
}

// get tutorial by id OR by ownerName:assetName. See addJoyrideSteps() for use case.
RestApi.addRoute('asset/tutorial/:id', { authRequired: false }, {
  get: function () {
    const idParts = this.urlParams.id.split(':')
    const asset = idParts.length === 2
      ? Azzets.findOne( { dn_ownerName: idParts[0], name: idParts[1], isDeleted: false, kind: 'tutorial' } ) // owner:name
      : Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset, asset ? (asset.content2.src || '')  : null, {
      'Content-Type': "text/plain",
      'file-name': asset ? asset.name : this.urlParams.name
    })
  }
})

// get code by id - tmp used for es6 import
RestApi.addRoute('asset/code/:id', { authRequired: false }, {
  get: function(){
    const asset = Azzets.findOne(this.urlParams.id)
    return genAPIreturn(this, asset, asset ? (asset.content2.src || '')  : null, {
      'Content-Type': "text/plain",
      'file-name': asset ? asset.name : this.urlParams.name
    })
  }
})

// TODO: permission check ?
// TODO: cleanup - make single function that requires assets ? DRY?
// used in codeEdit - import X from '/owner/codeName'
RestApi.addRoute('asset/code/:owner/:name', {authRequired: false}, {
  get: function(){
    const asset = Azzets.findOne({
      dn_ownerName: this.urlParams.owner,
      name: this.urlParams.name,
      kind: 'code',
      isDeleted: false
    })

    // this can be cached - probably no-go - need better solution (or adjust cloudfront headers)
    // nice trick to respond browser with his accepted type - e.g. css
    let contentType = 'text/plain'
    if(this.request.headers.accept){
      contentType = this.request.headers.accept.split(',').shift()
    }

    return genAPIreturn(this, asset, asset ? (asset.content2.src || '')  : null, {
      'Content-Type': contentType,
      'file-name': asset ? asset.name : this.urlParams.name
    })
  }
})

RestApi.addRoute('asset/code/bundle/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    return _makeBundle(this, asset)
  }
})

RestApi.addRoute('asset/code/bundle/cdn/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id, {fields: {_id: 1, updatedAt: 1}})
    return assetToCdn(this, asset, '/api/asset/code/bundle/' + this.urlParams.id)
  }
})

// this tries to locate asset, if asset is deleted - tries to find new asset with same name
RestApi.addRoute('asset/code/bundle/cdn/:id/:username/:codename', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({$or: [{_id: this.urlParams.id, isDeleted: false}, {
      dn_ownerName: this.urlParams.username,
      name: this.urlParams.codename,
      isDeleted: false,
      kind: 'code'
    }]}, {fields: {_id: 1, updatedAt: 1}})
    return assetToCdn(this, asset, '/api/asset/code/bundle/' + asset._id)
  }
})


// why there is 'u' in the middle ?
RestApi.addRoute('asset/code/bundle/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( {
      dn_ownerName: this.urlParams.username,
      name: this.urlParams.codename,
      isDeleted: false,
      kind: 'code'
    } )
    return _makeBundle(this, asset)
  }
})

RestApi.addRoute('asset/code/es5/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( {
      dn_ownerName: this.urlParams.username,
      name: this.urlParams.codename,
      isDeleted: false,
      kind: 'code'
    } )
    let contentType = 'text/plain'
    if(this.request.headers.accept){
      contentType = this.request.headers.accept.split(',').shift()
    }
    return genAPIreturn(this, asset, asset ? (asset.content2.es5 || '')  : null, {
      'Content-Type': contentType,
      'file-name': asset ? asset.name : this.urlParams.name
    })
  }
})

RestApi.addRoute('asset/code/bundle/cdn/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( {
        dn_ownerName: this.urlParams.username,
        name: this.urlParams.codename,
        isDeleted: false,
        kind: 'code'
      },
      {
      fields: {updatedAt: 1}
    } )
    return assetToCdn(this, asset, `/api/asset/code/bundle/${this.urlParams.username}/${this.urlParams.codename}`)
  }
})
