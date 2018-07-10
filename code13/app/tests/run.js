;(() => {
  const stack = {
    next: [],
    before: [],
    it: [],
    describe: [],
    timeout() {},
    slow() {},
  }
  const doRun = function() {
    if (stack.next.length) {
      const next = stack.next.shift()
      console.log('NEXT: ', typeof next.label === 'string' ? next.label : '')
      if (next.callback.length > 0) {
        return next.callback.call(stack, doRun)
      } else {
        console.log('instant callback')
        next.callback.call(stack)
        doRun()
        return
      }
    }

    if (stack.describe.length) {
      const next = stack.describe.shift()
      //console.log("\n\nDESCRIBE: ", (typeof next.label === 'string' ? next.label : ''))
      next.callback.call(stack)
      doRun()
      return
    }

    // process.exit()
  }

  global.describe = function(label, callback = label) {
    global.describe = function(label, callback = label) {
      //console.log("\n\nADDING DESCRIBE: ", (typeof label === 'string' ? label : ''))
      stack.describe.unshift({ label, callback })
    }

    //console.log("\n\nADDING DESCRIBE: ", (typeof label === 'string' ? label : ''))
    callback.call(stack)
    //stack.describe.push({label, callback})
    //console.log("\n\nADDING DESCRIBE: ", (typeof label === 'string' ? label : ''))
    doRun()
  }

  global.before = function(label, callback = label) {
    console.log('\n\nADDING before: ', typeof label === 'string' ? label : '')
    stack.next.push({ label, callback })
  }

  global.it = function(label, callback = label) {
    console.log('\n\nADDING it: ', typeof label === 'string' ? label : '')
    stack.next.push({ label, callback })
  }
})()
require('../test/browserstack.test.js')
//setTimeout(() => console.log("DONE!"), 10000)
