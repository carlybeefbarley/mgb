"use strict"
import knownLibs from "./knownLibs.js"
import {observeAsset, mgbAjax, makeCDNLink} from "/client/imports/helpers/assetFetchers"
import {AssetKindEnum} from '/imports/schemas/assets'
import SpecialGlobals from '/imports/SpecialGlobals'

import getCDNWorker from '/client/imports/helpers/CDNWorker'

// serving modules from...
const getModuleServer = (lib, version = 'latest') => {
  const parts = lib.split("@")
  if(parts.length === 1){
    return `https://cdn.jsdelivr.net/${lib}/${version}/${lib}.min.js`
  }
  else{
    const name = parts[0]
    return `https://cdn.jsdelivr.net/${name}/${parts[1]}/${name}.min.js`
  }
}

// CDN ajax requests cache lifetime
const INVALIDATE_CACHE_TIMEOUT = 60 * 60 * 1000

// delay between re-checking sources
const UPDATE_DELAY = 0.5 * 1000 // 500ms

// add only smalls libs to tern
const MAX_ACCEPTABLE_SOURCE_SIZE = SpecialGlobals.editCode.maxFileSizeForAST // 1024 * 100 // 100 KB

const ERROR = {
  SOURCE_NOT_FOUND: "W-ST-001", // warning - sourcetools - errnum -- atm only matters first letter: W(warning) E(error)
  MULTIPLE_SOURCES: "W-ST-002",
  UNREACHABLE_EXTERNAL_SOURCE: "W-ST-003",
  RECURSION_DETECTED:  "E-ST-004"
}


export default class SourceTools {
  // here are sources loaded from CDN
  static tmpCache = {}
  // here are sources which failed load from CDN - so we can avoid multiple calls to CDN
  static cached404 = {}
  constructor(ternServer, asset_id, owner) {
    // map with collected files and definitions - so we can avoid tern server updates
    this.addedFilesAndDefs = {}
    // meteor subscriptions - keep track - so we could unsubscribe
    this.subscriptions = {}
    //
    this.asset_id = asset_id
    this.tern = ternServer
    this.babelWorker = getCDNWorker("/lib/workers/BabelWorker.js")

    // all collected sources in the order of inclusion
    this.collectedSources = []
    // store timeoutID = so wec clear it later
    this.timeout = 0

    // asset owner is used to resolve imports without user prefix
    this.owner = owner
    // here will live external libraries
    this.cache = {}
    // here we will keep our transpiled files
    this.transpileCache = {}
    // save cached bundle - so we can quickly return it - if code is not changed
    this.cachedBundle = ''

    // internal state - shows that something is happening
    this._inProgress = false
    // switch which forces full code update on first run
    this._firstTime = true
    // to prevent unnecessary updates - this can be set from active asset - or from subscription
    this._hasSourceChanged = true
    // if this instance is destroyed no more updates or callbacks will be fired
    this._isDestroyed = false

    // caches last action - to prevent intensive updates in a case when external lib(s) is intensively updating and triggering updates
    this._lastActionSrc = ''
    // store entry point filename - usually will bet automatically set to asset name
    this.mainJS = "main.js"

    // callback which gets executed if error has encountered
    this.errorCBs = []
    // collected errors from last run
    this.errors = {}
    // used to track recursive dependencies
    this.pendingChanges = {}
  }

  // set/get for private variable
  set inProgress(val) {
    this._inProgress = val
  }
  get inProgress() {
    return this._inProgress
  }

  // TODO(stauzs): this is like typical Promise use case - refactor to promises
  // getter for destroyed state - used to track/debug state and notify on destruction
  get isDestroyed() {
    if (this._isDestroyed) {
      console.log("destroyed!!!")
    }
    return this._isDestroyed
  }

