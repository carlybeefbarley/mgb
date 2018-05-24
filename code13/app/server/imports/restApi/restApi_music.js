import { RestApi, etagFields, err404, audioHeader, assetAccessibleProps } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

const audioFields = { fields: { _id: 0, 'content2.dataUri': 1 } }
const makeAudioResponse = partialAsset => {
  const asset = Azzets.findOne(partialAsset._id, audioFields)
  return dataUriToBuffer(asset.content2.dataUri)
}

// get music by id
RestApi.addRoute(
  'asset/music/:id/music.mp3',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)

      if (!asset) return err404

      return genAPIreturn(this, asset, makeAudioResponse, audioHeader)
    },
  },
)
// get music by username / assetname
RestApi.addRoute(
  'asset/music/:user/:name/music.mp3',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            kind: 'music',
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return genAPIreturn(this, asset, makeAudioResponse, audioHeader)
    },
  },
)
