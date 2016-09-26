// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

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
    case "init": return startServer(data.defs, data.plugins, data.scripts);
    case "add": {
      if(server.fileMap[data.name]){
        // update file only if we have replace flag
        if(data.replace){
          server.delFile(data.name);
          return server.addFile(data.name, data.text);
        }
        else{
          console.log("Skipping file:", data.name)
        }
      }
      else{
        return server.addFile(data.name, data.text);
      }
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
    case "getNodeTree":
      return getNodeTree(data.file)
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
    plugins: plugins
  });
}

// here we are making config for CodeFlower from ast. http://www.redotheweb.com/CodeFlower/
function getNodeTree(filename, ret){
  ret = ret || {
    name: filename,
    children: []
  };
  var ast = this.server.fileMap[filename].ast;
  ast.body.forEach(function(node){
    parseNode(node, ret.children)
  })
  return ret
}
function parseNode(node, buffer, depth){
  depth = depth || 0
  if(depth > MAX_DEPTH){
    return
  }
  var tmp;
  if(node.type == "ImportDeclaration"){
    var filename = node.source.value;
    if(!this.server.fileMap[filename]){
      filename = filename.substr(2);
      // this is external file.... check defs???
      if(!this.server.fileMap[filename]){
        buffer.push({
          name: node.source.value,
          size: 100
        });
        return;
      }
    }
    buffer.push(getNodeTree(filename))
    return;
  }

  if(node.type == "VariableDeclaration"){
    depth++
    node.declarations.forEach(function(node){
      parseNode(node, buffer, depth)
    })
    return;
  }

  if(node.type == "VariableDeclarator"){
    tmp = {
      name: node.id.name,
      children: []
    }
    buffer.push(tmp)
    if(node.init.properties){
      depth++;
      node.init.properties.forEach(function(node){
        parseNode(node, tmp.children, depth);
      })
    }
    return;
  }

  if(node.type == "Property"){
    tmp = {
      name: node.key.name,
      children: []
    }
    buffer.push(tmp)
    if(node.value.type == "FunctionExpression"){
      tmp.name += "(";
      node.value.params.forEach(function(param){
        tmp.name += param.name + ","
      });
      tmp.name += tmp.name.substring(0, tmp.name - 1) + ")"
      return;
    }
    if(node.value.type == "ObjectExpression"){
      depth++;
      node.value.properties.forEach(function(node){
        parseNode(node, tmp.children, depth);
      })
      return;
    }
    if(node.value.type == "Literal"){

    }
  }
}























var console = {
  log: function(v) { postMessage({type: "debug", message: v}); },
  error: function(v) { postMessage({type: "debug", message: v}); }
};
