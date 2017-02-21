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
      timeout = timeout == void(0) ? 30000 : timeout
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

    untilInvisible(rule, timeout){
      timeout = timeout == void(0) ? 10000 : timeout
      browser.wait(() => {
        return browser.findElements(By.css(rule)).then((present) => {
          return !present.length;
        });
      }, 10000)
    },

    // TODO (stauzs): move site specific actions to external file?
    // JUST make sure test user has max levels at all options
    adjustLevelSlider(name){
      // this makes tests to fail - need super deep debug of SUIR tooltips and MGB redirects
      return
      // history.pushState is not working also :(

      // this SOMETIMES opens 'activity' instead of settings and test fails
      browser.executeScript(`window.location.href = '?_fp=settings'`)

      // slider cannot be located sometimes
      const slider = sel.css("#mgbjr-input-level-slider-" + name)
      browser.actions()
        .mouseMove(slider, {x: 129, y: 1}) // get 100% somehow
        .click()
        .perform()
        // need to wait for confirmation here !!! this also fails sometimes
        .then( () => {
          sel.css('#mgbjr-flexPanelIcons-settings').click()
        })
      // close side panel


      // TODO: FIX THIS
      /*
      const avatar = sel.css('#mgbjr-np-user')

      browser.actions()
        .mouseMove(avatar) // move to avatar - hover doesn't get triggered here and test fails
        .mouseDown(avatar) // this is not working - probably there is some strange delay in the JS
        .perform()

      // settings should be visible now ( but they ain't )
      const settings = sel.untilVisible('#mgbjr-np-user-settings')

      settings.click() // side panel with settings should appear

      /*

      const settings = sel.css('#mgbjr-np-user-settings')
      browser.actions()
        .mouseMove(settings)
        .click()
        //.mouseMove(avatar, {x: 10, y:10})
        //.mouseMove(avatar)
        .perform()
        .then(() => {
          const slider = sel.css("#mgbjr-input-level-slider-"+name)
          browser.actions()
            .mouseMove(slider, {x: 120, y: 1})
            .click()
            .perform()

          // close side panel
          sel.css('#mgbjr-flexPanelIcons-settings').click()
        })
      */

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
