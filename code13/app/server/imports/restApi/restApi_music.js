import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/server/imports/helpers/generators'

// get music by id
RestApi.addRoute('asset/music/:id/music.mp3', {authRequired: false}, {
  get: function () {
    "use strict";
    let asset = Azzets.findOne(this.urlParams.id)

    if(asset) {     
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = asset.content2.dataUri.substring(0, 100).match(regex)
      const extension = matches[1]

      return genAPIreturn(this, asset, () => dataUriToBuffer(asset.content2.dataUri), {
        'Content-Type': 'audio/'+extension
      })
    }
    else
      return { statusCode: 404 }
  }
})
