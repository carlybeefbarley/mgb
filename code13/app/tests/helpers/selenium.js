const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until
// this is for easier css selectors
// TODO: add xpath etc..
module.exports = (browser) => {
  return {
    css: (rule, timeout ) => {
      // css: (rule, timeout = 30000) => {
      // meteor should update node :)
      timeout = timeout == void(0) ? 30000 : timeout
      return browser.wait(until.elementLocated(By.css(rule)), timeout)
    }
  }
}
