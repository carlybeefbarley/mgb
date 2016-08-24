// from this file all the magic will begin

const browserName = "safari"
console.log("Testing with browser:", browserName)
const r = process.env.PWD + "/test/";
let npm;
// hack for meteor Npm.require
try {npm = Npm}catch(e){
  npm = {require: require}
}
const BrowserFactory = npm.require(r + "procedures/startBrowser.js");

describe("Connecting to selenium server (this might take few minutes)", function() {
  // allow max execution time 60 secs ( default - 2 - is not enought to get connected to BrowserStack and do the tests)
  this.timeout(120000)
  // TODO: check args and replace "default"
  let browser, login;
  afterEach(() => {
    // TODO: check if browser has closed..
  })
  it("Created new browser [" + browserName + "]", (done) => {
    browser = BrowserFactory(browserName)
    // TODO: login is sort of test by itself
    login = npm.require(r + "procedures/login.js")(browser)
    browser.call(done)
  })

  it("Login with test user", (done) => {
    login(done)
  })

  // this may be useful on failed login
  // this one fails on IE as IE don't provide logs
  it("Received logs", (done) => {
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
      else{
        console.log("Log was empty")
      }
    })
  })
})
