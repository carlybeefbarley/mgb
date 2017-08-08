// TODO: cleanup and split module loader from console hacks etc
// TODO: make AllInOne version without external dependencies
var _isAlive = false;
var mgbHostMessageContext = { msgSource: null, msgOrigin: null };

var STACK_FRAME_RE = /at ((\S+)\s)?\(?([^:]+):(\d+):(\d+)\)?/;
var THIS_FILE = "codeEditSandbox.html"

function _getCaller() {
  // TODO: Support more browsers.. See https://github.com/stacktracejs/error-stack-parser/blob/master/error-stack-parser.js
  var err = new Error();
  if (Error.captureStackTrace)
    Error.captureStackTrace(err);

  // Throw away the first line of the trace
  var frames = err.stack.split('\n').slice(1);
  // Find the first line in the stack that doesn't name this module.
  var callerInfo = null;
  for (var i = 0; i < frames.length; i++) {
    if (frames[i].indexOf(THIS_FILE) === -1) {
      callerInfo = STACK_FRAME_RE.exec(frames[i]);
      break;
    }
  }

  if (callerInfo) {
    return {
      function: callerInfo[2] || null,
      module:   callerInfo[3] || null,
      line:     callerInfo[4] || null,
      column:   callerInfo[5] || null
    };
  }
  return null;
}

