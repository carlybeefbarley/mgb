let babelWorker;
import knownLibs from "./knownLibs.js"

// serving modules from...
const MODULE_SERVER = 'https://cdn.jsdelivr.net/phaser/latest/'
// ajax requests cache - invalidate every few seconds
// this will insanely speed up run
const INVALIDATE_CACHE_TIMEOUT = 30 * 1000
const SMALL_CHANGES_TIMEOUT = 5 * 1000 // force refresh other mgb assets - even if current isn't changed
const UPDATE_DELAY = 15 * 1000

// add only smalls libs to tern
const MAX_ACCEPTABLE_SOURCE_SIZE = 1700653 // REACT sice for testing purposes - 1024 * 10 // 10 kb
const tmpCache = {}

export default class SourceTools {
  constructor(ternServer, asset_id) {
    // terminate old babel worker - just in case..
    if (babelWorker) {
      babelWorker.terminate()
    }

    //window.mgb_tools = this
    this.asset_id = asset_id
    this.tern = ternServer
    this.babelWorker = babelWorker = new Worker("/lib/BabelWorker.js")

    this.collectedSources = []
    this.timeout = 0

    // here will live external libraries
    this.cache = {}
    // here we will keep our transpiled files
    this.transpileCache = {}

    // set to true by default.. to wait for first action
    this._inProgress = true
    this._firstTime = true

    this._lastAction = {
      src: '',
      time: 0
    }
    // store entry point filename
    this.mainJS = "main.js"
  }

  set inProgress(val) {
    this._inProgress = val
  }

  get inProgress() {
    return this._inProgress
  }

  destroy() {
    this.cache = null
    this.transpileCache = null
    this.babelWorker.terminate()

    // next will be first time again :)
    this._firstTime = true

    // clean global cache
    // TODO: clean only changed files.. add some sort of meteor subscriber
    for (let i in tmpCache) {
      delete tmpCache[i]
    }
  }

  // probably events would work better
  collectSources(cb) {
    // make sure we are collecting latest sources
    this.updateNow(() => {
      cb(this.collectedSources)
    })
  }

  collectScript(name, code, cb) {
    // skip transpiled and compiled and empty scripts
    if (!name || !code || this.isAlreadyTranspiled(name)) {
      cb && cb()
      return;
    }
    // remove use strict added by babel - as it may break code silently
    code = code.replace(/use strict/gi, '')
    const lib = SourceTools.getKnowLib(name)
    const useGlobal = !(!lib || !lib.useGlobal)
    this.collectedSources.push({name, code, useGlobal})
    // MGB assets will have cache.. remote won't
    if (this.transpileCache[name]) {
      this.addDefsOrFile(name, this.transpileCache[name].src)
    }
    else {
      this.addDefsOrFile(name, code)
    }

    cb && cb()
  }

  addDefsOrFile(filename, code) {

    const lib = SourceTools.getKnowLib(filename)
    if (lib && lib.defs) {
      // this only works when NOT in worker mode..
      // TODO: find out how to fix that
      // true override everything
      this.tern.server.addDefs && this.tern.server.addDefs(lib.defs, true)
    }
    else {
      // TODO: debug: sometimes code isn't defined at all
      if (!code) {
        return
      }
      if (code.length < MAX_ACCEPTABLE_SOURCE_SIZE) {
        const cleanFileName = filename.indexOf("./") === 0 ? filename.substr(2) : filename
        // console.log("Adding file: ", cleanFileName)
        this.tern.server.delFile(cleanFileName)
        this.tern.server.addFile(cleanFileName, code)
      }
      else {
        console.log(`${filename} is too big [${code.length} bytes] and no defs defined`)
      }
    }
  }

  isAlreadyTranspiled(filename) {
    return this.collectedSources.find(s => s.name == filename)
  }

