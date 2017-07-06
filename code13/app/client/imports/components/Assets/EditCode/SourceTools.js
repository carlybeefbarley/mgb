/*
 this is reviewed and adjusted SourceTools for current requirements
 */
import knownLibs from "./knownLibs"
import {observeAsset, mgbAjax, makeCDNLink, genetag} from "/client/imports/helpers/assetFetchers"
import getCDNWorker from '/client/imports/helpers/CDNWorker'
import SpecialGlobals from '/imports/SpecialGlobals'

import { AssetKindEnum } from '/imports/schemas/assets'

import { EventEmitter } from 'events'

/**
 * Gets full url to module without known libs - e.g. jquery
 * @param lib
 * @param version
 * @returns {String}
 */
const getModuleServer = (lib, version = 'latest') => {
  const parts = lib.split("@")
  if (parts.length === 1) {
    return `https://cdn.jsdelivr.net/${lib}/${version}/${lib}.min.js`
  }
  else {
    const name = parts[0]
    return `https://cdn.jsdelivr.net/${name}/${parts[1]}/${name}.min.js`
  }
}

const ERROR = {
  SOURCE_NOT_FOUND: "W-ST-001", // warning - sourcetools - errnum -- atm only matters first letter: W(warning) E(error)
  MULTIPLE_SOURCES: "W-ST-002",
  UNREACHABLE_EXTERNAL_SOURCE: "W-ST-003",
  // if same file is included - then export default won't work as expected - so show error
  RECURSION_DETECTED: "E-ST-004",
  // if imported files will have recursion - usually everything will work fine.
  // But we still need to notify user that some unexpected behavior can happen
  // e.g. when imported resource is requested directly (not in the some function)
  WARN_RECURSION_DETECTED: "W-ST-005"
}

/**
 * Class SourceTools - collects imports, transpiles ES6 to ES5 and bundles code.
 * @extends EventEmitter
 * @emits 'change' - if one of imported files has been changed - we should re-bundle
 * @emits 'error' - if error occurred - for example cannot find requested resource
 */
export default class SourceTools extends EventEmitter {
  /**
   * Creates new instance of SourceTools
   * @param tern - reference to tern instance
   * @param asset - reference to asset
   */
  constructor(tern, asset) {
    super()
    this.tern = tern
    this.asset = asset

    this.babelWorker = getCDNWorker("/lib/workers/BabelWorker.js")


    this.cachedBundle = ''
    this.cachedAndMinfiedBundle = ''

    // map<name, source> containing all loaded defs and files
    this.loadedFilesAndDefs = {}

    // map<filename, transpiledData> containing transpiled files
    this.transpileCache = {}

    // Array of collcted sources for current Asset
    this.collectedSources = []

    // map<assetKey, subscription> Active subscriptions
    this.subscriptions = {}
    // temporary subscriptions - will be closed after all fetching all sources
    this.tmpSubscriptions = {}

    // map<importName, origin> - used to track down recursion
    this.pending = {}

  }

  /**
   * Cleanup
   */
  destroy() {
    this.babelWorker.terminate()
    this.loadedFilesAndDefs = {}
    this.transpileCache = {}
    this.collectedSources = []

    this.closeSubscriptions(this.subscriptions)
    this.subscriptions = {}
  }

  /**
   * Closes all stored subscriptions - opened by objeserveAsset in the assetFetchers
   * @param subscriptions
   */
  closeSubscriptions(subscriptions) {
    // close all used subscriptions
    for (let i in subscriptions) {
      subscriptions[i].subscription.stop()
    }
  }

  /**
   * Entry point for collecting sources - Converts ES6 to ES5 and resolves imports + cleans up old sources and calls private method
   * @param filename - name of the file ( usually /asset.name )
   * @param src - source code (ES6)
   * @param started - timestamp when call has started
   * @returns {Promise.<>} - resolves without arguments
   */
  collectAndTranspile(filename, src, started = Date.now()) {
    // do some cleanup - so we wont waste memory

    // wait.... if in progress
    // we need only last call to be completed.. we will reject any previous calls and start last one

    if(this.inProgress){
      if(this.inProgress > started)
        return Promise.reject() // bail out

      this.shouldCancelASAP = true
      return new Promise( resolve => {
        setTimeout(() => {
          resolve(this.collectAndTranspile(filename, src, started))
        }, 1000)
      })
    }

    this.inProgress = started
    this.collectedSources.length = 0
    const subs = Object.keys(this.subscriptions)
    this.tmpSubscriptions = this.subscriptions
    this.subscriptions = {}

    return this._collectAndTranspile(filename, src)
      .then(() => {
        // clean up pending scripts
        this.pending = {}
        subs.forEach((key) => {
          if (!this.subscriptions[key]) {
            console.log("Closing old SUB:", key)
            this.tmpSubscriptions[key].subscription.stop()
            this.tern.server.delFile('/' + key)
            delete this.transpileCache['/' + key]
          }
        })
        this.tmpSubscriptions = {}
        this.inProgress = 0
      }, (e) => {
        console.log("Cancelled..", e)
        this.inProgress = 0
      }
    )
  }

