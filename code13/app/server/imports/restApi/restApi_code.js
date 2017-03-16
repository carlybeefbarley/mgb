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
    const asset = Azzets.findOne(this.urlParams.id)
    return assetToCdn(this, asset, '/api/asset/code/bundle/' + this.urlParams.id)
  }
})
// why there is 'u' in the middle ?
RestApi.addRoute('asset/code/bundle/u/:username/:codename', { authRequired: false }, {
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

RestApi.addRoute('asset/code/bundle/cdn/u/:username/:codename', { authRequired: false }, {
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
    return assetToCdn(this, asset, `/api/asset/code/bundle/u/${this.urlParams.username}/${this.urlParams.codename}`)
  }
})
