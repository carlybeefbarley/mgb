import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/server/imports/helpers/generators'

RestApi.addRoute(
  'asset/map/:id',
  { authRequired: false },
  {
    get: function() {
      var asset = Azzets.findOne(this.urlParams.id)
      if (asset) {
        // map editor stores some info in the meta - e.g. camera position / active tool etc
        delete asset.content2.meta
      }
      return genAPIreturn(this, asset, asset ? asset.content2 : null)
    },
  },
)

RestApi.addRoute(
  'asset/map/:user/:name',
  { authRequired: false },
  {
    get: function() {
      var asset = Azzets.findOne({
        name: this.urlParams.name,
        dn_ownerName: this.urlParams.user,
        kind: 'map',
        isDeleted: false,
      })
      if (asset) {
        // map editor stores some info in the meta - e.g. camera position / active tool etc
        delete asset.content2.meta
      }
      return genAPIreturn(this, asset, asset ? asset.content2 : null)
    },
  },
)

RestApi.addRoute(
  'asset/actormap/:user/:name',
  { authRequired: false },
  {
    get: function() {
      var asset = Azzets.findOne({
        name: this.urlParams.name,
        dn_ownerName: this.urlParams.user,
        kind: 'actormap',
        isDeleted: false,
      })
      if (asset) {
        // map editor stores some info in the meta - e.g. camera position / active tool etc
        delete asset.content2.meta
      }
      return genAPIreturn(this, asset, asset ? asset.content2 : null)
    },
  },
)