window.onload = function() {
  var errorCount = 0;
  var mainWindow = window.parent; // reference to the last poster

  // hook ajax requests - so we can show them to user
  var origSend = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "send")
  var origOpen = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "open")
  Object.defineProperties(XMLHttpRequest.prototype, {
    send: {
      value: function(){
        var origOnError = this.onerror
        this.onerror = function(e){
          // TODO: HOW TO GET error details ???
          console.error("Error in the XMLHttpRequest request while loading source:", this.url, e.stack)
          origOnError && origOnError.call(this, e)
        }
        origSend.value.call(this)
      }
    },
    open: {
      value: function(method, url, async, user, password){
        this.url = url
        origOpen.value.call(this, method, url, async, user, password) // no arguments here
      }
    }
  })


  // here will be stored all imported objects
  var imports = {};
  // SuperSimple implementation for CommonJS like module loading
  window.require = function(key){
    // true is for global modules
    if(imports[key] && imports[key] !== true) {
      return imports[key]
    }
    // test without @version
    var name = key.split("@").shift()
    if(imports[name] && imports[name] !== true) {
      return imports[name]
    }
    name = name.split(":").pop();
    if(imports[name] && imports[name] !== true) {
      return imports[name]
    }
    // try to fallback to global
    // TODO: make this more universal - it would fail on something like CamelCaseLib
    // Trace global keys Object.keys(window) before and after loading???
    var ret =  window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)]
    if(!ret){
      console.warn("cannot find required resource: " + key + ". Check if module have export defined")
    }
    return ret
  }

  // Wrap the console functions so we can pass the info to parent window
  var consoleMethodNames = ["log", "debug", "info", "warn", "error"]  // trace? dir?
  var consoleOrigFns = {}
  for (var i = 0; i < consoleMethodNames.length; i++) {
    var name = consoleMethodNames[i]
    if (console[name])
    {
      consoleOrigFns[name] = {
        "name": name,
        "origFn": console[name]
      }
      !function() {
        var maxLength =10
        var stableName = name
        console[stableName] = function(msg) {
          consoleOrigFns[stableName].origFn.apply(this, arguments);
          var args = []
          for(var i=0; i<arguments.length; i++){
            if(typeof arguments[i] == "object"){
              var cache = [];
              args[i] = JSON.stringify(arguments[i], function (key, value) {
                if(cache.length > maxLength){
                  return
                }
                if (typeof key === 'symbol') {
                  return
                }
                if (key.indexOf("_") === 0) {
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
              }, "  ")
              cache = null
            }
            else{
              args[i] = arguments[i]
            }
          }
          var fromWhence = _getCaller()
          mainWindow.postMessage({
            args: args,
            mgbCmd: "mgbConsoleMsg",
            consoleFn: stableName,
            timestamp: new Date(),
            line: fromWhence && fromWhence.line ? fromWhence.line : undefined,
            file: fromWhence && fromWhence.module ? fromWhence.module : undefined,
          }, "*");
        }
      }()
    }
  }

  window.originalWindowOnerror = window.onerror
  window.onerror = function(message, url, lineNumber) {
    errorCount++
    mainWindow.postMessage({
      args: [message],      // TODO: A stringify to handle the stuff that can't be xferred. See https://github.com/jsbin/jsbin/blob/master/public/js/vendor/stringify.js
      mgbCmd: "mgbConsoleMsg",
      consoleFn: 'windowOnerror',
      timestamp: new Date(),
      line: lineNumber,
      url: url
    }, "*");
    if (window.originalWindowOnerror)
      return window.originalWindowOnerror(message, url, lineNumber);
    else
      return false;
  }

  window.addEventListener("error", function (e) {
    console.error("Error occurred: " + e.error.message);
    return false;
  })

  // is it safe to remove?
  function loadScript(url, callback) {
    // Adding the script tag to the head to load it
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility, so do both
    script.onreadystatechange = script.onload = function(){
      setTimeout(callback, 0)
    }

    script.onerror = function(err) {
      console.warn("Could not load script: " + url);
    }

    // Fire the loading
    head.appendChild(script);
  }

  var scriptsLoaded = 0;
  function appendScript(filename, code, cb){
      var script = document.createElement('script');
      script.setAttribute("data-origin", filename);
      var name = filename || "_doc_"+ (++scriptsLoaded) +"";
      if(name.substr(-3) != ".js"){
        name += ".js";
      }

      script.type = 'text/javascript';
      script.text = code + "\n//# sourceURL=" + name;

      // var src = code + "\n//# sourceURL=" + name;
      // script.src = URL.createObjectURL(new Blob([src]));

      script.onerror = function(err) {
        console.warn("Could not load script ["+ filename + "]");
      }

      // Adding the script tag to the head to load it
      var head = document.getElementsByTagName('head')[0];
      // Fire the loading
      head.appendChild(script)
      // remove from stack
      window.setTimeout(function(){
        cb && cb()
      }, 0)
  }

  function loadScriptFromText(srcText, filename, callback) {
    appendScript(filename, srcText, callback);
  }

  function sendSizeUpdate(){
    window.setTimeout(function () {
      mainWindow.postMessage({
        mgbCmd: "mgbAdjustIframe",
        size: {
          width: document.body.scrollWidth,
          height: document.body.scrollHeight
        }
      }, "*");
    }, 500)
  }


  var isRunning = false;
  var commands = {
    ping: function (e) {
      mainWindow.postMessage(_isAlive, e.origin)
    },
    stop: function(e){
      window.location.reload()
      window.removeEventListener('message', handleMessage)
      isRunning = false
    },
    screenshotCanvas: function (e) {
      var desiredHeight = e.data.recommendedHeight || 150
      var gameCanvas = document.getElementsByTagName('canvas').item(0)
      if (gameCanvas) {
        // use the height the caller suggested
        var scaleMult = desiredHeight/gameCanvas.height;
        // Take a 50% size screenshot
        var thumbCanvas = document.createElement('canvas');
        var w = gameCanvas.width  * scaleMult;
        var h = gameCanvas.height * scaleMult;
        thumbCanvas.width = w;
        thumbCanvas.height = h;
        var thumbCtx = thumbCanvas.getContext('2d');

        thumbCtx.drawImage(gameCanvas, 0, 0, w, h)

        var asDataUrl = thumbCanvas.toDataURL('image/png')
        mainWindow.postMessage({
          mgbCmd: "mgbScreenshotCanvasResponse",
          pngDataUrl: asDataUrl
        }, "*");
      }
      else
        console.log("No <canvas> element to screenshot")
    },
    startRun: function (e) {
      if(isRunning){
        console.log("Already running - stop before running")
        return
      }
      isRunning = true
      mgbHostMessageContext.msgSource = e.source
      mgbHostMessageContext.msgOrigin = e.origin
      var sources = e.data.sourcesToRun
      var run = function run(){
        var source = sources.shift()
        if(source){
          // console.log("Loading:", source.name)
          if(source.useGlobal){
            delete window.module
            delete window.exports
          }
          else{
            window.module = {exports: {}}
            window.exports = window.module.exports
          }

          appendScript(source.name, source.code, run)

          var key = source.name.split("@").shift()

          var localKeyWithExt = key.split("/").pop()
          // add user import
          var localKey = localKeyWithExt.split(".").shift().split(":").pop()
          if(source.useGlobal){
            // otherwise we would show warning
            imports[key] = true
          }
          else{
            //e.g.:  import localKey from 'key'
            // first for babel includes (with default support) another one for commonJS includes
            if(!imports[key])
              imports[key] = window.exports === window.module.exports ? window.exports : window.module.exports

            // babel quirks
            if(!imports[key+'.js'])
              imports[key+'.js'] = window.exports === window.module.exports ? window.exports : window.module.exports

            if(!imports[localKey])
              imports[localKey] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (source.localName && !imports[source.localName])
              imports[source.localName] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (source.name && !imports[source.name])
              imports[source.name] = window.exports === window.module.exports ? window.exports : window.module.exports
          }
        }
        else{
          console.info("MGB: All files have loaded!")
          sendSizeUpdate()
        }
      };
      run()
    },
    requestSizeUpdate: function(){
      sendSizeUpdate()
    },
    approveIsReady: function () {
      mainWindow.postMessage({
        mgbCmd: "mgbSetIframeReady"
      }, "*")
    }
  }

  var handleMessage = function (e) {
    mainWindow = e.source;
    // ignore completely self made messages - as we are only posting messages from code editor window
    if (mainWindow === window)
      return

    if(commands[e.data.mgbCommand]){
      commands[e.data.mgbCommand](e)
    }
    else{
      console.warn("Unknown command received: ["+ e.data.mgbCommand +']')
    }
  }
  window.addEventListener('message', handleMessage)

  window.addEventListener('beforeunload', function() {
    // remove listener - otherwise there ir race condition as old iframe (this) tend to respond to messages after unload has been requested
    window.removeEventListener('message', handleMessage)
    mainWindow.postMessage({
      mgbCmd: "mgbClosed"
    }, "*")
  })
}
