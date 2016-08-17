// TODO: cleanup and split module loader from console hacks etc
// TODO: make AllInOne version without external dependencies
var _isAlive = false;
var mgbHostMessageContext = { msgSource: null, msgOrigin: null };

var STACK_FRAME_RE = /at ((\S+)\s)?\(?([^:]+):(\d+):(\d+)\)?/;
var THIS_FILE = "codeEditSandbox.html"
//var MODULE_SERVER = 'https://wzrd.in/debug-standalone/'
var MODULE_SERVER = 'https://wzrd.in/standalone/'


var knownLibs = {
  // wzrd serves bad version of phaser because it requires extra steps to build: https://www.npmjs.com/package/phaser#browserify--cjs
  "phaser": {
    useGlobal: true,
    src: function(version){
      version = version || "2.4.7";
      //return 'http://localhost:3000/phaser/2.4.6/phaser.js'
      return '/phaser/' + version + '/phaser.min.js'
    }
  },
  "test": function(){
    return '/test.js'
  }
}


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
  var asset_id;

  var errorCount = 0;

  var mainWindow; // reference to the last poster
  /*
  TODO: make use of these setters?
  var exports = {};
  Object.defineProperty(window, "module", {
    get:function(){
      return imports
    },
    set: function(val){
      console.log("Overwriting imports");
    }
  })

  Object.defineProperty(window, "exports", {
    get:function(){
      return exports
    },
    set: function(val){
      console.log("Overwriting exports");
    }
  })*/

  // here will be stored all imported objects
  var imports = {};
  // SuperSimple implementation for CommonJS like module loading
  window.require = function(key){
    // true is for global modules
    if(imports[key] && imports[key] !== true) {
      return imports[key]
    }
    // try to fallback to global
    // TODO: make this more universal - it would fail on something like CamelCaseLib
    // Trace global keys Object.keys(window) before and after loading???
    var name = key.split("@").shift();
    return window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)]
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

  function parseImport(babel){
    var imp = babel.metadata.modules.imports
    var ret = []
    for(var i=0; i<imp.length; i++){
      ret.push(imp[i].source)
    }
    return ret
  }
  function isExternalFile(url){
    return !(url.indexOf("http") !== 0 && url.indexOf("//") !== 0)
  }
  function canSkipTranspile(url){
    return url.substring(0, 1) !== "/" || isExternalFile(url)
  }
  function getKnowLib(urlFinalPart){
    var parts = urlFinalPart.split("@")
    var name = parts[0]
    var ver = parts[1]
    var lib = knownLibs[name]
    if(lib){
      lib.ver = ver
      lib.name = name
      return lib
    }
    return null
  }
  function resolveUrl(urlFinalPart){
    var lib = getKnowLib(urlFinalPart)
    if(lib){
      return lib.src(lib.ver);
    }
    // import X from '/asset name' or import X from '/user/asset name'
    if(urlFinalPart.indexOf("/") === 0 && urlFinalPart.indexOf("//") === -1){
      return '/api/asset/code/' + asset_id + urlFinalPart
    }
    // import X from 'react' OR
    // import X from 'asset_id'
    if( !isExternalFile(urlFinalPart) ){
      return MODULE_SERVER + urlFinalPart
    }

    // import X from 'http://cdn.com/x'
      return urlFinalPart
  }
  // TODO: somehow resolve user's script and global lib
  function loadImport(urlFinalPart, cb) {
    var url = resolveUrl(urlFinalPart)
    // atm server will try to generate script
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
      if (httpRequest.readyState !== XMLHttpRequest.DONE ){
        return;
      }
      if( httpRequest.status !== 200 ){
        console.error("Failed to load script: ["+ url +"]", httpRequest.status)
        return;
      }
      var src = httpRequest.responseText
      mainWindow.postMessage({
        mgbCmd: "mgbStoreCache",
        src: src,
        filename: urlFinalPart
      }, "*")
      loadModule(src, urlFinalPart, cb)
    }
    httpRequest.open('GET', url, true);
    httpRequest.send(null);
  }
  function loadModule(src, urlFinalPart, cb){
    var lib = getKnowLib(urlFinalPart);
    if(!lib || !lib.useGlobal){
      window.module = {exports: {}};
      window.exports = window.module.exports;
    }
    else{
      // atm this is only for Phaser - as it has a bug in module exports:
      // PIXI is not defined - as PIXI will be added as module, but Phaser expects global PIXI :/
      delete window.module;
      delete window.exports;
    }

    loadScriptFromText(src, urlFinalPart, function(){
      if(lib && lib.useGlobal){
        // mark lib as has been loaded
        imports[urlFinalPart] = true;
      }
      // babel adds keys to exports
      else if(Object.keys(window.exports).length){
        imports[urlFinalPart] = window.exports;
      }
      // hack for React like module loading - as some versions are overwriting window.exports with their own version
      else{
        imports[urlFinalPart] = window.module.exports;
        // extract short name from url - e.g. react
        var shortName = urlFinalPart.split("/").pop().split(".").shift();
        if(shortName){
          imports[shortName] = window.module.exports;
        }
      }
      window.module = {exports: {}};
      window.exports = window.module.exports;

      cb && cb()
    })
  }
  // TODO: not all scripts needs to be transpiled - figure out - how to tell difference
  // atm we are not transpiling external sources
  function transform(srcText, filename) {
    // TODO: detect presets from code ?
    var tr;
    if(canSkipTranspile(filename)){
      // return structure compatible with babel
      tr = Babel.transform('', {filename: filename, compact: false});
      tr.code = srcText;
      return tr
    }
    const start = Date.now();
    console.trace("Transpiling " + filename + " (" + srcText.length + " bytes)")
    try {
      tr = Babel.transform(srcText, {
        filename: filename,
        compact: false,           // Default of "auto" fails on ReactImport
        presets: ['es2015', 'react'],
        plugins: ['transform-class-properties'],// , "transform-es2015-modules-amd" - not working
        retainLines: true
      });
    }
    // show nice error to user
    catch(e){
      console.error(e.message)
      return {
        metadata:{modules:{imports:[]}},
        code: ''
      }
    }
    console.trace("Transpilation yielded " + tr.code.length + " bytes" + ' ' + (Date.now() - start) + " ms")
    return tr;
  }

  // this is used to make script names a little bit nicer
  var scriptsLoaded = 0;
  function loadScriptFromText(srcText, filename, callback) {
    var output = transform(srcText, filename);
    var imports = parseImport(output);

    var ready = function(){
      var script = document.createElement('script');
      script.setAttribute("data-origin", filename);

      var name = filename || "_doc_"+ (++scriptsLoaded) +"";
      var cb;
      if(name.substr(-3) != ".js"){
        name += ".js";
      }
      script.type = 'text/javascript';
      script.text = output.code + "\n//# sourceURL=" + name;

      // var src = output.code + "\n//# sourceURL=" + name;
      // script.src = URL.createObjectURL(new Blob([src]));

      if (callback) {
        // execute on the next tick
        cb = function(){
          window.setTimeout(callback, 0);
        }
        // this does not work with script.text (only with script.src)
        // script.onreadystatechange = script.onload = cb;
      }

      script.onerror = function(err) {
        console.warn("Could not load script ["+ filename + "]");
      }

      // Adding the script tag to the head to load it
      var head = document.getElementsByTagName('head')[0];
      // Fire the loading
      head.appendChild(script)
      cb && cb()
    }

    // TODO: load all at once ( usually much faster ) - atm scripts are included one by one
    var load = function load(){
      if(imports.length){
        loadFromCache(imports.shift(), load)
      }
      else{
        ready()
      }
    }
    load()
  }

  var cbs = {};
  var cbId = 0;
  function loadFromCache(urlFinalPart, cb){
    // don't load at all
    if(imports[urlFinalPart]){
      cb && cb()
      return
    }
    var url = resolveUrl(urlFinalPart)
    // don't cache local files
    if(!isExternalFile(url)){
      loadImport(urlFinalPart, cb)
      return
    }
    /*
    Don't do this - loadModule never will be called
    else{
      loadScript(url, cb)
      return
    }*/
    // store callback for response handling
    cbId++;
    cbs[cbId] = function(src, id){
      if(src === void(0)){
        //loadScript(resolveUrl(urlFinalPart), cb)
        loadImport(urlFinalPart, cb)
      }
      else{
        loadModule(src, urlFinalPart, cb)
      }
      delete cbs[id]
    }

    // ask parent - as it may have cached source
    mainWindow.postMessage({
      mgbCmd: "mgbGetFromCache",
      filename: urlFinalPart,
      cbId: cbId
    }, "*")
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
      mgbHostMessageContext.msgSource = e.source;
      mgbHostMessageContext.msgOrigin = e.origin;
      // this is used to import nice filenames
      // get owner_id from asset - and find asset
      asset_id = e.data.asset_id
      try {
        // moved to import Phaser from 'phaser'
        // TODO: restore MGBOPT_phaser_version
        //loadScript(e.data.gameEngineScriptToPreload, function() {
          //  eval(e.data.codeToRun);  // NOT using eval since we can't get good window.onError information from it
          loadScriptFromText(e.data.codeToRun, "/" + e.data.filename, function(){
            if(errorCount === 0){
              console.info("All Files loaded successfully!")
            }
          });
        //})
      } catch (err) {
        console.error("Could not load and execute script: " + err);
      }
    },
    mgbFromCache: function(e){
      if(e.data.cbId){
        cbs[e.data.cbId](e.data.src, e.data.cbId)
      }
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
  });
}
