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

    untilInvisible(rule, timeout){
      timeout = timeout == void(0) ? 10000 : timeout
      browser.wait(() => {
        return browser.findElements(By.css(rule)).then((present) => {
          return !present.length;
        });
      }, 10000)
    },

    // TODO (stauzs): move site specific actions to external file?
    adjustLevelSlider(){
      const slider = sel.css("#NavBarGadgetUxSlider")
      browser.actions()
        .mouseMove(slider, {x: 120, y: 1})
        .click()
        .perform()
    },
    openAssetsPanel(){
      return browser.getCurrentUrl()
        .then((url) => {
          if(url.indexOf("_fp=assets") == -1){
            sel.css("#mgbjr-flexPanelIcons-assets").click()
          }
        })
    },
    findAsset(val){
      sel.openAssetsPanel()
      sel.css("#mgb_search_asset").sendKeys(val, Key.ENTER)
      return sel.css(".ui.card.animated.fadeIn canvas")
    },

    waitUntilSaved(){
      sel.untilInvisible("#mgb_asset_panel_detail_container .orange")
    },

    compareImages(filename, data){
      const fs = require("fs")
      const savedImageData = fs.readFileSync(__dirname + `/../imagesToCompare/${filename}`)
      if(savedImageData != data){
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
