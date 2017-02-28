let ws
const sendMessage = (action, data) => {
  ws.send(JSON.stringify({action, data}))
}

// this is our workspace
// ml - stands for MGB Loader
window.ml = {}

require(['/widgets/gauge.js', '/widgets/testCase.js', '/widgets/info.js'], () => {
  const status = {
    memory: new ml.Gauge(),
    cpu: new ml.Gauge("blue", "white"),
    info: new ml.Info()
  }
  status.memory.show(document.body)
  status.cpu.show(document.body)
  status.info.show(document.body)

  window.test = new ml.TestCase({name: 'loadPage', id: "Main test case", title: "Simply load page"}, (data) => {
    sendMessage('start', data)
  })

  new ml.TestCase({name: 'login', id: "Login test case", title: "Log In user"}, (data) => {
    sendMessage('start', data)
  })
  const actions = {
    status: (data) => {
      status.memory.progress(data.status.used * 100)
      status.cpu.progress(data.status.loadAvg * 100)
      status.info.addOrUpdate('Phantoms running: ', data.phantoms)
    },
    runnerStarted: data => {
      const testCase = ml.TestCase.find(data.id) || new ml.TestCase(data, () => {
          sendMessage('start', data)
        })
      testCase.init(data)
      // console.log("Runner started:", data)
    },
    runnerCompleted: data => {
      const testCase = ml.TestCase.find(data.id)
      testCase && testCase.update(data)
      // console.log("Runner completed:", data, data.tests[0])
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


