// TODO: cleanup and split module loader from console hacks etc
// TODO: make AllInOne version without external dependencies
'use strict'
var _isAlive = false
var mgbHostMessageContext = { msgSource: null, msgOrigin: null }

var STACK_FRAME_RE = /at ((\S+)\s)?\(?([^:]+):(\d+):(\d+)\)?/
var THIS_FILE = 'codeEditSandbox.html'

function _getCaller() {
  // TODO: Support more browsers.. See https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.js
  var err = new Error()
  if (Error.captureStackTrace) Error.captureStackTrace(err)

  // Throw away the first line of the trace
  var frames = err.stack.split('\n').slice(1)
  // Find the first line in the stack that doesn't name this module.
  var callerInfo = null
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].indexOf(THIS_FILE) === -1) {
      callerInfo = STACK_FRAME_RE.exec(frames[i])
      break
    }
  }

  if (callerInfo) {
    return {
      function: callerInfo[2] || null,
      module: callerInfo[3] || null,
      line: callerInfo[4] || null,
      column: callerInfo[5] || null,
    }
  }
  return null
}

window.onload = function() {
  var errorCount = 0
  var mainWindow = window.parent || window.opener // reference to the last poster

  // hook ajax requests - so we can show them to user
  /*
  TODO: this is sort of nicer message for ajax requests, BUT it breaks Google APIs
  @stauzs - couldn't find reason on the net - but probably related to security
  see dedicated service workers for API

  var origSend = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "send")
  var origOpen = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "open")
  Object.defineProperties(XMLHttpRequest.prototype, {
    send: {
      value: function () {
        var origOnError = this.onerror
        this.onerror = function (e) {
          // TODO: HOW TO GET error details ???
          console.error("Error in the XMLHttpRequest request while loading source:", this.url, e.stack)
          origOnError && origOnError.call(this, e)
        }
        origSend.value.call(this)
      }
    },
    open: {
      value: function (method, url, async, user, password) {
        this.url = url
        origOpen.value.call(this, method, url, async, user, password) // no arguments here
      }
    }
  })*/

  /**** MODULE LOADER *****/
  // here will be stored all imported modules

  var imports = {}
  // SuperSimple implementation for CommonJS like module loading
  window.require = function(key, silent) {
    // true is for global modules
    if (imports[key] && imports[key] !== true) {
      return imports[key]
    }
    // test without @version
    var name = key.split('@').shift()
    if (imports[name] && imports[name] !== true) {
      return imports[name]
    }
    var nname = '/' + name.split(':').pop()
    if (imports[nname] && imports[nname] !== true) {
      return imports[name]
    }
    nname = '/' + name.split('/').pop()
    if (imports[nname] && imports[nname] !== true) {
      return imports[name]
    }
    var ret =
      window[key] ||
      window[name.toUpperCase()] ||
      window[name.substring(0, 1).toUpperCase() + name.substring(1)]
    if (!ret && !silent) {
      console.error('cannot find required resource: ' + key + '. Check if module have export defined')
    }
    return ret
  }

  var baseUrl = '/api/asset/code/es5'
  var normalizeModuleName = function(moduleName, parentModuleName) {
    if (moduleName.indexOf('http') === 0 || moduleName.indexOf('//') === 0) {
      return moduleName
    }
    var moduleNameFixed = moduleName.split(':').join('/')
    if (
      moduleNameFixed.lastIndexOf('/') === 0 &&
      parentModuleName &&
      parentModuleName.lastIndexOf('/') !== 0
    ) {
      moduleNameFixed =
        '/' +
        parentModuleName
          .substring(1)
          .split('/')
          .shift() +
        moduleNameFixed
    }
    const extension = moduleNameFixed.substring(moduleNameFixed.lastIndexOf('.'), moduleNameFixed.length)
    return extension === '.js' ? moduleNameFixed.substr(0, moduleNameFixed.length - 3) : moduleNameFixed
  }

  var moduleCallbacks = {}
  var addCallback = function(moduleName, cb) {
    if (!moduleCallbacks[moduleName]) moduleCallbacks[moduleName] = []

    if (moduleCallbacks[moduleName].locked) {
      return moduleCallbacks[moduleName].locked.push(cb)
    }
    return moduleCallbacks[moduleName].push(cb)
  }
  var releaseCallbacks = function(name) {
    var cbs = moduleCallbacks[name]
    if (!cbs) {
      return
    }
    cbs.locked = []
    for (var i = 0; i < cbs.length; i++) {
      cbs[i]()
    }
    moduleCallbacks[name] = moduleCallbacks[name].locked
  }
  var getExports = function() {
    if (!window.module && !window.exports) return null
    return window.exports === window.module.exports ? window.exports : window.module.exports
  }

  /*
  this is AMD loader
  this is tricky because we don't know who and why called this function */
  window.define = function(array, cb) {
    var args = []
    for (var i = array.length - 1; i > -1; i--) {
      var moduleName = array[i]
      if (moduleName === 'exports') {
        // we need to use globals here to be compatible with commonJS
        window.module = { exports: {} }
        window.exports = window.module.exports
        args[i] = window.exports
        continue
      }
      moduleName = normalizeModuleName(moduleName, define.currentModule)

      var mod = require(moduleName, true)
      if (!mod) {
        var cm = define.currentModule
        window.define.pendingModule = moduleName
        loadModule(
          moduleName,
          function() {
            define.currentModule = cm
            define(array, cb)
          },
          define.currentHash,
        )
        return
      }

      args[i] = mod
    }

    cb.apply(window, args)
    window.define.module = getExports()
  }
  window.define.currentHash = ''
  window.define.getModule = function(name, cb, hash) {
    var moduleName = normalizeModuleName(name)
    var module = window.require(moduleName, true)
    if (module) {
      cb(module)
      return
    }

    loadModule(
      moduleName,
      function(err) {
        window.define.getModule(name, cb, hash)
      },
      hash,
    )
  }
  // we need to eval scripts one by one - otherwise there are racing conditions which are very hard to debug
  var getScriptLocked = false

  function loadModule(moduleName, cb, hash) {
    hash = hash || ''
    var src = moduleName
    if (src.indexOf('http') !== 0 && src.indexOf('//') !== 0) {
      src = baseUrl + moduleName + (hash && hash !== 'latest' ? '?hash=' + hash : '')
    }

    // already loaded
    if (require(moduleName, true)) {
      callback()
      return
    }

    // if this is not first callback - assume that script is already loading
    if (addCallback(moduleName, cb) > 1) {
      return
    }

    getScript(src, function(source) {
      ;(function execMaybe() {
        if (getScriptLocked) {
          addCallback('getScript', execMaybe)
          return
        }
        getScriptLocked = true

        define.currentModule = moduleName
        window.define.currentHash = hash
        appendScript(moduleName, source, function() {
          getScriptLocked = false
          ;(function doNext() {
            if (define.pendingModule) {
              var pendingModule = define.pendingModule
              define.pendingModule = ''
              addCallback(pendingModule, doNext)
            } else {
              saveModule(moduleName)
            }
          })()

          releaseCallbacks('getScript')
        })
      })()
    })
  }

  function saveModule(moduleName) {
    var exports = getExports()
    var shortName = moduleName.substring(moduleName.lastIndexOf('/'))

    if (!imports[moduleName]) imports[moduleName] = exports

    if (!imports[moduleName + '.js']) imports[moduleName + '.js'] = exports

    if (!imports[shortName]) imports[shortName] = exports

    if (!imports[shortName + '.js']) imports[shortName + '.js'] = exports

    releaseCallbacks(moduleName)
  }

  function getScript(src, cb) {
    var xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === XMLHttpRequest.DONE && xhttp.status >= 200 && xhttp.status < 400)
        cb(xhttp.responseText)
    }

    xhttp.onerror = function() {
      console.log('Failed to load script...', src)
    }
    xhttp.open('GET', src, true)
    xhttp.send()
  }

  function loadScript(url, after) {
    // Adding the script tag to the head to load it
    var script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = url

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility, so do both
    script.onreadystatechange = script.onload = function() {
      setTimeout(after, 0)
    }

    script.onerror = function(err) {
      console.warn('Could not load script: ' + url)
      after(err)
    }

    // Fire the loading
    document.head.appendChild(script)
  }

  function appendScript(filename, code, cb) {
    var script = document.createElement('script')
    script.setAttribute('data-origin', filename)
    var name = filename || '_doc_' + ++scriptsLoaded + ''
    if (name.substr(-3) != '.js') {
      name += '.js'
    }

    script.type = 'text/javascript'
    script.text = code + '\n//# sourceURL=' + name

    script.onerror = function(err) {
      console.warn('Could not load script [' + filename + ']')
    }

    // Adding the script tag to the head to load it
    var head = document.getElementsByTagName('head')[0]
    // Fire the loading
    head.appendChild(script)
    // remove from stack
    window.setTimeout(function() {
      cb && cb()
    }, 0)
  }

  /**** END OF MODULE LOADER *****/

  // Wrap the console functions so we can pass the info to parent window
  var consoleMethodNames = ['log', 'debug', 'info', 'warn', 'error'] // trace? dir?
  var consoleOrigFns = {}
  for (var i = 0; i < consoleMethodNames.length; i++) {
    var name = consoleMethodNames[i]
    if (console[name]) {
      consoleOrigFns[name] = {
        name: name,
        origFn: console[name],
      }
      !(function() {
        var maxLength = 10
        var stableName = name
        console[stableName] = function(msg) {
          consoleOrigFns[stableName].origFn.apply(this, arguments)
          var args = []
          for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] == 'object') {
              var cache = []
              args[i] = JSON.stringify(
                arguments[i],
                function(key, value) {
                  if (cache.length > maxLength) {
                    return
                  }
                  if (typeof key === 'symbol') {
                    return
                  }
                  if (key.indexOf('_') === 0) {
                    return
                  }
                  if (typeof value === 'function') {
                    return
                  }
                  if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                      // Circular reference found, discard key
                      return
                    }
                    // Store value in our collection
                    cache.push(value)
                  }
                  return value
                },
                '  ',
              )
              cache = null
            } else {
              args[i] = arguments[i]
            }
          }
          var fromWhence = _getCaller()
          mainWindow.postMessage(
            {
              args: args,
              mgbCmd: 'mgbConsoleMsg',
              consoleFn: stableName,
              timestamp: new Date(),
              line: fromWhence && fromWhence.line ? fromWhence.line : undefined,
              file: fromWhence && fromWhence.module ? fromWhence.module : undefined,
            },
            '*',
          )
        }
      })()
    }
  }

  window.originalWindowOnerror = window.onerror
  window.onerror = function(message, url, lineNumber) {
    errorCount++
    mainWindow.postMessage(
      {
        args: [message], // TODO: A stringify to handle the stuff that can't be xferred. See https://github.com/jsbin/jsbin/blob/master/public/js/vendor/stringify.js
        mgbCmd: 'mgbConsoleMsg',
        consoleFn: 'windowOnerror',
        timestamp: new Date(),
        line: lineNumber,
        url: url,
      },
      '*',
    )
    if (window.originalWindowOnerror) return window.originalWindowOnerror(message, url, lineNumber)
    else return false
  }

  window.addEventListener('error', function(e) {
    console.error('Error occurred: ' + (e.error ? e.error.message : e.message))
    return false
  })

  var scriptsLoaded = 0

  function sendSizeUpdate() {
    window.setTimeout(function() {
      mainWindow.postMessage(
        {
          mgbCmd: 'mgbAdjustIframe',
          size: {
            width: document.body.scrollWidth,
            height: document.body.scrollHeight,
          },
        },
        '*',
      )
    }, 500)
  }

  var isRunning = false
  var commands = {
    ping: function(e) {
      mainWindow.postMessage(_isAlive, e.origin)
    },
    stop: function(e) {
      window.location.reload()
      window.removeEventListener('message', handleMessage)
      isRunning = false
    },
    screenshotCanvas: function(e) {
      var desiredHeight = e.data.recommendedHeight || 150
      var gameCanvas = document.getElementsByTagName('canvas').item(0)
      if (gameCanvas) {
        // use the height the caller suggested
        var scaleMult = desiredHeight / gameCanvas.height
        // Take a 50% size screenshot
        var thumbCanvas = document.createElement('canvas')
        var w = gameCanvas.width * scaleMult
        var h = gameCanvas.height * scaleMult
        thumbCanvas.width = w
        thumbCanvas.height = h
        var thumbCtx = thumbCanvas.getContext('2d')

        thumbCtx.drawImage(gameCanvas, 0, 0, w, h)

        var asDataUrl = thumbCanvas.toDataURL('image/png')
        mainWindow.postMessage(
          {
            mgbCmd: 'mgbScreenshotCanvasResponse',
            pngDataUrl: asDataUrl,
          },
          '*',
        )
      } else console.log('No <canvas> element to screenshot')
    },
    startRun: function(e) {
      if (isRunning) {
        console.log('Already running - stop before running')
        return
      }
      isRunning = true
      mgbHostMessageContext.msgSource = e.source
      mgbHostMessageContext.msgOrigin = e.origin
      var sources = e.data.sourcesToRun
      var run = function run() {
        var source = sources.shift()
        if (source) {
          // console.log("Loading:", source.name)
          if (source.useGlobal) {
            delete window.module
            delete window.exports
          } else {
            window.module = { exports: {} }
            window.exports = window.module.exports
          }

          var saveModuleAndRun = function() {
            var key = source.name.split('@').shift()
            // add user import
            if (source.useGlobal) {
              // otherwise we would show warning
              imports[key] = true
            } else {
              saveModule(key)
            }
            run()
          }

          if (source.loadAsScript) {
            loadScript(source.url, saveModuleAndRun)
          } else {
            appendScript(source.name, source.code, saveModuleAndRun)
          }
        } else {
          // don't log message if HoC
          if (isHoC()) return false
          console.info('MGB: All files have loaded!')
          sendSizeUpdate()
        }
      }
      run()
    },
    requestSizeUpdate: function() {
      sendSizeUpdate()
    },
    approveIsReady: function() {
      mainWindow.postMessage(
        {
          mgbCmd: 'mgbSetIframeReady',
        },
        '*',
      )
    },
  }

  var isHoC = function() {
    var hocStepId = null
    var url = window.location.search
    if (url) url = url.split('&')
    url.forEach(str => {
      if (str && str.startsWith('hocStepId')) {
        hocStepId = str.split('=')[1]
      }
    })
    return hocStepId != null
  }

  var handleMessage = function(e) {
    mainWindow = e.source
    // ignore completely self made messages - as we are only posting messages from code editor window
    if (mainWindow === window) return

    if (commands[e.data.mgbCommand]) {
      commands[e.data.mgbCommand](e)
    } else {
      console.warn('Unknown command received: [' + e.data.mgbCommand + ']', e.data)
    }
  }
  window.addEventListener('message', handleMessage)

  window.addEventListener('beforeunload', function() {
    // remove listener - otherwise there is race condition as old iframe (this) tend to respond to messages after unload has been requested
    window.removeEventListener('message', handleMessage)
    mainWindow.postMessage(
      {
        mgbCmd: 'mgbClosed',
      },
      '*',
    )
  })
}
