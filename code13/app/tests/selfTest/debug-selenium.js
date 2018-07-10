// this is only for selenium debug purposes - not used in the codebase

var test = function() {
  var webdriver = require('selenium-webdriver')

  // Input capabilities
  var capabilities = {
    browserName: 'chrome',
    'browserstack.user': 'kasparsstauzs1',
    'browserstack.key': 'Bz7NKqjsmsLdsESGeN3y',
  }

  var driver = new webdriver.Builder()
    .usingServer('http://127.0.0.1:4444/wd/hub')
    .withCapabilities(capabilities)
    .build()

  return function(cb) {
    driver.get('http://www.google.com')
    driver.findElement(webdriver.By.name('q')).sendKeys('BrowserStack')
    driver.findElement(webdriver.By.name('btnG')).click()

    driver.getTitle().then(function(title) {
      console.log('Title was:', title)
    })

    driver.close()
    driver.quit()
    cb && setTimeout(cb, 5000)
  }
}
/*
const x = test();
x(x)

*/
