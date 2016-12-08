import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'
import { genAPIreturn } from '/imports/helpers/generators'

// get music by id
RestApi.addRoute('asset/music/:id/music.mp3', {authRequired: false}, {
  get: function () {
    "use strict";
    let music = Azzets.findOne(this.urlParams.id)

    if(music) {     
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = music.content2.dataUri.substring(0, 100).match(regex)
      const extension = matches[1]

      return genAPIreturn(this, asset, dataUriToBuffer(music.content2.dataUri), {
        'Content-Type': 'audio/'+extension
      })
    }
    else
      return { statusCode: 404 }
  }
})
