// here we are making config for CodeFlower from ast. http://www.redotheweb.com/CodeFlower/
// walk through AST and create new tree of interesting symbols
const COLORS = {
  member: "green",
  function: "purple",
  class: "orange"
}

const MAX = 0xffffffff

var flowerBuilder = {
  uniqueNames: null,
  maxDepth: 10,
  genTree: function(config, server){
    this.uniqueNames = {}
    this.config = config;
    this.server = server;

    return this.getAstFlowerTree(this.config.filename, null, null, true)
  },

  getAstFlowerTree: function(filename, ret, colorId, isMainFile){
    ret = ret || {
      name: filename,
      displayName: filename,
      size: isMainFile ? 100 : 1,
      children: [],
      depth: 0,
      id: this.genId(filename)
    };

    // create id from string - later used for nice color
    if(!colorId){
      colorId = this.genColorId(filename)
    }
    ret.colorId = colorId;

    var ast = this.server.fileMap[filename].ast;
    this.scanNodes(ast.body, ret.children, 0, colorId, filename + ":");

    return ret
  },
  scanNodes: function(nodes, buffer, depth, colorId, prefix){
    for(var i=0; i<nodes.length; i++) {
      this.parseNode(nodes[i], buffer, depth, colorId, prefix)
    }
  },
  parseNode: function(node, buffer, depth, colorId, prefix) {
    depth = depth || 0
    prefix = prefix || ""
    if (depth > MAX_DEPTH) {
      return
    }
    if(this[node.type]) {
      this[node.type](node, buffer, depth, colorId, prefix)
    }
    else {
      console.log("Skipping: ", node.type)
    }
  },

  genColorId: function(filename){
    var tot = Math.round(Math.random()*10)
    for(var i=0; i<filename.length; i++){
      tot += ( (filename.charCodeAt(i) * i) % MAX )
    }
    return tot
  },
  // improve this.. make use of namespace.. e.g. : my.lib.run - rotate lib around my and run around lib etc
  genId: function(name){
    var tot = 0
    for(var i=0; i<name.length; i++){
      tot += ( (name.charCodeAt(i) * i) % MAX )
    }
    return tot
  },
  makeFunctionName: function( params){
    var ret = "("
    if(params.length) {
      params.forEach(function (param) {
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

        ret += " " + name + ", ";
      });
      ret = ret.substring(0, ret.length - 2);
    }
    ret += " )";
    return ret;
  },
  getObjectName: function(node){
    var n = node;
    var ret = "";
    while(n && n.object){

      if(n.property.name){
        return n.property.name
      }

      if(n.object.name) {
        ret = n.object.name
      }

      n = n.object
    }
    return ret
  },
  // adds extra objects into tree
  makeAdditionalObjects: function(node, buffer, depth, colorId, prefix){
    var n = node, tmp, par;
    var collected = [];
    while(n.object){
      if(n.property.name){
        collected.push(n.property)
      }
      if(n.object.name) {
        collected.push(n.object)
      }
      n = n.object
    }

    // first should be main child
    collected.shift()

    var name = prefix;
    var d = depth;
    var ppar;
    // usually we will need to create only prototype for function.. but it will support deeper nesting also
    while(collected.length){
      var p = collected.pop()
      name += p.name;

      par = this.getParentByName(name, buffer)
      if(par){
        buffer = par.children
        name += "."
        ppar = par;
        // node found - no need to create another
        continue
      }

      if(p.name === "prototype" && ppar){
        if(this.config.local) {
          ppar.color = COLORS.class
        }
      }

      tmp = {
        name: name,
        displayName: p.name,
        children: [],
        depth: ++d,
        colorId: colorId,
        start: p.end,
        end: node.end,
        id: this.genId(name)
      };
      if(this.config.local){
        tmp.color = COLORS.member
      }
      buffer.push(tmp);
      buffer = tmp.children;

      name += "."
    }
    return buffer;
  },
  getParentByName: function(name, buffer){
    for(var i=0; i<buffer.length; i++){
      if(buffer[i].name === name){
        return buffer[i]
      }
    }
    return null
  },
  getParentByNode: function(node, buffer){
    var n = node;
    var name = "";
    while(n.object){
      if(n.object.name) {
        name = n.object.name
      }
      n = n.object
    }
    for(var i=0; i<buffer.length; i++){
      if(buffer[i].displayName === name){
        return buffer[i]
      }
    }
    return null;
  },

  /// rest are node type functions
  ImportDeclaration: function(node, buffer, depth, colorId, prefix) {
    var filename = node.source.value;
    var spec = (node.specifiers && node.specifiers[0]) ? node.specifiers[0] : null;
    var name = spec  && spec.local ? spec.local.name : filename
    if (!server.fileMap[filename] || this.config.local){
      filename = filename.substr(2);
      // this is external file.... check defs???
      if (!this.server.fileMap[filename] || this.config.local) {
        if (this.uniqueNames[node.source.value])
          return
        colorId = this.genColorId(filename)
        var tmp = {
          name: prefix + name,
          displayName: name,
          children: [],
          depth: depth,
          colorId: colorId,
          start: spec ? spec.end : node.source.start,
          end: node.end,
          id: this.genId(prefix + name)
        }
        buffer.push(tmp);
        if (this.config.local)
          return

        var defs = this.server.defs.find(function(d) {
          return d['!name'] == node.source.value
        })
        // scan only first level...
        if (defs) {
          depth++;
          var self = this
          Object.keys(defs).forEach(function(key) {
            if (key.length > 1 && (key.substr(0, 1) === "!" || key.substr(0, 1) === "_") )
              return;

            Object.keys(defs[key]).forEach(function(key){
              tmp.children.push({
                name: prefix + key,
                displayName: key,
                children: [],
                depth: depth,
                colorId: colorId,
                id: self.genId(prefix + name)
              })
            })
          })
        }
        else
          tmp.size = 100 // make unknown external libs huge ( as they will be larger than max size in the sourceTools )

        this.uniqueNames[node.source.value] = true
        return
      }
    }

    // already parsed node
    if (this.uniqueNames[node.source.value])
      return

    this.uniqueNames[node.source.value] = true

    var tree = this.getAstFlowerTree(filename)
    tree.name = name
    tree.depth = depth
    //tree._children = tree.children
    //delete tree.children
    buffer.push(tree)
  },

  VariableDeclaration: function(node, buffer, depth, colorId, prefix){
    this.scanNodes(node.declarations, buffer, ++depth, colorId, prefix)
  },

  VariableDeclarator: function(node, buffer, depth, colorId, prefix) {
    var name = prefix + node.id.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.id.name,
      children: [],
      depth: depth,
      colorId: colorId,
      start: node.id.end,
      end: node.end,
      id: this.genId(prefix + name)
    };
    if(this.config.local){
      tmp.color = COLORS.member
    }
    buffer.push(tmp)

    if(node.init) {
      if (node.init.properties) {
        this.scanNodes(node.init.properties, tmp.children, depth, colorId, prefix + "." + node.id.name)
      }
      if (node.init.right && node.init.right.properties) {
        this.scanNodes(node.init.right.properties, tmp.children, depth, colorId, prefix + "." + node.id.name)
      }
      if(node.init.type == "FunctionExpression"){
        tmp.displayName += this.makeFunctionName(node.init.params)
        if(node.init.body && node.init.body.body){
          if(this.config.local){
            tmp.color = COLORS.function
          }
          this.scanNodes(node.init.body.body, tmp.children, depth, colorId, prefix + "." + node.id.name)
        }
      }
    }
  },

  Property: function(node, buffer, depth, colorId, prefix) {
    var name = prefix + node.key.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.key.name,
      children: [],
      depth: depth,
      colorId: colorId,
      start: node.key.end,
      end: node.end,
      id: this.genId(prefix + name)
    }
    if(this.config.local){
      tmp.color = COLORS.member
    }
    buffer.push(tmp)


    if(node.value.type === "FunctionExpression"){
      if(this.config.local){
        tmp.color = COLORS.function
      }
      tmp.displayName += this.makeFunctionName(node.value.params)
      return;
    }
    if(node.value.type === "ObjectExpression"){
      this.scanNodes(node.value.properties, tmp.children, ++depth, colorId, prefix + "." + node.key.name)
      return;
    }
    if(node.value.type === "Literal"){
      if(this.config.local){
        tmp.color = "red"
      }
    }
  },

  /*FunctionExpression: function(node, buffer, depth, colorId, prefix){
    var name = prefix + '.' + node.scope.fnType.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.scope.fnType.name,
      children: [],
      depth: depth,
      colorId: colorId
    }
    buffer.push(tmp)
  },*/

  ObjectExpression: function(node, buffer, depth, colorId, prefix) {
    this.scanNodes(node.properties || node, buffer, depth, colorId, prefix)
  },

  ExportDefaultDeclaration: function(node, buffer, depth, colorId, prefix) {
    if(node.declaration.type === "AssignmentExpression"){
      //increaseDepthAndScanNodes(node.declaration.right, tmp.children)
      this.parseNode(node.declaration.right, buffer, depth, colorId, prefix);
    }
    if(node.declaration.type === "ClassDeclaration"){
      this.parseNode(node.declaration, buffer, depth, colorId, prefix);
    }
  },

  ClassDeclaration: function(node, buffer, depth, colorId, prefix) {
    // node.id.name - class Name
    var name = prefix + node.id.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.id.name,
      children: [],
      depth: depth,
      colorId: colorId,
      start: node.id.end,
      end: node.end,
      id: this.genId(prefix + name)
    }
    if(this.config.local){
      tmp.color = COLORS.class
    }
    buffer.push(tmp)
    if(node.body && node.body.body){
      this.scanNodes(node.body.body, tmp.children, ++depth, colorId, prefix + "." + node.id.name)
    }
  },

  MethodDefinition: function(node, buffer, depth, colorId, prefix) {
    // node.id.name - class Name
    var name = prefix + '.' + node.key.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.key.name,
      children: [],
      depth: depth,
      colorId: colorId,
      start: node.key.end,
      end: node.end,
      id: this.genId(prefix + name)
    }
    // special case
    if(node.key.name === "constructor"){
      if(node.value && node.value.body && node.value.body.body){
        // buffer as constructor nodes will be at same level as constructor
        var nodes = node.value.body.body
        for(var i=0; i<nodes.length; i++) {
          var n = nodes[i]
          if(n.type == "VariableDeclaration"){
            // these are local variables....
            this.parseNode(nodes[i], tmp.children, depth, colorId, prefix + "." + node.key.name)
          }
          else{
            // these are members of class
            this.parseNode(nodes[i], buffer, depth, colorId, prefix + "." + node.key.name)
          }
        }
        //this.scanNodes(node.value.body.body, buffer, ++depth, colorId, prefix + "." + node.key.name)
      }
    }
    if(this.config.local){
      tmp.color = COLORS.function
    }
    buffer.push(tmp)
    tmp.displayName += this.makeFunctionName(node.value.params)
  },

  FunctionDeclaration: function(node, buffer, depth, colorId, prefix){
    // node.id.name - class Name
    var name = prefix + '.' + node.id.name
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: node.id.name,
      children: [],
      depth: depth,
      colorId: colorId,
      start: node.id.end,
      end: node.end,
      id: this.genId(prefix + name)
    }
    // special case
    if(this.config.local){
      tmp.color = COLORS.function
    }
    buffer.push(tmp)
    tmp.displayName += this.makeFunctionName(node.params)
  },
  ExpressionStatement: function(node, buffer, depth, colorId, prefix){
    var left = node.expression.left
    var right = node.expression.right
    // TODO: this is the case where node.expression == "NewExpression" - e.g. new Phaser.Game(...)
    if(!left && !right){
      return;
    }
    var parent;
    var displayName = this.getObjectName(left)

    var name = prefix + '.' + displayName
    if(this.uniqueNames[name]) return
    this.uniqueNames[name] = true
    var tmp = {
      name: name,
      displayName: displayName,
      children: [],
      depth: depth,
      colorId: colorId,
      start: (left && left.end) ? left.end : node.start,
      end: node.end,
      id: this.genId(prefix + name)
    }
    if(this.config.local){
      tmp.color = COLORS.member
    }
    if(left) {
      parent = this.makeAdditionalObjects(left, buffer, depth, colorId, prefix)
    }

    if(right.type === "FunctionExpression"){
      if(this.config.local){
        tmp.color = COLORS.function
      }
      tmp.displayName += this.makeFunctionName(right.params)
    }
    if(parent){
      parent.push(tmp)
    }
    else{
      buffer.push(tmp)
    }
    //this.parseNode(node.expression.right, buffer, depth, colorId, prefix);
  }
}
