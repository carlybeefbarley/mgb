const status = require('./status')
const spawn = require('child_process').spawn

// short for send message ;)
const sm = (ws, action, data) => {
  ws.send(JSON.stringify({action, data}))
}
// send message to ALL connected clients
const smAll = (wss, action, data) => {
  wss.clients.forEach((c) => {
    sm(c, action, data)
  })
}
// send message to OTHER connected clients
const smOthers = (wss, action, data, ws) => {
  wss.clients.forEach((c) => {
    if(c == ws) return
    sm(c, action, data)
  })
}

let port = 4000
module.exports = {
  hello: (data, ws, wss) => {
    console.log("Message from client", data.toString())
    smOthers(wss, 'hello', data, ws)
  },
  start: (data, ws, wss) =>{
    smAll(wss, 'runnerStarted', data)
    port++
    const localPort = port
    const runner = spawn('node', [__dirname + '/testRunner.js', data.name, port], {
      stdio: ['pipe', null, null, null, 'ipc'],
      env: {PATH: process.env.PATH}
    })
    let runnerData

    runner.stdout.on('data', (data) => {
      console.log(`Runner stdout: ${data}`)
    })
    runner.stderr.on('data', (data) => {
      console.log(`Runner error: ${data}`)
    })
    runner.on('message', data => {
      runnerData = JSON.parse(data)
      console.log("From runner:", runnerData)
    })

    runner.on('close', (code) => {
      wss.clients.forEach((c) => {
        sm(c, "runnerCompleted", {
          tests: runnerData,
          port: localPort,
          id: data.id
        })
      })
      console.log(`child process exited with code ${code}`)
    })
  },
  status: (data, ws, wss) => {
    status.update()
    sm(ws, 'status', status)
  }
}
