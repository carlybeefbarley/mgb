/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  var browser;
  describe("Running login tests", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("Logging in", function(done){
      const login = require(path + "procedures/login.js")(browser)
      login(done)
    })
  })
}