  updateNow(cb) {

    // wait for active job to complete
    if (this.inProgress) {
      setTimeout(() => {
        this.updateNow(cb)
      }, 100)
      return;
    }

    // call manually pending changes
    if (this.timeout) {
      // this will trigger in progress and waiting will start again
      window.clearTimeout(this.timeout);
      this.timeout = 0;

      this.delayed(true);
      this.updateNow(cb);
    }
    // already on the latest version, yay!
    else {
      cb()
    }
  }

  collectAndTranspile(srcText, filename, callback, force = false) {
    // TODO: break instantly callback chain

    // clean previous pending call
    if (this.timeout) {
      window.clearTimeout(this.timeout)
      this.timeout = 0;
    }

    const prev = this._lastAction
    // wait for previous action and transpile lazy - as full core refresh and reanalyze makes text cursor feel sluggish
    if (!force) {
      if ((this.inProgress && !this._firstTime) || (prev.src === srcText || Date.now() - prev.time < SMALL_CHANGES_TIMEOUT)) {
        this.delayed = (force) => {
          // this may never be called if new sources will come in
          this.collectAndTranspile(srcText, filename, callback, force)
        }
        this.timeout = window.setTimeout(this.delayed, UPDATE_DELAY)
        return
      }
    }
    else if(this.inProgress){
      console.log("This never should happen - Debug ASAP!")
    }

    this._lastAction.src = srcText
    this._lastAction.time = Date.now()

    this._firstTime = false
    this.mainJS = filename

    // clean up old data
    this.collectedSources.length = 0
    this.inProgress = true
    this._collectAndTranspile(srcText, filename, () => {
      // force tern to update arg hint cache as we may have loaded new files / defs / docs
      this.tern.cachedArgHints = null
      callback && callback()
      this.inProgress = false
    })
  }

  _collectAndTranspile(srcText, filename, callback) {
    const compiled = this.isAlreadyTranspiled(filename);
    if (compiled) {
      callback && callback(compiled.code)
      return;
    }
    this.transform(srcText, filename, (output) => {
      var imports = SourceTools.parseImport(output)
      var cb

      if (callback) {
        // execute callback on the next tick
        cb = function () {
          window.setTimeout(function () {
            callback(output.code)
          }, 0)
        }
      }

      var load = () => {
        if (imports.length) {
          this.loadFromCache(imports.shift(), load)
        }
        else {
          this.collectScript(filename, output.code, cb)
        }
      }
      load()
    })

  }

  transform(srcText, filename, cb) {
    let code = '';
    if (!SourceTools.isExternalFile(filename)) {
      code = srcText;
    }
    this.transpile(filename, code, cb);
  }

  transpile(filename, src, cb) {
    //
    if (this.transpileCache[filename]) {
      if (this.transpileCache[filename].src == src) {
        cb(this.transpileCache[filename].data)
        return
      }
    }

    // TODO: spawn extra workers?
    this.babelWorker.onmessage = (m) => {
      this.transpileCache[filename] = {src, data: m.data}
      cb(m.data)
    };
    this.babelWorker.postMessage([filename, src])
  }

  // cb usually will be this@load
  loadFromCache(urlFinalPart, cb) {
    // don't load at all
    if (this.cache[urlFinalPart] || !urlFinalPart) {
      this.collectScript(urlFinalPart, this.cache[urlFinalPart])
      cb && cb('', '')
      return
    }
    var url = SourceTools.resolveUrl(urlFinalPart, this.asset_id)
    if (!url) {
      cb && cb('', '')
      return
    }
    // don't cache local files
    if (!SourceTools.isExternalFile(url)) {
      SourceTools.loadImport(url, (src) => {
        this._collectAndTranspile(src, urlFinalPart, cb)
      })
      return
    }
    // load external file and cache - so we can skip loading next time
    SourceTools.loadImport(url, (src) => {
      this.cache[urlFinalPart] = src
      this.collectScript(urlFinalPart, src, cb)
    })
  }

