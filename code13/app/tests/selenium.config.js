// config in js because js allows nicer comments
module.exports = {
  browsers: {
    // if this is filled - only those tests will be tested
    // TODO: add extension automatically
    //only: ["win8.1_ie"],//, "safari_9.1", "chrome", "edge", "firefox"],
    //only: ["win8.1_ie", "safari_9.1", "chrome", "edge", "firefox"],
    only: ['local'],
    // add here some tests to skip
    skip: []
  },
  tests: {
    // if this is filled - only those tests will be tested
    only: ["code.update.test.js"],
    // add here some tests to skip
    skip: ["login.test.js"] // skip login test as other tests logs in user anyway
  }
}
