var Mocha = require('mocha')

class MyReporter extends Mocha.reporters.Base {
  constructor(runner){
    super(runner)
    global.report = []
    const report = global.report;

    console.log("Custom reporter started!")
    var passes = 0
    var failures = 0
    let total = 0

    runner.on('pass', function(test){
      passes++;
      report.push(test)
      console.log(`pass: ${test.fullTitle()} (${test.duration}ms)`)
      total += test.duration
    })

    runner.on('fail', function(test, err){
      report.push(test)
      failures++;
      console.log(`fail: ${test.fullTitle()} (${test.duration}ms)`, err.message)
      total += test.duration
    })

    runner.on('end', function(){
      console.log(`end: ${passes}/${passes + failures} in ${total}ms`)
    })
  }
}

module.exports = MyReporter