  createBundle(cb) {
    this.collectSources((sources) => {
      let allInOneBundle =
        '(function(){' +
        'var imports = {};' +
        'window.require = function(key){ ' +
        'if(imports[key] && imports[key] !== true) {' +
        'return imports[key];' +
        '} ' +
        'var name = key.split("@").shift();' +
        'return (window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)])' +
        '}; '
      for (var i in sources) {
        const key = sources[i].name.split("@").shift();
        if (sources[i].useGlobal) {
          allInOneBundle += "\n" + 'delete window.exports; delete window.module; '
        }
        else {
          allInOneBundle += "\n" + 'window.module = {exports: {}};window.exports = window.module.exports; '
        }
        allInOneBundle += ";" + sources[i].code + "; "
        if (sources[i].useGlobal) {
          allInOneBundle += 'imports["' + sources[i].name + '"] = true; '
        }
        else {
          allInOneBundle +=
            'imports["' + key + '"] = (window.exports === window.module.export ? window.exports : window.module.exports)';
          if (sources[i].name) {
            allInOneBundle += "\n" + 'imports["' + sources[i].name + '"] = window.module.exports;'
          }
        }
      }

      allInOneBundle += "\n" + "})(); "

      // spawn new babel worker and create bundle in the background - as it can take few seconds to transpile
      const worker = new Worker("/lib/BabelWorker.js")
      worker.onmessage = (e) => {
        cb(e.data.code)
        worker.terminate()
      };
      worker.postMessage(["bundled_" + this.mainJS, allInOneBundle, {
        compact: true,
        minified: true,
        comments: false,
        ast: false,
        retainLines: false
      }])
    })
  }

  static isExternalFile(url) {
    return !(url.indexOf("http") !== 0 && url.indexOf("//") !== 0)
  }

  static parseImport(babel) {
    let imp;
    const ret = [];

    imp = babel.data.modules.imports
    for (let i = 0; i < imp.length; i++) {
      ret.indexOf(imp[i].source) === -1 && ret.push(imp[i].source)
    }

    // also add export from 'externalSource'
    imp = babel.data.modules.exports.specifiers
    for (let i = 0; i < imp.length; i++) {
      if (imp[i].kind == "external" && imp[i].source) {
        ret.indexOf(imp[i].source) === -1 && ret.push(imp[i].source)
      }
    }

    return ret
  }

  static resolveUrl(urlFinalPart, asset_id) {
    var lib = SourceTools.getKnowLib(urlFinalPart)
    if (lib) {
      return lib.src(lib.ver);
    }
    // import X from '/asset name' or import X from '/user/asset name'
    if (urlFinalPart.indexOf("./") === 0 && urlFinalPart.indexOf("//") === -1) {
      return '/api/asset/code/' + asset_id + urlFinalPart.substr(1)
    }
    // import X from 'react' OR
    // import X from 'asset_id'
    if (!SourceTools.isExternalFile(urlFinalPart)) {
      // try CDN
      return MODULE_SERVER + urlFinalPart
    }

    // import X from 'http://cdn.com/x'
    return urlFinalPart
  }

  static loadImport(url, cb) {
    if (tmpCache[url]) {
      // remove from stack to maintain order
      window.setTimeout(() => {
        cb(tmpCache[url])
      }, 0)
      return
    }
    // atm server will try to generate script
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      if (httpRequest.status !== 200) {
        console.error("Failed to load script: [" + url + "]", httpRequest.status)
        cb("")
        return;
      }
      var src = httpRequest.responseText
      tmpCache[url] = src
      window.setTimeout(() => {
        delete tmpCache[url]
      }, INVALIDATE_CACHE_TIMEOUT)
      cb(src)
    }
    httpRequest.open('GET', url, true);
    httpRequest.send(null);
  }

  static getShortName(fullUrl) {
    var name = fullUrl.split("/").pop().split("@").shift().split(".").shift();
    return name;
  }

  static canSkipTranspile(url) {
    return url.substring(0, 1) === "/" || SourceTools.isExternalFile(url)
  }

  static getKnowLib(urlFinalPart) {
    var parts = urlFinalPart.split("@")
    var name = parts[0]
    var ver = parts[1]
    var lib = knownLibs[name]
    if (lib) {
      lib.ver = ver
      lib.name = name
      return lib
    }
    return null
  }
}
