// this is only for phantom testing purposes - not used in the codebase

var page = require('webpage').create()
page.viewportSize = {
  width: 1920,
  height: 1080,
}
page.onError = function(msg, trace) {
  var msgStack = ['ERROR: ' + msg]

  if (trace && trace.length) {
    msgStack.push('TRACE:')
    trace.forEach(function(t) {
      msgStack.push(
        ' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''),
      )
    })
  }

  console.error(msgStack.join('\n'))
}

page.open('http://test.mygamebuilder.com', function() {
  waitFor({
    debug: true, // optional
    interval: 3, // optional
    timeout: 5000, // optional
    check() {
      return page.evaluate(function() {
        return $('.ui.teal.huge.button').is(':visible')
      })
    },
    success() {
      console.log('Success....')
      page.render('phantomScreen.png')
      phantom.exit()
    },
    error() {
      page.render('scr/phantomScreen.png')
      console.log('ERROR while waiting for button....')
    }, // optional
  })

  //phantom.exit();
})

function waitFor($config) {
  $config._start = $config._start || new Date()

  if ($config.timeout && new Date() - $config._start > $config.timeout) {
    if ($config.error) $config.error()
    if ($config.debug) console.log('timedout ' + (new Date() - $config._start) + 'ms')
    return
  }

  if ($config.check()) {
    if ($config.debug) console.log('success ' + (new Date() - $config._start) + 'ms')
    return $config.success()
  }

  setTimeout(waitFor, $config.interval || 0, $config)
}
