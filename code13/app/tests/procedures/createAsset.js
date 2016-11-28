const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  newAsset: '[to="/assets/create"]',
  inputName: '.ui.basic.segment input',
  assetTypeButton: '#create-asset',
  createBtn: '#mgbjr-create-asset-button',
  shouldAppear: type => `a[href="/u/tester/assets?kinds=${type}"]`,
  cmLine: '.CodeMirror-activeline'
}
module.exports = (browser) => {
  const sel = SeleniumHelper(browser)

  // return function so procedure can be used directly as callback
  return (type, done) => {
    // wait for React root element
    sel.css("#root")

    sel.css(el.newAsset).click()
    sel.css(el.inputName).sendKeys('test.junk.' + type)
    sel.css(el.assetTypeButton + "-" + type).click()
    sel.css(el.createBtn).click()

    sel.css(el.shouldAppear(type))
    sel.done(done)
  }
}
module.exports.assetType = {
  graphic: "graphic",
  actor: "actor",
  actormap: "actormap",
  map: "map",
  code: "code",
  sound: "sound",
  music: "music",
  game: "game",
  tutorial: "tutorial"
}
