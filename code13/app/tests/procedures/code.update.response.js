const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const SuccessHandle = require("./waitForMessage.js")

const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
  codeTextArea: '.CodeMirror textarea',
  fullScreenButton: '.button.full-screen',
  start: "#mgb-EditCode-start-button",
  stop: "#mgb-EditCode-stop-button",
  console: "#mgbjr-EditCode-console",
  iframe: "#mgbjr-EditCode-sandbox-iframe",
  codeRunner: "#mgbjr-EditCode-codeRunner span" // click event is binded on the child
}
module.exports = (browser) => {
  // return function so procedure can be used directly as callback
  return (done) => {
    const sel = SeleniumHelper(browser)
    const onSuccess = SuccessHandle(browser)
    // wait for React root element
    sel.css("#root")

    sel.css(el.codeTextArea).sendKeys(
      `alert("Success")`
    );

    sel.css(el.codeRunner).click()
    // wait for accordion menu
    browser.sleep(1000)
    sel.css(el.start).click()

    onSuccess("Success", () => {
      sel.done(done)
    })
  }
}