  /**
   * checks if we should reject promise becasue of newer request
   * @param reject
   */
  checkCancel(reject){
    if(this.shouldCancelASAP) {
      this.shouldCancelASAP = false
      reject("Canceling previous running job...")
    }
  }
  /**
   * Main job for this class - deeply recursive function (can call itself many times - on evry imported file)
   * Collects and transpiles filename and all imported files found in the src
   * @async - may or may not
   * @private
   * @param filename - name of the code asset (file) - tern and babel threats it as normal filename
   * @param src - source code
   * @param origin - reference to first importer ( null for main script )
   * @param additionalProps - additional into that should be appended to source info:
   *  useGlobal (for phaser only) - tells to threat file as global script instead of module
   *  referrer - for imported scripts from another user
   *  url - url to the script
   *  isExternalFile - not an asset
   * @returns {Promise.<>} - resolves without arguments
   */
  _collectAndTranspile(filename, src, origin = null, additionalProps = null) {
    if (this.pending[filename] && !this.transpileCache[filename]) {

      this.emit('error', {
        reason: "Recursion: " + filename,
        evidence: filename,
        code: ERROR.WARN_RECURSION_DETECTED
      })
      return Promise.resolve()
    }
    this.pending[filename] = origin || filename

    // referring itself...
    if (filename === origin) {
      this.emit('error', {
        reason: "Recursion: " + filename,
        evidence: filename,
        code: ERROR.RECURSION_DETECTED
      })
      return Promise.resolve()
    }
    // this object will contain all necessary info about script
    // we need to push it only after all other imported files from this file are resolved to maintain correct order
    const toAdd = Object.assign(this.findCollected(filename) || {name: filename, origin: []}, additionalProps)
    // partial calls don't know origin - so leave as is
    if (origin)
      toAdd.origin.push(origin)

    return this.transpile(filename, src)
      .then(data => {
        const imports = SourceTools.parseImport(data)
        const promises = []
        toAdd.code = data.code
        imports.forEach(imp => {
          // ignore empty urls
          if (imp.url.trim())
            promises.push(this.loadImportedFile(imp.url, {
              filename: imp.url,
              referrer: additionalProps ? additionalProps.referrer : null
            }))
        })
        return Promise.all(promises)
      })
      .then(sources => {
        const promises = []
        sources.forEach(info => {
          // or remove data from info and assign all info ???
          const data = info.data
          delete info.data
          promises.push(this._collectAndTranspile(info.filename, data, filename, info))
        })
        return Promise.all(promises).then(() => {
          if (!this.findCollected(toAdd.name)) {
            this.collectedSources.push(toAdd)
          }
        })
      }
    )
  }

  /**
   * collects imports - ignoring already imported scripts
   * @param filename
   * @returns {Array.<T>}
   */
  collectAvailableImportsForFile(filename) {

    // in the tern VFS all files starts with /
    if(filename.indexOf('/') !== 0)
      filename = '/' + filename

    return this.collectedSources.filter(script => {
      // !!!!! after renaming asset script name won't match asset name
      // only main script don't have origin - as an extra check after renaming
      if (script.name === filename || !script.origin)
        return false

      return script.origin.indexOf(filename) === 0
    })
  }
  /**
   * @typedef {Object} collectedSource
   * @property {String} filename - name of the imported file (can be only asset name or owner:asset combo
   * @property {String} code - transpiled code
   * @property {String} name - import name - usually same as filename
   * @property {String} origin - asset name from which this file has been imported
   * @property {String} referrer - guessed asset owner name ( if it don't have one in the filename )
   * @property {String} url - api link to transpiled asset - so it can be loaded from bundle
   * @property {Boolean} isExternalFile - if true - it's not MGB asset
   *
   * Finds collected source by filename
   * @param filename
   * @returns {collectedSource}
   */
  findCollected(filename) {
    return this.collectedSources.find(s => s.name === filename)
  }


