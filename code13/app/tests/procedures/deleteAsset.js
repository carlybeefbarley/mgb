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
    // wait for changes to be updated
    // TODO: create global helpers for checking save status - as it will be useful in many many cases
    browser.sleep(1000)
    done && browser.call(done)
  }
}
