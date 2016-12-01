import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import makeBundle from '/imports/helpers/codeBundle'


const _retval404 = { statusCode: 404, body: {} }   // body required to correctly show 404 not found header

/* TODO: check urls containing referrer - it may be hard to cache (invalidate) them correctly..
   probably easier is to change /:user/:name on the client side
*/

function _doGet(kind, id){
  const idParts = id.split(':')

  const asset = idParts.length === 2 ? 
    Azzets.findOne( { dn_ownerName: idParts[0], name: idParts[1], isDeleted: false, kind: kind } ) :  // owner:name
    Azzets.findOne(id)                                   // id (e.g cDutAafswYtN5tmRi)

  if (!asset)
    return _retval404 
  
  const content = asset.content2.src

  if (content) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': "text/plain", 'file-name': asset.name },
      body: content
    }
  }
  else
    return _retval404
}

function _makeBundle(asset){
  if (!asset)
    return _retval404
  return {
    statusCode: 200,
    headers: {'Content-Type': "text/html", 'file-name': asset.name},
    body: makeBundle(asset)
  }
}

// get tutorial by id - tmp used for es6 import
RestApi.addRoute('asset/tutorial/:id', { authRequired: false }, {
  get: function () {
    return _doGet('tutorial', this.urlParams.id)
  }
})
// get code by id - tmp used for es6 import
RestApi.addRoute('asset/code/:id', { authRequired: false }, {
  get: function () {
    return _doGet('code', this.urlParams.id)
  }
})


/* not used anymore */
RestApi.addRoute('asset/code/:owner/:name/:referrer', {authRequired: false}, {
  get: function() {
    const referrer = Azzets.findOne(this.urlParams.referrer);
    const asset = Azzets.findOne({owner: referrer.owner, name: this.urlParams.name})
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

// TODO: permission check ?
// TODO: cleanup - make single function that requires assets ? DRY?
// used in codeEdit - import X from '/owner/codeName' - referrer is added automatically
RestApi.addRoute('asset/code/:owner/:name', {authRequired: false}, {
  get: function(){

    // referrer is not used here
    /*
    const owner = Users.findOne({"profile.name": this.urlParams.owner})
    if(!owner){
      return {statusCode: 404}
    }
    */

    const asset = Azzets.findOne({dn_ownerName: this.urlParams.owner, name: this.urlParams.name})

    if (asset) {
      return {
        statusCode: 200,
        headers: {'Content-Type': "text/plain", 'file-name': asset.name},
        body: asset.content2.src
      }
    }
    else
     return _retval404
  }
})

RestApi.addRoute('asset/code/bundle/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)

    return _makeBundle(asset)
  }
})

RestApi.addRoute('asset/code/bundle/u/:username/:codename', { authRequired: false }, {
  get: function () {
    const asset = Azzets.findOne( { dn_ownerName: this.urlParams.username, name: this.urlParams.codename } )
    return _makeBundle(asset)
  }
})
