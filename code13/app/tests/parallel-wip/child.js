const Reporter = require('./Reporter.js')
process.on('message', function(m) {
  const Mocha = require('mocha')
  const mocha = new Mocha({
    //ui: 'tdd',
    reporter: Reporter,
  })
  m.files.forEach(file => {
    mocha.addFile(file)
  })
  mocha.run(failures => {
    process.exit(failures)
  })
})

process.send({ foo: 'bar' })
