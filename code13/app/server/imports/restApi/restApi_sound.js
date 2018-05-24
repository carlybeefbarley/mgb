import { RestApi, err404, audioHeader, etagFields, assetAccessibleProps } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

const audioResponseFields = { fields: { 'content2.dataUri': 1 } }

const makeAudioResponse = (api, asset) => {
  return genAPIreturn(
    api,
    asset,
    partialAsset => {
      const asset = Azzets.findOne(partialAsset._id, audioResponseFields)
      if (!asset) return err404

      if (asset.content2 && asset.content2.dataUri) {
        return dataUriToBuffer(asset.content2.dataUri)
      } else {
        return ''
      }
    },
    audioHeader,
  )
}

// get sound by id
RestApi.addRoute(
  'asset/sound/:id/sound.mp3',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(this.urlParams.id, etagFields)
      if (!asset) return err404

      return makeAudioResponse(this, asset)
    },
  },
)
// get sound by user / name combo
RestApi.addRoute(
  'asset/sound/:user/:name/sound.mp3',
  { authRequired: false },
  {
    get() {
      const asset = Azzets.findOne(
        Object.assign(
          {
            kind: 'sound',
            name: this.urlParams.name,
            dn_ownerName: this.urlParams.user,
          },
          assetAccessibleProps,
        ),
        etagFields,
      )
      if (!asset) return err404

      return makeAudioResponse(this, asset)
    },
  },
)

// TODO: add genAPIreturn(this, asset, data, headers)
// get sound from stock by name/tag
RestApi.addRoute(
  'asset/sound/name/:name',
  { authRequired: false },
  {
    get() {
      'use strict'
      const ownerId = 'fijoMML4CZzTAdHuf' // guntis id for test purposes // TODO(guntis) FIX
      // let sound = Azzets.findOne(this.urlParams.id)
      let query = Azzets.find({ kind: 'sound', ownerId, name: { $regex: this.urlParams.name } })

      let sounds = []
      query.forEach(function(item) {
        sounds.push({
          _id: item._id,
          name: item.name,
          thumbnail: item.thumbnail,
          duration: item.content2.duration,
        })
      })

      return sounds
    },
  },
)
