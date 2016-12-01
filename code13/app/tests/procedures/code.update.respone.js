const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
  codeTextArea: '.CodeMirror textarea',
  fullScreenButton: '.button.full-screen',
  start: "mgb-EditCode-start-button",
  stop: "#mgb-EditCode-stop-button",
  console: "#mgbjr-EditCode-console"
}
module.exports = (browser) => {
  // return function so procedure can be used directly as callback
  return (done) => {
    const sel = SeleniumHelper(browser)
    // wait for React root element
    sel.css("#root")

    sel.css(el.codeTextArea).sendKeys(
      `console.log("123")`
    );

    sel.css(el.start).click()
    // wait for new window
    browser.sleep(1000)
    browser.findElement("//*[contains(text(), 'My Button')]")

    sel.css(el.codeTextArea)

  }
}
