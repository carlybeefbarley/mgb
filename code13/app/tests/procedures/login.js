const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

//const By = webdriver.By
//const until = webdriver.until
const SeleniumHelper = require("../helpers/selenium.js")


const buttons = {
  // if avatar is visible login will be threated as successful
  avatar: '#mgbjr-np-user',
  login: '#mgbjr-np-login',
  submitLoginForm: 'form button.ui.button'
}

const inputs = {
  email: "input[name=email]",
  password: "input[name=password]"
}

module.exports = (browser) => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return (done) => {
    // wait for React root element
    sel.css("#root")

    // already logged in ?
    sel.exists(buttons.avatar, (e, found) => {
      if (found) {
        sel.done(done)
        return
      }

      sel.css(buttons.login).click()

      sel.css(inputs.email).sendKeys('tester@example.com')
      // sel.css(inputs.password).sendKeys('tester1')

      // login with ENTER key
      sel.css(inputs.password).sendKeys('tester1', Key.ENTER);
      // login with click on the submit button
      // sel.css(buttons.submitLoginForm).click()


      sel.exists(buttons.avatar, e => {
        if (e) {
          throw(e)
        }
        sel.done(done)
      })
    })
  }
}
