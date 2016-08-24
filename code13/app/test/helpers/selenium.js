const webdriver = require('selenium-webdriver')
const By = webdriver.By
const until = webdriver.until

module.exports = (browser) => {
  return {
    // meteor should update node
    // css: (rule, timeout = 30000) => {
    css: (rule, timeout ) => {
      timeout = timeout == void(0) ? 30000 : timeout
      return browser.wait(until.elementLocated(By.css(rule)), timeout)
    }
  }
}
