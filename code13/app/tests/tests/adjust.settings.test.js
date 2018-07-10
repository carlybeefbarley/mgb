/* this is sample test which only tries to log in user */
module.exports = getBrowser => {
  let browser
  describe('Adjust Settings', function() {
    before(function() {
      browser = getBrowser()
    })
    // all action should be in the "it" block
    it('Logging in', function(done) {
      require(__dirname + '/../procedures/login.js')(browser)(done)
    })

    it('Adjust Settings', function(done) {
      require(__dirname + '/../procedures/adjustSettings.js')(browser)(done)
    })
  })
}
