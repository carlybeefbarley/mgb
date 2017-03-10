import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

const makeAudioResponse = (api, asset) => {
  if(asset) {
    if (asset.content2 && asset.content2.dataUri) {
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = asset.content2.dataUri.substring(0, 100).match(regex)
      const extension = matches[1]
      return genAPIreturn(api, asset, () => dataUriToBuffer(asset.content2.dataUri), {
        'Content-Type': 'audio/' + extension
      })
    }
    else {
      return genAPIreturn(api, asset, '', {
        'Content-Type': 'audio/mp3'
      })
    }
  }
  else
    return { statusCode: 404 }
}

// get sound by id
RestApi.addRoute('asset/sound/:id/sound.mp3', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id)
    return makeAudioResponse(this, asset)
  }
})
// get sound by user / name combo - not used?
RestApi.addRoute('asset/sound/:user/:name/sound.mp3', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({
      kind: "sound",
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    })
    return makeAudioResponse(this, asset)
  }
})

// TODO: add genAPIreturn(this, asset, data, headers)
// get sound from stock by name/tag
RestApi.addRoute('asset/sound/name/:name', {authRequired: false}, {
  get: function () {
    "use strict";
    const ownerId = "fijoMML4CZzTAdHuf"   // guntis id for test purposes // TODO(guntis) FIX
    // let sound = Azzets.findOne(this.urlParams.id)
    let query = Azzets.find({kind:"sound", ownerId: ownerId, name: {'$regex': this.urlParams.name} })

    let sounds = []
    query.forEach(function(item){
      sounds.push({
        _id: item._id
        , name: item.name
        , thumbnail: item.thumbnail
        , duration: item.content2.duration
      })
    })

    return sounds
  }
})
