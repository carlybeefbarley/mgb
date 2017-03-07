const clientActions = require('./actions')
const {sm, smAll, smOthers} = require('./wsTools')

const getIdleSlave = (slaves) => {
  slaves.sort((a, b) => {
    return a.jobs - b.jobs
  })
  return slaves[0]
}
const findSlave = (slave, slaves) => {
  return slaves.find(s => s.ws == slave)
}

const events = {
  test: (data, ws, clients, slaves) => {
    console.log("From Slave:", data)
    sm(ws, "test", {test: "123"})
  },
  start: (data, ws, clients, slaves) => {
    if(!slaves.length){
      sm(ws, 'error', 'No slaves available!')
      smAll(clients, 'runnerCompleted', data)
      return
    }
    const slave = getIdleSlave(slaves)
    if (slave) {
      console.log(`Starting test on slave with ${slave.jobs} jobs already running on: ${
        slave.ws.upgradeReq.headers['x-forwarded-for'] || slave.ws.upgradeReq.connection.remoteAddress}`)
      slave.jobs++
      sm(slave.ws, "start", data)
    }
    else {
      console.log("No slaves available !!!")
      setTimeout(() => {
        events.start(data, ws, clients, slaves)
      }, 1000)
    }
  },
  runnerCompleted: (data, ws, clients, slaves) => {
    const slave = findSlave(ws, slaves)
    if(slave){
      slave.jobs--
    }

    //console.log("Runner completed!")
    smAll(clients, 'runnerCompleted', data)
    //clientActions.events.runnerCompleted(data, ws, clients, slaves)
  },
  updateSlaves: (data, ws, clients, slaves) => {
    slaves.forEach((slave) => {
      sm(slave.ws, "update", data)
    })
  },
  updateCompleted: (data, ws, clients, slaves) => {
    console.log(`Slave updated: ${
      ws.upgradeReq.headers['x-forwarded-for'] || ws.upgradeReq.connection.remoteAddress}`)
  }
}
module.exports = {
  events
}
