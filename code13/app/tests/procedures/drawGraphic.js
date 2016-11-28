const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
  codeTextArea: '.CodeMirror textarea',
  fullScreenButton: '.button.full-screen'
}
module.exports = (browser) => {
  // return function so procedure can be used directly as callback
  return (done) => {
    const sel = SeleniumHelper(browser)


    sel.done(done)
  }
}
