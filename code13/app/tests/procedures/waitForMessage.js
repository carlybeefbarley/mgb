const webdriver = require('selenium-webdriver')
const until = webdriver.until

const error = () => {
  throw new Error('Failed to get message')
}
module.exports = browser => {
  return (expectedMessage, done) => {
    browser
      .wait(until.alertIsPresent(), 10000)
      .then(() => {
        return browser.switchTo().alert()
      }, error)
      .then(alert => {
        const text = alert.getText()
        alert.accept()
        return text
      }, error)
      .then(text => {
        console.log('GOT text from alert', text)
        if (text !== expectedMessage) {
          throw new Error(`Expected: '${expectedMessage}' - got: '${text}'`)
        }
        done()
      }, error)
  }
}
