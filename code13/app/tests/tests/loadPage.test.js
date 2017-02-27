/* this is sample test which only tries to log in user */
const SeleniumHelper = require("../helpers/selenium.js")
module.exports = (getBrowser, path) => {
  var browser;
  describe("Running login tests", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("PageLoaded?", function(done){
      const sel = SeleniumHelper(browser)
      sel.css("#root")
      sel.done(done)
    })
  })
}

if(global.browser) {
  console.log("Running test directly")
  module.exports(() => global.browser, '../')
}