  /**
   * Converts import to URL and loads it: there are 3 cases:
   *    global import e.g. phase / react / jquery
   *       if it's known import we will use provided CDN location and load defs for tern
   *       if unknown - we will load generate link from CDN and load source directly into tern
   *    local import e.g. /!vault:cssLoader (any code asset)
   *    direct link e.g. https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js
   *
   * @private
   * @param filename - filename as defined in the source file /user:asset
   * @param additionalProps - add additional props for resolve value
   * @param ignoreCache - forces to retrieve latest content
   * @returns {Promise.<{url, data}>}
   */
  loadImportedFile(filename, additionalProps, ignoreCache = false) {
    additionalProps = additionalProps || {}

    // remove leading . from filename - old imports has one
    if (filename.indexOf('.') === 0)
      filename = filename.substring(1, filename.length)

    const parts = SourceTools.getLibAndVersion(filename)
    // simple import e.g. 'phaser', 'jquery'
    if (SourceTools.isGlobalImport(filename)) {
      // load knowLib - e.g. phaser
      const lib = knownLibs[parts[0]]
      if (lib) {
        return this.load(lib.src ? lib.src(parts[1]) : getModuleServer(parts[0], parts[1]), null,
          Object.assign(additionalProps, {
            useGlobal: lib.useGlobal,
            isExternalFile: true,
            lib: parts[0],
            version: parts[1]
          })
        )
          .then(info => {
            if (lib.defs)
              this.loadDefs(lib.defs())
            else
              this.addFileToTern(filename, info.data)
            return info
          })
      }
      // unknown lib - e.g. jquery
      else {
        return this.load(getModuleServer(parts[0], parts[1]), null,
          Object.assign(additionalProps, {
            lib: parts[0],
            version: parts[1]
          })
        )
          .then(info => {
            this.addFileToTern(filename, info.data)
            return info
          })
      }
    }
    // load local file
    else if (!SourceTools.isExternalFile(filename)) {
      const ref = additionalProps.referrer || this.asset.dn_ownerName
      const parts = SourceTools.getUserAndName(filename, ref)
      return this.startObserver(parts)
        .then(asset => {
          // TODO: what to do without asset????
          const url = makeCDNLink(`/api/asset/code/${parts.join('/')}`, genetag(asset))
          const es5src = makeCDNLink(`/api/asset/code/es5/${parts.join('/')}`, genetag(asset))
          // try to get e5 source from asset
          // TODO: store in the asset meta info - as we only need to verify if asset has es5 available
          return this.load(es5src, asset).then(es5 => {

            return this.load(url, asset, Object.assign(additionalProps, {
              referrer: asset ? asset.dn_ownerName : ref,
              isExternalFile: !!(es5 && es5.data && es5.data.trim()),
              url: es5src,
              lib: parts[0],
              version: parts[1]
            }), ignoreCache)
              .then(info => {
                this.addFileToTern(filename, info.data)
                return info
              })

          })

        })
    }
    // should be full url
    else {
      return this.load(filename, null, Object.assign(additionalProps, {
        isExternalFile: true,
        lib: parts[0],
        version: parts[1]
      }))
        .then(info => {
          this.addFileToTern(filename, info.data)
          return info
        })
    }
  }

