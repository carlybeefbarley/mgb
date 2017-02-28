const createBrowser = function(browserName, options){
  const webdriver = require('selenium-webdriver')
  const caps = Object.assign(require("../browsers/" + browserName), options)
  const capabilities = caps.browser
  const browser = new webdriver.Builder().
    usingServer(caps.server).
    withCapabilities(capabilities).
    build()

  browser.loadHomePage = () => {
    return browser.get(caps.url)
  }
  // most common based on wikipedia 1366x768
  browser.manage().window().setSize(1366, 768)


  const flow = browser.controlFlow()
  const scheduleClose = () => {
    // there might be other "idle" listeners - so wait 1 sec - to be sure queue is empty
    setTimeout(() => {
      if(flow.isIdle()){
        console.log("CLOSING BROWSER!!!")
        browser.close()
        browser.quit()
        // TODO (stauzs): is this available from browser?
        browser.hasClosed = true;
      }
      else{
        flow.once("idle", scheduleClose)
      }
    }, 50)
  }
  scheduleClose()
  return browser
}

module.exports = function create(browserName, options){
  options = options || {}
  return createBrowser(browserName, options)
}
