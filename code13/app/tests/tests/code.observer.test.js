/*
 in this test we will open code page with many observers - and just wait
 test fails on any JS error
 */
const SeleniumHelper = require('../helpers/selenium.js')
module.exports = getBrowser => {
  let browser
  describe('Running code update test', function() {
    before(function() {
      browser = getBrowser()
    })

    it('Logging in', function(done) {
      require(__dirname + '/../procedures/login.js')(browser)(done)
    })

    it('Loading: test code page', function(done) {
      require(__dirname + '/../procedures/loadPageAndRunCode.js')(browser)(
        '/u/stauzs/asset/oe7yigXkw6Qfs4Jkc?_fp=assets',
        done,
      )
    })

    it('Hanging out in the code page', function(done) {
      this.timeout(60 * 10 * 1000)
      const sel = SeleniumHelper(browser)
      // 5 minutes is this enough
      sel.wait(60 * 5 * 1000).then(done)
    })
  })
}
