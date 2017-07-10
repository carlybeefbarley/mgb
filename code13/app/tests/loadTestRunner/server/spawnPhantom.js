const spawn = require('child_process').spawn
const PHANTOM_MAX_AGE = 5 * 60 * 1000 // 5 minutes
const phantoms = []

const spawnPhantom = (
  port,
  callback = p => {
    p.available = true
  },
) => {
  for (let i = 0; i < phantoms.length; i++) {
    const p = phantoms[i]
    if (p.available && Date.now() - p.started > PHANTOM_MAX_AGE) {
      p.phantom.kill()
      phantoms.splice(i, 1)
      i--
    }
  }

  const oldPhantom = phantoms.find(p => {
    return p.available
  })

  if (oldPhantom) {
    oldPhantom.available = false
    // WARNING!!!
    if (oldPhantom.tmpPath.startsWith('/tmp/phantom')) {
      //const rm = spawn('rm', ['-rf', oldPhantom.tmpPath])
      //rm.on('exit', () => {
      callback(oldPhantom)
      //})
    } else {
      console.error('Failed to clear phantom cache')
    }
    return oldPhantom
  }

  const tmpPath = '/tmp/phantom/' + Date.now() + Math.random()

  const phantom = spawn(
    'phantomjs',
    [
      '--webdriver=' + port,
      '--local-storage-path=' + tmpPath,
      '--offline-storage-path=' + tmpPath,
      '--cookies-file=' + tmpPath + '/cookies',
      //'--debug=true'
    ],
    {
      env: { QT_QPA_PLATFORM: '', PATH: process.env.PATH },
    },
  )

  const retval = {
    phantom,
    port,
    tmpPath,
    available: false,
    started: Date.now(),
  }

  phantom.stderr.on('data', data => {
    console.log(`phantom stderr: ${data}`)
  })

  // this is cheesy way to tell that phantom has been started
  phantom.stdout.once('data', () => {
    callback(retval)
  })

  phantom.stdout.on('data', data => {
    console.log(`phantom: ${data}`)
  })

  phantom.on('exit', () => {
    console.log('Phantom exit!!!!!!')
    const i = phantoms.findIndex(p => {
      return p == retval
    })
    if (i > -1) {
      phantoms.splice(i, 1)
    }
    phantom.kill()
  })

  phantoms.push(retval)
  return retval
}

module.exports = spawnPhantom
spawnPhantom.phantoms = phantoms
// kill all phantoms on exit
function exitHandler(options, err) {
  phantoms.forEach(p => p.phantom.kill())
  if (options.cleanup) console.log('clean')
  if (err) console.log(err.stack)
  if (options.exit) process.exit()
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }))
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }))
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))
