import { RestApi, updatedOnlyField, content2onlyField, err404 } from './restApi'
import { Azzets } from '/imports/schemas'
import { genAPIreturn } from '/server/imports/helpers/generators'

const getMapData = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, {
    fields: {
      _id: 0,
      content2: 1,
    },
  })
  // Projection cannot have a mix of inclusion and exclusion
  if (asset) {
    // old assets have content2.meta - we need to remove it - to be compatible with tiled standard
    delete asset.content2.meta
    return asset.content2
  } else return null
}

const getMapAssetByUserName = function(kind = 'map') {
  const asset = Azzets.findOne(
    {
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      kind: kind,
      isDeleted: false,
    },
    updatedOnlyField,
  )
  if (!asset) return err404
  return genAPIreturn(this, asset, getMapData)
}

RestApi.addRoute(
  'asset/map/:id',
  { authRequired: false },
  {
    get: function() {
      const asset = Azzets.findOne(this.urlParams.id, updatedOnlyField)
      if (!asset) return err404
      return genAPIreturn(this, asset, getMapData)
    },
  },
)

RestApi.addRoute('asset/map/:user/:name', { authRequired: false }, { get: getMapAssetByUserName })

RestApi.addRoute(
  'asset/actormap/:user/:name',
  { authRequired: false },
  {
    get: function() {
      return getMapAssetByUserName.call(this, 'actormap')
    },
  },
)
