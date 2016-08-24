* use test/ instead of tests/ because we would like to _meteor test_ pick up those tests when they are ready
* in the browsers/ we are storing browser configuration from BrowserStack (also called _capabilities_)
  * browsers/default.js will be used by meteor test command - usually it will will use local selenium
* in the automation/ tests for BrowserStack (for Selenium to be more specific) located
* in the procedures/ are stored tests that will do common tasks - such as log in test user
* Selenium API Docs:
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebDriver.html
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise_exports_ControlFlow.html
  * for browser capabilities check: https://www.browserstack.com/automate/node#setting-os-and-browser

* helper/ - misc helpers for selenium-webdriver
