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

describe("Connecting to selenium server", function() {
  // allow max execution time 60 secs ( default - 2 - is not enought to get connected to BrowserStack and do the tests)
  this.timeout(120000)
  // TODO: check args and replace "default"
  let browser, login;
  afterEach(() => {
    // TODO: check if browser has closed..
  })
  it("Should create new browser", (done) => {
    browser = BrowserFactory(browserName)
    login = npm.require(r + "procedures/login.js")(browser)
    browser.call(done)
  })

  it("Should Login with test user", (done) => {
    login(done)
  })

  // this may be useful on failed login
  // this one fails on IE as IE don't provide logs
  it("Should receive logs", function (done) {
    // console.error will show in the log
    // browser.executeScript('console.error("Hello, I\'m Error!!")')
    // console.log won't show up
    // browser.executeScript('console.log("Hello, I\'m Simple log!!")')
    const logs = browser.manage().logs().get("browser")
    browser.call(done)
    browser.call(() => {
      if (logs.value) {
        console.log("Collected logs: ", logs.value)
      }
      else{
        console.log("Logs was empty")
      }
    })
  })
})
