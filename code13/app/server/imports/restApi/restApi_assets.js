import { RestApi } from './restApi'
// these routes will return lists of assets instead of single asset
import { loadAssets } from '/imports/schemas/assets'
import { genAPIreturn } from '/server/imports/helpers/generators'


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
      return {text: a.name, desc: a.text, id: a._id}
    }))
  }
})

// props - decoded JSON string with some (or all) props defined in the loadAssets arguments:
/*
 {
 userId,
 kind,
 searchName,
 limit = SpecialGlobals.assets.mainAssetsListDefaultLimit,
 page = 1,
 projectName = null,
 showDeleted = false,
 showStable = false,
 sort = undefined,
 showChallengeAssets = false,
 hideWorkstateMask = 0,
 }

 */
RestApi.addRoute('assets/:props', {authRequired: false}, {
  get: function () {

    //return props
    return genAPIreturn(this, null, () => {
      const props = JSON.parse(decodeURIComponent(this.urlParams.props))
      const retval =  loadAssets(props)
      return retval.fetch()
    })
  }
})
