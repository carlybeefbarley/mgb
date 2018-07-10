const WebSocket = require('ws')

// short for send message ;)
const sm = (module.exports.sm = (ws, action, data, callback) => {
  if (ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({ action, data }), callback)
})
// send message to ALL connected clients
const smAll = (module.exports.smAll = (clients, action, data, callback, url = '/') => {
  let toComplete = 0
  clients.forEach(cr => {
    const c = cr.ws
    if (c.upgradeReq.url !== url || c.readyState !== WebSocket.OPEN) return
    toComplete++
  })
  clients.forEach(cr => {
    const c = cr.ws
    if (c.upgradeReq.url !== url || c.readyState !== WebSocket.OPEN) return
    sm(c, action, data, () => {
      toComplete--
      if (!toComplete) {
        callback && callback()
      }
    })
  })
})
// send message to OTHER connected clients
const smOthers = (module.exports.smOthers = (clients, action, data, ws, callback) => {
  let toComplete = 0
  clients.forEach(cr => {
    const c = cr.ws
    if (c == ws || c.upgradeReq.url !== ws.upgradeReq.url || c.readyState !== WebSocket.OPEN) return
    toComplete++
  })
  clients.forEach(cr => {
    const c = cr.ws
    if (c == ws || c.upgradeReq.url !== ws.upgradeReq.url || c.readyState !== WebSocket.OPEN) return
    sm(c, action, data, () => {
      toComplete--
      if (!toComplete) {
        callback && callback()
      }
    })
  })
})
