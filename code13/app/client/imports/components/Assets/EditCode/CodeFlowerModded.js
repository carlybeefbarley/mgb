//window.d3 = d3;
import d3 from 'd3'
import SpecialGlobals from '/imports/SpecialGlobals'
const config = SpecialGlobals.codeFlower

const CodeFlower = function(selector, w, h, options) {
  this.w = w
  this.h = h
  // test has 600px
  this.aspect = this.w / 600
  this.options = options

  d3
    .select(selector)
    .selectAll('svg')
    .remove()

  this.svg = d3
    .select(selector)
    .append('svg:svg')
    .attr('width', w)
    .attr('height', h)

  this.svg
    .append('svg:rect')
    .style('stroke', '#999')
    .style('fill', '#fff')
    .attr('width', w)
    .attr('height', h)

  this.force = d3.layout
    .force()
    .on('tick', this.tick.bind(this))
    .charge(d => {
      // main node - make all nodes to run away from it
      if (d.depth === 0) {
        return config.mainCharge * this.aspect
      }
      return !d.children
        ? config.charge * this.aspect
        : d.children.length * config.chargePerChild * this.aspect + config.charge * this.aspect
    })
    .chargeDistance(config.chargeDistance * this.aspect)
    .gravity(config.gravity)
    .friction(config.friction)
    .theta(config.friction)
    .linkStrength(d => {
      return config.linkStrength
    })
    // length of link - charge will modify this value
    .linkDistance(d => {
      const s1 = 0 //!d.source.children ? config.link * this.aspect :  (d.source.children.length * config.linkPerChild * this.aspect) + config.link * this.aspect
      const s2 = !d.target.children
        ? config.link * this.aspect
        : d.target.children.length * config.linkPerChild * this.aspect + config.link * this.aspect

      let ret = s1 + s2
      if ((d.source.depth === 0 || d.target.depth === 0) && d.source.colorId == d.target.colorId) {
        ret = config.link_at_same_level * this.aspect
      }
      return ret
    })
    .size([w, h])
}
CodeFlower.prototype.getNodeSize = function(d) {
  const defaultSize = 7 * this.aspect
  const maxSize = 27 * this.aspect

  if (!d._size) {
    d._size = d.size * this.aspect
  }
  let size
  // collapsed
  if (d._children && d._children.length) {
    size = d._children.length * 2
  } else {
    size = d._size || (d.children ? d.children.length + 1 : defaultSize)
  }
  size = Math.min(Math.max(defaultSize, size * 0.3), maxSize)

  // make bigger 1st level nodes
  if (d.depth < 2 && size < maxSize * 0.5) {
    size = maxSize * 0.5
  }

  // let size = d._size || (d.children ? (defaultSize) : (d._children.length) * 2)
  // collapsed node
  /*if(d._children && d._children.length){
   size = d._children.length * 2
   }*/

  size = Math.min(Math.max(defaultSize, size), maxSize)
  // scale to width
  if (size >= maxSize * 0.5 && this.options.showNames) {
    d.text = d.displayName
  }
  // size *= this.aspect
  d.size = size
  return size
}
CodeFlower.prototype.update = function(json) {
  if (json) this.json = json

  this.json.fixed = true
  this.json.x = this.w / 2
  this.json.y = this.h / 2

  var nodes = this.flatten(this.json)
  var links = d3.layout.tree().links(nodes)

  // remove all nodes - as there are some glitched in refreshing
  this.svg.selectAll('*').remove()
  this.svg.append('style').text(this.getCss())

  // Restart the force layout
  this.force
    //.gravity(Math.atan(total / 50) / Math.PI * 0.4)
    .nodes(nodes)
    .links(links)
    .start()

  // Update the links
  this.link = this.svg.selectAll('line.link').data(links, function(d) {
    return d.target.name
  })

  // Enter any new links
  this.link
    .enter()
    .insert('svg:line', '.node')
    .attr('class', 'link')
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })
    .attr('style', function() {
      return 'fill: none; stroke: #9ecae1; stroke-width: 1.5px;'
    })

  // Exit any old links.
  this.link.exit().remove()

  // Update the nodes
  this.node = this.svg
    .selectAll('circle.node')
    .data(nodes, function(d) {
      return d.name
    })
    .classed('collapsed', function(d) {
      return d._children ? 1 : 0
    })

  this.node
    .transition()
    .attr('r', d => {
      return this.getNodeSize(d) || 1
    })
    .style('stroke', '#000')
    .style('stroke-width', '.5px')

  let downMove
  // Enter any new nodes
  const group = this.node
    .enter()
    .append('svg:g')
    .call(this.force.drag)
    .on('click', this.click.bind(this))
    .on('mouseover', this.mouseover.bind(this))
    .on('mousedown', () => {
      downMove = e => {
        this.mousemoved = true
      }
      this.mousemoved = false
      window.addEventListener('mousemove', downMove)
    })
    .on('mouseup', () => {
      window.removeEventListener('mousemove', downMove)
    })
    .on('mouseout', this.mouseout.bind(this))

  group
    .append('svg:circle')
    .attr('class', 'node')
    .classed('directory', function(d) {
      return d._children || d.children ? 1 : 0
    })
    .attr('r', d => {
      return this.getNodeSize(d) || 1
    })
    .style('fill', function color(d) {
      if (d.color) {
        return d.color
      }

      let light = Math.min(30 + d.depth * 5, 100)
      light = parseInt(light * (1 + (0.2 - Math.random() * 0.4)), 10)

      return 'hsl(' + (d.colorId * 5) % 360 + ',90%,' + light + '%)'
    })

  group
    .append('svg:text')
    .attr('class', 'nodename')
    .attr('text-anchor', 'middle')
    .text(d => {
      return d.text
    })
    .style('font-size', d => {
      let size = this.getNodeSize(d)
      return Math.max(Math.min(size, 16), 8) + 'px'
    })
    .style('font-family', "'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif")

  // Exit any old nodes
  this.node.exit().remove()

  this.text = this.svg
    .append('svg:text')
    .attr('class', 'nodetext')
    .attr('dy', 0)
    .attr('dx', 0)
    .attr('text-anchor', 'middle')
    .attr('pointer-events', 'none')

  return this
}

