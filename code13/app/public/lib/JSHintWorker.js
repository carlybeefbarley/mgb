// importScripts("/lib/babel-standalone.js");
// importScripts("/lib/jshint.min.js");
// this is required for babel - as it uses window as global
this.window = this
importScripts("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.12.0/babel.js")
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jshint/2.9.1/jshint.min.js")


onmessage = function(e) {
  var str = e.data[0]
  var trans = Babel.transform(str, {
    compact: false,           // Default of "auto" fails on ReactImport
    presets: ['react'],
    plugins: ['transform-class-properties'],
    retainLines: true
  })


  var conf = e.data[1]
  JSHINT(trans.code, conf)

  postMessage([JSHINT.errors])
};
