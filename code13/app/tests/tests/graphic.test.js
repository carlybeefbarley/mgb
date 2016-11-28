/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  let browser;
  describe("Running code bundler tests", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("Logging in", function(done){
      const login = require(path + "procedures/login.js")(browser)
      login(done)
    })

    it("Creating Graphic Asset", function(done){
      require(path + "procedures/createAsset.js")(browser)("graphic", done)
    })

    it("Drawing image", function(done){
      require(path + "procedures/drawGraphic.js")(browser)(done)
    })

    // this should be called from edit asset page
    it("Remove Graphic - clean up", function(done){
      require(path + "procedures/deleteAsset.js")(browser)(done)
    })

    it("check for console errors", function(done){
      require(path + "procedures/checkConsoleErrors.js")(browser)(done)
    })
  })
}
