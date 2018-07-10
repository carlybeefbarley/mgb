/* this is sample test which only tries to log in user */
module.exports = getBrowser => {
  let browser
  describe('Running Graphics tests', function() {
    before(function() {
      browser = getBrowser()
    })
    // all action should be in the "it" block
    it('Logging in', function(done) {
      const login = require(__dirname + '/../procedures/login.js')(browser)
      login(done)
    })

    it('Creating Graphic Asset', function(done) {
      require(__dirname + '/../procedures/createAsset.js')(browser)('graphic', done)
    })

    it('Drawing image', function(done) {
      require(__dirname + '/../procedures/drawGraphic.js')(browser)(done)
    })

    it('Remove Graphic - clean up', function(done) {
      require(__dirname + '/../procedures/deleteAsset.js')(browser)(done)
    })
  })
}
