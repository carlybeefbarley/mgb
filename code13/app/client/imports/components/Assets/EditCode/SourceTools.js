let babelWorker;
import knownLibs from "./knownLibs.js"

// ajax requests cache - invalidate every few seconds
// this will insanely speed up run
const INVALIDATE_CACHE_TIMEOUT = 30000
// add only smalls libs to tern
const MAX_ACCEPTABLE_SOURCE_SIZE = 653937 + 1 // REACT sice for testing purposes - 1024 * 10 // 10 kb
const tmpCache = {}

export default class SourceTools {
  constructor(ternServer, asset_id) {
    // terminate old babel worker - just in case..
    if (babelWorker) {
      babelWorker.terminate()
    }
    window.mgb_tools = this
    this.asset_id = asset_id
    this.tern = ternServer
    this.babelWorker = babelWorker = new Worker("/lib/BabelWorker.js")

    this.collectedSources = []
    this.timeout = 0

    // here will live external libraries
    this.cache = {}
    // here we will keep our transpiled files
    this.transpileCache = {}
  }

  destroy() {
    this.cache = null
    this.transpileCache = null
    this.babelWorker.terminate()
  }
  // probably events would work better
  collectSources(cb) {
    if (this.inProgress) {
      setTimeout(() => {
        this.collectSources(cb)
      }, 1000)
      return;
    }

    cb(this.collectedSources)
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
    this.addDefsOrFile(name, code)

    cb && cb()
  }
  addDefsOrFile(filename, code){
    const lib = SourceTools.getKnowLib(filename)
    if(lib && lib.defs){
      // true override everything
      this.tern.server.addDefs && this.tern.server.addDefs(lib.defs, true)
    }
    else{
      if(code.length < MAX_ACCEPTABLE_SOURCE_SIZE){

        // this only works when not in worker mode..
        // TODO: find out how to fix that
        this.tern.server.addFile(filename, code)
      }
      else{
        console.log(`source is too big [${filename} -> ${code.length}bytes] and no defs defined`)
      }
    }
  }
  isAlreadyTranspiled(filename) {
    return this.collectedSources.find(s => s.name == filename)
  }

  collectAndTranspile(srcText, filename, callback) {
    // TODO: break instantly callback chain

    if (this.timeout) {
      window.clearTimeout(this.timeout)
      this.timeout = 0;
    }

    // temporary workaround - wait until finises running one and then start again new one
    if (this.inProgress) {
      this.timeout = window.setTimeout(() => {
        this.collectAndTranspile(srcText, filename, callback)
      }, 100)
      return;
    }


    // clean up old data
    this.collectedSources.length = 0
    this.inProgress = true
    this._collectAndTranspile(srcText, filename, () => {
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
    if(this.transpileCache[filename]){
      if(this.transpileCache[filename].src == src){
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
  createBundle(cb){
    this.collectSources((sources) => {
      let allInOneBundle =
        '(function(){'+
        'var imports = {};'+
        'window.require = function(key){ '+ "\n" +
        'if(imports[key] && imports[key] !== true) {'+ "\n" +
        'return imports[key];' + "\n" +
        '} ' +
        'var name = key.split("@").shift();'+ "\n" +
        'return (window[key] || window[name.toUpperCase()] || window[name.substring(0, 1).toUpperCase() + name.substring(1)])' +
        '}; '
      for(var i in sources){
        const key = sources[i].name.split("@").shift();
        if(sources[i].useGlobal){
          allInOneBundle += "\n" + 'delete window.exports; delete window.module; '
        }
        else{
          allInOneBundle += "\n"+ 'window.module = {exports: {}};window.exports = window.module.exports; '
        }
        allInOneBundle += ";" + sources[i].code + "; "
        if(sources[i].useGlobal){
          allInOneBundle += 'imports["' + sources[i].name + '"] = true; '
        }
        else{
          allInOneBundle +=
            'imports["'+key+'"] = (window.exports === window.module.export ? window.exports : window.module.exports)';
          if(sources[i].name){
            allInOneBundle +=  "\n"+ 'imports["' + sources[i].name + '"] = window.module.exports;'
          }
        }
      }

      allInOneBundle += "\n" + "})(); "

      let bundle = allInOneBundle;
      //console.log("transpiling bundle", allInOneBundle.length);
      /*
       const start = Date.now();
       const tr = Babel.transform(allInOneBundle, {
       filename: "bundle.js",
       compact: true,
       minified: true,
       comments: false,
       ast: false,
       retainLines: false
       });
       bundle = tr.code;
       */

      cb(bundle)
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
    if (urlFinalPart.indexOf("/") === 0 && urlFinalPart.indexOf("//") === -1) {
      return '/api/asset/code/' + asset_id + urlFinalPart
    }
    // import X from 'react' OR
    // import X from 'asset_id'
    if (!SourceTools.isExternalFile(urlFinalPart)) {
      return MODULE_SERVER + urlFinalPart
    }

    // import X from 'http://cdn.com/x'
    return urlFinalPart
  }

  static loadImport(url, cb) {
    if(tmpCache[url]){
      window.setTimeout(() => {cb(tmpCache[url])}, 0)
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
