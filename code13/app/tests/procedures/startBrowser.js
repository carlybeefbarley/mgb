const createBrowser = function(browserName, options) {
  const webdriver = require('selenium-webdriver')
  const caps = Object.assign(require('../browsers/' + browserName), options)
  const capabilities = caps.browser
  const browser = new webdriver.Builder()
    .usingServer(caps.server)
    .withCapabilities(capabilities)
    .build()

  browser.loadHomePage = () => {
    return browser.get(caps.url)
  }
  browser.getLocal = uri => {
    return browser.get(caps.url + uri)
  }
  browser.caps = caps
  // most common based on wikipedia 1366x768
  browser
    .manage()
    .window()
    .setSize(1366, 768)

  console.log(`Starting browser: ${browserName} with caps:`, caps)
  return browser
}

module.exports = function create(browserName, options) {
  options = options || {}
  return createBrowser(browserName, options)
}
