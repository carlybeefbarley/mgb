const status = require('./status')
const TestRunner = require('./testRunner')
// short for send message ;)
const sm = (ws, action, data) => {
  ws.send(JSON.stringify({action, data}))
}

module.exports = {
  hello: (data, ws, wss) => {
    console.log("Message from client", data)
    wss.clients.forEach((c) => {
      if(c == ws) return
      sm(c, 'hello', data)
    })
  },
  start: (data, ws, wss) =>{

    const testRunner = new TestRunner()
    testRunner.start(data.name)
    testRunner.on("done", (report) => {
      wss.clients.forEach((c) => {
        sm(c, report)
      })
    })
  },
  status: (data, ws, wss) => {
    status.update()
    sm(ws, 'status', status)
  }
}
