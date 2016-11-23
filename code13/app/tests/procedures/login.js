const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

//const By = webdriver.By
//const until = webdriver.until
const SeleniumHelper = require("../helpers/selenium.js")


const buttons = {
  sidePanelLogin: '#mgbjr-navPanelIcons-home',
  avatar: '.mgbNavPanel .ui.centered.avatar.image',
  login: 'a[href="/login"]',
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
    sel.css(buttons.sidePanelLogin).click()

    sel.exists(buttons.avatar, (e, found) => {
      if(found){
        console.log("All clear! Already logged in")
        done && browser.call(done)
        return
      }
      // and then login button
      sel.css(buttons.login).click()

      // fill the form
      // TODO: move login info to the env
      sel.css(inputs.email).sendKeys('tester@example.com');
      sel.css(inputs.password).sendKeys('tester1');

      // login with ENTER key
      //sel.css(inputs.password).sendKeys('tester1', Key.ENTER);
      // login with click on the submit button
      sel.css(buttons.submitLoginForm).click()

      // wait for logged in element
      // TODO: get a better way to check if user has successfully logged in

      // open side panel
      sel.css(buttons.sidePanelLogin).click()
      sel.exists(buttons.avatar, e => {
        if(e){
          throw(e)
        }
        // close side panel
        sel.css(buttons.sidePanelLogin).click()
        done && browser.call(done)
      })
    })
  }
}
