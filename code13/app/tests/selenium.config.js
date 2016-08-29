// config in js because js allows nicer comments
module.exports = {
  browsers: {
    // if this is filled - only those tests will be tested
    // TODO: add extension automatically
    only: ["safari_9.1", "chrome", "edge", "firefox"],
    // add here some tests to skip
    skip: []
  },
  tests: {
    // if this is filled - only those tests will be tested
    only: [],
    // add here some tests to skip
    skip: []
  }
}
