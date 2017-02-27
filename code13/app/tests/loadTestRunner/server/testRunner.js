const EventEmitter = require('events').EventEmitter
const spawn = require('child_process').spawn

const startBrowser = require('../../procedures/startBrowser')
const Mocha = require('mocha')
const Reporter = require('../../reporters/benchmark')

class TestRunner extends EventEmitter {

  start(name, port = 4000){
    const phantom = spawn('phantomjs', ["--webdriver="+port], {
      env: {QT_QPA_PLATFORM: "", PATH: process.env.PATH}
    })
    const start = () => {
      this.runTest(name, phantom, port)
    }

    phantom.stderr.on('data', (data) => {
      console.log(`phantom stderr: ${data}`)
    })

    // this is cheesy way to tell that phantom has been started
    phantom.stdout.once('data', start)

    phantom.stdout.on('data', data => {
      console.log(`phantom: ${data}`)
    })
    phantom.on('exit', () => {
      console.log("Phantom exit")
    })
  }

  runTest(name, phantom, port){
    console.log("running test: "+name)
    const mocha = new Mocha({
      timeout: 30000
    })
    const testFileName = __dirname + '/../../tests/' + name + '.test.js'
    global.browser = startBrowser('local.phantom', {server: 'http://127.0.0.1:'+port})
    mocha.addFile(testFileName)

    mocha.reporter(Reporter).run(function(failures){
      const report = []
      global.report.forEach(t => {
        report.push({
          title: t.title,
          duration: t.duration,
          state: t.state
        })
      })
      process.send && process.send(JSON.stringify(report))
      console.log(global.report)

      // give driver 2 sec to finalize session and close browser
      setTimeout(() => { phantom.kill()}, 2000)
    })
  }
}

const runner = new TestRunner()
runner.start(process.argv[2], process.argv[3])
