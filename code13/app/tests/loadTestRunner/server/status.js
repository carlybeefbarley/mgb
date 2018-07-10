var os = require('os')
class Status {
  constructor() {
    this.update()
  }
  update() {
    this.freeMem = os.freemem()
    this.totalMem = os.totalmem()
    this.used = (this.totalMem - this.freeMem) / this.totalMem
    this.cpus = os.cpus()
    // make this nicer - atm reports only last minute avg
    this.loadAvg = os.loadavg()[0] / this.cpus.length
  }
}

module.exports = new Status()
