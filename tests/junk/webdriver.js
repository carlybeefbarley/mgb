var webdriverio = require('webdriverio');

module.exports = (config) => {
  var webdriverio = require('webdriverio');
  var options = {
    desiredCapabilities: {
      browserName: 'firefox'
    }
  };

  webdriverio
    .remote(options)
}
