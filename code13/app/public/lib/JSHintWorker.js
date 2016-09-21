// importScripts("/lib/babel-standalone.js");
// importScripts("/lib/jshint.min.js");
// this is required for babel - as it uses window as global
this.window = this
importScripts("https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.12.0/babel.js")
importScripts("https://cdnjs.cloudflare.com/ajax/libs/jshint/2.9.1/jshint.min.js")


onmessage = function(e) {
  var str = e.data[0]
  var code;
  var trans;
  var babelError;
  try {
    trans = Babel.transform(str, {
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['react'],
      plugins: ['transform-class-properties'],
      retainLines: true
    })
    code = trans.code
  }
  // TODO: what to do if babel fails to transform code?
  catch(e){
    var f = new Array(e.loc.line - 1);
    f.fill("\n");
    code = f.join("") + str.substring(e.pos);

    const lines = str.split("\n");
    lines.splice(e.loc.line - 1, 1);
    code = '';//lines.join("\n");
    babelError = {
      line: e.loc.line,
      code: "EXXX",
      reason: e.message.substring(0, e.message.indexOf("(") - 1)
    }
  }


  var conf = e.data[1]
  JSHINT(code, conf)
  var errors = [JSHINT.errors]
  babelError && JSHINT.errors.push(babelError)

  postMessage(errors)
};
