let ws
const sendMessage = (action, data) => {
  ws.send(JSON.stringify({ action, data }))
}

// this is our workspace
// ml - stands for MGB Loader
window.ml = {}

require(['/widgets/gauge.js', '/widgets/testCase.js', '/widgets/info.js'], () => {
  const txt = {
    startSlave: 'Start New Slave',
    updateSlaves: 'Update All Slaves',
    terminateSlaves: 'Terminate All Slaves',
  }
  const status = {
    memory: new window.ml.Gauge('yellow', 'red', 'memory'),
    cpu: new window.ml.Gauge('yellow', 'blue', 'cpu'),
    info: new window.ml.Info(),
  }
  status.memory.show(document.body)
  status.cpu.show(document.body)
  status.info.show(document.body)

  const restart = data => sendMessage('start', data)
  new window.ml.TestCase({ name: 'load.home.page', id: 'load.home.page', title: 'Load home page' }, restart)
  new window.ml.TestCase({ name: 'login', id: 'login', title: 'Test Log In' }, restart)

  new window.ml.TestCase(
    { name: 'code.observer', id: 'code.observer', title: 'Open code asset with 9 imports' },
    restart,
  )
  new window.ml.TestCase(
    { name: 'adjust.settings', id: 'adjust.settings', title: 'Adjust Settings' },
    restart,
  )

  // code bundling is broken on phantomjs
  // new window.ml.TestCase({name: 'code.mentor', id: 'code.mentor', title: 'Test Code Mentor'}, restart)
  // new window.ml.TestCase({name: 'code.bundler', id: "code.bundler", title: 'Test Code Bundler'}, restart)
  // new window.ml.TestCase({name: 'code.update', id: 'code.update', title: 'Test Code Updates'}, restart)

  new window.ml.TestCase(
    { name: 'code.load.import', id: "code.load.import'", title: 'Test Import Loader' },
    restart,
  )

  new window.ml.TestCase({ name: 'graphic', id: 'graphic', title: 'Test Graphic Editor' }, restart)
  new window.ml.TestCase({ name: 'map.simple', id: 'map.simple', title: 'Test Map Editor' }, restart)

  // new window.ml.TestCase({name: 'random.error', id: 'random.error', title: 'SelfTest: Generate Errors Randomly'}, restart)
  status.info.addOrUpdate(txt.startSlave, '', () => {
    sendMessage('startSlave')
  })
  status.info.addOrUpdate(txt.updateSlaves, '', () => {
    sendMessage('updateSlaves')
  })
  status.info.addOrUpdate(txt.terminateSlaves, '', () => {
    confirm('DO YOU REALLY WANT TO TERMINATE ALL SLAVES???') && sendMessage('terminateSlaves')
  })

  const actions = {
    status(data) {
      status.memory.progress(data.status.used * 100)
      status.cpu.progress(data.status.loadAvg * 100)
      status.info.addOrUpdate('Clients connected: ', data.clients)
      status.info.addOrUpdate('Slaves available: ', data.slaves)
    },
    runnerStarted(data) {
      const testCase =
        window.ml.TestCase.find(data.id) ||
        new window.ml.TestCase(data, () => {
          sendMessage('start', data)
        })
      testCase.init(data)
      // console.log("Runner started:", data)
    },
    runnerCompleted(data) {
      const testCase = window.ml.TestCase.find(data.id)
      testCase && testCase.update(data)
      // console.log("Runner completed:", data, data.tests[0])
    },
    slaveStarting(data) {
      status.info.addOrUpdate(txt.startSlave, 'Starting Slave')
    },
    slaveStarted(data) {
      status.info.addOrUpdate('StartSlave', '', () => {
        sendMessage('startSlave')
        return 'starting'
      })
    },
    slavesTerminating(data) {
      console.log('Slaves terminating...')
    },
    slavesTerminated(data) {
      console.log('Slaves terminated...')
    },
    log(data) {
      console.log('>>>', data)
    },
    critical(data) {
      alert('Critical error!\n' + data)
    },
    error(data) {
      alert('Error:\n' + data)
    },
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
    } else {
      console.log('Unknown message from server:', msg)
    }
  })
})
