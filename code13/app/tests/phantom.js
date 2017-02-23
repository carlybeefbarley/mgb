var page = require('webpage').create();
page.viewportSize = {
  width: 1920,
  height: 1080
};
page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};

page.open('http://localhost:3000', function() {
  debugger;
  waitFor({
    debug: true,  // optional
    interval: 0,  // optional
    timeout: 1000,  // optional
    check: function () {
      return page.evaluate(function() {
        return $('.ui.teal.huge.button').is(':visible');
      });
    },
    success: function () {
      console.log("Success....")
      page.render('phantomScreen.png');
      // we have what we want
    },
    error: function () {
      console.log("ERROR while waiting for button....")
    } // optional
  });


  //phantom.exit();
});


function waitFor ($config) {
  $config._start = $config._start || new Date();

  if ($config.timeout && new Date - $config._start > $config.timeout) {
    if ($config.error) $config.error();
    if ($config.debug) console.log('timedout ' + (new Date - $config._start) + 'ms');
    return;
  }

  if ($config.check()) {
    if ($config.debug) console.log('success ' + (new Date - $config._start) + 'ms');
    return $config.success();
  }

  setTimeout(waitFor, $config.interval || 0, $config);
}
