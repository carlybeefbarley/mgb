const spawn = require('child_process').spawn
const spawnPhantom = require('../spawnPhantom')
const { sm } = require('../wsTools')

let port = Math.floor(Math.random() * 1000) + 4000
module.exports = {
  test(data, ws) {
    console.log('Test message from Master:', data)
  },
  start(data, ws) {
    port++
    const localPort = port
    spawnPhantom(localPort, phantom => {
      const runner = spawn('node', [__dirname + '/../testRunner.js', data.name, phantom.port], {
        stdio: ['pipe', null, null, null, 'ipc'],
        env: { PATH: process.env.PATH },
      })
      let runnerData

      runner.stdout.on('data', data => {
        console.log(`Runner stdout: ${data}`)
      })
      runner.stderr.on('data', data => {
        console.log(`Runner error: ${data}`)
        /*sm(ws, 'critical', data.toString(), () => {
         process.exit()
         })*/
      })
      runner.on('message', data => {
        runnerData = JSON.parse(data)
        // console.log("From runner:", runnerData)
      })

      runner.on('close', code => {
        sm(ws, 'runnerCompleted', {
          tests: runnerData,
          port: localPort,
          id: data.id,
        })

        // release phantom
        phantom.available = true
        // console.log(`child process exited with code ${code}`)
      })
    })
  },
  update(data, ws) {
    console.log('updating...')
    const update = spawn(__dirname + '/../../../updateSlave.sh', {
      env: { PATH: process.env.PATH },
    })
    update.on('close', () => {
      console.log('update completed')
      sm(ws, 'updateCompleted', {})
    })
  },
}
