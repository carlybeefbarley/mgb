const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  // TODO: add ids in the code - so we can use better selectors
  deleteButton: '.ui.eight.wide.right.aligned.column .bordered.trash.outline.icon'
}
module.exports = (browser) => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return (done) => {
    // wait for React root element
    sel.css("#root")

    // TODO: check if we are in the asset view

    sel.css(el.deleteButton).click()

    done && browser.call(done)
  }
}
