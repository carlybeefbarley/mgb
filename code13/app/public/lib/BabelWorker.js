// importScripts("/lib/babel-standalone.js");
// importScripts("/lib/jshint.min.js");
// this is required for babel - as it uses window as global
this.window = this
//importScripts("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.12.0/babel.js")
importScripts("/lib/babel-standalone.js")

onmessage = function (e) {
  var filename = e.data[0]
  var srcText = e.data[1]
  var options = e.data[2] || {
      filename: filename,
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['es2015', 'react'], // remove comments as they will break bundled code
      plugins: ['transform-class-properties'], // , "transform-es2015-modules-amd" - not working
      retainLines: true
    }
  if (!options.filename) {
    options.filename = filename
  }

  var trans
  try {
    trans = Babel.transform(srcText , options);
  }
    // TODO: what to do if babel fails to transform code?
  catch (e) {
    // dummy transform
    trans = Babel.transform('', {
      filename: filename,
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['es2015', 'react'],// remove comments as they will break bundled code
      plugins: ['transform-class-properties'],// , "transform-es2015-modules-amd" - not working
      retainLines: true
    });
    trans.code = `throw new Error('${e.message.split("\n").shift()}')`
    trans.error = {message: e.message, loc: e.loc}
  }
  // this is really heavy task
  trans.code = trans.code.replace(/['"]use strict['"]/gi, '')


  postMessage({data: trans.metadata, code: trans.code, error: trans.error, astTokens: null})
};
