const SeleniumHelper = require('../helpers/selenium.js')
const el = {
  codeTextArea: '.CodeMirror textarea',
  fullScreenButton: '.button.full-screen',
  start: '#mgb-EditCode-start-button',
  stop: '#mgb-EditCode-stop-button',
  console: '#mgbjr-EditCode-console',
  iframe: '#mgbjr-EditCode-sandbox-iframe',
  codeRunner: '#mgbjr-EditCode-handleRun', // click event is binded on the child
}
module.exports = browser => {
  // return function so procedure can be used directly as callback
  return (page, done) => {
    const sel = SeleniumHelper(browser)
    browser.executeScript(`window.location = '${page}'`).then(() => {
      sel.css('#root')
      sel.css(el.codeRunner).click()
      // wait for accordion menu
      //browser.sleep(1000)
      //sel.css(el.start).click()
      sel.css(el.iframe)
      browser.sleep(5000).then(() => {
        sel.done(done)
      })
    })
  }
}
