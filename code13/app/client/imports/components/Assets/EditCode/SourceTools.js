"use strict"
import knownLibs from "./knownLibs.js"
import { Azzets } from '/imports/schemas'
// serving modules from...

const getModuleServer = (lib) => {
  return 'https://cdn.jsdelivr.net/' + lib + '/latest/' + lib + ".js"
}



// ajax requests cache - invalidate every few seconds
// this will insanely speed up run
const INVALIDATE_CACHE_TIMEOUT = 30 * 1000
const UPDATE_DELAY = 0.5 * 1000

// add only smalls libs to tern
const MAX_ACCEPTABLE_SOURCE_SIZE = 1024 * 100 // 100 KB

const ERROR = {
  SOURCE_NOT_FOUND: "W-ST-001", // warning - sourcetools - errnum -- atm only matters first letter: W(warning) E(error)
  MULTIPLE_SOURCES: "W-ST-002",
  UNREACHABLE_EXTERNAL_SOURCE: "W-ST-003",
  RECURSION_DETECTED:  "E-ST-004"
}


export default class SourceTools {
  static tmpCache = {}
  static cached404 = {}
  constructor(ternServer, asset_id, owner) {
    // terminate old babel worker - just in case..

    this.addedFilesAndDefs = {}
    this.subscriptions = {}
    window.mgb_tools = this
    this.asset_id = asset_id
    this.tern = ternServer
    this.babelWorker = new Worker("/lib/BabelWorker.js")

    this.collectedSources = []
    this.timeout = 0

    this.owner = owner
    // here will live external libraries
    this.cache = {}
    // here we will keep our transpiled files
    this.transpileCache = {}
    this.cachedBundle = ''

    // set to true by default.. to wait for first action
    this._inProgress = true
    this._firstTime = true
    this._hasSourceChanged = true

    this._isDestroyed = false

    this._lastAction = {
      src: '',
      time: 0
    }
    // store entry point filename
    this.mainJS = "main.js"

    this.errorCBs = []
    this.errors = {}
    this.pendingChanges = {}
  }
  // this will handle errors in the EditCode

  set inProgress(val) {
    this._inProgress = val
  }
  get inProgress() {
    return this._inProgress
  }
  get isDestroyed() {
    if (this._isDestroyed) {
      console.log("destroyed!!!")
    }
    return this._isDestroyed
  }


  onError(cb){
    this.errorCBs.push(cb)
  }
  getErrors(){
    const ret = []
    for(let i in this.errors){
      ret.push(this.errors[i])
    }
    return ret
  }
  setError(err){
    this.errors[err.code] = err
    const errors = this.getErrors()
    this.errorCBs.forEach((c) => {
      c(err)
    })
  }

  getAST(cb = () => {}){
    const self = this;
    this.collectSources((s) => {
      const getFiles = (e) => {
        // clean up
        self.tern.worker.removeEventListener("message", getFiles)

        const ternFiles = e.data;

        const ret = []
        s.forEach((sp) => {
          // || strip ./ from local includes
          const ternFile = ternFiles[sp.name] || ternFiles[sp.name.substr(2)]
          let tokens = (self.transpileCache[sp.name] && self.transpileCache[sp.name].data) ? self.transpileCache[sp.name].data.astTokens : ''
          if(ternFile){
            ret.push({
              name: sp.name,
              code: sp.code,
              ast: ternFile.ast,
              tokens
            })
          }
          else {
            ret.push({
              name: sp.name,
              code: sp.code,
              tokens
            })
          }

        }, this)
        cb(ret)
      }
      this.tern.worker.addEventListener("message", getFiles)
      this.tern.worker.postMessage({type: "getFiles"})
    })
  }

  collectAndTranspile(srcText, filename, callback, force = false) {
    // TODO: break instantly callback chain
    if (this.isDestroyed) return
    // clean previous pending call
    if (this.timeout) {
      window.clearTimeout(this.timeout)
      this.timeout = 0;
    }

    const prev = this._lastAction
    if (!force) {
      if ((this.inProgress && !this._firstTime) || (prev.src === srcText)) {
        this.delayed = (force) => {
          // this may never be called if new sources will come in
          this.collectAndTranspile(srcText, filename, callback, force)
        }
        this.timeout = window.setTimeout(this.delayed, UPDATE_DELAY)
        return
      }
    }
    else if (this.inProgress) {
      console.log("This never should happen - Debug ASAP!")
    }

    // clean up old errors
    this.errors = {}

    this._lastAction.src = srcText
    this._lastAction.time = Date.now()

    this._firstTime = false
    this.mainJS = filename

    this.cleanup()

    // this.collectedSources.length = 0

    this.inProgress = true
    this._collectAndTranspile(srcText, filename, () => {
      if (this.isDestroyed) return
      // force tern to update arg hint cache as we may have loaded new files / defs / docs
      callback && callback(this.collectedSources)
      this.inProgress = false
    })
  }
  collectSources(cb) {
    if (this.isDestroyed) return
    // make sure we are collecting latest sources
    this.updateNow(() => {
      cb(this.collectedSources)
    })
  }

