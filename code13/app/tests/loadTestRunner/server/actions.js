const status = require('./status')
const spawn = require('child_process').spawn
// short for send message ;)
const sm = (ws, action, data, callback) => {
  ws.send(JSON.stringify({action, data}), callback)
}
// send message to ALL connected clients
const smAll = (wss, action, data, callback) => {
  let toComplete = wss.clients.length
  wss.clients.forEach((c) => {
    sm(c, action, data, () => {
      toComplete--
      if(!toComplete){
        callback && callback()
      }
    })
  })
}
// send message to OTHER connected clients
const smOthers = (wss, action, data, ws, callback) => {
  let toComplete = wss.clients.length - 1
  wss.clients.forEach((c) => {
    if(c == ws) return
    sm(c, action, data, () => {
      toComplete--
      if(!toComplete){
        callback && callback()
      }
    })
  })
}

let port = Math.floor(Math.random() * 1000) + 4000
const phantoms = []
// kill all phantoms


function exitHandler(options, err) {

  phantoms.forEach(p => p.phantom.kill())

  if (options.cleanup) console.log('clean')
  if (err) console.log(err.stack)
  if (options.exit) process.exit()
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}))
//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}))
//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}))

const PHANTOM_MAX_AGE = 5 * 60 * 1000 // 5 minutes

const spawnPhantom = (port, callback = (p) => {p.available = true}) => {
  for(let i=0; i<phantoms.length; i++){
    const p = phantoms[i]
    if(p.available && Date.now() - p.started > PHANTOM_MAX_AGE){
      p.phantom.kill()
      phantoms.splice(i, 1)
      i--
    }
  }

  const oldPhantom = phantoms.find(p => {
    return p.available
  })



  if(oldPhantom){
    oldPhantom.available = false
    // WARNING!!!
    if(oldPhantom.tmpPath.startsWith('/tmp/phantom')){
      //const rm = spawn('rm', ['-rf', oldPhantom.tmpPath])
      //rm.on('exit', () => {
        callback(oldPhantom)
      //})
    }
    else{
      console.error("Failed to clear phantom cache")
    }
    return oldPhantom
  }

  const tmpPath = '/tmp/phantom/' + Date.now() + Math.random()

  const phantom = spawn('phantomjs', [
    '--webdriver=' + port,
    '--local-storage-path=' + tmpPath,
    '--offline-storage-path=' + tmpPath,
    '--cookies-file=' + tmpPath + '/cookies'
    //'--debug=true'
  ], {
    env: {QT_QPA_PLATFORM: "", PATH: process.env.PATH}
  })

  const retval = {
    phantom, port, tmpPath,
    available: false,
    started: Date.now()
  }

  phantom.stderr.on('data', (data) => {
    console.log(`phantom stderr: ${data}`)
  })

  // this is cheesy way to tell that phantom has been started
  phantom.stdout.once('data', () => {callback(retval)})

  phantom.stdout.on('data', data => {
    console.log(`phantom: ${data}`)
  })

  phantom.on('exit', () => {
    console.log("Phantom exit!!!!!!")
    const i = phantoms.findIndex(p => {
      return p == retval
    })
    if(i > -1){
      phantoms.splice(i, 1)
    }
    phantom.kill()
  })


  phantoms.push(retval)
  return retval
}

for(let i=0; i<4; i++){
  spawnPhantom(port++)
}

module.exports = {
  hello: (data, ws, wss) => {
    console.log("Message from client", data.toString())
    smOthers(wss, 'hello', data, ws)
  },
  start: (data, ws, wss) =>{
    smAll(wss, 'runnerStarted', data)
    port++
    const localPort = port

    spawnPhantom(localPort, (phantom) => {
      const runner = spawn('node', [__dirname + '/testRunner.js', data.name, phantom.port], {
        stdio: ['pipe', null, null, null, 'ipc'],
        env: {PATH: process.env.PATH}
      })
      let runnerData

      runner.stdout.on('data', (data) => {
        console.log(`Runner stdout: ${data}`)
      })
      runner.stderr.on('data', (data) => {
        console.log(`Runner error: ${data}`)
        /*sm(ws, 'critical', data.toString(), () => {
          process.exit()
        })*/
      })
      runner.on('message', data => {
        runnerData = JSON.parse(data)
        // console.log("From runner:", runnerData)
      })

      runner.on('close', (code) => {
        wss.clients.forEach((c) => {
          sm(c, "runnerCompleted", {
            tests: runnerData,
            port: localPort,
            id: data.id
          })
        })

        // release phantom
        phantom.available = true
        // console.log(`child process exited with code ${code}`)
      })
    })

  },
  status: (data, ws, wss) => {
    status.update()
    sm(ws, 'status', {status, phantoms: phantoms.length})
  }
}
