const webdriver = require('selenium-webdriver');
const Key = webdriver.Key
const By = webdriver.By

const SeleniumHelper = require("../helpers/selenium.js")
const el = {
  colorPicker: '#mgbjr-EditGraphic-colorPicker',
  colorPickerArea: "div.chrome-picker > div:nth-child(1) > div > div > div:nth-child(1)",
  colorSlider: "div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div",
  opacitySlider: "div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div",
  mainCanvas: "#mgb_edit_graphic_main_canvas",
  fillTool: "#mgbjr-EditGraphic-fillTool",
  addFrame: "#mgb_edit_graphics_add_frame",
  getFrameSelector: f => `#mgb_edit_graphics_frame_cell_${f}`,
  getFrameOptionsSelector: f => `#mgb_edit_graphics_frame_options_${f}`,
}




module.exports = (browser) => {

  const sel = SeleniumHelper(browser)

  const pickColor = (offset) => {
    // open color picker
    const colorPicker = sel.css(el.colorPicker)
    colorPicker.click()

    // wait for color slider
    const colorSlider = sel.css(el.colorSlider)
    browser.sleep(300)

    if(!colorSlider){
      throw new Error("Cannot find color slider")
    }
    const pickArea = sel.css(el.colorPickerArea)
    if(!pickArea){
      throw new Error("Cannot find pick area")
    }



    browser.actions()
      // x: 50 - approx green color
      .mouseMove(colorSlider, {x: Math.floor(offset/100 * 155), y: 5})
      .click()
      // select corner in the palette
      .mouseMove(pickArea, {x: 224, y: 5})
      .click()
      .perform()

    // close color picker
    colorPicker.click()
    browser.sleep(300)
  }


  // return function so procedure can be used directly as callback
  return (done) => {
    sel.adjustLevelSlider()

    // green
    pickColor(35)
    const canvas = sel.css(el.mainCanvas)
    // draw green rect
    browser.actions()
      .mouseMove(canvas, {x: 10, y: 10})
      .mouseDown()
      .mouseMove(canvas, {x: 100, y: 10})
      .mouseMove(canvas, {x: 100, y: 100})
      .mouseMove(canvas, {x: 10, y: 100})
      .mouseMove(canvas, {x: 10, y: 10})
      .mouseUp()
      .perform()

    // red
    pickColor(98)
    sel.css(el.fillTool).click()
    // fill green rect
    browser.actions()
      .mouseMove(canvas, {x: 50, y: 50})
      .click()
      .perform()


    sel.css(el.addFrame).click()
    sel.css(el.getFrameSelector(1)).click()

    // yellow
    pickColor(18.5)
    sel.css(el.fillTool).click()
    // fill all canvas with yellow color
    browser.actions()
      .mouseMove(canvas, {x: 50, y: 50})
      .click()
      .perform()

    sel.css(el.addFrame).click()
    sel.css(el.getFrameSelector(2)).click()
    sel.openAssetsPanel()

    const asset = sel.findAsset("test.image.for.drop")
    browser.sleep(5000)

    // asset.findElement(By.tagName("canvas"))
    //  .then( from => {
    //    console.log("Drag and drop test!!!!")
    //    browser.actions()
    //      .mouseDown(asset)
    //      .mouseMove(asset, {x: 1, y: 1})
    //      .mouseMove(canvas)
    //      .mouseUp()
    //      .perform()
    //  })
    browser.actions()
      .mouseDown(asset)
      .mouseMove(asset, {x: 1, y: 1})
      .dragAndDrop(asset, canvas)
      .perform()


    browser.sleep(100)

    sel.css(el.addFrame).click()
    sel.css(el.addFrame).click()
    browser.sleep(100)

    // remove extra 3 frames
    sel.css(el.getFrameOptionsSelector(3))
    sel.css(el.getFrameOptionsSelector(3))

    browser.sleep(100000)
    sel.done(done)
  }
}
