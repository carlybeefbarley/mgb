const http = require('http')

module.exports = getBrowser => {
  let browser
  const getLocal = uri => {
    return new Promise((res, rej) => {
      const uriToLoad = browser.caps.url + uri
      http.get(uriToLoad, resp => {
        if (resp.statusCode > 399)
          throw new Error(`Response code from: \n${uriToLoad} was ${resp.statusCode} (${resp.statusMessage})`)
        else res()
      })
    })
  }

  describe('Running API test', function() {
    this.timeout(10 * 1000)
    this.slow(1 * 1000)

    before(function() {
      browser = getBrowser()
    })
    // make sure errors are working... don't delete this
    /*it('test http server', function(done){
      getUrl('http://google.com/non-existent')
        .then( (resp) => {
          console.log("ALL OK!")
          done()
        })
    })*/

    it('graphic APIs', function(done) {
      const id = '6ujaprADgsYs2nmNR'
      const name = 'stauzs/tests.graphic'
      getLocal('/api/asset/png/' + id)
        .then(() => getLocal('/api/asset/png/' + name))
        .then(() => getLocal('/api/asset/fullgraphic/' + name))
        .then(() => getLocal('/api/asset/tileset-info/' + id))
        .then(() => getLocal('/api/asset/tileset/' + id))
        .then(() => getLocal('/api/asset/tileset/' + name))
        .then(done)
    })
    it('empty graphic APIs', function(done) {
      const id = 'Jsngf29oRgiixCCrr'
      const name = 'stauzs/EmptyGraphic'
      getLocal('/api/asset/png/' + id)
        .then(() => getLocal('/api/asset/png/' + name))
        .then(() => getLocal('/api/asset/fullgraphic/' + name))
        .then(() => getLocal('/api/asset/tileset-info/' + id))
        .then(() => getLocal('/api/asset/tileset/' + id))
        .then(() => getLocal('/api/asset/tileset/' + name))
        .then(done)
    })

    it('actor APIs', function(done) {
      const id = 'sJgraJpnW7oGhsSfB'
      const name = 'stauzs/tests.actor'
      getLocal('/api/asset/actor/' + id)
        .then(() => getLocal('/api/asset/actor/' + name))
        .then(() => getLocal('/api/asset/fullactor/' + name))
        .then(done)
    })
    it('empty actor APIs', function(done) {
      const id = 'uv3dnMibt3XMLqSnJ'
      const name = 'stauzs/EmptyActor'
      getLocal('/api/asset/actor/' + id)
        .then(() => getLocal('/api/asset/actor/' + name))
        .then(() => getLocal('/api/asset/fullactor/' + name))
        .then(done)
    })

    it('Actor Map APIs', function(done) {
      // actormaps don't have access by id, but this id matches same asset used to access by name
      // leave it for the sake of clarity
      const id = 'iTbZbw4bwHS9nNL3G'
      const name = 'stauzs/tests.actormap'
      getLocal('/api/asset/actormap/' + name).then(done)
    })
    it('Empty Actor Map APIs', function(done) {
      // actormaps don't have access by id, but this id matches same asset used to access by name
      // leave it for the sake of clarity
      const id = 'M8Qy75L5xyoYQYeh6'
      const name = 'stauzs/EmptyActorMap'
      getLocal('/api/asset/actormap/' + name).then(done)
    })

    it('Map APIs', function(done) {
      const id = 'Q2xcLiBntucu7yXqg'
      const name = 'stauzs/test.map'
      getLocal('/api/asset/map/' + id).then(() => getLocal('/api/asset/map/' + name)).then(done)
    })
    it('Empty Map APIs', function(done) {
      const id = 'm4mahsPRYc7WqMKY4'
      const name = 'stauzs/EmptyMap'
      getLocal('/api/asset/map/' + id).then(() => getLocal('/api/asset/map/' + name)).then(done)
    })

    it('Sound APIs', function(done) {
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if (browser.caps.browser.browserName === 'chrome') {
        done()
        return
      }
      const id = 'JPvMjMupFwcF274Jb'
      const name = 'stauzs/test.sound'
      getLocal('/api/asset/sound/' + id + '/sound.mp3')
        .then(() => getLocal('/api/asset/sound/' + name + '/sound.mp3'))
        .then(done)
    })
    it('Empty Sound APIs', function(done) {
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if (browser.caps.browser.browserName === 'chrome') {
        done()
        return
      }
      const id = 'Gx5okJiiiaRSRD72h'
      const name = 'stauzs/EmptySound'
      getLocal('/api/asset/sound/' + id + '/sound.mp3')
        .then(() => getLocal('/api/asset/sound/' + name + '/sound.mp3'))
        .then(done)
    })

    it('Music APIs', function(done) {
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if (browser.caps.browser.browserName === 'chrome') {
        done()
        return
      }
      const id = '6FxWLwhdKdAxZiBQh'
      const name = 'stauzs/test.music'
      getLocal('/api/asset/music/' + id + '/sound.mp3')
        .then(() => getLocal('/api/asset/music/' + name + '/sound.mp3'))
        .then(done)
    })
    it('Empty Music APIs', function(done) {
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if (browser.caps.browser.browserName === 'chrome') {
        done()
        return
      }
      const id = '4W79GcHkLBM5BscHo'
      const name = 'stauzs/EmptyMusic'
      getLocal('/api/asset/music/' + id + '/sound.mp3')
        .then(() => getLocal('/api/asset/music/' + name + '/sound.mp3'))
        .then(done)
    })

    it('Code APIs', function(done) {
      const id = 'thmCHkkryjDDx955d'
      const name = 'stauzs/test.code'
      getLocal('/api/asset/code/' + id)
        .then(() => getLocal('/api/asset/code/' + name))
        .then(() => getLocal('/api/asset/code/bundle/' + id))
        .then(() => getLocal('/api/asset/code/bundle/cdn/' + id))
        .then(() => getLocal('/api/asset/code/bundle/u/' + name))
        .then(() => getLocal('/api/asset/code/bundle/cdn/u/' + name))
        .then(done)
    })
    it('Empty Code APIs', function(done) {
      const id = 'i8Ax7yotENddRngdW'
      const name = 'stauzs/EmptyCode'
      getLocal('/api/asset/code/' + id)
        .then(() => getLocal('/api/asset/code/' + name))
        .then(() => getLocal('/api/asset/code/bundle/' + id))
        .then(() => getLocal('/api/asset/code/bundle/cdn/' + id))
        .then(() => getLocal('/api/asset/code/bundle/u/' + name))
        .then(() => getLocal('/api/asset/code/bundle/cdn/u/' + name))
        .then(done)
    })

    it('Tutorial APIs', function(done) {
      const id = 'Lbq3czHhanrawJJfJ'
      const name = 'stauzs/test.tutorial'
      const idLike = 'stauzs:test.tutorial'
      getLocal('/api/asset/tutorial/' + id).then(() => getLocal('/api/asset/tutorial/' + idLike)).then(done)
    })
    it('Empty Tutorial APIs', function(done) {
      const id = 'AHKcgRZBDJDgsL4jT'
      const name = 'stauzs/EmptyTutorial'
      const idLike = 'stauzs:EmptyTutorial'
      getLocal('/api/asset/tutorial/' + id).then(() => getLocal('/api/asset/tutorial/' + idLike)).then(done)
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

    it('Common APIs', function(done) {
      const id = '6ujaprADgsYs2nmNR'
      const name = 'stauzs/tests.graphic'

      getLocal('/api/asset/' + id)
        .then(() => getLocal('/api/asset/content2/' + id))
        .then(() => getLocal('/api/asset/full/' + name))
        .then(() => getLocal('/api/asset/json/' + id))
        .then(() => getLocal('/api/asset/raw/' + id))
        .then(() => getLocal('/api/asset/id/' + name))
        .then(() => getLocal('/api/asset/thumbnail/png/' + id))
        .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + id))
        .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + name))
        .then(() => getLocal('/api/assets/code/stauzs/'))
        .then(done)
    })

    it('Empty Common APIs', function(done) {
      const id = 'Jsngf29oRgiixCCrr'
      const name = 'stauzs/EmptyGraphic'

      getLocal('/api/asset/' + id)
        .then(() => getLocal('/api/asset/content2/' + id))
        .then(() => getLocal('/api/asset/full/' + name))
        .then(() => getLocal('/api/asset/json/' + id))
        .then(() => getLocal('/api/asset/raw/' + id))
        .then(() => getLocal('/api/asset/id/' + name))
        .then(() => getLocal('/api/asset/thumbnail/png/' + id))
        .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + id))
        .then(() => getLocal('/api/asset/cached-thumbnail/png/5/' + name))
        .then(done)
    })
  })
}
