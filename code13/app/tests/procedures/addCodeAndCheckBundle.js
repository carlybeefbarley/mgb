const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
  codeTextArea: '.CodeMirror textarea',
  toggleCodeRuner: '#mgbjr-EditCode-codeRunner > .explicittrigger',
  fullScreenButton: '#mgb-EditCode-full-screen-button'
}
module.exports = (browser) => {
  // return function so procedure can be used directly as callback
  return (done) => {

    browser.getWindowHandle()
      .then(mainWindow => {
        const sel = SeleniumHelper(browser)

        // wait for React root element
        sel.css("#root").then(() => {
          console.log("Root Selected!")
        })

        sel.css(el.codeTextArea).sendKeys(
          `import {appendToBody} from './stauzs:libForTestImports'
const div = appendToBody("div")
div.setAttribute("id", "test-element")

`
        )
        //browser.executeScript(`m.editCode.quickSave()`)
        //sel.waitUntilSaved()

        sel.css(el.toggleCodeRuner).click()
        sel.css(el.fullScreenButton).click()

        // wait for new window
        browser.sleep(5000)
        //sel.untilInvisible('.loading-notification')
        //sel.takeScreenShot('enteredCode.png')
        browser.getAllWindowHandles()
          .then(handles => {
            // there should be open window
            if (handles.length < 2) {
              throw new Error("Failed to open new window for bundle")
            }
            const popup = handles.find(h => h != mainWindow)
            // switch to popup and find created element and close after
            browser.switchTo().window(popup)
            //sel.takeScreenShot('test.png', () => {
              sel.untilVisible('#test-element')
              browser.close()

              browser.switchTo().window(mainWindow)
              sel.done(done)
            //})

          })
      })
  }
}
