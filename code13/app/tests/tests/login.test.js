/* this is sample test which logs in user */
module.exports = (browser, path, done) => {
  const login = require(path + "procedures/login.js")(browser)

  describe("Running Login tests:", function () {
    it("May pass", function (done) {
      setTimeout(done, 100)
    })
    it("Also May pass", function (done) {
      setTimeout(done, 100)
    })
    it("will sometimes fail", function (done) {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          throw(new Error("Number too big"))
        }
        done();
      }, 100)
    })
  })

  //login(done)
  /*
   it("Login with test user", (done) => {

   })
   */


// this may be useful on failed login
// this one fails on IE as IE don't provide logs
  /*it("Received logs", (done) => {
   // console.error will show in the log
   // browser.executeScript('console.error("Hello, I\'m Error!!")')
   // console.log won't show up
   // browser.executeScript('console.log("Hello, I\'m Simple log!!")')
   const log = browser.manage().logs().get("browser")
   browser.call(done)
   browser.call(() => {
   if (log.value) {
   console.log("Collected logs: ", log.value)
   }
   else {
   console.log("Log was empty")
   }
   })
   })*/

}
