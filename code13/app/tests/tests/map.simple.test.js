/* this is sample test which only tries to log in user */
module.exports = getBrowser => {
  let browser
  describe('Running code bundler tests', function() {
    before(function() {
      browser = getBrowser()
    })
    // all action should be in the "it" block
    it('Logging in', function(done) {
      const login = require(__dirname + '/../procedures/login.js')(browser)
      login(done)
    })

    it('Creating Map Asset', function(done) {
      require(__dirname + '/../procedures/createAsset.js')(browser)('map', done)
    })

    it('Editing Map Asset', function(done) {
      require(__dirname + '/../procedures/editMap.js')(browser)(done)
    })

    it('Remove Map - clean up', function(done) {
      require(__dirname + '/../procedures/deleteAsset.js')(browser)(done)
    })
  })
}