  destroy() {
    this._isDestroyed = true

    this.cache = null
    this.transpileCache = null
    this.cachedBundle = ''

    this.babelWorker.terminate()

    // next will be first time again :)
    this._firstTime = true
    this._hasSourceChanged = true
    // clean global cache
    // TODO: clean only changed files.. add some sort of meteor subscriber
    for (let i in SourceTools.tmpCache) {
      delete SourceTools.tmpCache[i]
    }

    // close all used subscriptions
    for (let i in this.subscriptions) {
      this.subscriptions[i].subscription.stop()
      if(this.subscriptions[i].observer){
        this.subscriptions[i].observer.stop()
      }
    }
    this.subscriptions = null
    this.errorCBs = null
    this.errors = null

    this.cleanup()
    for(let i=0; i<this.collectedSources.length; i++){
     this.tern.server.delFile(this.collectedSources[i].name)
    }
  }

  // clean up old data
  cleanup(){
    this.removeTranspiled(this.mainJS)
    /*for(let i=0; i<this.collectedSources.length; i++){
      this.tern.server.delFile(this.collectedSources[i].name)
    }*/
    this.collectedSources.length = 0;
  }

  collectScript(name, code, cb, localName = name, force = false) {
    if (this.isDestroyed) return
    // skip transpiled and compiled and empty scripts
    if (!name || !code || (!force && this.isAlreadyTranspiled(name)) ) {
      cb && cb()
      return;
    }

    const lib = SourceTools.getKnowLib(name)
    const useGlobal = lib && lib.useGlobal
    this.collectSource({name, code, useGlobal, localName})
    // MGB assets will have cache.. remote won't
    if (this.transpileCache[name]) {
      this.addDefsOrFile(name, this.transpileCache[name].src, true)
    }
    else {
      this.addDefsOrFile(name, code)
    }

    cb && cb()
  }

  addDefsOrFile(filename, code, replace = false) {
    if (this.isDestroyed) return
    // skip added defs and files
    if(this.addedFilesAndDefs[filename]){
      return
    }

    const lib = SourceTools.getKnowLib(filename)
    if (lib && lib.defs) {
      // this only works when NOT in worker mode..
      // TODO: find out how to fix that
      // true override everything
      this.tern.server.addDefs && this.tern.server.addDefs(lib.defs, true)
      this.addedFilesAndDefs[filename] = true
      this.tern.cachedArgHints = null
    }
    else {
      // TODO: debug: sometimes code isn't defined at all
      if (!code) {
        return
      }
      if (code.length < MAX_ACCEPTABLE_SOURCE_SIZE) {
        if(!replace){
          this.addedFilesAndDefs[filename] = true
        }
        const cleanFileName = filename.indexOf("./") === 0 ? filename.substr(2) : filename
        this.tern.server.addFile(cleanFileName, code, replace)
        this.tern.cachedArgHints = null
      }
      else {
        console.log(`${filename} is too big [${code.length} bytes] and no defs defined`)
      }
    }
  }
  collectSource(source){
    const oldSource = this.isAlreadyTranspiled(source.name)
    if(oldSource){
      oldSource.code = source.code
      oldSource.useGlobal = source.useGlobal
      oldSource.localName = source.localName
      return
    }
    this.collectedSources.push(source)
  }
  isAlreadyTranspiled(filename) {
    return this.collectedSources.find(s => s.name == filename)
  }

  removeTranspiled(filename) {
    const item = this.isAlreadyTranspiled(filename)
    if (item) {
      this.collectedSources.splice(this.collectedSources.indexOf(item), 1)
    }
  }

