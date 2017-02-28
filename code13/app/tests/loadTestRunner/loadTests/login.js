// load basic test case
const testToRun = require('../../tests/login.test')
const browser = global.browser
// provide global browser to basic test case
describe("Preparing: ", function(){

  it("Waiting for browser to be ready", (done) => {
    console.log("Waiting for browser")
    browser.controlFlow().once("idle", done)

    browser.loadHomePage().then(() => {
      testToRun(() => browser, '../')
    })
  })

  it("Clearing localStorage", done => {
    browser.executeScript('try{window.localStorage.clear(); window.location.reload();}catch(e){}').then(done)
  })


})