  /**
   * Adds file (es5/6 code) to tern server
   * @param filename
   * @param src
   */
  addFileToTern(filename, src){
    const prev = this.transpileCache[filename]
    if(this.transpileCache[filename]){
      if(prev.src === src){
        /// console.log("Already added to tern server... skipping")
        return
      }
    }
    if(src.length < SpecialGlobals.editCode.maxFileSizeForAST) {
      this.tern.server.addFile(filename, src, true)
      //console.log("Added file", filename, (src.length / 1024).toFixed(2) + "KB")
    }
    else
      console.log(`File ${filename} is too big (${(src.length / 1024).toFixed(2)}KB )!`)
  }
  /**
   * Starts observing asset
   * @private
   * @param {String[]} parts
   * @returns {Promise.<Asset>}
   */
  startObserver(parts) {
    const key = parts.join(':')
    // restore subscription
    if (this.tmpSubscriptions[key]) {
      this.subscriptions[key] = this.tmpSubscriptions[key]
    }

    if (this.subscriptions[key] && !this.subscriptions[key].stopped()) {
      if (this.subscriptions[key].ready()) {
        return Promise.resolve(this.subscriptions[key].getAsset())
      }
      else {
        return new Promise( (resolve, reject) => {
            this.checkCancel(reject)
            setTimeout(() => {
              return this.startObserver(parts).then(asset => resolve(asset))
            }, 300)
          }
        )
      }
    }

    return new Promise(resolve => {
      const owner = parts[0]
      const name = parts[1]

      const onReady = () => {
        // if subscription cannot be found - it has been moved for cleanup - restore it
        if (!this.subscriptions[key])
          this.subscriptions[key] = this.tmpSubscriptions[key]

        // not sure why this gets lost - probably tmpSubscriptions also is undefined.. as has been closed at some point
        if (!this.subscriptions[key])
          return resolve()

        const assets = this.subscriptions[key].getAssets()
        if (assets.length > 1) {
          this.emit('error', {
            reason: "Multiple candidates found for: /" + key,
            evidence: '/' + key,
            code: ERROR.MULTIPLE_SOURCES
          })
        }

        if (!assets.length) {
          this.emit('error', {
            reason: "Unable to load: /" + key,
            evidence: '/' + key,
            code: ERROR.SOURCE_NOT_FOUND
          })
          resolve()
          return
        }

        const asset = assets[0]
        // stop subscription for active asset immediately
        if (this.asset._id === asset._id) {
          this.subscriptions[key].subscription.stop()
        }
        resolve(asset)
      }

      const onChange = () => {
        this.loadImportedFile('/' + key, null, true)
          .then(data => this._collectAndTranspile(data.url, data.data))
          .then(() => {
            // guard here as async function - can be called even after component has been unmounted
            if (this.subscriptions[key])
              this.emit("change", this.subscriptions[key].getAsset())
          })
      }

      this.subscriptions[key] = observeAsset({
        dn_ownerName: owner,
        name: name,
        kind: AssetKindEnum.code,
        isDeleted: false
      }, onReady, onChange)
    })

  }

  /**
   * @typedef {Object} babelResponse
   * @property {String} code - transpiled code
   * @property {Object} data - information about modules (imports / exports)
   * @property {Object} astTokens - babel AST tokens (after transpilation) - not used atm
   *
   * Transpiles src from ES6 to ES5 and resolves promise with {babelResponse}
   * @param filename - name of the file
   * @param src - content of the file
   * @returns {Promise.<babelResponse>}
   */
  transpile(filename, src) {
    if (this.transpileCache[filename] && this.transpileCache[filename].src === src)
      return Promise.resolve(this.transpileCache[filename].data)

    if (SourceTools.isExternalFile(filename) || SourceTools.isGlobalImport(filename)) {
      const fakeBabelResponse = {data: {modules: {imports: [], exports: {specifiers: []}}}, code: src}
      this.transpileCache[filename] = {src, data: fakeBabelResponse}
      return Promise.resolve(fakeBabelResponse)
    }
    return new Promise((resolve, reject) => {
      this.checkCancel(reject)
      const runBabelJob = () => {
        // TODO: spawn extra workers?
        this.babelWorker.onmessage = (m) => {
          this.transpileCache[filename] = {src, data: m.data}
          // prevent extra calls
          this.babelWorker.onmessage = null
          this.babelWorker.isBusy = false
          resolve(m.data)
        }
        this.babelWorker.isBusy = filename
        this.babelWorker.postMessage([filename, src])
      }
      const checkBabelStatus = () => {
        if (this.babelWorker.isBusy)
          setTimeout(checkBabelStatus, 100)
        else
          runBabelJob()
      }
      checkBabelStatus()

    })
  }

  /**
   * Collects all sources - promise to keep async behaviour
   * @returns {Promise.<Array>}
   */
  collectSources() {
    return Promise.resolve(this.collectedSources)
  }

