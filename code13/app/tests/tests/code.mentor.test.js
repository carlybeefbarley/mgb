/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  let browser;
  describe("Running code mentor tests", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("Logging in", function(done){
      const login = require(path + "procedures/login.js")(browser)
      login(done)
    })

    it("Creating Code Asset", function(done){
      require(path + "procedures/createAsset.js")(browser)("code", done)
    })

    it("Modifying Code", function(done){
      require(path + "procedures/checkCodeMentor.js")(browser)(done)
    })

    it("Remove Code - clean up", function(done){
      require(path + "procedures/deleteAsset.js")(browser)(done)
    })

    it("check for console errors", function(done){
      require(path + "procedures/checkConsoleErrors.js")(browser)(done)
    })
  })
}
