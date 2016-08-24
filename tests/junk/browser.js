const webdriver = require('selenium-webdriver');
const fs = require('fs');

webdriver.WebDriver.prototype.saveScreenshot = function (filename) {
  return this.takeScreenshot().then((data) => {
    fs.writeFile(
      filename,
      data.replace(/^data:image\/png;base64,/, ''),
      'base64', function (err) {
        if (err) throw err;
      }
    );
  });
};

module.exports = (props, server = 'http://hub-cloud.browserstack.com/wd/hub') => {

  // Input capabilities
  const capabilities = {
    'browserstack.user': process.env.TEST_USER,
    'browserstack.key': process.env.TEST_KEY,
    'browserName': 'chrome',
    //'browser_version' : '11.0',
    //'os' : 'Windows',
    //'os_version' : '7',
    'resolution': '1024x768'
  };

  Object.assign(capabilities, props);

  return new webdriver.Builder().
    usingServer(server).
    withCapabilities(capabilities).
    build();
};

global.process.on("exit", () => {
  console.log("Process exitted")
})
