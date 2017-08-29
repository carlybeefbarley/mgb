const SeleniumHelper = require('../helpers/selenium.js')
const el = {
  colorPicker: '#mgbjr-EditGraphic-colorPicker',
  colorPickerArea: 'div.chrome-picker > div:nth-child(1) > div > div > div:nth-child(1)',
  colorSlider:
    'div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div',
  opacitySlider:
    'div.chrome-picker > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div',
  mainCanvas: '#mgb_edit_graphic_main_canvas',
  penTool: '#mgbjr-EditGraphic-penTool',
  fillTool: '#mgbjr-EditGraphic-fillTool',
  addFrame: '#mgb_edit_graphics_add_frame',
  getFrameSelector: f => `#mgb_edit_graphics_frame_cell_${f}`,
  getFrameOptionsSelector: f => `#mgb_edit_graphics_frame_options_${f}`,
}

module.exports = browser => {
  const sel = SeleniumHelper(browser)

  const pickColor = offset => {
    // open color picker
    const colorPicker = sel.css(el.colorPicker)
    colorPicker.click()

    // wait for color slider
    const colorSlider = sel.css(el.colorSlider)
    if (!colorSlider) {
      throw new Error('Cannot find color slider')
    }
    const pickArea = sel.css(el.colorPickerArea)
    if (!pickArea) {
      throw new Error('Cannot find pick area')
    }
    browser
      .actions()
      // x: 50 - approx green color
      .mouseMove(colorSlider, { x: Math.floor(offset / 100 * 155), y: 5 })
      .click()
      // select corner in the palette
      .mouseMove(pickArea, { x: 224, y: 5 })
      .click()
      .perform()

    // close color picker
    browser
      .actions()
      .mouseMove(sel.css('#mgbjr-np-mgb'))
      .perform()

    // wait a little bit until color picker is closed
    return sel.untilInvisible('#mgbjr-EditGraphic-colorPicker-body')
  }
  const removeFrame = id => {
    const frameoptions = sel.css(el.getFrameOptionsSelector(id))
    browser
      .actions()
      .mouseMove(frameoptions)
      .perform()

    sel.untilVisible(el.getFrameOptionsSelector(id) + ' .remove.icon')
    sel.css(el.getFrameOptionsSelector(id) + ' .remove.icon').click()
  }

  // return function so procedure can be used directly as callback
  return done => {
    // adjustLevelSlider - works only partially
    sel.adjustLevelSlider('EditGraphic', 1)
    const canvas = sel.css(el.mainCanvas)

    // green
    pickColor(35)
      .then(() => {
        sel.css(el.penTool).click()
        // draw green rect
        return browser
          .actions()
          .mouseMove(canvas, { x: 10, y: 10 })
          .mouseDown()
          .mouseMove(canvas, { x: 100, y: 10 })
          .mouseMove(canvas, { x: 100, y: 100 })
          .mouseMove(canvas, { x: 10, y: 100 })
          .mouseMove(canvas, { x: 10, y: 10 })
          .mouseUp()
          .perform()
      })
      // red
      .then(() => pickColor(99))
      .then(() => {
        sel.css(el.fillTool).click()
        // fill green rect
        browser
          .actions()
          .mouseMove(canvas, { x: 50, y: 50 })
          .click()
          .perform()

        console.log('trying to add frame: done!')
        sel.css(el.addFrame).click()

        console.log('add frame: done!')
        return sel.css(el.getFrameSelector(1)).click()
      })
      // yellow
      .then(() => pickColor(18.5))
      .then(() => {
        console.log('pick color: done!')
        sel
          .css(el.fillTool)
          .click()
          .catch(e => {
            console.log('Caught error!', e)
          })
        // fill all canvas with yellow color
        return browser
          .actions()
          .mouseMove(canvas, { x: 50, y: 50 })
          .click()
          .perform()
      })
      .then(() => {
        sel.css(el.addFrame).click()
        sel.css(el.getFrameSelector(2)).click()

        const asset = sel.findAsset('test.image.for.drop')
        console.log('pick color: done!')
        // is there selenium native way for react/HTML5 drag and drop???
        sel.dragAndDrop(asset, canvas)

        sel.css(el.addFrame).click()
        sel.css(el.addFrame).click()

        //TODO: fix this - atm it shows error - .remove.icon not visible - something with hover drop down remove last frames
        removeFrame(4)
        removeFrame(3)

        sel.waitUntilSaved()

        return browser
          .executeScript(
            `
      return window.m.editGraphic.getImageData()`,
          )
          .then(pngData => {
            sel.compareImages('graphics.thumbnail.pngdata.txt', pngData)
            sel.done(done)
          })
      })
  }
}
