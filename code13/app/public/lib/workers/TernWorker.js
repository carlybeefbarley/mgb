// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
importScripts('/lib/flowerBuilder.js')
// maximal node depth while scanning for AST tree
var MAX_DEPTH = 5;

// declare global: tern, server
var server;

this.onmessage = function(e) {
  var data = e.data;

  if(!server && data.type != "init"){
    console.log("Server not ready!")
    return
  }

  switch (data.type) {
    case "init": return startServer(data.defs, data.plugins, data.scripts)
    case "add": {
      if(server.fileMap[data.name]){
        if(server.fileMap[data.name].text == data.text){
          return
        }
        // update file only if we have replace flag
        if(data.replace){
          return server.addFile(data.name, data.text)
        }
        else{
          console.log("Skipping file:", data.name)
        }
      }
      else{
        return server.addFile(data.name, data.text)
      }
      break
    }
    case "del": return server.delFile(data.name);
    case "req": return server.request(data.body, function(err, reqData) {
      postMessage({id: data.id, body: reqData, err: err && String(err)});
    });
    case "addDefs": return server.addDefs(data.defs, true);
    case "getFile":
      var c = pending[data.id];
      delete pending[data.id];
      return c(data.err, data.text);
    case "getFiles":
      return postMessage(server.fileMap)
    case "getAstFlowerTree":
      return postMessage({type: "flower", data: flowerBuilder.genTree(data, server)})
    default: throw new Error("Unknown message type: " + data.type);
  }
};

var nextId = 0, pending = {};
function getFile(file, c) {
  postMessage({type: "getFile", name: file, id: ++nextId});
  pending[nextId] = c;
}

function startServer(defs, plugins, scripts) {
  if (scripts) importScripts.apply(null, scripts);

  server = new tern.Server({
    getFile: getFile,
    async: true,
    defs: defs,
    plugins: plugins,
    projectDir: ''
  });
}

/*
var console = {
  log: function(v) { postMessage({type: "debug", message: v}); },
  error: function(v) { postMessage({type: "debug", message: v}); }
};*/

