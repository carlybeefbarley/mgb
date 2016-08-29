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
        console.log("all DONE!");
        browser.close()
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
  const browser = createBrowser(browserName, options)
  return browser;
  /*
  TODO (stauzs): meteor doesn't support Proxy Object - but it's necessary to recreate browser after it closes (as meteor are caching test cases)
  Proxy isn't required for mocha - as it collects all tests, runs, and exits
  let browser;
  const P = (typeof Proxy !== "function") ? function(t, n){return Proxy.create(t, n)} : Proxy;

  return new P({}, {
    get: function(target, name){
      if(browser.hasClosed == true){
        browser = createBrowser(browserName, options)
      }
      return browser[name]
    }
  });*/
}
