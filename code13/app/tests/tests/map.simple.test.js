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

    it("Creating Map Asset", function(done){
      require(path + "procedures/createAsset.js")(browser)("map", done)
    })

    it("Editing Map Asset", function(done){
      require(path + "procedures/editMap.js")(browser)(done)
    })

    it("Remove Map - clean up", function(done){
      require(path + "procedures/deleteAsset.js")(browser)(done)
    })

  })
}
