const webdriver = require('selenium-webdriver');
const By = webdriver.By
const until = webdriver.until
const Key = webdriver.Key
const SeleniumHelper = require("../helpers/selenium.js")

const buttons = {
  sidePanelLogin: '.mgbNavPanel .ui.inverted.icon.menu .item .user',
  sidePanelHistory: '.mgbNavPanel .ui.inverted.icon.menu .item .history',
  login: 'a[href="/signin"]',
  submitLoginForm: '#root > div > div > div.noScrollbarDiv > div > div > div > div:nth-child(2) > button'
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

    // click side panel button
    sel.css(buttons.sidePanelLogin).click()
    // and then login button
    sel.css(buttons.login).click()

    // fill the form
    // TODO: move login info to the env
    sel.css(inputs.email).sendKeys('tester@example.com');
    sel.css(inputs.password).sendKeys('tester1');
    //sel.css(inputs.password).sendKeys('tester1', Key.ENTER);
    // click submit button - we are sending ENTER key
    sel.css(buttons.submitLoginForm).click()

    // wait for logged in element
    // TODO: get a better way to check if user has successfully logged in
    sel.css(buttons.sidePanelHistory)

    browser.call(done)
  }
}
