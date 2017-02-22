/* this is sample test which only tries to log in user */
module.exports = (getBrowser, path) => {
  let browser;
  describe("Adjust Settings", function(){
    before(function(){
      browser = getBrowser();
    })
    // all action should be in the "it" block
    it("Logging in", function(done){
      require(path + "procedures/login.js")(browser)(done)
    })

    it("Adjust Settings", function(done){
      require(path + "procedures/adjustSettings.js")(browser)(done)
    })

  })
}
