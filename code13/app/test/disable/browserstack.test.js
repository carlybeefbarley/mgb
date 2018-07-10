let npm,
  parallel,
  shouldRun = false
if (typeof Meteor !== 'undefined') {
  if (Meteor.isTest) {
    shouldRun = true
    npm = Npm
    //
    parallel = function(...args) {
      return describe(...args)
    }
  }
} else {
  shouldRun = true
  npm = { require }
  // TODO: for unknown reason mocha.parallel makes Meteor server to crash after 2nd parallel test
  parallel = npm.require('mocha.parallel')
}
const fs = npm.require('fs')
const testWorkingDirectory = process.env.PWD + '/tests/'
const CreateBrowser = npm.require(testWorkingDirectory + 'procedures/startBrowser.js')
const config = npm.require(testWorkingDirectory + 'selenium.config.js')
if (shouldRun) {
  prepareRun()
}

function prepareRun() {
  let testsAdded = false
  // this is required because otherwise mocha will automatically exit
  describe('Selenium tests sadasd', function() {
    before(function(done) {
      if (!testsAdded) {
        testsAdded = true
        setTimeout(function() {
          prepareAllTests(function(b, t) {
            done()
            runTestsForEachBrowser(b, t)
          })
        })
      } else {
        done()
      }
    })

    it('Preparing tests', function(done) {
      // 1 second should be enough to read directories and register collected tests
      setTimeout(done, 0)
    })
  })
}

function prepareAllTests(mainDone) {
  const testsLocation = testWorkingDirectory + 'tests/'
  const browserLocation = testWorkingDirectory + 'browsers/'

  // TODO: refactor - it's possible to skip readdir if we already know tests from config
  fs.readdir(browserLocation, (err, list) => {
    if (err) {
      throw err
    }
    const browsers =
      config.browsers.only.length === 0 ? collectFiles(list, config.browsers.skip) : config.browsers.only
    fs.readdir(testsLocation, (err, list) => {
      if (err) {
        throw err
      }
      const tests = config.tests.only.length === 0 ? collectFiles(list, config.tests.skip) : config.tests.only
      mainDone(browsers, tests)
    })
  })
}
function runTestsForEachBrowser(browsers, tests) {
  // this is required to make tests run in parallel
  // it slightly breaks reporting
  // parallel("Starting parallel browser tests", function () {
  browsers.forEach(browserName => {
    //it(`Running on: [${browserName}]`, function () {
    runTests(browserName, tests)
    //})
  })
}

// TODO: to run in parallel - check out child process
function runTests(browserName, tests) {
  const testsLocation = testWorkingDirectory + 'tests/'
  let browser
  const getBrowser = () => {
    if (!browser) {
      // skip rest of the tests
      throw new Error(`Not connected to browser [${browserName}]`)
    }
    return browser
  }

  describe(`Connecting to browser [${browserName}] ...`, function() {
    this.timeout(120 * 1000)
    this.slow(10 * 1000)
    // create new instance of browser.. it can actually fail on some cases
    it('connecting to browser', function(done) {
      /*
       TODO: due to meteor test specifics - 2nd time describe() won't be called - and
       if 2 tests are running in parallel (on 2 or more separate windows) both will crash - as
       they will overwrite browser instance
       child process should resolve this, but error reporting will suffer
       */

      const waitForPreviousBrowserToClose = () => {
        if (browser) {
          setTimeout(waitForPreviousBrowserToClose, 100)
        } else {
          // only assign reference to browser - when all good
          const tmpbrowser = CreateBrowser(browserName)
          tmpbrowser.call(function() {
            browser = tmpbrowser
            browser.loadHomePage().then(() => {
              // hide notifications - they are in the way of fp buttons...
              browser.executeScript(`
                  window.m && m.addStyle('.notification {display: none}')
                `)
            })
            // otherwise tests will need to wait for them to hide - and that will increase time on some tests by 5 seconds
            browser.call(done)
          })
        }
      }
      waitForPreviousBrowserToClose()
    })

    tests.forEach(name => {
      npm.require(testsLocation + name)(getBrowser, testWorkingDirectory)
    })
  })

  // we need to separate this because otherwise it will be called earlier than tests - in a case if tests will be wrapped into describe
  describe(`Finalizing [${browserName}]`, function() {
    // actually we are just waiting here for browser to close
    it('closing browser', function(done) {
      this.timeout(5000)
      this.slow(10000)
      browser
        .executeScript('try{window.localStorage.clear(); window.location.reload();}catch(e){}')
        .then(() => {
          browser.close()
          browser.quit()
          done()
        })
    })
  })
}

function collectFiles(list, skip) {
  const only = []
  const ret = []
  list.forEach(name => {
    if (name.indexOf('skip') > -1 || skip.indexOf(name) > -1) {
      return
    }
    if (name.indexOf('only') > -1) {
      only.push(name)
      return
    }
    ret.push(name)
  })
  if (only.length) {
    return only
  }
  return ret
}
