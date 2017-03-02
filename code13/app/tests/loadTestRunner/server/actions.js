const status = require('./status')
const {sm, smAll, smOthers} = require('./wsTools')
const slaveActions = require('./slaveActions')

module.exports = {
  broadcastStatus: (clients, slaves) => {
    status.update()
    clients.forEach( (c) => {
      module.exports.events.status(null, c.ws, clients, slaves)
    })
    // smAll(wss, 'status', {status, phantoms: 0})
  },
  events: {
    hello: (data, ws, clients, slaves) => {
      console.log("Message from client", data.toString())
      smOthers(clients, 'hello', data, ws)
    },
    start: (data, ws, clients, slaves) => {
      smAll(clients, 'runnerStarted', data)
      slaveActions.events.start(data, ws, clients, slaves)
    },
    status: (data, ws, clients, slaves) => {
      status.update()
      sm(ws, 'status', {status, clients: clients.length, slaves: slaves.length})
    }
  }
}
