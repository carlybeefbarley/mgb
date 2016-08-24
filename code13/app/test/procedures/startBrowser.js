

module.exports = function(browserName, options){
  options = options || {}
  console.log("Creating new Browser!");
  const webdriver = require('selenium-webdriver')
  const By = webdriver.By
  const until = webdriver.until

  const caps = require("../browsers/" + browserName + ".js")

  const capabilities = Object.assign({}, caps.browser, options);
  const browser = new webdriver.Builder().
    usingServer(caps.server).
    withCapabilities(capabilities).
    build();
  browser.get(caps.url);

  // don't forget to close browser when all is done
  const flow = browser.controlFlow()
  const scheduleClose = () => {
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
