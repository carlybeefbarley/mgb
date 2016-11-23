const createBrowser = function(browserName, options){
  const webdriver = require('selenium-webdriver')
  const caps = require("../browsers/" + browserName)
  const capabilities = Object.assign({}, caps.browser, options);

  const browser = new webdriver.Builder().
    usingServer(caps.server).
    withCapabilities(capabilities).
    build();
  browser.get(caps.url);

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
