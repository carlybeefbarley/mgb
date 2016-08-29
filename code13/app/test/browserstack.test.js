let npm, parallel, shouldRun = false
if (typeof Meteor !== 'undefined') {
  if (Meteor.isTest) {
    shouldRun = true
    npm = Npm
    // 
    parallel = function (...args) {
      return describe(...args)
    }
  }
}
else {
  shouldRun = true
  npm = {require: require}
  // TODO: for unknown reason mocha.parallel makes Meteor server to crash after 2nd parallel test
  parallel = npm.require('mocha.parallel')
}
const fs = npm.require("fs")
const testWorkingDirectory = process.env.PWD + "/tests/"
const CreateBrowser = npm.require(testWorkingDirectory + "procedures/startBrowser.js")
const config = npm.require(testWorkingDirectory + "selenium.config.js")
if (shouldRun) {
  prepareRun()
}

function prepareRun() {
  describe("Preparing to run", function () {
    // TODO (stauzs): this should be in "before" - but mocha 2 doesn't support async before
    // change it to before after meteor updates mocha to v3

    let alreadyDone = false
    it("Entering async world", function (done) {
      this.timeout(10000)
      this.slow(5000)

      // meteor will collect all generated tests - add only once
      if (!alreadyDone) {
        prepareAllTests(done)
        alreadyDone = true
      }
      else {
        done()
      }
    })
  })
}

function prepareAllTests(mainDone) {
  const testsLocation = testWorkingDirectory + "tests/"
  const browserLocation = testWorkingDirectory + "browsers/"

  // TODO: refactor - it's possible to skip readdir if we already know tests from config
  fs.readdir(browserLocation, (err, list) => {
    if (err) {
      throw err
    }
    const browsers = config.browsers.only.length === 0 ? collectFiles(list, config.browsers.skip) : config.browsers.only
    fs.readdir(testsLocation, (err, list) => {
      if (err) {
        throw err
      }
      const tests = config.tests.only.length === 0 ? collectFiles(list, config.tests.skip) : config.tests.only
      runTestsForEachBrowser(browsers, tests)
      mainDone()
    })
  })
}
function runTestsForEachBrowser(browsers, tests) {

  // this is required to make tests run in parallel
  // it slightly breaks reporting
  // parallel("Starting parallel browser tests", function () {
  describe("Starting parallel browser tests", function () {
    browsers.forEach((browserName) => {
      //it(`Running on: [${browserName}]`, function () {
      runTests(browserName, tests)
      //})
    })
  })
}


function runTests(browserName, tests) {
  const testsLocation = testWorkingDirectory + "tests/"
  const browser = CreateBrowser(browserName)
  // show nice message when running prallel tests as it breaks (not showing) describe
  it(`Starting tests on ${browserName}`, () => {})
  tests.forEach((name) => {
    // this breaks
    describe(`[${name}] on ${browserName}`, function () {
      // parallel doesn't support timeout / slow
      this.timeout(120 * 1000)
      this.slow(10 * 1000)

      npm.require(testsLocation + name)(browser, testWorkingDirectory)
    })
  })
}

function collectFiles(list, skip) {
  const only = []
  const ret = []
  list.forEach((name) => {
    if (name.indexOf("skip") > -1 || skip.indexOf(name) > -1) {
      return
    }
    if (name.indexOf("only") > -1) {
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
