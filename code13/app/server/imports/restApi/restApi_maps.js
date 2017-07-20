import { RestApi, updatedOnlyField, content2onlyField } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/server/imports/helpers/generators'

const getMapData = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, {
    fields: {
      _id: 0,
      content2: 1,
      // map editor stores (WAS storing - deprecated, but old maps may still have some )some info in the meta - e.g. camera position / active tool etc
      'content2.meta': 0,
    },
  })
  return asset ? asset.content2 : null
}

const getMapAssetByUserName = function() {
  const asset = Azzets.findOne(
    {
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      kind: 'map',
      isDeleted: false,
    },
    updatedOnlyField,
  )
  return genAPIreturn(this, asset, getMapData)
}

RestApi.addRoute(
  'asset/map/:id',
  { authRequired: false },
  {
    get: function() {
      const asset = Azzets.findOne(this.urlParams.id, updatedOnlyField)
      return genAPIreturn(this, asset, getMapData)
    },
  },
)

RestApi.addRoute('asset/map/:user/:name', { authRequired: false }, { get: getMapAssetByUserName })

RestApi.addRoute('asset/actormap/:user/:name', { authRequired: false }, { get: getMapAssetByUserName })
