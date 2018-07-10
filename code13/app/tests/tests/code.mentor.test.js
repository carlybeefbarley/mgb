/* this is sample test which only tries to log in user */
module.exports = getBrowser => {
  let browser
  describe('Running code mentor tests', function() {
    before(function() {
      browser = getBrowser()
    })
    // all action should be in the "it" block
    it('Logging in', function(done) {
      const login = require(__dirname + '/../procedures/login.js')(browser)
      login(done)
    })

    it('Creating Code Asset', function(done) {
      require(__dirname + '/../procedures/createAsset.js')(browser)('code', done)
    })

    it('Modifying Code', function(done) {
      require(__dirname + '/../procedures/checkCodeMentor.js')(browser)(done)
    })

    it('Remove Code - clean up', function(done) {
      require(__dirname + '/../procedures/deleteAsset.js')(browser)(done)
    })
  })
}
