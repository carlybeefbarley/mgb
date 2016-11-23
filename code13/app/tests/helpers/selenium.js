const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until
// this is for easier css selectors
// TODO: add xpath etc..
module.exports = (browser) => {
  return {
    css: (rule, timeout ) => {
      timeout = timeout == void(0) ? 10000 : timeout
      return browser.wait(until.elementLocated(By.css(rule)), timeout)
    },
    exists: (rule, callback) => {
      console.log("checking if exists")
      const p = browser.findElements(By.css(rule))
      p.then((found) => {
        console.log("check - done")
        callback(null, !!found.length)
      })
      .catch((e) => {
        callback(e)
      })
    },
    getUri: () => {
      browser.executeAsyncScript("")
    }
  }
}
