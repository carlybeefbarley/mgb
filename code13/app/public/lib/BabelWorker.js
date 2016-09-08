// importScripts("/lib/babel-standalone.js");
// importScripts("/lib/jshint.min.js");
// this is required for babel - as it uses window as global
this.window = this
importScripts("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.12.0/babel.js")

onmessage = function(e) {
  var filename = e.data[0]
  var srcText = e.data[1]
  var trans
  try {
    trans = Babel.transform(srcText, {
      filename: filename,
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['es2015', 'react'],// remove comments as they will break bundled code
      plugins: ['transform-class-properties'],// , "transform-es2015-modules-amd" - not working
      retainLines: true,
      ast: false
    });
  }
  // TODO: what to do if babel fails to transform code?
  catch(e){
    trans = Babel.transform('', {
      filename: filename,
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['es2015', 'react'],// remove comments as they will break bundled code
      plugins: ['transform-class-properties'],// , "transform-es2015-modules-amd" - not working
      retainLines: true,
      ast: false
    });
    trans.code = `throw new Error('${e.message.split("\n").shift()}')`
  }

  postMessage({data: trans.metadata, code: trans.code})
};
