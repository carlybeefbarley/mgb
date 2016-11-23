const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  newAsset: '[to="/assets/create"]',
  inputName: '.ui.basic.segment input',
  code: '.ui.basic.padded.segment .large.code.icon',
  createBtn: '#mgbjr-create-asset-button',
  shouldAppear: 'a[href="/u/tester/assets?kinds=code"]',
  cmLine: '.CodeMirror-activeline'
}
module.exports = (browser) => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return (done) => {
    // wait for React root element
    sel.css("#root")

    sel.css(el.newAsset).click()
    sel.css(el.inputName).sendKeys('testing-code')
    sel.css(el.code).click()
    sel.css(el.createBtn).click()

    sel.css(el.shouldAppear)
    done && browser.call(done)
  }
}