  // error related methods - used in the edit code - to show nice errors - e.g. recursion
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
    this.errorCBs.forEach((c) => {
      c(err)
    })
  }

  // collects and transpiles ES6 imports - launches callback on completion
  collectAndTranspile(srcText, filename, callback, force = false) {
    // TODO: break instantly callback chain
    if (this.isDestroyed) return
    // clean previous pending call
    if (this.timeout) {
      window.clearTimeout(this.timeout)
      this.timeout = 0
    }

    if (!force) {
      if ((this.inProgress && !this._firstTime) || (this._lastActionSrc === srcText)) {
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

    this._lastActionSrc = srcText

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
  // calls callback with collected sources
  collectSources(cb) {
    if (this.isDestroyed) return
    // wait for first action...
    if(this._firstTime){
      window.setTimeout(() => {
        this.collectSources(cb)
      }, 100)
      return
    }
    // make sure we are collecting latest sources
    this.updateNow(() => {
      cb(this.collectedSources)
    })
  }
  // clear all references / kill workers etc
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
    this.collectedSources.length = 0;
  }

  // collects info about script
  collectScript(name, source, cb, localName = name, force = false) {
    if (this.isDestroyed) return
    // skip transpiled and compiled and empty scripts
    if (!name || !source.code || (!force && this.isAlreadyTranspiled(name)) ) {
      cb && cb()
      return;
    }

    const lib = SourceTools.getKnowLib(name)
    source.useGlobal = lib && lib.useGlobal
    source.name = name
    source.localName = localName
    source.isExternalFile = SourceTools.isExternalFile(source.url)

    this.collectSource(source)
    // MGB assets will have cache.. remote won't
    if (!source.isExternalFile) {
      this.addDefsOrFile(name, this.transpileCache[name].src, true)
    }
    else {
      this.addDefsOrFile(name, source.code)
    }

    cb && cb()
  }

  // adds def of file to the tern server - so we can show autocomplete and other info from imported files
  addDefsOrFile(filename, code, replace = false) {
    if (this.isDestroyed) return
    // skip added defs and files
    if(this.addedFilesAndDefs[filename]){
      return
    }

    const lib = SourceTools.getKnowLib(filename)
    if (lib && lib.defs) {
      this.loadDefs(lib.defs())
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
  // adds script to the collection - user has added import
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
  // helper to check is script already is already transpiled - so we could skip unnecessary transpilations
  isAlreadyTranspiled(filename) {
    return this.collectedSources.find(s => s.name == filename)
  }
  // removes script from collection - user has removed import
  removeTranspiled(filename) {
    const item = this.isAlreadyTranspiled(filename)
    if (item) {
      this.collectedSources.splice(this.collectedSources.indexOf(item), 1)
    }
  }

  // schedules update on the next update loop (also waits until previous task is done)
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

  // real source collection and transformation method
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
          this.collectScript(filename, {code: output.code, url: filename}, cb, null, force)
          delete this.pendingChanges[filename]
        }
      }
      load()
    })

  }
  // transforms code from ES6 to ES5 + skips external libs
  transform(srcText, filename, cb) {
    if (this.isDestroyed) return
    let code = '';
    if (!SourceTools.isExternalFile(filename)) {
      code = srcText;
    }
    this.transpile(filename, code, cb);
  }
  // real transpilation is happening here
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
  // wrapper around loadImport - to avoid extra ajax calls to CDN
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
    SourceTools.loadImport(url, (source, error) => {
      if(error){
        this.setError(error)
      }
      this.cache[urlFinalPart] = source
      this.collectScript(urlFinalPart, source, cb, localName)
    }, urlFinalPart)
  }

  // loads and observes imported MGB code asset for changes
  loadAndObserveLocalFile(url, urlFinalPart, cb){
    //console.log("Local file:", url)
    // import './stauzs:asset_name'
    const parts = urlFinalPart.split("/").pop().split(":")
    const name = parts.pop()
    const owner = parts.length > 0 ? parts.pop() : this.owner
    const assetUrl = `/api/asset/code/${owner}/${name}`

    const getSourceAndTranspile = (err, assets) => {
      if(assets.length > 1){
        this.setError({reason: "Multiple candidates found for " + urlFinalPart, evidence: urlFinalPart, code: ERROR.MULTIPLE_SOURCES})
      }
      const asset = assets[0]
      if (asset) {
        mgbAjax(assetUrl, (err, content) => {
            if(err){
              this.setError({reason: "Unable to load: " + urlFinalPart, evidence: urlFinalPart, code: ERROR.SOURCE_NOT_FOUND})
              return
            }
            this._collectAndTranspile(content, urlFinalPart, cb, true)
          }, asset
        )
      }
      else {
        // TODO somewhere in the callstack get line number and pass to this function - atm EditCode is guessing lines by evidence string
        this.setError({reason: "Unable to locate: " + urlFinalPart, evidence: urlFinalPart, code: ERROR.SOURCE_NOT_FOUND})
        cb("")
      }
    }
    // asset resource identifier
    const ari = url ; //+ '/' + urlFinalPart
    // already subscribed and observing
    // TODO: this can be skipped - but requires to check all edge cases - e.g. first time load / file removed and then added again etc
    // atm this seems pretty quick

    if (this.subscriptions[ari]) {
      getSourceAndTranspile(null, this.subscriptions[ari].getAssets())
      return
    }

    const onReady = () => {
      getSourceAndTranspile(null, this.subscriptions[ari].getAssets())
    }
    // on Change we should check if there is already something happening.. as it can be called at any time
    const onChange = () => {
      if(this.inProgress){
        return
      }
      getSourceAndTranspile(null, this.subscriptions[ari].getAssets())
    }

    // from now on only observe asset and update tern on changes only
    this.subscriptions[ari] = observeAsset({dn_ownerName: owner, name: name, kind: AssetKindEnum.code}, onReady, onChange)
  }
  // expose private variable - EditCode uses this
  hasChanged(){
    return this._hasSourceChanged
  }

  // includes only local MGB code in the bundle - leave CDN untouched
  createBundle(cb){
    if (this.isDestroyed) return
    if (!this._hasSourceChanged) {
      cb(this.cachedBundle, true)
      return
    }
    this.collectSources((sources) => {
      // check sources and skip bundling if sources are empty
      let canSkipBundling = true
      for (let i in sources) {
        const code = sources[i].code
        if(code && code !== ";"){
          canSkipBundling = false
          break
        }
      }
      if(canSkipBundling){
        this.cachedBundle = ''
        this._hasSourceChanged = false
        cb('')
        return
      }



      // only phaser is global atm
      const externalGlobal = []
      const externalLocal = []
      for (let i in sources) {
        const source = sources[i]
        if (source.isExternalFile) {
          const localKey = source.url.split("/").pop().split(".").shift()
          const partial = {url: source.url, localName: source.localName, name: source.name, localKey: localKey, key: source.key}
          source.useGlobal
            ? externalGlobal.push(partial)
            : externalLocal.push(partial)
        }
      }

      let allInOneBundle =
`
(function(){

var imports = {};
window.require = function(key){
  if(imports[key] && imports[key] !== true) {
    return imports[key];
  }
  console.log("guessing name:", key)
  var name = key.split("@").shift()
  if(imports[name] && imports[name] !== true) {
    return imports[name]
  }
  name = name.split(":").pop();
  if(imports[name] && imports[name] !== true) {
    return imports[name]
  }
  return (window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)])
};

var main;
var globalLibs = JSON.parse('${JSON.stringify(externalGlobal)}')
var localLibs = JSON.parse('${JSON.stringify(externalLocal)}')

var loadScript = function(src, cb){
  var s = document.createElement("script")
  s.onload = function(){
    window.setTimeout(cb, 0)
  }
  s.src = src
  document.head.appendChild(s)
}

var loadLocalLibs = function(){
  window.module = {exports: {}};window.exports = window.module.exports;
  if(!localLibs.length){
    window.setTimeout(main, 0)
    return
  }
  var lib = localLibs.shift()
  loadScript(lib.url, function(){
            if(!imports[lib.key])
              imports[lib.key] = window.exports === window.module.exports ? window.exports : window.module.exports

            if(!imports[lib.localKey])
              imports[lib.localKey] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (lib.localName && !imports[lib.localName])
              imports[lib.localName] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (lib.name && !imports[lib.name])
              imports[lib.name] = window.exports === window.module.exports ? window.exports : window.module.exports
    loadLocalLibs()
  })
}

var loadGlobalLibs = function(){
  if(!globalLibs.length){
    window.setTimeout(loadLocalLibs, 0)
    return
  }
  var lib = globalLibs.shift()
  loadScript(lib.url, function(){
    if(window[lib.name]){
      imports[lib.name] = window[lib.name]
    }
    loadGlobalLibs()
  })
}
loadGlobalLibs(globalLibs)

main = function(){
`
      const imports = {}
      for (let i in sources) {
        const source = sources[i]
        if(source.isExternalFile){
          continue
        }

        const key = source.name.split("@").shift();
        const localKeyWithExt = key.split("/").pop()
        const localKey = localKeyWithExt.split(".").shift().split(":").pop()

        allInOneBundle += "window.module = {exports: {}};window.exports = window.module.exports;\n" +
          source.code + ";\n"

        if(!imports[key])
          allInOneBundle += "\n" + 'imports["' + key + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

        if(!imports[localKey])
          allInOneBundle += "\n" + 'imports["' + localKey + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

        if (source.localName && !imports[source.localName])
          allInOneBundle += "\n" + 'imports["' + source.localName + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

        if (source.name && !imports[source.name])
          allInOneBundle += "\n" + 'imports["' + source.name + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'
      }

      allInOneBundle += "\n" + "}})(); "
      // spawn new babel worker and create bundle in the background - as it can take few seconds (could be even more that 30 on huge source and slow pc) to transpile
      /*const worker = new Worker("/lib/BabelWorker.js")
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
      }])*/

      cb(allInOneBundle)
      this.cachedBundle = allInOneBundle
      this._hasSourceChanged = false
    })
  }

  loadDefs(defs){
    for(let i=0; i<defs.length; i++){
      if( this.addedFilesAndDefs[defs[i]]){
        continue
      }
      mgbAjax(defs[i], (err, data) => {
        if(err){
          console.error(`Failed to load def ${defs[i]}`, err)
          return
        }
        this.tern.server.addDefs && this.tern.server.addDefs(JSON.parse(data), true)
        this.addedFilesAndDefs[defs[i]] = true
        this.tern.cachedArgHints = null
      })
    }
  }

  loadCommonDefs(){
    this.loadDefs(knownLibs.common.defs())
  }

  // includes all files in the on big bundle file - not used atm
  createBundle_commonJS(cb) {
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
        allInOneBundle += sources[i].code + "; "

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
      const worker = getCDNWorker("/lib/workers/BabelWorker.js")
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

  // gets imported / exported sources from babel response
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

  // resolves imported file to external (or mgb) link
  static resolveUrl(urlFinalPart, asset_id) {
    var lib = SourceTools.getKnowLib(urlFinalPart)
    if (lib) {
      return lib.src(lib.ver);
    }
    // import X from '/asset name' or import X from '/user/asset name'
    if (urlFinalPart.startsWith("./") ) {
      return '/api/asset/code/' + asset_id
    }
    if(urlFinalPart.startsWith("/") && urlFinalPart.indexOf("//") === -1){
      return '/api/asset/code' + urlFinalPart
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

  // loads and caches import
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

    mgbAjax(url, (err, src) => {
      if(err){
        SourceTools.cached404[url] = httpRequest.status
        cb({code: "", url}, {reason: "Failed to include external source: " + urlFinalPart + " ("+httpRequest.status+")", evidence: urlFinalPart, code: ERROR.UNREACHABLE_EXTERNAL_SOURCE})
      }
      else{
        SourceTools.tmpCache[url] = src
        window.setTimeout(() => {
          delete SourceTools.tmpCache[url]
        }, INVALIDATE_CACHE_TIMEOUT)
        cb({code: src, url})
      }
    })
  }

  // extracts short name from CDN link lib@ver.js => lib
  static getShortName(fullUrl) {
    var name = fullUrl.split("/").pop().split("@").shift().split(".").shift();
    return name;
  }

  // check if we already have info about library - e.g. defs / cdn location etc
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
