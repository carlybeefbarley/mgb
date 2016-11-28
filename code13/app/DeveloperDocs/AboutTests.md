* selenium test entry point is in test/ - meteor will skip tests/ ( it also seems to be safe to use Npm.require - to require simple nodejs modules from tests/)
* also we need to meteor app server to ignore test files - so rest files are in the tests/ folder
* in the browsers/ we are storing browser configuration from BrowserStack (also called _capabilities_)
  * browsers/default.js will be used by meteor test command - usually it will will use local selenium
* in the procedures/ are stored tests that will do common tasks - such as log in test user
* Selenium API Docs:
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebDriver.html
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/webdriver_exports_WebElement.html
  * http://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/lib/promise_exports_ControlFlow.html
  * for browser capabilities check: https://www.browserstack.com/automate/node#setting-os-and-browser

* helper/ - misc helpers for selenium-webdriver
* Local server:
  * Follow instructions: https://github.com/SeleniumHQ/selenium/wiki/RemoteWebDriverServer
  * download link: http://selenium-release.storage.googleapis.com/index.html - look for latest standalone server

* How it works:
  * browserstack test will read all browsers from tests/browsers/ - it's possible to add only / skip (to the filename)- to test only necessary files
test for each browser will run in parallel ( currently only from commandline _mocha_)
  * then script will loop thought tests/tests/ and execute every file ( skip / only also supported here ) - those tests are executed one by one - as they will be using same browser
  * added tests/selenium.config.js - to allow skip browsers/tests without renaming files

* Check tests/login.test.js - as an example

