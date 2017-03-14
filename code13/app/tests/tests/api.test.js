module.exports = (getBrowser) => {
  let browser;
  describe("Running API test", function(){
    this.timeout(10 * 1000)
    this.slow(1 * 1000)
    before(function(){
      browser = getBrowser()
    })

    it("graphic APIs", function(done){
      const id = '6ujaprADgsYs2nmNR'
      const name = 'stauzs/tests.graphic'
      browser.getLocal('/api/asset/png/' + id)
        .then(() => browser.getLocal('/api/asset/png/' + name))
        .then(() => browser.getLocal('/api/asset/fullgraphic/' + name))
        .then(() => browser.getLocal('/api/asset/tileset-info/' + id))
        .then(() => browser.getLocal('/api/asset/tileset/' + id))
        .then(() => browser.getLocal('/api/asset/tileset/' + name))
        .then(done)
    })
    it("empty graphic APIs", function(done){
      const id = 'Jsngf29oRgiixCCrr'
      const name = 'stauzs/EmptyGraphic'
      browser.getLocal('/api/asset/png/' + id)
        .then(() => browser.getLocal('/api/asset/png/' + name))
        .then(() => browser.getLocal('/api/asset/fullgraphic/' + name))
        .then(() => browser.getLocal('/api/asset/tileset-info/' + id))
        .then(() => browser.getLocal('/api/asset/tileset/' + id))
        .then(() => browser.getLocal('/api/asset/tileset/' + name))
        .then(done)
    })


    it("actor APIs", function(done){
      const id = 'sJgraJpnW7oGhsSfB'
      const name = 'stauzs/tests.actor'
      browser.getLocal('/api/asset/actor/' + id)
        .then(() => browser.getLocal('/api/asset/actor/' + name))
        .then(() => browser.getLocal('/api/asset/fullactor/' + name))
        .then(done)
    })
    it("empty actor APIs", function(done){
      const id = 'uv3dnMibt3XMLqSnJ'
      const name = 'stauzs/EmptyActor'
      browser.getLocal('/api/asset/actor/' + id)
        .then(() => browser.getLocal('/api/asset/actor/' + name))
        .then(() => browser.getLocal('/api/asset/fullactor/' + name))
        .then(done)
    })


    it("Actor Map APIs", function(done){
      const id = 'iTbZbw4bwHS9nNL3G'
      const name = 'stauzs/test.actormap'
      browser.getLocal('/api/asset/actormap/' + name)
        .then(done)
    })
    it("Empty Actor Map APIs", function(done){
      const id = 'M8Qy75L5xyoYQYeh6'
      const name = 'stauzs/EmptyActorMap'
      browser.getLocal('/api/asset/actormap/' + name)
        .then(done)
    })


    it("Map APIs", function(done){
      const id = 'Q2xcLiBntucu7yXqg'
      const name = 'stauzs/test.map'
      browser.getLocal('/api/asset/map/' + id)
        .then(() => browser.getLocal('/api/asset/map/' + name))
        .then(done)
    })
    it("Empty Map APIs", function(done){
      const id = 'm4mahsPRYc7WqMKY4'
      const name = 'stauzs/EmptyMap'
      browser.getLocal('/api/asset/map/' + id)
        .then(() => browser.getLocal('/api/asset/map/' + name))
        .then(done)
    })


    it("Sound APIs", function(done){
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if(browser.caps.browser.browserName == 'chrome'){
        done()
        return
      }
      const id = 'JPvMjMupFwcF274Jb'
      const name = 'stauzs/test.sound'
      browser.getLocal('/api/asset/sound/' + id + '/sound.mp3')
        .then(() => browser.getLocal('/api/asset/sound/' + name + '/sound.mp3'))
        .then(done)
    })
    it("Empty Sound APIs", function(done){
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if(browser.caps.browser.browserName == 'chrome'){
        done()
        return
      }
      const id = 'Gx5okJiiiaRSRD72h'
      const name = 'stauzs/EmptySound'
      browser.getLocal('/api/asset/sound/' + id + '/sound.mp3')
        .then(() => browser.getLocal('/api/asset/sound/' + name + '/sound.mp3'))
        .then(done)
    })


    it("Music APIs", function(done){
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if(browser.caps.browser.browserName == 'chrome'){
        done()
        return
      }
      const id = '6FxWLwhdKdAxZiBQh'
      const name = 'stauzs/test.music'
      browser.getLocal('/api/asset/music/' + id + '/sound.mp3')
        .then(() => browser.getLocal('/api/asset/music/' + name + '/sound.mp3'))
        .then(done)
    })
    it("Empty Music APIs", function(done){
      // sound tests fails on chrome - because auto-play - seems like a bug in the selenium
      if(browser.caps.browser.browserName == 'chrome'){
        done()
        return
      }
      const id = '4W79GcHkLBM5BscHo'
      const name = 'stauzs/EmptyMusic'
      browser.getLocal('/api/asset/music/' + id + '/sound.mp3')
        .then(() => browser.getLocal('/api/asset/music/' + name + '/sound.mp3'))
        .then(done)
    })


    it("Code APIs", function(done){
      const id = 'thmCHkkryjDDx955d'
      const name = 'stauzs/test.code'
      browser.getLocal('/api/asset/code/' + id)
        .then(() => browser.getLocal('/api/asset/code/' + name))
        .then(() => browser.getLocal('/api/asset/code/bundle/' + id))
        .then(() => browser.getLocal('/api/asset/code/bundle/cdn/' + id))
        .then(() => browser.getLocal('/api/asset/code/bundle/u/' + name))
        .then(() => browser.getLocal('/api/asset/code/bundle/cdn/u/' + name))
        .then(done)
    })
    it("Empty Code APIs", function(done){
      const id = 'i8Ax7yotENddRngdW'
      const name = 'stauzs/EmptyCode'
      browser.getLocal('/api/asset/code/' + id)
        .then(() => browser.getLocal('/api/asset/code/' + name))
        .then(() => browser.getLocal('/api/asset/code/bundle/' + id))
        .then(() => browser.getLocal('/api/asset/code/bundle/cdn/' + id))
        .then(() => browser.getLocal('/api/asset/code/bundle/u/' + name))
        .then(() => browser.getLocal('/api/asset/code/bundle/cdn/u/' + name))
        .then(done)
    })


    it("Tutorial APIs", function(done){
      const id = 'Lbq3czHhanrawJJfJ'
      const name = 'stauzs/test.tutorial'
      const idLike = 'stauzs:test.tutorial'
      browser.getLocal('/api/asset/tutorial/' + id)
        .then(() => browser.getLocal('/api/asset/tutorial/' + idLike))
        .then(done)
    })
    it("Empty Tutorial APIs", function(done){
      const id = 'AHKcgRZBDJDgsL4jT'
      const name = 'stauzs/EmptyTutorial'
      const idLike = 'stauzs:EmptyTutorial'
      browser.getLocal('/api/asset/tutorial/' + id)
        .then(() => browser.getLocal('/api/asset/tutorial/' + idLike))
        .then(done)
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


    it("Common APIs", function(done){
      const id = '6ujaprADgsYs2nmNR'
      const name = 'stauzs/tests.graphic'

      browser.getLocal('/api/asset/' + id)
        .then(() => browser.getLocal('/api/asset/content2/' + id))
        .then(() => browser.getLocal('/api/asset/full/' + name))
        .then(() => browser.getLocal('/api/asset/json/' + id))
        .then(() => browser.getLocal('/api/asset/raw/' + id))
        .then(() => browser.getLocal('/api/asset/id/' + name))
        .then(() => browser.getLocal('/api/asset/thumbnail/png/' + id))
        .then(() => browser.getLocal('/api/asset/cached-thumbnail/png/5/' + id))
        .then(() => browser.getLocal('/api/asset/cached-thumbnail/png/5/' + name))
        .then(() => browser.getLocal('/api/assets/code/stauzs/'))
        .then(done)
    })

    it("Empty Common APIs", function(done){
      const id = 'Jsngf29oRgiixCCrr'
      const name = 'stauzs/EmptyGraphic'

      browser.getLocal('/api/asset/' + id)
        .then(() => browser.getLocal('/api/asset/content2/' + id))
        .then(() => browser.getLocal('/api/asset/full/' + name))
        .then(() => browser.getLocal('/api/asset/json/' + id))
        .then(() => browser.getLocal('/api/asset/raw/' + id))
        .then(() => browser.getLocal('/api/asset/id/' + name))
        .then(() => browser.getLocal('/api/asset/thumbnail/png/' + id))
        .then(() => browser.getLocal('/api/asset/cached-thumbnail/png/5/' + id))
        .then(() => browser.getLocal('/api/asset/cached-thumbnail/png/5/' + name))
        .then(done)
    })
  })
}
