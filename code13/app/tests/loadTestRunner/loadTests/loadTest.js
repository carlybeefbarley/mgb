const common = require('./common')
const testInfo = global.testInfo
// load basic test case
const test = require(`../../tests/${testInfo.test}.test`)
const browser = testInfo.browser

describe('Preparing: ', function() {
  common.start(browser)
})
describe('Running actual Tests: ', function() {
  test(() => browser)
})
describe('Cleaning up: ', function() {
  common.cleanUp(browser)
})
