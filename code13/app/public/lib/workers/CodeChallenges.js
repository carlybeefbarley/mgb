this.onmessage = receiveMessage
// tell main window that we are ready to work
this.postMessage({
  prefix: 'codeTests',
  results: 'ready',
})



let code, mgbData, mgbResults, mgbError, mgbConsole


/*
* assert functionality
*/
const assert = function (mgbResult, mgbMessage) {
  mgbResults.push({
    success: mgbResult ? true : false,
    message: mgbMessage
  })
  if (mgbResults.length == mgbData.tests.length) {
    callback(mgbResults)
  }
}

assert.isNumber = function (n, mgbMessage) {
  return assert(!isNaN(parseFloat(n)) && isFinite(n), mgbMessage)
}

assert.isNaN = function (n, mgbMessage) {
  return assert(isNaN(n), mgbMessage)
}

assert.deepEqual = function (x, y, mgbMessage) {
  return assert(deepEqual(x, y), mgbMessage)
}

const deepEqual = function (x, y) {
  if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop)) {
        if (!deepEqual(x[prop], y[prop]))
          return false;
      }
      else
        return false;
    }

    return true;
  }
  else if (x !== y)
    return false;
  else
    return true;
}

function callback(mgbResults) {
  const message = {
    prefix: 'codeTests',
    results: mgbResults,
    error: mgbError,
    console: mgbConsole
  }
  this.postMessage(message)
  console.log("Message posted!")
}



/*
* receive user code and start testing
*/
function receiveMessage(mgbEvent) {
  mgbResults = []
  mgbError = null
  mgbConsole = null
  mgbData = mgbEvent.data
  code = mgbData.code

  // eval additional (before user code) functionality for more complex tasks
  if (mgbData.head) {
    try {
      eval(mgbData.head)
    }
    catch (err) {
      console.warn('Head error', err)
    }
  }

  // import exception
  if (mgbData.importException) {
    code = '/*' + code + '*/'
  }

  // eval user code and save error message if is present
  try {
    eval(code)
  }
  catch (err) {
    mgbError = err.message
  }

  // eval additional (after user code) functionality for more complex tasks
  if (mgbData.tail) {
    try {
      eval(mgbData.tail)
    }
    catch (err) {
      console.warn('Tail error', err)
    }
  }

  // save console output
  if (typeof logOutput !== 'undefined') {
    mgbConsole = logOutput
  }


  // run tests. Note that some tests can have errors (because of user code)
  mgbData.tests.forEach((mgbTest) => {
    try {
      eval(mgbTest)
    }
    catch (err) {
      assert(false, mgbTest.split('message: ')[1].slice(0, -3))
    }
  })
}
