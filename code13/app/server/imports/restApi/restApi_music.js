import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'


// get music by id
RestApi.addRoute('asset/music/:id/music.mp3', {authRequired: false}, {
  get: function () {
    "use strict";
    let music = Azzets.findOne(this.urlParams.id)

    if(music) {     
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = music.content2.dataUri.substring(0, 100).match(regex)
      const extension = matches[1]
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'audio/'+extension
        },
        body: dataUriToBuffer(music.content2.dataUri)
      }
    }
    else
      return { statusCode: 404 }
  }
})