CodeFlower.prototype.flatten = function(root) {
  var nodes = [],
    i = 0
  var w = this.w
  var h = this.h

  function recurse(node) {
    if (node.children) {
      let size = node.children.reduce(function(p, v) {
        return p + recurse(v)
      }, 0)
      node.size = node.size || size
    }
    if (!node.id) node.id = ++i
    if (node.x === void 0 && node.y === void 0) {
      node.x = (node.id & 0x0f0f0f0f) % w
      node.y = (node.id & 0xf0f0f0f0) % h
      // node.fixed = true - prevents nodes from moving
    }
    nodes.push(node)
    return node.size
  }

  root.size = recurse(root)
  return nodes
}

CodeFlower.prototype.click = function(d) {
  if (this.mousemoved) {
    d.fixed = 1
    return
  }
  if (this.options.onclick) {
    this.options.onclick(d)
    return
  }
  // Toggle children on click.
  if (d.children) {
    d._children = d.children
    d.children = null
  } else {
    d.children = d._children
    d._children = null
  }
  d.fixed = 0
  this.update()
}

CodeFlower.prototype.mouseover = function(d) {
  this.text.node = d
  this.text
    .attr('transform', 'translate(' + d.x + ',' + d.y + ')')
    .text(d.displayName)
    .style('display', null)
}

CodeFlower.prototype.mouseout = function(d) {
  this.mousemoved = false
  this.text.style('display', 'none')
}

CodeFlower.prototype.tick = function() {
  var h = this.h
  var w = this.w
  this.link
    .attr('x1', function(d) {
      return d.source.x
    })
    .attr('y1', function(d) {
      return d.source.y
    })
    .attr('x2', function(d) {
      return d.target.x
    })
    .attr('y2', function(d) {
      return d.target.y
    })

  this.node.attr('transform', function(d) {
    const s = d.size
    return 'translate(' + Math.max(s, Math.min(w - s, d.x)) + ',' + Math.max(s, Math.min(h - s, d.y)) + ')'
  })

  if (this.text.node && this.text.node.x !== void 0) {
    this.text.attr('transform', 'translate(' + this.text.node.x + ',' + this.text.node.y + ')')
  }
}

CodeFlower.prototype.cleanup = function() {
  this.update([])
  this.force.stop()
}

CodeFlower.prototype.getCss = function() {
  return `
#flower text, #flower circle {
    transition-duration: 0.2s;
}

circle.node {
    cursor: pointer;
    stroke: #000;
    stroke-width: .5px;
}

circle.node.directory {
    stroke: #9ecae1;
    stroke-width: 2px;
}

circle.node.collapsed {
    stroke: #555;
}

svg:hover .nodename{
    font-size: 8px;
    opacity: 0.5;
}
svg:hover .nodetext{
    font-size: 16px !important;
    opacity: 1;
    display: block !important;
}
g:hover .nodename{
    pointer-events: none;
    display: none;
}
.nodetext{
    display: none;
}
.nodetext, .nodename {
    font-size: 10px;
    fill: #252929;
    font-weight: bold;
    text-shadow: 0 0 0.2em white;
}

line.link {
    fill: none;
    stroke: #9ecae1;
    stroke-width: 1.5px;
}

`
}

export default CodeFlower
