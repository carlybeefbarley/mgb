const SeleniumHelper = require('../helpers/selenium.js')

module.exports = browser => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return done => {
    // wait for React root element
    sel.css('#root')
    sel.adjustLevelSlider(null, 1)
    sel.done(done)
  }
}
