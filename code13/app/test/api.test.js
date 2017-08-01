const http = require('http')

const getLocal = uri => {
  return new Promise((res, rej) => {
    const uriToLoad = 'http://localhost:3000/' + uri
    http.get(uriToLoad, resp => {
      if (resp.statusCode > 399)
        rej(new Error(`Response code from: \n${uriToLoad} was ${resp.statusCode} (${resp.statusMessage})`))
      else res()
    })
  })
}

describe('Running API tests', function() {
  this.timeout(10 * 1000)
  this.slow(1 * 1000)

  // make sure errors are working... don't delete this
  /*it('test http server', function(){
   getUrl('http://google.com/non-existent')
   .then( (resp) => {
   console.log("ALL OK!")
   done()
   })
   })*/

  it('graphic APIs', function() {
    const id = '6ujaprADgsYs2nmNR'
    const name = 'stauzs/tests.graphic'
    return getLocal('/api/asset/png/' + id)
      .then(() => getLocal('/api/asset/png/' + name))
      .then(() => getLocal('/api/asset/fullgraphic/' + name))
      .then(() => getLocal('/api/asset/tileset-info/' + id))
      .then(() => getLocal('/api/asset/tileset/' + id))
      .then(() => getLocal('/api/asset/tileset/' + name))
  })

  it('empty graphic APIs', function() {
    const id = 'Jsngf29oRgiixCCrr'
    const name = 'stauzs/EmptyGraphic'
    return getLocal('/api/asset/png/' + id)
      .then(() => getLocal('/api/asset/png/' + name))
      .then(() => getLocal('/api/asset/fullgraphic/' + name))
      .then(() => getLocal('/api/asset/tileset-info/' + id))
      .then(() => getLocal('/api/asset/tileset/' + id))
      .then(() => getLocal('/api/asset/tileset/' + name))
  })

  it('actor APIs', function() {
    const id = 'sJgraJpnW7oGhsSfB'
    const name = 'stauzs/tests.actor'
    return getLocal('/api/asset/actor/' + id)
      .then(() => getLocal('/api/asset/actor/' + name))
      .then(() => getLocal('/api/asset/fullactor/' + name))
  })
  it('empty actor APIs', function() {
    const id = 'uv3dnMibt3XMLqSnJ'
    const name = 'stauzs/EmptyActor'
    return getLocal('/api/asset/actor/' + id)
      .then(() => getLocal('/api/asset/actor/' + name))
      .then(() => getLocal('/api/asset/fullactor/' + name))
  })

  it('Actor Map APIs', function() {
    // actormaps don't have access by id, but this id matches same asset used to access by name
    // leave it for the sake of clarity
    const id = 'iTbZbw4bwHS9nNL3G'
    const name = 'stauzs/tests.actormap'
    return getLocal('/api/asset/actormap/' + name)
  })
  it('Empty Actor Map APIs', function() {
    // actormaps don't have access by id, but this id matches same asset used to access by name
    // leave it for the sake of clarity
    const id = 'M8Qy75L5xyoYQYeh6'
    const name = 'stauzs/EmptyActorMap'
    return getLocal('/api/asset/actormap/' + name)
  })

  it('Map APIs', function() {
    const id = 'Q2xcLiBntucu7yXqg'
    const name = 'stauzs/test.map'
    return getLocal('/api/asset/map/' + id).then(() => getLocal('/api/asset/map/' + name))
  })
  it('Empty Map APIs', function() {
    const id = 'm4mahsPRYc7WqMKY4'
    const name = 'stauzs/EmptyMap'
    return getLocal('/api/asset/map/' + id).then(() => getLocal('/api/asset/map/' + name))
  })

  it('Sound APIs', function() {
    const id = 'JPvMjMupFwcF274Jb'
    const name = 'stauzs/test.sound'
    return getLocal('/api/asset/sound/' + id + '/sound.mp3').then(() =>
      getLocal('/api/asset/sound/' + name + '/sound.mp3'),
    )
  })
  it('Empty Sound APIs', function() {
    const id = 'Gx5okJiiiaRSRD72h'
    const name = 'stauzs/EmptySound'
    return getLocal('/api/asset/sound/' + id + '/sound.mp3').then(() =>
      getLocal('/api/asset/sound/' + name + '/sound.mp3'),
    )
  })

  it('Music APIs', function() {
    const id = '6FxWLwhdKdAxZiBQh'
    const name = 'stauzs/test.music'
    return getLocal('/api/asset/music/' + id + '/sound.mp3').then(() =>
      getLocal('/api/asset/music/' + name + '/sound.mp3'),
    )
  })
  it('Empty Music APIs', function() {
    const id = '4W79GcHkLBM5BscHo'
    const name = 'stauzs/EmptyMusic'
    return getLocal('/api/asset/music/' + id + '/sound.mp3').then(() =>
      getLocal('/api/asset/music/' + name + '/sound.mp3'),
    )
  })

  it('Code APIs', function() {
    const id = 'thmCHkkryjDDx955d'
    const name = 'stauzs/test.code'
    return getLocal('/api/asset/code/' + id)
      .then(() => getLocal('/api/asset/code/' + name))
      .then(() => getLocal('/api/asset/code/bundle/' + id))
      .then(() => getLocal('/api/asset/code/bundle/cdn/' + id))
      .then(() => getLocal('/api/asset/code/bundle/u/' + name))
      .then(() => getLocal('/api/asset/code/bundle/cdn/u/' + name))
  })
  it('Empty Code APIs', function() {
    const id = 'i8Ax7yotENddRngdW'
    const name = 'stauzs/EmptyCode'
    return getLocal('/api/asset/code/' + id)
      .then(() => getLocal('/api/asset/code/' + name))
      .then(() => getLocal('/api/asset/code/bundle/' + id))
      .then(() => getLocal('/api/asset/code/bundle/cdn/' + id))
      .then(() => getLocal('/api/asset/code/bundle/u/' + name))
      .then(() => getLocal('/api/asset/code/bundle/cdn/u/' + name))
  })

  it('Tutorial APIs', function() {
    const id = 'Lbq3czHhanrawJJfJ'
    const name = 'stauzs/test.tutorial'
    const idLike = 'stauzs:test.tutorial'
    return getLocal('/api/asset/tutorial/' + id).then(() => getLocal('/api/asset/tutorial/' + idLike))
  })
  it('Empty Tutorial APIs', function() {
    const id = 'AHKcgRZBDJDgsL4jT'
    const name = 'stauzs/EmptyTutorial'
    const idLike = 'stauzs:EmptyTutorial'
    return getLocal('/api/asset/tutorial/' + id).then(() => getLocal('/api/asset/tutorial/' + idLike))
  })

  // game config don't have api atm
  /*
   test:
   id: fGDonpqPmFiAtC66k
   name: stauzs/test.gameconfig
   empty:
   id: QWE7Tey7wrgSgDKNc
   name: stauzs/EmptyGameConfig
   */

  it('Common APIs', function() {
    const id = '6ujaprADgsYs2nmNR'
    const name = 'stauzs/tests.graphic'

    return getLocal('/api/asset/' + id)
      .then(() => getLocal('/api/asset/content2/' + id))
      .then(() => getLocal('/api/asset/full/' + name))
      .then(() => getLocal('/api/asset/json/' + id))
      .then(() => getLocal('/api/asset/raw/' + id))
      .then(() => getLocal('/api/asset/id/' + name))
      .then(() => getLocal('/api/asset/thumbnail/png/' + id))
      .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + id))
      .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + name))
      .then(() => getLocal('/api/assets/code/stauzs/'))
  })

  it('Empty Common APIs', function() {
    const id = 'Jsngf29oRgiixCCrr'
    const name = 'stauzs/EmptyGraphic'

    return getLocal('/api/asset/' + id)
      .then(() => getLocal('/api/asset/content2/' + id))
      .then(() => getLocal('/api/asset/full/' + name))
      .then(() => getLocal('/api/asset/json/' + id))
      .then(() => getLocal('/api/asset/raw/' + id))
      .then(() => getLocal('/api/asset/id/' + name))
      .then(() => getLocal('/api/asset/thumbnail/png/' + id))
      .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + id))
      .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + name))
  })
})
