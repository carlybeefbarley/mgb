import { RestApi, getContent2, getFullAsset, etagFields, err404, assetAccessibleProps } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/server/imports/helpers/generators'

RestApi.addRoute(
  'asset/actor/:id',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404
      return genAPIreturn(this, asset, getContent2)
    },
  },
)
RestApi.addRoute(
  'asset/actor/:user/:name',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            kind: 'actor',
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
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
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            kind: 'actor',
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404
      return genAPIreturn(this, asset, getFullAsset)
    },
  },
)
