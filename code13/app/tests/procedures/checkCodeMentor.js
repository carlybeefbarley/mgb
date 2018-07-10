const webdriver = require('selenium-webdriver')
const Key = webdriver.Key

const SeleniumHelper = require('../helpers/selenium.js')
const el = {
  phaserInfo: '.ui.orange.left.ribbon.label',
}
module.exports = browser => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return done => {
    // wait for React root element
    sel.css('#root')

    sel.css('.CodeMirror textarea').sendKeys(
      `import 'phaser'
Phaser.Game`,
    )

    /*
     should show smth like this:
     This is where the magic happens.
     The Game object is the heart of your game,
     providing quick access to common functions and handling the boot process.
     */
    sel.css(el.phaserInfo)

    sel.waitUntilSaved()
    sel.done(done)
  }
}
