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

require(['widgets/gauge.js', 'widgets/testCase.js'], () => {
  const statMeter = new Gauge()
  const loadMeter = new Gauge("blue", "white")

  statMeter.show(document.body)
  loadMeter.show(document.body)

  const actions = {
    status: (data) => {
      statMeter.progress(data.used * 100)
      loadMeter.progress(data.loadAvg * 100)
      // console.log("status:", data.loadAvg)
    },
    runnerStarted: data => {
      const testCase = new TestCase(data)
      console.log("Runner started:", data)
    },
    runnerCompleted: data => {
      const testCase = TestCase.find(data.id)
      testCase.update(data)
      console.log("Runner completed:", data, data.tests[0])
    }
  }
  ws = new WebSocket('ws://' + window.location.host)

  // hot reload
  ws.addEventListener('close', () => {
    window.setInterval(() => {
      const bws = new WebSocket('ws://' + window.location.host)
      bws.onopen = () => {
        window.location.reload()
      }
    }, 1000)

  })

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


