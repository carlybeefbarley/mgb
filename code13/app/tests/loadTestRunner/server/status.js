var os = require('os')
class Status {
  constructor(){
    this.update()
  }
  update(){
    this.freeMem = os.freemem()
    this.totalMem = os.totalmem()
    this.used = this.freeMem / this.totalMem
  }
}


module.exports = new Status()
