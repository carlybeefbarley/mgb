const http = require('http')
const WebSocketServer = require('ws').Server
const fs = require('fs')

const actions = require('./server/actions')
const slaveActions = require('./server/slaveActions')

const s = http.createServer()

const checkAuth = (headers, user, password) => {
  var auth = headers['authorization']
  if (!auth) {
    return false
  }
  var encPass = auth.substring(6)
  if (new Buffer(encPass, 'base64').toString('binary') == user + ':' + password) {
    return true
  }
  return false
}

s.on('request', (req, res) => {
  const path = req.url == '/' ? '/static/index.html' : '/static' + req.url
  const filename = __dirname + path

  if (!checkAuth(req.headers, 'mgb', 'superSecretPass')) {
    res.writeHead(401, 'Unauthorized', {
      'www-authenticate': 'Basic realm="Default"',
    })
    res.end()
    return
  }

  if (req.headers.accept) {
    const f = req.headers.accept.split(',').shift()
    res.writeHead(200, { 'content-type': f })
  }

  const rs = fs.createReadStream(filename)
  rs.on('error', err => {
    rs.unpipe(res)
    res.writeHead(404, 'not found')
    res.end()
  })
  rs.on('done', () => rs.close())
  rs.pipe(res)
})

s.listen({
  port: 8082,
  host: '0.0.0.0',
})

const wss = new WebSocketServer({ server: s, perMessageDeflate: true })

const clients = []
const slaves = []

setInterval(() => {
  actions.broadcastStatus(clients, slaves)
}, 1000)

const removeWs = (ws, array) => {
  const index = array.findIndex(i => i.ws == ws)
  if (index > -1) array.splice(index, 1)
}

wss.on('connection', ws => {
  if (ws.upgradeReq.url === '/') {
    clients.push({ ws })
    actions.events.status(null, ws, clients, slaves)
    ws.on('message', function(msgStr) {
      try {
        const msg = JSON.parse(msgStr)
        actions.events[msg.action] && actions.events[msg.action](msg.data, ws, clients, slaves)
      } catch (e) {
        console.log('Error in WS connection:', e)
      }
    })

    ws.on('close', () => {
      removeWs(ws, clients)
    })
  } else if (ws.upgradeReq.url === '/slave') {
    console.log('Slave connected...')
    slaves.push({
      ws,
      jobs: 0,
    })
    ws.on('message', function(msgStr) {
      try {
        const msg = JSON.parse(msgStr)
        slaveActions.events[msg.action] && slaveActions.events[msg.action](msg.data, ws, clients, slaves)
      } catch (e) {
        console.log('Error in WS connection:', e)
      }
    })

    ws.on('close', () => {
      console.log('Removing slave!')
      removeWs(ws, slaves)
    })
  }
})
