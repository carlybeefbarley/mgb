/*
in this test we will open pages and will run code - test fails on any JS error
 */
module.exports = getBrowser => {
  let browser
  describe('Running code update test', function() {
    before(function() {
      browser = getBrowser()
    })

    // import test manual / page
    it('Loading: import self test page', function(done) {
      require(__dirname + '/../procedures/loadPageAndRunCode.js')(browser)(
        '/u/stauzs/asset/hwqvbn8fyk729sKLE?_fp=assets',
        done,
      )
    })

    // react MASTERMIND import page
    it('Loading: react MASTERMIND import page', function(done) {
      require(__dirname + '/../procedures/loadPageAndRunCode.js')(browser)(
        '/u/dgolds/asset/7F3pM2HZHYPSr9Ra6?_fp=assets',
        done,
      )
    })

    // 1kjs page - mini platformer
    it('Loading: 1kjs page - mini platformer', function(done) {
      require(__dirname + '/../procedures/loadPageAndRunCode.js')(browser)(
        '/u/!vault/asset/hg9RfWBiRTfFb8iBj?_fp=assets',
        done,
      )
    })
  })
}