  updateNow(cb) {
    if (this.isDestroyed) return
    // wait for active job to complete
    if (this.inProgress) {
      setTimeout(() => {
        this.updateNow(cb)
      }, 1000)
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
    else
      cb()
  }

  _collectAndTranspile(srcText, filename, callback, force) {
    if (this.isDestroyed) return
    this.pendingChanges[filename] = true
    const compiled = !force && this.isAlreadyTranspiled(filename);
    if (compiled) {
      callback && callback(compiled.code)
      return
    }
    this._hasSourceChanged = true
    this.transform(srcText, filename, (output) => {
      var imports = SourceTools.parseImport(output)
      var cb
      if (callback) {
        // execute callback on the next tick
        cb = () => {
          window.setTimeout(() => {
            callback(output.code)
          }, 0)
        }
      }

      var load = () => {
        if (imports.length) {
          const imp = imports.shift()
          // TODO: find out how to resolve this - if ever possible
          if(this.pendingChanges[imp.src]){
            this.setError({reason: "Recursion detected: " + filename, evidence: filename, code: ERROR.RECURSION_DETECTED})
            load()
            return
          }
          this.loadFromCache(imp.src, load, imp.name)
        }
        else {
          this.collectScript(filename, output.code, cb, null, force)
          delete this.pendingChanges[filename]
        }
      }
      load()
    })

  }

  transform(srcText, filename, cb) {
    if (this.isDestroyed) return
    let code = '';
    if (!SourceTools.isExternalFile(filename)) {
      code = srcText;
    }
    this.transpile(filename, code, cb);
  }

  transpile(filename, src, cb) {
    // this instance has been destroyed while doing some background work
    if (this.isDestroyed) return

    if (this.transpileCache[filename]) {
      if (this.transpileCache[filename].src == src) {
        cb(this.transpileCache[filename].data)
        return
      }
    }
    //
    if(this.babelWorker.isBusy){
      // debugger
      // racing condition - usually happens when one is working on the main file and second on the file included by the main file..
      // it should be safe to ignore direct request - as main file will pull in dependency in anyway
      return
    }
    // TODO: spawn extra workers?
    this.babelWorker.onmessage = (m) => {
      this.transpileCache[filename] = {src, data: m.data}
      // prevent extra calls
      this.babelWorker.onmessage = null
      this.babelWorker.isBusy = false
      cb(m.data)
    };
    this.babelWorker.isBusy = filename
    this.babelWorker.postMessage([filename, src])
  }

  // cb usually will be this@load
  loadFromCache(urlFinalPart, cb, localName) {
    if (this.isDestroyed) return

    // don't load at all
    if (this.cache[urlFinalPart] || !urlFinalPart) {
      this.collectScript(urlFinalPart, this.cache[urlFinalPart], null, localName)
      cb && cb('', '')
      return
    }
    const url = SourceTools.resolveUrl(urlFinalPart, this.asset_id)
    if (!url) {
      cb && cb('', '')
      return
    }

    if (!SourceTools.isExternalFile(url)) {
      this.loadAndObserveLocalFile(url, urlFinalPart, cb)
      // ajax
      /*SourceTools.loadImport(url, (src) => {
        this._collectAndTranspile(src, urlFinalPart, cb)
      })*/
      return
    }
    // load external file and cache - so we can skip loading next time
    SourceTools.loadImport(url, (src, error) => {
      if(error){
        this.setError(error)
      }
      this.cache[urlFinalPart] = src
      this.collectScript(urlFinalPart, src, cb, localName)
    }, urlFinalPart)
  }

  loadAndObserveLocalFile(url, urlFinalPart, cb){
    const parts = url.split("/")

     // import './stauzs:asset_name'
    const toInclude = parts.pop()
    const sparts = toInclude.split(":")
    const name = sparts.pop()
    const owner = sparts.length > 0 ? sparts.pop() : this.owner

    // import './stauzs/asset_name'
    /*
    const name = parts.pop()
    const owner = parts.length == 6 ? parts.pop() : this.owner
    */

    const cursor = Azzets.find({dn_ownerName: owner, name: name})

    const getSourceAndTranspile = () => {
      const assets = cursor.fetch()

      if(assets.length > 1){
        this.setError({reason: "Multiple candidates found for " + urlFinalPart, evidence: urlFinalPart, code: ERROR.MULTIPLE_SOURCES})
      }
      if (assets[0]) {
        this._collectAndTranspile(assets[0].content2.src, urlFinalPart, cb, true)
      }
      else {
        // TODO somewhere in callstack get line number and pass to this function - atm EditCode is guessing lines by evidence string
        this.setError({reason: "Unable to locate: " + urlFinalPart, evidence: urlFinalPart, code: ERROR.SOURCE_NOT_FOUND})
        cb("")
      }
    }

    // already subscribed and observing
    // TODO: this can be skipped - but requires to check all edge cases - e.g. first time load / file removed and then added again etc
    // atm this seems pretty quick
    if (this.subscriptions[url]) {
      getSourceAndTranspile()
      return
    }

    // from now on only observe asset and update tern on changes only

    this.subscriptions[url] = {
      subscription: Meteor.subscribe("assets.public.owner.name", owner, name, {
        onReady: () => {
          getSourceAndTranspile()
          this.subscriptions[url].observer = cursor.observeChanges({
            changed: (id, changes) => {
              // we may end with older resource until next changes..
              if(this.inProgress){
                return
              }
              // it gets called one extra time when asset.src arrives for the first time
              if (changes.content2 && changes.content2.src) {
                this._collectAndTranspile(changes.content2.src, urlFinalPart, null, true)
              }
            }
          })
        },
        onError: (...args) => {
          console.log("Error:", name, ...args)
          cb("")
        }
      })
    }
  }
  hasChanged(){
    return this._hasSourceChanged
  }
  createBundle(cb) {
    if (this.isDestroyed) return
    if (!this._hasSourceChanged) {
      cb(this.cachedBundle, true)
      return
    }
    this.collectSources((sources) => {
      let allInOneBundle = `
(function(){
  var imports = {};
  window.require = function(key){
    if(imports[key] && imports[key] !== true) {
      return imports[key];
    }
    var name = key.split("@").shift()
    if(imports[name] && imports[name] !== true) {
      return imports[name]
    }
    name = name.split(":").pop();
    if(imports[name] && imports[name] !== true) {
      return imports[name]
    }
    return (window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)])
  };`
      for (let i in sources) {
        const key = sources[i].name.split("@").shift();
        if (sources[i].useGlobal) {
          allInOneBundle += "\n" + 'delete window.exports; delete window.module; '
        }
        else {
          allInOneBundle += "\n" + 'window.module = {exports: {}};window.exports = window.module.exports; '
        }
        allInOneBundle += ";" + sources[i].code + "; "
        if (sources[i].useGlobal) {
          allInOneBundle += "\n" + 'imports["' + sources[i].name + '"] = true; '
        }
        else {
          allInOneBundle +=
            "\n" + 'imports["' + key + '"] = (window.exports === window.module.export ? window.exports : window.module.exports)';
          if (sources[i].name) {
            allInOneBundle += "\n" + 'imports["' + sources[i].name + '"] = window.module.exports;'
          }
        }
      }

      allInOneBundle += "\n" + "})(); "

      // spawn new babel worker and create bundle in the background - as it can take few seconds (could be even more that 30 on huge source and slow pc) to transpile
      const worker = new Worker("/lib/BabelWorker.js")
      worker.onmessage = (e) => {
        cb(e.data.code)
        worker.terminate()
      }
      worker.postMessage(["bundled_" + this.mainJS, allInOneBundle, {
        compact: true,
        minified: true,
        comments: false,
        ast: false,
        retainLines: false
      }])
      this.cachedBundle = allInOneBundle
      this._hasSourceChanged = false
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
      ret.indexOf(imp[i].source) === -1 && ret.push({
        src: imp[i].source,
        name: imp[i].specifiers && imp[i].specifiers.length ? imp[i].specifiers[0].local : null
      })
    }

    // also add export from 'externalSource'
    imp = babel.data.modules.exports.specifiers
    for (let i = 0; i < imp.length; i++) {
      if (imp[i].kind == "external" && imp[i].source) {
        ret.indexOf(imp[i].source) === -1 && ret.push({
          src: imp[i].source,
          name: imp[i].specifiers && imp[i].specifiers.length ? imp[i].specifiers[0].local : null
        })
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
      return getModuleServer(urlFinalPart)
      //return MODULE_SERVER + urlFinalPart
    }

    // import X from 'http://cdn.com/x'
    return urlFinalPart
  }

  static loadImport(url, cb, urlFinalPart = '') {
    if (SourceTools.tmpCache[url]) {
      // remove from stack to maintain order
      window.setTimeout(() => {
        cb(SourceTools.tmpCache[url])
      }, 0)
      return
    }
    if (SourceTools.cached404[url]) {
      //console.error("Failed to load script: [" + url + "]", cached404[url])
      cb("", {reason: "Failed to include external source: " + urlFinalPart + " ("+SourceTools.cached404[url]+")", evidence: urlFinalPart, code: ERROR.UNREACHABLE_EXTERNAL_SOURCE})
      return;
    }

    // atm server will try to generate script
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState !== XMLHttpRequest.DONE) {
        return;
      }
      if (httpRequest.status !== 200) {
        //console.error("Failed to load script: [" + url + "]", httpRequest.status)
        SourceTools.cached404[url] = httpRequest.status
        cb("", {reason: "Failed to include external source: " + urlFinalPart + " ("+httpRequest.status+")", evidence: urlFinalPart, code: ERROR.UNREACHABLE_EXTERNAL_SOURCE})
        return;
      }
      var src = httpRequest.responseText
      SourceTools.tmpCache[url] = src
      window.setTimeout(() => {
        delete SourceTools.tmpCache[url]
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
