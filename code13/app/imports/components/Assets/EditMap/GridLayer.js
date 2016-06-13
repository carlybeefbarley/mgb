import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";

export default class TileMapLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args){
    super(...args);
    this.ctx = null;
  }
  componentDidMount(){
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");
    this.adjustCanvas();
    this.drawGrid();
    this.alignToActiveLayer();
  }
  sync(){
    this.adjustCanvas();
    this.drawGrid();
  }
  // align grid to active layer in preview mode
  shouldComponentUpdate(){
    const map = this.props.map;
    if(!map.state.preview){
      this.refs.layer.style['transform'] = '';
      return false;
    }
    if(!map.layers.length){
      return false;
    }
    // remove this function from current stack - as layers are registering themselfes on DidMount
    setTimeout(() => {
      this.alignToActiveLayer();
    }, 0);

    return false;
  }
  componentWillUnmount(){
    const index = this.props.map.layers.indexOf(this);
    if(index > -1){
      this.props.map.layers.splice(index, 1);
    }
    document.body.removeEventListener("mouseup", this._mup);
  }
  /* endof lifecycle functions */

  adjustCanvas(){
    const canvas = this.refs.canvas;
    const $el = $(canvas.parentElement);
    canvas.width = $el.width();
    canvas.height = $el.height();
  }

  alignToActiveLayer(){
    const layerData = map.data.layers[map.activeLayer];
    let index = 0;
    for(let i=0; i<map.layers.length; i++){
      if(map.layers[i].props.data == layerData){
        index = i;
        break;
      }
    }

    const activeLayer = map.layers[index];
    if(activeLayer && activeLayer.kind == "tilemaplayer"){
      this.refs.layer.style['transform'] = getComputedStyle(activeLayer.refs.layer)["transform"];
    }
  }

  drawGrid (){
    this.adjustCanvas();
    //this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const camera = this.props.map.camera;
    if(this.ctx.setLineDash){
      this.ctx.setLineDash([5, 3]);
    }
    const data = this.props.map.data;
    this.ctx.beginPath();

    const offsetX = camera.x % data.tilewidth * camera.zoom;
    const offsetY = camera.y % data.tileheight * camera.zoom;



    // vertical lines
    let i=0;
    const width = Math.floor(this.ctx.canvas.width /data.tilewidth);
    for(; i<= width / camera.zoom; i++){
      this.ctx.moveTo(i * data.tilewidth * camera.zoom + 0.5 + offsetX, -data.tileheight + offsetY);
      this.ctx.lineTo(i * data.tilewidth * camera.zoom + 0.5 + offsetX, this.ctx.canvas.height);
    }
    //this.ctx.moveTo(i * data.tilewidth * camera.zoom - 0.5 + offsetX, -data.tileheight + offsetY);
    //this.ctx.lineTo(i * data.tilewidth * camera.zoom - 0.5 + offsetX, this.ctx.canvas.height);

    // horizontal lines
    i=0;
    const height = Math.floor(this.ctx.canvas.height /data.tileheight);
    for(; i<= height / camera.zoom; i++){
      this.ctx.moveTo(-data.tilewidth + offsetX, i * data.tileheight * camera.zoom + 0.5 + offsetY);
      this.ctx.lineTo(this.ctx.canvas.width, i * data.tileheight * camera.zoom + 0.5 + offsetY);
    }
    //this.ctx.moveTo(-data.tilewidth + offsetX, i * data.tileheight * camera.zoom - 0.5 + offsetY);
    //this.ctx.lineTo(this.ctx.canvas.width, i * data.tileheight * camera.zoom - 0.5 + offsetY);

    this.ctx.strokeStyle="black";
    this.ctx.stroke();

    this.ctx.beginPath();

    const startx = 0.5 + camera.x * camera.zoom;
    const endx = 0.5 + (camera.x + data.width * data.tilewidth) * camera.zoom;

    const starty = 0.5 + camera.y * camera.zoom;
    const endy = 0.5 + (camera.y + data.height * data.tileheight) * camera.zoom;


    this.ctx.moveTo(startx, Math.min(starty, camera.y * camera.zoom));
    this.ctx.lineTo(startx, Math.min(this.ctx.canvas.height, endy));
    this.ctx.moveTo(endx, Math.min(starty, camera.y * camera.zoom));
    this.ctx.lineTo(endx, Math.min(this.ctx.canvas.height, endy));


    this.ctx.moveTo(Math.min(startx, camera.x * camera.zoom), starty);
    this.ctx.lineTo(Math.min(endx, this.ctx.canvas.width), starty);
    this.ctx.moveTo(Math.min(startx, camera.x * camera.zoom), endy);
    this.ctx.lineTo(Math.min(endx, this.ctx.canvas.width), endy);

    if(this.ctx.setLineDash){
      this.ctx.setLineDash([]);
    }
    this.ctx.strokeStyle="red";
    this.ctx.stroke();
  }

  render(){
    // TODO - probably we can leave only canvas element here
    return (<div
      className="tilemap-layer no-events grid-layer"
      data-name="Grid"
      ref="layer"
      >
      <canvas ref="canvas"
              style={{
                width: "100%", height: "100%", display: "block"
              }}
        >
      </canvas>
    </div>);
  }
}
