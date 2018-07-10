var Mocha = require('mocha')

class MyReporter extends Mocha.reporters.Base {
  constructor(runner) {
    super(runner)
    global.report = []
    const report = global.report

    console.log('Custom reporter started!')
    var passes = 0
    var failures = 0
    let total = 0

    runner.on('test', test => {
      test.started = Date.now()
    })
    /*runner.on('test', (test) => {
      test.started = Date.now()
    })*/

    runner.on('pass', function(test) {
      test.duration = Date.now() - test.started
      passes++
      report.push(test)
      //console.log(`pass: ${test.fullTitle()} (${test.duration}ms)`)
      total += test.duration
    })

    runner.on('fail', function(test, err) {
      test.duration = Date.now() - test.started
      report.push(test)
      failures++
      console.error(`fail: ${test.fullTitle()}`, test, err.message, err.stack)
      total += test.duration
    })

    runner.on('end', function() {
      //console.log(`end: ${passes}/${passes + failures} in ${total}ms`)
    })
  }
}

module.exports = MyReporter
