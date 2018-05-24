// this is required for babel - as it uses window as global

this.window = this
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.26.0/babel.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jshint/2.9.4/jshint.min.js"
)
importScripts()


onmessage = function (e) {
  var str = e.data[0]
  var code;
  var trans;
  var babelError;
  try {
    trans = Babel.transform(str, {
      compact: false,           // Default of "auto" fails on ReactImport
      presets: ['react'],
      // minimal required plugins for jshint stop complaining
      plugins: [
        'transform-object-rest-spread',
        'transform-class-properties'
      ],
      retainLines: true
    })
    code = trans.code
  }
    // TODO: what to do if babel fails to transform code?
  catch (e) {
    const lines = str.split("\n")
    lines.splice(e.loc.line - 1, 1)
    code = '';
    babelError = {
      line: e.loc.line,
      code: "EXXX",
      reason: e.message.substring(0, e.message.indexOf("\n"))
    }
  }


  var conf = e.data[1]
  JSHINT(code, conf)
  var errors = []
  var err
  for (var i = 0; i < JSHINT.errors.length; i++) {
    err = JSHINT.errors[i]
    if (!err) {
      continue
    }
    errors.push({line: err.line, code: err.code, reason: err.reason})
  }
  babelError && errors.push(babelError)

  postMessage([errors])
};
