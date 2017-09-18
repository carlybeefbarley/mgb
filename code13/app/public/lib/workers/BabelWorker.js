// this is required for babel - as it uses window as global
this.window = this
importScripts("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.12.0/babel.min.js")

var resolveModuleName = function(importName, currentFile, referrer){
  // global import
  if(importName.indexOf('http') === 0 || importName.indexOf('//') === 0){
    return importName
  }
  if(!referrer){
    var parts = currentFile.substring(1).split(':')
    if(parts.length > 1){
      referrer = parts[0]
    }
  }
  importName = importName.split(':').join('/')
  if (importName.indexOf('/') === 0 && importName.indexOf('//') !== 0) {
    if(importName.lastIndexOf('/') === 0 && referrer)
      return '/' + referrer + importName + '.js'
    else
      return importName + '.js'
  }
  return importName
}

onmessage = function (e) {
  var filename = e.data[0]
  var srcText = e.data[1]
  var extraOptions = e.data[2]
  var referrer = e.data[3]
  var importNames = []

  var options = Object.assign({
    filename: filename,
    compact: false,           // Default of "auto" fails on ReactImport
    presets: ['es2015', 'react'],
    sourceMaps: 'inline',
    plugins: ['transform-es2015-modules-amd', 'transform-class-properties'], // async
    // this is function from SourceTools:resolveModuleSource
    resolveModuleSource: function(importName, currentFile){
      importNames.push(importName)
      return resolveModuleName(importName, currentFile, referrer)
    },
  }, extraOptions)
  if (!options.filename) {
    options.filename = filename
  }

  var trans
  try {
    trans = Babel.transform(srcText, options);
  }
    // TODO: what to do if babel fails to transform code?
  catch (e) {
    // dummy transform
    trans = Babel.transform('', {
      filename: filename,
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['es2015', 'react'],// remove comments as they will break bundled code
      plugins: [],// , "transform-es2015-modules-amd"
      retainLines: true
    });
    trans.code = `throw new Error('${e.message.split("\n").shift()}')`
    trans.error = {message: e.message, loc: e.loc}
  }
  // this is really heavy task
  trans.code = trans.code.replace(/['"]use strict['"]/gi, '')


  postMessage({data: trans.metadata, code: trans.code, error: trans.error, astTokens: null, importNames: importNames})
};
