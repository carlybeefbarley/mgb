import { RestApi, getContent2, getFullAsset, updatedOnlyField, err404 } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/server/imports/helpers/generators'

RestApi.addRoute(
  'asset/actor/:id',
  { authRequired: false },
  {
    get: function() {
      const asset = Azzets.findOne(this.urlParams.id, updatedOnlyField)
      if (!asset) return err404
      return genAPIreturn(this, asset, getContent2)
    },
  },
)
RestApi.addRoute(
  'asset/actor/:user/:name',
  { authRequired: false },
  {
    get: function() {
      const asset = Azzets.findOne(
        {
          kind: 'actor',
          name: this.urlParams.name,
          dn_ownerName: this.urlParams.user,
          isDeleted: false,
        },
        updatedOnlyField,
      )
      if (!asset) return err404
      return genAPIreturn(this, asset, getContent2)
    },
  },
)

RestApi.addRoute(
  'asset/fullactor/:user/:name',
  { authRequired: false },
  {
    get: function() {
      const asset = Azzets.findOne(
        {
          name: this.urlParams.name,
          kind: 'actor',
          dn_ownerName: this.urlParams.user,
          isDeleted: false,
        },
        updatedOnlyField,
      )
      if (!asset) return err404
      return genAPIreturn(this, asset, getFullAsset)
    },
  },
)
