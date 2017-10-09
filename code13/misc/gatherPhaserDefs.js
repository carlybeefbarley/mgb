const fs = require('fs')
const pathToDocs = '../../../phaser/v2/resources/docgen/output/'
const files = fs.readdirSync(pathToDocs)
const out = {}
process.chdir(__dirname)


const addKey = (obj, arr) => {
  const p = arr.shift()
  if (p) {
    obj[p] = obj[p] || {'!name': p}
   return addKey(obj[p], arr)
  }
  return obj
}

const prepareParams = (params) => {
  if(!params)
    return ''
  let out = []
  params.forEach(p => {
    if(!p.name){
      return
    }
    let name = p.name.split('[').pop().split('=').shift().split(']').shift()
    // [style]: object, [style.font]: string, [style.fill='black']
    // TODO: this is param definition format.. probably convert to ??: style {color: string, fontSize: string} etc
    if(name.split(".").length > 1){
      return
    }
    name = name.replace(/[\-\+]/gi, "$")


    out.push( (name == '-' ? 'restParameters' : name) + (p.optional ? '?' : '') + ': ' + p.type.join('|').split(' ').join('|').replace(/[\-\+]/gi, "$") )
  })

  return out.join(', ')
}

const primitiveTypes = [
  'number', 'string', 'boolean', 'undefined', 'null'
]

files.forEach(f => {
  let d
  try {
    d = JSON.parse(fs.readFileSync(pathToDocs + f))
  }
  catch(e){
    console.error("Caught error: file:`" + f + '`: ', e)
    return true
  }
  const def = addKey(out, d.class.name.split('.'))
  const url = 'http://phaser.io/docs/2.6.2/' + d.class.name + '.html'
  def['!type'] = 'fn(' + prepareParams(d.class.parameters) + ')'
  def['!url'] = url
  def['!doc'] = d.class.help.split("\\n").join("\n")

  d.consts.forEach((c) => {
    def[c.name] = {
      "!type": c.type.replace('boolean', 'bool'),
      "!url": url + "#"+c.name,
      "!doc": c.help
    }
  })

  if(d.properties.public.length > 0) {
    def.prototype = def.prototype || {}
  }

  d.properties.public.forEach(c => {
    //const name = c.name.split('[').pop().split('=').join('>').split(']').shift()

    const type = c.type.join("|")
    const tmp = {
      "!type": (primitiveTypes.indexOf(type) > -1 ? type : ('+' + type)).replace('boolean', 'bool'),
      "!url": url + "#"+c.name,
      "!doc": c.help + '\n' + c.inlineHelp ? c.inlineHelp : ''
    }
    if(c.static){
      def[c.name] = tmp
    }
    else{
      def.prototype[c.name] = tmp
    }
  })

  if(d.methods.public.length > 0) {
    def.prototype = def.prototype || {}
  }
  // we need only public???
  d.methods.public.forEach((c) => {
    if(c.returns && c.returns.length > 1){
      console.log("unhandled multiple returns", c)
    }

    const tmp = {
      "!type": ('fn(' + prepareParams(c.parameters) + ')' + (c.returns ? ' -> ' + c.returns.types.pop() : '')).replace('boolean', 'bool'),
      "!url": url + "#"+c.name,
      "!doc": c.help + '\n' + c.inlineHelp ? c.inlineHelp : ''
    }

    if(c.static){
      def[c.name] = tmp
    }
    else{
      def.prototype[c.name] = tmp
    }

  })



})

fs.writeFileSync('../app/public/lib/tern/defs/phaser.new.json', JSON.stringify({
  "!": "DO NOT EDIT THIS FILE DIRECTLY - IT WILL BE OVERWRITTEN",
  "!name": 'phaser',  Phaser: out.Phaser}, null, "  "))
fs.writeFileSync('../app/public/lib/tern/defs/pixi.new.json', JSON.stringify({
  "!": "DO NOT EDIT THIS FILE DIRECTLY - IT WILL BE OVERWRITTEN",
  "!name": 'pixi',
  PIXI: out.PIXI}, null, "  "))
/*
NAME = {
 "!type": "fn(number) -> number",
 "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/abs",
 "!doc": "Returns the absolute value of a number."
}

"atan2": {
   "!type": "fn(y: number, x: number) -> number",
   "!url": "https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/atan2",
   "!doc": "Returns the arctangent of the quotient of its arguments."
},
 */

// just for reference
const sample = {
  "class": {
    "name": "Phaser.Particles.Arcade",
    "extends": "",
    "static": true,
    "constructor": false,
    "parameters": [
      {
        "name": "x",
        "type": [
          "number"
        ],
        "help": "position of the point on the x axis",
        "optional": false,
        "default": null
      },
      {
        "name": "y",
        "type": [
          "number"
        ],
        "help": "position of the point on the y axis",
        "optional": false,
        "default": null
      }
    ],
    "help": "Arcade Particles is a Particle System integrated with Arcade Physics."
  },
  "consts": [],
  "methods": {"public": [], "protected": [], "private": [], "static": []},
  "properties": {"public": [], "protected": [], "private": []}
}