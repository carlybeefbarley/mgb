// const EventEmitter = require('events').EventEmitter
const spawn = require('child_process').spawn

const startBrowser = require('../../procedures/startBrowser')
const Mocha = require('mocha')
const Reporter = require('../../reporters/benchmark')

class TestRunner {

  start(name, port = 4000) {
    this.runTest(name, port)
  }

  runTest(name, port) {
    // console.log("running test: "+name)
    const mocha = new Mocha({
      timeout: 30000
    })
    const testFileName = __dirname + '/../loadTests/' + name + '.js'
    global.browser = startBrowser('local.phantom', {server: 'http://127.0.0.1:' + port})
    mocha.addFile(testFileName)

    mocha.reporter(Reporter).run(function (failures) {
      const report = []
      global.report.forEach(t => {
        report.push({
          title: t.title,
          duration: t.duration,
          state: t.state
        })
      })
      process.send && process.send(JSON.stringify(report))
      // console.log(global.report)
    })
  }
}

const runner = new TestRunner()
runner.start(process.argv[2], process.argv[3])
