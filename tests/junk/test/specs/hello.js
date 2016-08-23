var assert = require('assert');

describe('Log In', function() {
  it('should have the right title - the fancy generator way', function () {
    browser.url('/api/graphic/xxx');
    var title = browser.getTitle();
    assert.equal(title, 'WebdriverIO - Selenium 2.0 javascript bindings for nodejs');
  });
});
