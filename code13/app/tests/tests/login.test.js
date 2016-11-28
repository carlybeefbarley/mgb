/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  var browser;
  describe("Running login tests", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("Logging in", function(done){
      require(path + "procedures/login.js")(browser)(done)
    })

    it("check for console errors", function(done){
      require(path + "procedures/checkConsoleErrors.js")(browser)(done)
    })
  })
}
