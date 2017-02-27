const startBrowser = require('../../procedures/startBrowser')
const EventEmitter = require('events').EventEmitter;

const Mocha = require('mocha')
const Reporter = require('../../reporters/benchmark')

class TestRunner extends EventEmitter {

  start(name){
    const mocha = new Mocha({
      timeout: 30000
    })
    const testFileName = '../tests/' + name + '.test.js'
    global.browser = startBrowser('local.phantom')
    mocha.addFile(testFileName)

    mocha.reporter(Reporter).run(function(failures){
      // test are located in the global report
      console.log(global.report)
    })

    /*const browser = startBrowser('local.phantom')
    const test = require('../../tests/'+name+'.test')
    try {
      test(browser)(() => {
        this.emit("done")
      })
    }
    catch(e){
      this.emit("error", e)
    }*/
  }
}

module.exports = TestRunner
