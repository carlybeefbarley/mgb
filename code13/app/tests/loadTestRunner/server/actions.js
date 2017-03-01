const status = require('./status')
const spawn = require('child_process').spawn
const spawnPhantom = require('./spawnPhantom')
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
    sm(ws, 'status', {status, phantoms: spawnPhantom.phantoms.length})
  }
}
