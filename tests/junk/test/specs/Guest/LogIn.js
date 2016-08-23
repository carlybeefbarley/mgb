var assert = require('assert');

describe('Log In', function() {
  it('should have the right title - the fancy generator way', function () {
    browser.url('/');
    var title = browser.getTitle();
    assert.equal(title, 'MGB');
  });
});