  /**
   * Creates Code Bundle - without external (CDN) files
   * @returns {Promise.<String>} - resolves with bundle string
   */
  createBundle() {
    return this.collectSources()
      .then((sources) => {

        // check sources and skip bundling if ALL sources are empty
        // empty means ';' - because of babel transforms
        let canSkipBundling = true
        for (let i = 0; i < sources.length; i++) {
          const code = sources[i].code
          if (code && code !== ";") {
            canSkipBundling = false
            break
          }
        }
        if (canSkipBundling) {
          this.cachedBundle = ''
          this._hasSourceChanged = false
          return
        }

        // only phaser is global atm
        const externalGlobal = []
        const externalLocal = []
        for (let i = 0; i < sources.length; i++) {
          const source = sources[i]
          if (source.isExternalFile) {
            // only lib should be used here
            const name = source.lib || source.name
            const lib = knownLibs[name]
            const url = lib && lib.min
              ? lib.min(source.version)
              : source.url

            const localKey = source.url.split("/").pop().split(".").shift()
            const partial = {
              url: url,
              localName: source.localName,
              name: source.name,
              localKey: localKey,
              key: source.key
            }
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
            if(lib.key && !imports[lib.key])
              imports[lib.key] = window.exports === window.module.exports ? window.exports : window.module.exports

            if(lib.key && !imports[lib.key + '.js'])
              imports[lib.key + '.js'] = window.exports === window.module.exports ? window.exports : window.module.exports

            if(!imports[lib.localKey])
              imports[lib.localKey] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (lib.localName && !imports[lib.localName])
              imports[lib.localName] = window.exports === window.module.exports ? window.exports : window.module.exports

            if (lib.name && !imports[lib.name])
              imports[lib.name] = window.exports === window.module.exports ? window.exports : window.module.exports
            if (lib.name && !imports[lib.name + '.js'])
              imports[lib.name + '.js'] = window.exports === window.module.exports ? window.exports : window.module.exports

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
          if (source.isExternalFile) {
            continue
          }

          const key = source.name.split("@").shift();
          const localKeyWithExt = key.split("/").pop()
          const localKey = localKeyWithExt.split(".").shift().split(":").pop()

          allInOneBundle += "window.module = {exports: {}};window.exports = window.module.exports;\n" +
            source.code + ";\n"

          if (!imports[key])
            allInOneBundle += "\n" + 'imports["' + key + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

          if (!imports[key+'.js'])
            allInOneBundle += "\n" + 'imports["' + key + '.js"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

          if (!imports[localKey])
            allInOneBundle += "\n" + 'imports["' + localKey + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

          if (source.localName && !imports[source.localName])
            allInOneBundle += "\n" + 'imports["' + source.localName + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'

          if (source.name && !imports[source.name])
            allInOneBundle += "\n" + 'imports["' + source.name + '"] = (window.exports === window.module.export ? window.exports : window.module.exports);'
        }

        allInOneBundle += "\n" + "}})(); "
        // spawn new babel worker and create bundle in the background - as it can take few seconds (could be even more that 30 on huge source and slow pc) to transpile

        if (this.cachedBundle === allInOneBundle) {
          this._hasSourceChanged = false
          return this.cachedAndMinfiedBundle || this.cachedBundle
        }

        this.cachedBundle = allInOneBundle

        // uncomment to get readable version of es5 code
        //return  this.cachedBundle
        return this.transpileAndMinify("bundled_" + this.asset.name, allInOneBundle).then((code) => {
          this.cachedAndMinfiedBundle = code
          this._hasSourceChanged = false
          return this.cachedAndMinfiedBundle
        })
      })
  }

  /**
   * Transpiles and minifies requested ES6 code - used to store ES5 version of this file
   * @param name - filename (asset name)
   * @param codeToTranspile - ES6 code
   * @returns {Promise}
   */
  transpileAndMinify(name, codeToTranspile){
    name = name  + '.js'
    return new Promise(resolve => {
      const worker = getCDNWorker("/lib/workers/BabelWorker.js")
      worker.onmessage = (e) => {
        worker.terminate()
        resolve(e.data.code)
      }
      worker.postMessage([name, codeToTranspile, {
        compact: true,
        minified: true,
        comments: false,
        ast: false,
        retainLines: false
      }])
    })

  }

  /**
   * Loads content via AJAX
   * @param url - source to load
   * @param asset - if known - allows to use etag
   * @param additionalProps - additional props to be added when promise resolves
   * @param ignoreCache - skip cache
   * @returns {Promise.<{url, data +additionalProps}>}
   */
  load(url, asset = null, additionalProps = null, ignoreCache = false) {

    return new Promise((resolve, reject) => {
      this.checkCancel(reject)
      if (!ignoreCache && this.loadedFilesAndDefs[url])
        resolve(Object.assign({url, data: this.loadedFilesAndDefs[url]}, additionalProps))

      mgbAjax(url, (err, data) => {
        if (err) {
          console.log("FAILED TO LOAD:", err, additionalProps)
          const filename = additionalProps ? (additionalProps.filename || url) : url
          this.emit('error', {
            reason: "Unable to load: " + filename,
            evidence: filename,
            code: ERROR.SOURCE_NOT_FOUND
          })
        }
        this.loadedFilesAndDefs[url] = data || ''
        resolve(Object.assign({url, data}, additionalProps))
      }, asset)
    })
  }


  /**
   * Loads definition files defined in the knownLibs
   * @param defs{[String]} - Array with strings representing definition file location on server
   * @returns {Promise.<>} - resolves on success - rejects on failure
   */
  loadDefs(defs) {
    const promises = []
    for (let i = 0; i < defs.length; i++)
      promises.push(this.loadSingleDef(defs[i]))

    return Promise.all(promises)
  }

  /**
   * Load common definition files - e.g. browser, ecmascript
   * @returns Promise.<>
   */
  loadCommonDefs() {
    return this.loadDefs(knownLibs.common.defs())
  }

  /**********************************************************/
  /*****************    Private stuff    ********************/
  /**********************************************************/
  /**
   * @private
   * Loads single definition file - not used directly
   * @param def
   * @returns {Promise.<>}
   */
  loadSingleDef(def) {
    return this.load(def).then(contents => {
      this.tern.server.addDefs && this.tern.server.addDefs(JSON.parse(contents.data), true)
      this.tern.cachedArgHints = null
    })
  }

  /**********************************************************/
  /*****************    Static stuff     ********************/
  /**********************************************************/

  /**
   * Checks if url is local or remote (CDN)
   * @param url - source location
   * @returns {boolean}
   */
  static
  isExternalFile(url) {
    return url.indexOf("http:") === 0 || url.indexOf("https:") === 0 || url.indexOf("//") === 0
  }

  /**
   * Check if url is global import e.g. 'phaser', 'react' etc
   * @param url
   * @returns {boolean}
   */
  static
  isGlobalImport(url) {
    if (url.indexOf('.') === 0)
      url = url.substring(1, url.length)
    return url.indexOf('/') !== 0 && url.indexOf('http:') !== 0 && url.indexOf('https:') !== 0
  }

  /**
   * extracts username and assetname from filename
   * @param filename
   * @param defaultUser - default user
   * @returns {String[]}
   */
  static
  getUserAndName(filename, defaultUser) {
    // older imports have format './myLib'
    if (filename.indexOf('./') === 0) {
      filename = filename.substring(2, filename.length)
    }
    // default import format './myLib'
    if (filename.indexOf('/') === 0) {
      filename = filename.substring(1, filename.length)
    }
    const parts = filename.split(':')
    if (parts.length > 1)
      return parts
    else if (defaultUser)
      return [defaultUser, parts[0]]
    else
      throw new Error("defaultUser is missing!!!")
  }

  /**
   * Splits lib@version - or fallbacks to 'latest' version
   * @param filename
   * @returns {String[]}
   */
  static
  getLibAndVersion(filename) {
    const parts = filename.split('@')
    if (parts.length > 1) {
      return parts
    }
    return [filename, 'latest']
  }

  /**
   * Parses imported files from babel response
   * @param babelAST
   * @returns String[]} - array with imported files
   */
  static
  parseImport(babelAST) {
    let imp;
    const ret = [];

    imp = babelAST.data.modules.imports
    for (let i = 0; i < imp.length; i++) {
      const source = imp[i].source
      const im = source.split('.')
      if (source.indexOf('/') === 0 && source.indexOf('//') !== 0) {
        im.pop()
      }
      ret.push({
        url: im.join('.'),
        name: imp[i].specifiers && imp[i].specifiers.length ? imp[i].specifiers[0].local : null
      })
    }

    // also add export from 'externalSource'
    imp = babelAST.data.modules.exports.specifiers
    for (let i = 0; i < imp.length; i++) {
      const source = imp[i].source
      if (source && imp[i].kind === "external") {
        const im = source.split('.')

        if (source.indexOf('/') === 0 && source.indexOf('//') !== 0)
          im.pop()

        ret.push({
          url: im.join('.'),
          name: imp[i].specifiers && imp[i].specifiers.length ? imp[i].specifiers[0].local : null
        })
      }
    }

    return ret
  }
}
