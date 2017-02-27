const require = (sources, cb) => {
  const load = () => {
    if (!sources.length) {
      cb()
      return
    }
    const script = document.createElement('script')
    script.onload = load
    script.src = sources.shift()
    document.head.appendChild(script)
  }
  load()
}

let ws
const sendMessage = (action, data) => {
  ws.send(JSON.stringify({action, data}))
}

require(['widgets/gauge.js'], () => {
  const statMeter = new Gauge()
  statMeter.show(document.body)

  const actions = {
    status: (data) => {
      statMeter.progress(data.used * 100)
      //console.log("status:", data)
    }
  }
  ws = new WebSocket('ws://' + window.location.host)

  // hot reload ;)
  ws.addEventListener('close', () => window.location.reload())
  ws.addEventListener('message', msgStr => {
    const msg = JSON.parse(msgStr.data)
    if (actions[msg.action]) {
      actions[msg.action](msg.data)
    }
    else {
      console.log("Unknown message from server:", msg)
    }
  })

})


