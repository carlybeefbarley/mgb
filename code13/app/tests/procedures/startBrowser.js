const createBrowser = function(browserName, options){
  const webdriver = require('selenium-webdriver')
  const caps = Object.assign(require("../browsers/" + browserName), options)
  const capabilities = caps.browser
  console.log("Starting browser with caps:", caps)
  const browser = new webdriver.Builder().
    usingServer(caps.server).
    withCapabilities(capabilities).
    build()

  browser.get(caps.url).then(() => {
    // clear localStorage - log out user in Meteor
    browser.executeScript('window.localStorage.clear();')
    browser.manage().window().maximize()
  })


  const flow = browser.controlFlow()
  const scheduleClose = () => {
    // there might be other "idle" listeners - so wait 1 sec - to be sure queue is empty
    setTimeout(() => {
      if(flow.isIdle()){
        browser.close()
        browser.quit()
        // TODO (stauzs): is this available from browser?
        browser.hasClosed = true;
      }
      else{
        flow.once("idle", scheduleClose)
      }
    }, 1000)
  };
  flow.once("idle", scheduleClose)
  return browser;
}

module.exports = function create(browserName, options){
  options = options || {}
  return createBrowser(browserName, options)
}
