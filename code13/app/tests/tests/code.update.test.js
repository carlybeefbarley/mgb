/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  let browser;
  describe("Running code update test", function(){
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

    it("Modifying Code and checking bundle for modified code", function(done){
      require(path + "procedures/code.update.response.js")(browser)(done)
    })

    it("Remove Code and clean up", function(done){
      require(path + "procedures/deleteAsset.js")(browser)(done)
    })
  })
}
