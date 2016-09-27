//import d3 from "d3";
// attempt to upgrade d3 - if you want to test it - add: <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/4.2.6/d3.js"></script> to app.html head
const d3 = window.d3;
import "./CodeFlower.css"
//import d3 from "d3"

export default CodeFlower = function (selector, w, h) {
  this.w = w;
  this.h = h;

  d3.select(selector).selectAll("svg").remove();

  this.svg = d3.select(selector).append("svg:svg")
    .attr('width', w)
    .attr('height', h);

  this.svg.append("svg:rect")
    .style("stroke", "#999")
    .style("fill", "#fff")
    .attr('width', w)
    .attr('height', h);

  this.force = d3.forceSimulation()
    .on("tick", this.tick.bind(this))
    /*.charge(function (d) {
      return -100
    })*/
    .force("center", d3.forceCenter(w / 2, h / 2))
    /*.linkDistance( (d) => {
      return (this.getNodeSize(d.target) + this.getNodeSize(d.source)) * 2
      //return d.target._children ? 80 : 50;
    })*/
    //.size([h, w]);
};
CodeFlower.prototype.getNodeSize = function (d) {
  const defaultSize = 2
  const maxSize = 20

  if( !d._size ){
    d._size = d.size
  }
  let size = d._size || (d.children ? (d.children.length + 1) : (d._children.length) * 2)
  size = Math.min(Math.max(defaultSize, size), 20)
  // scale to width
  size *= this.w / 200
  d.size = size
  return size
}
CodeFlower.prototype.update = function (json) {
  if (json) this.json = json;


  this.json.fixed = true;
  this.json.x = this.w / 2;
  this.json.y = this.h / 2;

  var nodes = this.flatten(this.json);
  //var links = d3.tree()(json);
  var hierarchy = d3.hierarchy(this.json);
  var links = hierarchy.links()

  var total = nodes.length || 1;

  // remove existing text (will readd it afterwards to be sure( _it's) on top)
  this.svg.selectAll("*").remove();

  // Restart the force layout
  this.force
    //.gravity(Math.atan(total / 50) / Math.PI * 0.4)
    .nodes(hierarchy)
    //.start();

  // Update the links
  this.link = this.svg.selectAll("line.link")
    .data(links, function (d) {
      return d.target.name;
    });


  // Enter any new links
  this.link.enter().insert("svg:line", ".node")
    .attr("class", "link")
    .attr("x1", function (d) {
      return d.source.x;
    })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    })
    .attr("style", function(){
      return 'fill: none; stroke: #9ecae1; stroke-width: 1.5px;'
    })
  ;

  // Exit any old links.
  this.link.exit().remove();

  // Update the nodes
  this.node = this.svg.selectAll("circle.node")
    .data(nodes, function (d) {
      return d.name;
    })
    .classed("collapsed", function (d) {
      return d._children ? 1 : 0;
    });

  this.node.transition()
    .attr("r", (d) => {
      return this.getNodeSize(d) || 1;
    })
    .style("stroke","#000")
    .style("stroke-width", ".5px");

  let downMove;
  // Enter any new nodes
  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  function dragended(d) {
    d3.select(this).classed("active", false);
  }
  const group = this.node.enter()
    .append('svg:g')
    //.call(this.force.drag)
    .call(d3.drag()
      .on("drag", dragged)
      .on("end", dragended)
    )
    .on("click", this.click.bind(this))
    .on("mouseover", this.mouseover.bind(this))
    .on("mousedown", () => {
      downMove = (e) => {
        this.mousemoved = true
      };
      this.mousemoved = false
      window.addEventListener("mousemove", downMove)

    })
    .on("mouseup", () => {
      window.removeEventListener("mousemove", downMove)
    })
    .on("mouseout", this.mouseout.bind(this));

  group.append('svg:circle')
        .attr("class", "node")
        .classed('directory', function (d) {
          return (d._children || d.children) ? 1 : 0;
        })
        .attr("r", (d) =>  {
          return this.getNodeSize(d) || 1;
        })
        .style("fill", function color(d) {
          return "hsl(" + parseInt(360 / total * d.id, 10) + ",90%,70%)";
        });


  group.append('svg:text')
    .attr('class', 'nodename')
    .attr('text-anchor', 'middle')
    .text((d) => {
      return d.name
    })
    .style('font-size', (d) => {
      let size = this.getNodeSize(d)
      return Math.max(Math.min(size, 16), 8) + "px"
    })
    .style('font-family', "'Lato', 'Helvetica Neue', Arial, Helvetica, sans-serif");

  /*

   */

  // Exit any old nodes
  this.node.exit().remove();


  this.text = this.svg.append('svg:text')
    .attr('class', 'nodetext')
    .attr('dy', 0)
    .attr('dx', 0)
    .attr('text-anchor', 'middle')
    .attr('pointer-events', 'none');

  return this;
};

CodeFlower.prototype.flatten = function (root) {
  var nodes = [], i = 0;

  function recurse(node) {
    if (node.children) {
      node.size = node.children.reduce(function (p, v) {
        return p + recurse(v);
      }, 0);
    }
    if (!node.id) node.id = ++i;
    nodes.push(node);
    return node.size;
  }

  root.size = recurse(root);
  return nodes;
};

CodeFlower.prototype.click = function (d) {
  if(this.mousemoved){
    return
  }
  // Toggle children on click.
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
  else {
    d.children = d._children;
    d._children = null;
  }
  this.update();
};

CodeFlower.prototype.mouseover = function (d) {
  this.text.node = d;
  this.text.attr('transform', 'translate(' + d.x + ',' + (d.y ) + ')')
    .text(d.name)
    .style('display', null);
};

CodeFlower.prototype.mouseout = function (d) {
  this.mousemoved = false
  this.text.style('display', 'none');
};

CodeFlower.prototype.tick = function () {
  var h = this.h;
  var w = this.w;
  this.link.attr("x1", function (d) {
    return d.source.x;
  })
    .attr("y1", function (d) {
      return d.source.y;
    })
    .attr("x2", function (d) {
      return d.target.x;
    })
    .attr("y2", function (d) {
      return d.target.y;
    });

  this.node.attr("transform", function (d) {
    const s = d.size
    return "translate(" + Math.max(s, Math.min(w - s, d.x)) + "," + Math.max(s, Math.min(h - s, d.y)) + ")";
  });

  if( this.text.node && this.text.node.x !== void(0) ){
    this.text.attr('transform', 'translate(' + this.text.node.x + ',' + (this.text.node.y ) + ')')
  }
};

CodeFlower.prototype.cleanup = function () {
  this.update([]);
  this.force.stop();
};
