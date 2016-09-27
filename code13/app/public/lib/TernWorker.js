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
      return postMessage(getAstFlowerTree(data, null, null, true))
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
function getAstFlowerTree(options, ret, colorId, mainFile){
  ret = ret || {
    name: options.filename,
    size: mainFile ? 100 : 1,
    children: [],
    depth: 0
  };
  var ast = this.server.fileMap[options.filename].ast;

  // reate id from string - later used for nice color
  if(!colorId){
    colorId = genColorId(options.filename)
  }
  ret.colorId = colorId;

  ast.body.forEach(function(node){
    parseNode(node, ret.children, 1, colorId, options.filename + ":", options)
  })
  return ret
}
function parseNode(node, buffer, depth, colorId, prefix, options){
  depth = depth || 0
  prefix = prefix || ""
  if(depth > MAX_DEPTH){
    return
  }
  var increaseDepthAndScanNodes = function(nodes, buffer, _prefix){
    _prefix = _prefix || ""
    prefix = prefix + "." + _prefix + "."
    depth++;
    nodes.forEach(function(node){
      parseNode(node, buffer, depth, colorId, prefix);
    })
  };

  var tmp;
  if(node.type === "ImportDeclaration"){
    var filename = node.source.value;
    var spec = (node.specifiers && node.specifiers[0]) ? node.specifiers[0] : null;
    var name = spec  && spec.local ? spec.local.name : filename
    if(!server.fileMap[filename] || options.local){
      filename = filename.substr(2);
      // this is external file.... check defs???
      if(!server.fileMap[filename] || options.local){
        if(uniqueNames[node.source.value]) return
        colorId = genColorId(filename)
        tmp = {
          name: prefix + name,
          children: [],
          depth,
          colorId
        }
        buffer.push(tmp);
        if(options.local){
          return
        }
        var defs = server.defs.find(function(d){
          return d['!name'] == node.source.value
        })
        // scan only first level...
        if(defs){
          depth++;
          Object.keys(defs).forEach(function(key){
            if( key.length > 1 && (key.substr(0, 1) === "!" || key.substr(0, 1) === "_") ){
              return;
            }
            Object.keys(defs[key]).forEach(function(key){
              tmp.children.push({
                name: key,
                children: [],
                depth,
                colorId
              })
            })
          })
        }
        else{
          tmp.size = 100 // make unknown external libs huge ( as they will be larger than max size in the sourceTools )
        }
        uniqueNames[node.source.value] = true
        return;
      }
    }

    var tree = getAstFlowerTree({filename})
    tree.name = name
    tree.depth = depth
    //tree._children = tree.children
    //delete tree.children
    buffer.push(tree)
    return;
  }

  if(node.type === "VariableDeclaration"){
    increaseDepthAndScanNodes(node.declarations, buffer)
    return;
  }

  if(node.type === "VariableDeclarator"){
    if(uniqueNames[node.id.name]) return
    depth--;
    uniqueNames[node.id.name] = true
    tmp = {
      name: prefix + node.id.name,
      children: [],
      depth, colorId
    }
    buffer.push(tmp)
    if(node.init && node.init.properties){
      increaseDepthAndScanNodes(node.init.properties, tmp.children, node.id.name)
    }
    if(node.init && node.init.right && node.init.right.properties){
      increaseDepthAndScanNodes(node.init.right.properties, tmp.children, node.id.name)
    }
    return;
  }

  if(node.type === "Property"){
    if(uniqueNames[node.key.name]) return
    uniqueNames[node.key.name] = true
    tmp = {
      name: prefix + node.key.name,
      children: [],
      depth, colorId
    }
    buffer.push(tmp)
    if(node.value.type === "FunctionExpression"){
      tmp.name += "(";
      if(node.value.params.length) {
        node.value.params.forEach(function (param) {
          var name;
          if(param.type == "AssignmentPattern"){
            name = param.left.name
          }
          else{
            name = param.name
          }
          tmp.name += " " + name + ", ";
        });
        tmp.name = tmp.name.substring(0, tmp.name.length - 2);
      }
      tmp.name += ")";
      return;
    }
    if(node.value.type === "ObjectExpression"){
      increaseDepthAndScanNodes(node.value.properties, tmp.children, node.key.name)
      return;
    }
    if(node.value.type === "Literal"){

    }
  }

  if(node.type === "ObjectExpression"){
    depth--
    increaseDepthAndScanNodes(node.properties, buffer)
    return;
  }

  if(node.type === "ExportDefaultDeclaration"){
    if(node.declaration.type === "AssignmentExpression"){
      //increaseDepthAndScanNodes(node.declaration.right, tmp.children)
      parseNode(node.declaration.right, buffer, depth, colorId, prefix);
      return;
    }
    if(node.declaration.type === "ClassDeclaration"){
      parseNode(node.declaration, buffer, depth, colorId, prefix);
      return;
    }
  }

  if(node.type === "ClassDeclaration"){
    // node.id.name - class Name
    uniqueNames[node.id.name] = true
    tmp = {
      name: prefix + node.id.name,
      children: [],
      depth, colorId
    }
    buffer.push(tmp)
    if(node.body && node.body.body){
      increaseDepthAndScanNodes(node.body.body, tmp.children, node.id.name)
      return;
    }
  }

  if(node.type === "MethodDefinition"){
    uniqueNames[node.key.name] = true
    tmp = {
      name: prefix + node.key.name,
      children: [],
      depth, colorId
    }
    buffer.push(tmp)
    tmp.name += "(";
    if(node.value.params.length) {
      node.value.params.forEach(function (param) {
        var name;
        if(param.type == "AssignmentPattern"){
          name = param.left.name
        }
        else if(param.type == "RestElement"){
          name = "..." + param.argument.name
        }
        else{
          name = param.name
        }

        tmp.name += " " + name + ", ";
      });
      tmp.name = tmp.name.substring(0, tmp.name.length - 2);
    }
    tmp.name += ")";
    return;
  }
}

function genColorId(filename){
  var tot = 0
  for(var i=0; i<filename.length; i++){
    tot += filename.charCodeAt(i) * i
  }
  return tot
}






var console = {
  log: function(v) { postMessage({type: "debug", message: v}); },
  error: function(v) { postMessage({type: "debug", message: v}); }
};
