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

  const restart = data => sendMessage('start', data)
  new ml.TestCase({name: 'load.home.page', id: 'load.home.page', title: 'Load home page'}, restart)
  new ml.TestCase({name: 'login', id: 'login', title: 'Test Log In'}, restart)

  new ml.TestCase({name: 'adjust.settings', id: "adjust.settings", title: 'Adjust Settings'}, restart)
  new ml.TestCase({name: 'code.bundler', id: "code.bundler", title: 'Test Code Bundler'}, restart)
  new ml.TestCase({name: 'code.load.import', id: "code.load.import'", title: 'Test Import Loader'}, restart)
  new ml.TestCase({name: 'code.mentor', id: 'code.mentor', title: 'Test Code Mentor'}, restart)
  new ml.TestCase({name: 'code.update', id: 'code.update', title: 'Test Code Updates'}, restart)
  new ml.TestCase({name: 'graphic', id: 'graphic', title: 'Test Graphic Editor'}, restart)
  new ml.TestCase({name: 'map.simple', id: 'map.simple', title: 'Test Map Editor'}, restart)

  new ml.TestCase({name: 'random.error', id: 'random.error', title: 'SelfTest: Generate Errors Randomly'}, restart)

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
    },
    critical: data => {
      alert("Critical error!\n" + data)
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


