const webdriver = require('selenium-webdriver')
const Key = webdriver.Key

const By = webdriver.By
const until = webdriver.until
//console.log(until)
//process.exit()
// this is for easier css selectors
// TODO: add xpath etc..
module.exports = (browser) => {
  const sel = {
    css: (rule, timeout ) => {
      timeout = timeout == void(0) ? 10000 : timeout
      return browser.wait(until.elementLocated(By.css(rule)), timeout)
    },
    exists: (rule, callback) => {
      const p = browser.findElements(By.css(rule))
      p.then((found) => {
        callback(null, !!found.length)
      })
      .catch((e) => {
        callback(e)
      })
    },
    getUri: () => {
      browser.executeAsyncScript("")
    },
    showLogs: () => {
      browser.manage().logs().get("browser")
        .then(logs => {
          console.log(logs)
        })
    },
    done: (done) => {
      try {
        browser.manage().logs().get("browser")
          .then(logs => {
            const errors = logs.filter(l => l.message.indexOf('Uncaught') > -1)
            if(errors.length){
              throw new Error("Javascript errors encountered \n" + JSON.stringify(errors, null, "\t"))
            }
            done && browser.call(done)
          })
      }
        // this will throw exception on IE
      catch (e) {
        done && browser.call(done)
        return []
      }

    },
    untilVisible(rule, timeout){
      timeout = timeout == void(0) ? 10000 : timeout
      return browser.wait(until.elementIsVisible(sel.css(rule)), timeout)
    },

    untilEnabled(rule, timeout){
      timeout = timeout == void(0) ? 10000 : timeout
      return browser.wait(until.elementIsEnabled(sel.css(rule)), timeout)
    },

    untilInvisible(rule, timeout){
      timeout = timeout == void(0) ? 10000 : timeout
      browser.wait(() => {
        return browser.findElements(By.css(rule)).then((present) => {
          return !present.length;
        });
      }, 10000)
    },

    wait(timeout, message){
      browser.wait(new Promise((y, n) => {
        setTimeout(y, timeout)
      }), timeout, message)
    },

    takeScreenShot(name, cb){
      browser.takeScreenshot().then(data => {
        const fs = require("fs")
        fs.writeFile(name, Buffer.from(data, 'base64'), () => {cb && cb()})
      })
    },

    // REST is site specific stuff...
    // TODO (stauzs): move site specific actions to external file?
    adjustLevelSlider(name, level){
      level = level === void(0) ? 1 : level
      const sliders = [
        '#mgbjr-input-level-slider-FlexPanel',
        '#mgbjr-input-level-slider-EditGraphic',
        '#mgbjr-input-level-slider-EditCode',
        '#mgbjr-input-level-slider-MapTools',
        '#mgbjr-input-level-slider-AudioTools'
      ]

      browser.actions()
        .mouseMove(sel.css('#mgbjr-np-mgb')) // move to logo
        .mouseMove(sel.css('#mgbjr-np-user')) // move to avatar
        .mouseMove(sel.css('#mgbjr-np-user-avatar')) // move to avatar
        .perform()

      // settings should be visible now
      const settings = sel.untilVisible('#mgbjr-np-user-settings')
      settings.click() // side panel with settings should appear

      if(name){
        const slider = sel.untilVisible('#mgbjr-input-level-slider-' + name)
        slider.getSize()
          .then((size) => {
            browser.actions()
              .mouseMove(slider, {x: size.width * level, y: size.height * 0.5})
              .click()
              .perform()
          })
      }
      else{
        sliders.forEach( s => {
          const slider = sel.untilVisible(s)
          slider.getSize()
          .then((size) => {
              browser.actions()
                .mouseMove(slider, {x: size.width * level * 0.99, y: size.height * 0.5})
                .click()
                .perform()
            })
        })
      }
      // wait and check if everything is fine
      //sel.wait(10 * 1000)

      // close side panel
      sel.css('#mgbjr-flexPanelIcons-settings').click()
    },
    openAssetsPanel(){
      return browser.getCurrentUrl()
        .then((url) => {
          if(url.indexOf("_fp=assets") == -1){
            // debug this SUI is not working well
            sel.css("#mgbjr-flexPanelIcons-assets > .icon").click()
          }
        })
    },
    findAsset(val){
      sel.openAssetsPanel()
      sel.untilVisible("#mgbjr_fp_search_asset input")
      sel.css("#mgbjr_fp_search_asset input").sendKeys(val, Key.ENTER)
      return sel.css(".ui.card img.mgb-pixelated")
    },

    waitUntilSaved(){
      sel.untilInvisible("#mgbjr-changes-saved")
    },

    compareImages(filename, data){
      const fs = require("fs")
      let savedImageData;
      try {
        savedImageData = fs.readFileSync(__dirname + `/../imagesToCompare/${filename}`)
      }
      // ignore first time error - if we don't have file
      catch(e){
        fs.writeFileSync(__dirname + `/../imagesToCompare/${filename}.tmp`, data)
      }

      if (savedImageData != data) {
        fs.writeFileSync(__dirname + `/../imagesToCompare/${filename}.tmp`, data)
        throw new Error("Saved thumbnail and created Image doesn't match!")
      }

    },

    dragAndDrop(from, to){
      browser.executeScript(`
      return window.m.dnd.simulateDragAndDrop.apply(m.dnd, arguments);`, from, to)
    }
  }
  return sel
}
