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

    browser.getWindowHandle()
      .then(currentWindow => {
        const sel = SeleniumHelper(browser)

        // wait for React root element
        sel.css("#root")

        sel.css(el.codeTextArea).sendKeys(
          `import {appendToBody} from './stauzs:libForTestImports'
const div = appendToBody("div")
div.setAttribute("id", "test-element")

`
        );
        sel.css(el.fullScreenButton).click()
        // wait for new window
        browser.sleep(1000)
        browser.getAllWindowHandles()
          .then(handles => {
            // there should be open window
            if (handles.length < 2) {
              throw new Error("Failed to open new window for bundle")
            }
            const popup = handles.find(h => h != currentWindow)
            // switch to popup and find created element and close after
            browser.switchTo().window(popup)
            sel.css("#test-element")
            browser.close()

            browser.switchTo().window(currentWindow)
            sel.done(done)
          })
      })
  }
}
