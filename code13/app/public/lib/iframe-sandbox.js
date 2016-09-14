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

  // here will be stored all imported objects
  var imports = {};
  // SuperSimple implementation for CommonJS like module loading
  window.require = function(key){
    // true is for global modules
    if(imports[key] && imports[key] !== true) {
      return imports[key]
    }
    // test without @version
    var name = key.split("@").shift();
    if(imports[name] && imports[name] !== true) {
      return imports[name]
    }
    // try to fallback to global
    // TODO: make this more universal - it would fail on something like CamelCaseLib
    // Trace global keys Object.keys(window) before and after loading???
    var ret =  window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)]
    if(!ret){
      console.warn("cannot find required file: ", key)
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
        var stableName = name;
        console[stableName] = function(msg) {
          consoleOrigFns[stableName].origFn.apply(this, arguments);

          var fromWhence = _getCaller()
          window.parent.postMessage( {
            args: Array.prototype.slice.call(arguments),
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
    window.parent.postMessage( {
      args: [message],      // TODO: A stringify to handle the stuff that can't be xferred. See https://github.com/jsbin/jsbin/blob/master/public/js/vendor/stringify.js
      mgbCmd: "mgbConsoleMsg",
      consoleFn: 'windowOnerror',
      timestamp: new Date(),
      line: lineNumber
    }, "*");
    if (window.originalWindowOnerror)
      return window.originalWindowOnerror(message, url, lineNumber);
    else
      return false;
  }

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

  var commands = {
    ping: function(e){
      mainWindow.postMessage(_isAlive, e.origin);
    },
    screenshotCanvas: function(e){
      var desiredHeight = e.data.recommendedHeight || 150;
      var gameCanvas = document.getElementsByTagName ('canvas').item(0);
      if (gameCanvas)
      {
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
        window.parent.postMessage( {
          mgbCmd: "mgbScreenshotCanvasResponse",
          pngDataUrl: asDataUrl
        }, "*");
      }
      else
        console.log("No <canvas> element to screenshot")
    },
    startRun: function(e){
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
          if(source.useGlobal){
            // otherwise we would show warning
            imports[key] = true
          }
          else{
            // first for babel includes (with default support) another one for commonJS includes
            imports[key] = window.exports === window.module.exports ? window.exports : window.module.exports
          }
        }
        else{
          console.log("(info) All files have loaded.")
        }
      };
      run()
    }
  }

  window.addEventListener('message', function (e) {
    mainWindow = e.source;
    if(commands[e.data.mgbCommand]){
      commands[e.data.mgbCommand](e)
    }
    else{
      console.error("Unknown command received: ["+ e.data.mgbCommand +']')
    }
  })
}
