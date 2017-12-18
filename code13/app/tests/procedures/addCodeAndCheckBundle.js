const webdriver = require('selenium-webdriver')
const Key = webdriver.Key

const SeleniumHelper = require('../helpers/selenium.js')
const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
  codeTextArea: '.CodeMirror textarea',
  toggleCodeRuner: '#mgbjr-EditCode-codeRunner .title',
  fullScreenButton: '#mgb-EditCode-full-screen-button',
}
module.exports = browser => {
  // return function so procedure can be used directly as callback
  return done => {
    browser.getWindowHandle().then(mainWindow => {
      const sel = SeleniumHelper(browser)

      // wait for React root element
      sel.css('#root').then(() => {
        console.log('Root Selected!')
        sel.takeScreenShot('rootSelected')
      })

      sel.css(el.codeTextArea).sendKeys(
        `import {appendToBody} from '/stauzs:libForTestImports'
const div = appendToBody("div")
div.setAttribute("id", "test-element")

`,
      )
      sel.wait(1000)
      //.then(() => sel.takeScreenShot('after code input'))

      //browser.executeScript(`m.editCode.quickSave()`)
      //sel.waitUntilSaved()

      sel
        .untilVisible(el.toggleCodeRuner)
        .then(elm => {
          elm.click()
          console.log('Visible:', el.toggleCodeRuner)
        })
        .then(() => {
          sel.css(el.fullScreenButton).click()
        })
        .then(() => {
          // wait for new window
          // browser.sleep(5000)
          sel.untilInvisible('.loading-notification')
          //sel.takeScreenShot('enteredCode.png')
          browser.getAllWindowHandles().then(handles => {
            // there should be open window
            if (handles.length < 2) {
              throw new Error('Failed to open new window for bundle')
            }
            const popup = handles.find(h => h != mainWindow)

            // switch to popup and find created element and close after
            browser
              .switchTo()
              .window(popup)
              .then(() => {
                //sel.takeScreenShot('test.png', () => {
                sel.css('#test-element')
                browser.close()

                browser.switchTo().window(mainWindow)
                sel.done(done)
              })
            //})
          })
        })
    })
  }
}
