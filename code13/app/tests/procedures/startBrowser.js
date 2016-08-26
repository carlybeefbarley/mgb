module.exports = function(browserName, options){
  options = options || {}
  const webdriver = require('selenium-webdriver')
  const caps = require("../browsers/" + browserName)

  const capabilities = Object.assign({}, caps.browser, options);
  const browser = new webdriver.Builder().
    usingServer(caps.server).
    withCapabilities(capabilities).
    build();
  browser.get(caps.url);

  // don't forget to close browser when all is done
  const flow = browser.controlFlow()
  const scheduleClose = () => {
    // there might be other "idle" listeners - so wait 1 sec - to be sure queue is empty
    setTimeout(() => {
      if(flow.isIdle()){
        console.log("all DONE!");
        browser.close()
      }
      else{
        flow.once("idle", scheduleClose)
      }
    }, 1000)
  };
  flow.once("idle", scheduleClose)

  return browser;
}
