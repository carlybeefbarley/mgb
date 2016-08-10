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
  _isAlive = true;
  var imports = {};
  window.require = function(key){
    return imports[key];
  };

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

  originalWindowOnerror = window.onerror
  window.onerror = function(message, url, lineNumber) {
    window.parent.postMessage( {
      args: [message],      // TODO: A stringify to handle the stuff that can't be xferred. See https://github.com/jsbin/jsbin/blob/master/public/js/vendor/stringify.js
      mgbCmd: "mgbConsoleMsg",
      consoleFn: 'windowOnerror',
      timestamp: new Date(),
      line: lineNumber
    }, "*");
    if (originalWindowOnerror)
      return originalWindowOnerror(message, url, lineNumber);
    else
      return false;
  }

  function loadScript(url, callback) {
    // Adding the script tag to the head to load it
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility, so do both
    script.onreadystatechange = callback;
    script.onload = callback;
    script.onerror = function(err) {
      console.warn("Could not load script: " + url);
    }

    // Fire the loading
    head.appendChild(script);
  }

  // TODO: find out if we can get imports from babel AST
  function parseImport(src){
    var toFind = "require";
    var buffer = '';
    var ret = [];
    var getImport = function(char){
      if(char == " "){
        return;
      }
      buffer += char;
      if(buffer.length > toFind.length){
        buffer = buffer.substring(1);
      }
      if(buffer == toFind){
        buffer = '';
        cb = getSource
      }
    }
    var getSource = function(char){
      if(char == " "){
        return;
      }
      if(buffer == '' && char != "("){
        cb = getImport;
        cb(char);
        return;
      }
      if(char == ")"){
        // strip (' and final '
        buffer = buffer.substring(2, buffer.length - 1);
        ret.push(buffer)
        buffer = '';
        cb = getImport;
      }
      buffer += char;
    }
    var cb = getImport;
    for(var i=0; i<src.length - 1; i++){
      cb(src.substring(i, i+1))
    }
    return ret;
  }

  function parseImport2(babel){
    var imp = babel.metadata.modules.imports
    var ret = []
    for(var i=0; i<imp.length; i++){
      ret.push(imp[i].source)
    }
    return ret
  }

  // TODO: somehow resolve user's script and global lib
  function loadImport(urlFinalPart, cb) {
    // atm server will try to generate script
    var url = '/api/asset/code/' + urlFinalPart;
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
      if (httpRequest.readyState !== XMLHttpRequest.DONE || httpRequest.status !== 200) {
        return;
      }
      var src = httpRequest.responseText
      window.exports = {};
      loadScriptFromText(src, function(){
        imports[urlFinalPart] = window.exports;
        window.exports = {};
        cb && cb()
      })
    }
    httpRequest.open('GET', url, true);
    httpRequest.send(null);
  }
  function transform(srcText) {
    // TODO: detect presets from code ?
    var tr = Babel.transform(srcText, { presets: ['es2015', 'react'] });
    return tr;
  }

  // this is used to make script names a little bit nicer
  var scriptsLoaded = 0;
  function loadScriptFromText(srcText, callback) {

    var output = transform(srcText);
    var imports = parseImport2(output);

    // loaded gets called one extra time
    var ready = function(){
      // Adding the script tag to the head to load it
      // technically document head can be used: https://developer.mozilla.org/en-US/docs/Web/API/Document/head
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');

      script.type = 'text/javascript';
      // todo: load asset name also and make sourceURL more recognizable???
      script.text = output.code + "\n//# sourceURL=_doc_"+ (++scriptsLoaded) +".js" ;
      if (callback) {
        // execute on the next tick
        var cb = function(){
          window.setTimeout(callback, 0);
        }
        // this does not work with script.text (only with script.src)
        // script.onreadystatechange = script.onload = cb;
      }
      script.onerror = function(err) {
        console.warn("Could not load script from provided SourceText");
      }
      // Fire the loading
      head.appendChild(script);
      cb && cb();
    };

    // TODO: load all at once ( usually much faster ) - atm scripts are included one by one
    var load = function(){
      if(imports.length){
        loadImport(imports.pop(), load);
      }
      else{
        ready();
      }
    };
    load();
  }



  window.addEventListener('message', function (e) {
    var mainWindow = e.source;
    if (e.data === 'ping')
    {
      mainWindow.postMessage(_isAlive, e.origin);
    }
    else if (e.data.mgbCommand === 'screenshotCanvas')
    {
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
    }
    else if (e.data.mgbCommand === 'startRun')
    {
      mgbHostMessageContext.msgSource = e.source;
      mgbHostMessageContext.msgOrigin = e.origin;
      try {
        loadScript(e.data.gameEngineScriptToPreload, function() {
          //  eval(e.data.codeToRun);  // NOT using eval since we can't get good window.onError information from it
          loadScriptFromText(e.data.codeToRun);
        })
      } catch (err) {
        console.error("Could not load and execute script: " + err);
      }
    }
  });
}
