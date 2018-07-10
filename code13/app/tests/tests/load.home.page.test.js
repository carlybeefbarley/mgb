/* this is sample test which only tries to log in user */
const SeleniumHelper = require('../helpers/selenium.js')
module.exports = getBrowser => {
  var browser
  describe('Running login tests', function() {
    before(function() {
      browser = getBrowser()
    })
    // all action should be in the "it" block
    it('Main page loaded', function(done) {
      const sel = SeleniumHelper(browser)
      sel.css('#root')
      sel.done(done)
    })
  })
}
