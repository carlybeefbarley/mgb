let npm, parallel, shouldRun = false;
if (typeof Meteor !== 'undefined') {
  if (Meteor.isTest) {
    shouldRun = true;
    npm = Npm
    parallel = function (...args) {
      return describe(...args)
    };
  }
}
else {
  shouldRun = true;
  npm = {require: require}
  // TODO: for unknown reason mocha.parallel makes Meteor server to crash after 2nd parallel test
  parallel = npm.require('mocha.parallel');
}
const fs = npm.require("fs");
const r = process.env.PWD + "/tests/";
const CreateBrowser = npm.require(r + "procedures/startBrowser.js");

if (shouldRun) {
  prepareRun();
}

function prepareRun() {
  describe("Preparing to run", function () {
    // TODO (stauzs): this should be in "before" - but mocha 2 doesn't support async before
    // change it to before after meteor updates mocha to v3

    let alreadyDone = false;
    it("Entering async world", function (done) {
      this.timeout(10000);
      this.slow(5000);

      // meteor will collect all generated tests - add only once
      if (!alreadyDone) {
        prepareAllTests(done)
        alreadyDone = true;
      }
      else {
        done();
      }
    })
  })
}

function prepareAllTests(mainDone) {
  const testsLocation = r + "tests/";
  const browserLocation = r + "browsers/";

  fs.readdir(browserLocation, (err, list) => {
    if (err) {
      throw err;
    }
    const toTest = collectFiles(list)
    fs.readdir(testsLocation, (err, list) => {
      const tests = collectFiles(list)
      // this is required to make tests run in parallel
      // it slightly breaks reporting
      describe("Starting parallel browser tests", function () {
        toTest.forEach((browserName) => {
          //it(`Running on: [${browserName}]`, function () {
          runTests(browserName, tests);
          //})
        })
      })

      mainDone()
    })
  })
}

function runTests(browserName, tests) {
  const testsLocation = r + "tests/";
  const browser = CreateBrowser(browserName)
  tests.forEach((name) => {
    describe(`[${name}] on ${browserName}`, function () {
      this.timeout(120 * 1000)
      this.slow(10 * 1000)
      npm.require(testsLocation + name)(browser, r)
    })
  })
}

function collectFiles(list) {
  const only = [];
  const ret = [];
  list.forEach((name) => {
    if (name.indexOf("skip") > -1) {
      return
    }
    if (name.indexOf("only") > -1) {
      only.push(name)
      return
    }
    ret.push(name)
  })
  if (only.length) {
    return only;
  }
  return ret;
}
