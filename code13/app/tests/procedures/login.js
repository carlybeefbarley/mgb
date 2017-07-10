const webdriver = require('selenium-webdriver')
const Key = webdriver.Key

//const By = webdriver.By
//const until = webdriver.until
const SeleniumHelper = require('../helpers/selenium.js')

const EMAIL = 'tester@example.com'
const PASSWORD = 'tester1'

const buttons = {
  // if avatar is visible login will be threated as successful
  avatar: '#mgbjr-np-user-avatar',
  login: '#mgbjr-np-login',
  submitLoginForm: 'form button.ui.button',
}

const inputs = {
  email: 'input[name=email]',
  password: 'input[name=password]',
}

module.exports = browser => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return done => {
    // wait for React root element
    sel.css('#root')
    console.log('ROOT selected!')
    // already logged in ?
    sel.exists(buttons.avatar, (e, found) => {
      if (found) {
        console.log('Already logged in!')
        sel.done(done)
        return
      }
      console.log('Trying to log in..!')
      // and check again - just in case we are logged in already
      sel.css(buttons.login).click()
      // clear input - because chrome tends to save forms
      const email = sel.css(inputs.email)
      email.sendKeys(EMAIL)

      // login with ENTER key
      const password = sel.css(inputs.password)
      password.sendKeys(PASSWORD, Key.ENTER)

      // OR login with click on the submit button
      // password.sendKeys(PASSWORD)
      // sel.css(buttons.submitLoginForm).click()
      //sel.wait(100)
      //sel.takeScreenShot('scr/isLogged.png')

      sel.untilVisible(buttons.avatar, 3000)
      sel.exists(buttons.avatar, e => {
        if (e) {
          console.log('LOGIN FAILED!', e)
          sel.takeScreenShot('scr/NOTLoggedIn.png', () => {
            throw e
          })
          sel.done(done)
          return
        }
        sel.takeScreenShot('scr/LoggedIn.png')
        sel.done(done)
      })
    })
  }
}
