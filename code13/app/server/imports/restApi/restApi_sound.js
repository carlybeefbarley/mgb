import { RestApi } from './restApi'
import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'


// get sound by id
RestApi.addRoute('asset/sound/:id/sound.mp3', {authRequired: false}, {
  get: function () {
    "use strict";
    let sound = Azzets.findOne(this.urlParams.id)

    if(sound) {     
      const regex = /^data:.+\/(.+);base64,(.*)$/;
      const matches = sound.content2.dataUri.substring(0, 100).match(regex)
      const extension = matches[1]
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'audio/'+extension
        },
        body: dataUriToBuffer(sound.content2.dataUri)
      }
    }
    else
      return { statusCode: 404 }
  }
})

// get sound from stock by name/tag
RestApi.addRoute('asset/sound/name/:name', {authRequired: false}, {
  get: function () {
    "use strict";
    const ownerId = "fijoMML4CZzTAdHuf"   // guntis id for test purposes // TODO FIX
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
