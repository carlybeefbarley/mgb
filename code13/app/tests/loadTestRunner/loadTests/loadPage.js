// load basic test case
const test = require('../../tests/loadPage.test')
const browser = global.browser
// provide global browser to basic test case
describe("Preparing: ", function(){

  it("Waiting for browser to be ready", (done) => {
    console.log("Waiting for browser")
    browser.controlFlow().once("idle", done)
  })

  it("Loading main page", done => {
    browser.loadHomePage().then(() => {
      done()
    })
  })

  it("Cleaning up and closing browser", done => {
    browser.executeScript('try{window.localStorage.clear(); window.location.reload();}catch(e){}').then(() => {
       browser.close()
       browser.quit()
      done()
    })

  })


})

