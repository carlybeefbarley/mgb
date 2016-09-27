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
    case "getAstFlowerTree":
      uniqueNames = {}
      return postMessage(getAstFlowerTree(data.filename))
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
var uniqueNames = {}
function getAstFlowerTree(filename, ret){
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
  var increaseDepthAndScanNodes = function(nodes, buffer){
    depth++;
    nodes.forEach(function(node){
      parseNode(node, buffer, depth);
    })
  };

  var tmp;
  if(node.type === "ImportDeclaration"){
    var filename = node.source.value;
    var spec = node.specifiers && node.specifiers[0] ? node.specifiers[0].local : null;
    var name = spec  && spec.local ? spec.local.name : filename
    if(!server.fileMap[filename]){
      filename = filename.substr(2);
      // this is external file.... check defs???
      if(!server.fileMap[filename]){
        if(uniqueNames[node.source.value]) return
        tmp = {
          size: 100, // make external libs large
          name: name,
          children: []
        }
        buffer.push(tmp);
        var defs = server.defs.find(function(d){
          return d['!name'] == node.source.value
        })
        // scan only first level...
        if(defs){
          Object.keys(defs).forEach(function(key){
            if( key.length > 1 && (key.substr(0, 1) === "!" || key.substr(0, 1) === "_") ){
              return;
            }
            Object.keys(defs[key]).forEach(function(key){
              tmp.children.push({
                name: key,
                children: []
              })
            })
          })
        }
        uniqueNames[node.source.value] = true
        return;
      }
    }
    var tree = getAstFlowerTree(filename)
    buffer.push(tree)
    return;
  }

  if(node.type === "VariableDeclaration"){
    increaseDepthAndScanNodes(node.declarations, buffer)
    return;
  }

  if(node.type === "VariableDeclarator"){
    if(uniqueNames[node.id.name]) return
    uniqueNames[node.id.name] = true
    tmp = {
      name: node.id.name,
      children: []
    }
    buffer.push(tmp)
    if(node.init && node.init.properties){
      increaseDepthAndScanNodes(node.init.properties, tmp.children)
    }
    return;
  }

  if(node.type === "Property"){
    if(uniqueNames[node.key.name]) return
    uniqueNames[node.key.name] = true
    tmp = {
      name: node.key.name,
      children: []
    }
    buffer.push(tmp)
    if(node.value.type === "FunctionExpression"){
      tmp.name += "(";
      if(node.value.params.length) {
        node.value.params.forEach(function (param) {
          tmp.name += " " + param.name + " ,";
        });
        tmp.name = tmp.name.substring(0, tmp.name.length - 1);
      }
      tmp.name += ")";
      return;
    }
    if(node.value.type === "ObjectExpression"){
      increaseDepthAndScanNodes(node.value.properties, tmp.children)
      return;
    }
    if(node.value.type === "Literal"){

    }
  }

  if(node.type === "ObjectExpression"){
    increaseDepthAndScanNodes(node.properties, buffer)
    return;
  }

  if(node.type === "ExportDefaultDeclaration"){
    if(node.declaration.type === "AssignmentExpression"){
      //increaseDepthAndScanNodes(node.declaration.right, tmp.children)
      parseNode(node.declaration.right, buffer, ++depth);
      return;
    }
  }
}























var console = {
  log: function(v) { postMessage({type: "debug", message: v}); },
  error: function(v) { postMessage({type: "debug", message: v}); }
};
