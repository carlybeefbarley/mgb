const http = require('http')
const WebSocketServer = require("ws").Server
const fs = require('fs')
const actions = require('./server/actions')

const s = http.createServer()
s.on('request', (req, res) => {
  const path = req.url == '/' ? '/static/index.html' : '/static' + req.url
  const filename = process.cwd() + path
  const rs = fs.createReadStream(filename)

  if(req.headers.accept){
    const f = req.headers.accept.split(',').shift()
    res.writeHead(200, {'content-type': f})
  }

  rs.on("error", err => {
    rs.unpipe(res)
    res.writeHead(404, "not found")
    res.end()
  })
  rs.on("done", () => rs.close())
  rs.pipe(res)
})

s.listen({
  port: 8082,
  host: "127.0.0.1"
})

const wss = new WebSocketServer({server: s, perMessageDeflate: true})
setInterval(() => {
  wss.clients.forEach((ws) => {
    actions.status(null, ws, wss)
  })
}, 1000)

wss.on('connection', (ws) => {
  actions.status(null, ws, wss)
  ws.on("message", function(msgStr){
    try{
      const msg = JSON.parse(msgStr)
      actions[msg.action] && actions[msg.action](msg.data, ws, wss)
    }
    catch(e){
      console.log("Error in WS connection:", e)
    }
  })
})
