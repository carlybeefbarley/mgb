import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import makeHtmlBundle from '/imports/helpers/codeBundle'
import { genAPIreturn, assetToCdn } from '/server/imports/helpers/generators'

function _makeBundle(api, asset){

  return genAPIreturn(api, asset, () => asset ? makeHtmlBundle(asset) : null, {
    'Content-Type': "text/html",
    'file-name':  asset ? asset.name : this.urlParams.name
  })
}

// get tutorial by id - tmp used for es6 import
RestApi.addRoute('asset/tutorial/:id', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
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
    const asset = Azzets.findOne({dn_ownerName: this.urlParams.owner, name: this.urlParams.name, isDeleted: false})
    return genAPIreturn(this, asset, asset ? (asset.content2.src || '')  : null, {
      'Content-Type': "text/plain",
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
    const asset = Azzets.findOne(this.urlParams.id)
    return assetToCdn(this, asset, '/api/asset/code/bundle/' + this.urlParams.id)
  }
})
// why there is 'u' in the middle ?
RestApi.addRoute('asset/code/bundle/u/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( { dn_ownerName: this.urlParams.username, name: this.urlParams.codename, isDeleted: false } )
    return _makeBundle(this, asset)
  }
})

RestApi.addRoute('asset/code/bundle/cdn/u/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( { dn_ownerName: this.urlParams.username, name: this.urlParams.codename, isDeleted: false }, {
      fields: {updatedAt: 1}
    } )
    return assetToCdn(this, asset, `/api/asset/code/bundle/u/${this.urlParams.username}/${this.urlParams.codename}`)
  }
})
