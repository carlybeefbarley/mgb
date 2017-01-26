import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import makeHtmlBundle from '/imports/helpers/codeBundle'
import { genAPIreturn, assetToCdn } from '/server/imports/helpers/generators'

const _retval404 = { statusCode: 404, body: {} }   // body required to correctly show 404 not found header

/* TODO: check urls containing referrer - it may be hard to cache (invalidate) them correctly..
   probably easier is to change /:user/:name on the client side
*/

function _doGet(apiInstance, kind, id){
  const idParts = id.split(':')

  const asset = idParts.length === 2
    ? Azzets.findOne( { dn_ownerName: idParts[0], name: idParts[1], isDeleted: false, kind: kind } ) // owner:name
    : Azzets.findOne(id)                                   // id (e.g cDutAafswYtN5tmRi)

  if (!asset)
    return _retval404 
  
  const content = asset.content2.src
  return genAPIreturn(apiInstance, asset, content, {
    'Content-Type': "text/plain",
    'file-name': asset.name
  })
}

function _makeBundle(api, asset){

  return genAPIreturn(api, asset, () => asset ? makeHtmlBundle(asset) : null, {
    'Content-Type': "text/html",
    'file-name': asset.name
  })
}

// get tutorial by id - tmp used for es6 import
RestApi.addRoute('asset/tutorial/:id', { authRequired: false }, {
  get: function () {
    return _doGet(this, 'tutorial', this.urlParams.id)
  }
})
// get code by id - tmp used for es6 import
RestApi.addRoute('asset/code/:id', { authRequired: false }, {
  get: function () {
    return _doGet(this, 'code', this.urlParams.id)
  }
})


/* was used in the editCode to locate scripts with deep nesting - not used anymore - but might be one day */
/* RestApi.addRoute('asset/code/:owner/:name/:referrer', {authRequired: false}, {
  get: function() {
    const referrer = Azzets.findOne(this.urlParams.referrer);
    const asset = Azzets.findOne({owner: referrer.owner, name: this.urlParams.name, isDeleted: false})
    if (asset) {
      return {
        statusCode: 200,
        // filename header - idea is to tell e.g. ajax asset name
        headers: {'Content-Type': "text/plain", 'file-name': asset.name},
        body: asset.content2.src || "\n" // without new line API returns JSON
      }
    }
    else
      return _retval404
  }
})
*/

// TODO: permission check ?
// TODO: cleanup - make single function that requires assets ? DRY?
// used in codeEdit - import X from '/owner/codeName'
RestApi.addRoute('asset/code/:owner/:name', {authRequired: false}, {
  get: function(){
    const asset = Azzets.findOne({dn_ownerName: this.urlParams.owner, name: this.urlParams.name, isDeleted: false})
    return genAPIreturn(this, asset, asset ? asset.content2.src : null, {
      'Content-Type': "text/plain",
      'file-name': asset.name
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
