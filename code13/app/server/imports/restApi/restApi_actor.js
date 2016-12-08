import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/imports/helpers/generators'

// get music by id
RestApi.addRoute('asset/actor/:user/:name', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({
      kind: "actor",
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    })
    return genAPIreturn(this, asset, asset ? asset.content2 : null)
  }
})

RestApi.addRoute('asset/fullactor/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({ name: this.urlParams.name, kind: 'actor', dn_ownerName: this.urlParams.user, isDeleted: false })
    return genAPIreturn(this, asset)
  }
})

