const webdriver = require('selenium-webdriver')
const Key = webdriver.Key

const By = webdriver.By
const until = webdriver.until
//console.log(until)
//process.exit()
// this is for easier css selectors
// TODO: add xpath etc..

// always return browser.XXX - to make function thenable
module.exports = browser => {
  const sel = {
    css(rule, timeout) {
      timeout = timeout == void 0 ? 30000 : timeout
      return browser.wait(until.elementLocated(By.css(rule)), timeout)
    },
    // show console log timed correctly
    log(...args) {
      browser.call(() => {
        console.log(...args)
      })
    },
    exists(rule, callback) {
      const p = browser.findElements(By.css(rule))
      return p
        .then(found => {
          callback(null, !!found.length)
        })
        .catch(e => {
          callback(e)
        })
    },
    getUri() {
      return browser.executeAsyncScript('')
    },
    showLogs() {
      return browser
        .manage()
        .logs()
        .get('browser')
        .then(logs => {
          console.log(logs)
        })
    },
    done(done) {
      try {
        browser
          .manage()
          .logs()
          .get('browser')
          .then(logs => {
            const errors = logs.filter(l => l.message.indexOf('Uncaught') > -1)
            if (errors.length) {
              throw new Error('Javascript errors encountered \n' + JSON.stringify(errors, null, '\t'))
            }
            done && browser.call(done)
          })
      } catch (e) {
        // this will throw exception on IE
        done && browser.call(done)
        return []
      }
    },
    untilVisible(rule, timeout) {
      console.log('Waiting for:', rule)
      timeout = timeout == void 0 ? 10000 : timeout
      const retval = browser.wait(until.elementIsVisible(sel.css(rule)), timeout)
      retval.then(() => {
        console.log('Is visible', rule)
      })
      return retval
    },

    untilEnabled(rule, timeout) {
      timeout = timeout == void 0 ? 10000 : timeout
      return browser.wait(until.elementIsEnabled(sel.css(rule)), timeout)
    },

    untilInvisible(rule, timeout) {
      console.log('Waiting to disappear:', rule)
      timeout = timeout == void 0 ? 10000 : timeout
      return browser.wait(() => {
        return browser.findElements(By.css(rule)).then(elements => {
          console.log('Is Present?:', rule, elements.length)
          return !elements.length
        })
      }, 10000)
    },

    wait(timeout, message) {
      // browser.call is needed here to put wait call in the correct spot in the selenium stack
      return browser.call(() => {
        return browser.wait(
          new Promise((y, n) => {
            setTimeout(y, timeout)
          }),
          timeout * 2,
          message,
        )
      })
    },

    takeScreenShot(name, cb) {
      return browser.takeScreenshot().then(data => {
        const fs = require('fs')
        fs.writeFile(__dirname + '/../scr/' + name, Buffer.from(data, 'base64'), () => {
          cb && cb()
        })
      })
    },

    // REST is site specific stuff...
    // TODO (stauzs): move site specific actions to external file?
    adjustLevelSlider(name, level) {
      // hide notifications.. as they are in the way of setting
      return browser.call(() => {
        level = level === void 0 ? 1 : level
        const sliders = [
          '#mgbjr-input-level-slider-FlexPanel',
          '#mgbjr-input-level-slider-EditGraphic',
          '#mgbjr-input-level-slider-EditCode',
          '#mgbjr-input-level-slider-MapTools',
          '#mgbjr-input-level-slider-AudioTools',
        ]

        browser
          .actions()
          .mouseMove(sel.css('#mgbjr-np-mgb')) // move to logo (this fixes strange issue when mouse is not moving directly to avatar
          // .mouseMove(sel.css('#mgbjr-np-user')) // move to avatar
          .mouseMove(sel.css('#mgbjr-np-user-avatar'))
          .mouseMove(sel.css('#mgbjr-np-user-settings'), { x: 0, y: 0 })
          .click()
          .perform()

        sel.takeScreenShot('scr/settingsOpen.png')

        if (name) {
          const slider = sel.untilVisible('#mgbjr-input-level-slider-' + name)
          slider.getSize().then(size => {
            browser
              .actions()
              .mouseMove(slider, { x: size.width * level, y: size.height * 0.5 })
              .click()
              .perform()
          })
        } else {
          sliders.forEach(s => {
            const slider = sel.untilVisible(s)
            slider.getSize().then(size => {
              browser
                .actions()
                .mouseMove(slider, { x: size.width * level * 0.99, y: size.height * 0.5 })
                .click()
                .perform()
            })
          })
        }
        // for some reason we get it back to 0
        // TODO: debug - look at deferred setting save
        sel.wait(1000)

        // close side panel
        sel.css('#mgbjr-flexPanelIcons-settings').click()
      })
    },
    // dead code?
    openAssetsPanel() {
      return browser.getCurrentUrl().then(url => {
        if (url.indexOf('_fp=assets') == -1) {
          // debug this SUI is not working well
          sel.css('#mgbjr-flexPanelIcons-assets > .icon').click()
        }
      })
    },
    findAsset(val) {
      sel.openAssetsPanel()
      sel.untilVisible('#mgbjr_fp_search_asset input')
      const elm = sel.css('#mgbjr_fp_search_asset input')
      elm.clear()
      elm.sendKeys(val, Key.ENTER)
      return sel.css('.ui.cards *[draggable=true]')
    },

    waitUntilSaved() {
      return sel.untilInvisible('#mgbjr-saving-changes')
    },

    compareImages(filename, data) {
      const fs = require('fs')
      let savedImageData
      try {
        savedImageData = fs.readFileSync(__dirname + `/../imagesToCompare/${filename}`)
      } catch (e) {
        // ignore first time error - if we don't have file
        fs.writeFileSync(__dirname + `/../imagesToCompare/${filename}.tmp`, data)
      }

      if (savedImageData != data) {
        fs.writeFileSync(__dirname + `/../imagesToCompare/${filename}.tmp`, data)
        throw new Error("Saved thumbnail and created Image doesn't match!")
      }
    },

    dragAndDrop(from, to) {
      return browser.executeScript(
        `
      return window.m.dnd.simulateDragAndDrop.apply(m.dnd, arguments);`,
        from,
        to,
      )
    },
  }
  return sel
}
