const webdriver = require('selenium-webdriver');
const Key = webdriver.Key

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  colorPicker: '#mgbjr-EditGraphic-eyedropperTool',
  colorPickerArea: "div.chrome-picker > div:nth-child(1) > div > div > div:nth-child(1)",
  colorSlider: "div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div",
  opacitySlider: "div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div"

}
module.exports = (browser) => {
  // return function so procedure can be used directly as callback
  return (done) => {
    const sel = SeleniumHelper(browser)
    const colorPicker = sel.css(el.colorPicker)
    // pick red color
    browser.actions().
      mouseDown(colorPicker).
      mouseMove(colorPicker, {x: 100, y: 0}).
      mouseUp(colorPicker).
      perform();

    

    browser.sleep(60000)
    sel.done(done)
  }
}
