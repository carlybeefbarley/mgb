const WebSocket = require('ws')
const { sm, smAll, smOthers } = require('./server/wsTools')

const events = require('./server/slave/slaveEvents')
const restart = () => {
  const masterAddr = process.argv[2] || '127.0.0.1:8082'
  const ws = new WebSocket(`ws://${masterAddr}/slave`, {
    perMessageDeflate: true,
  })

  ws.on('message', msgStr => {
    try {
      const msg = JSON.parse(msgStr)
      events[msg.action] && events[msg.action](msg.data, ws)
    } catch (e) {
      console.log('Error in WS connection:', e)
    }
  })
  ws.on('open', () => {
    sm(ws, 'test', 'this is test data')
  })

  const onClose = () => {
    console.log('Socket closed.. re-opening')
    setTimeout(restart, 1000)
  }
  ws.on('close', onClose)
  ws.on('error', err => {
    console.log('Error in WS:', err)
  })
}
restart()
