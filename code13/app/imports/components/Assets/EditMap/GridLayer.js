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
    const $el = $(canvas.parentElement);
    canvas.width = $el.width();
    canvas.height = $el.height();

    this.ctx = canvas.getContext("2d");
    this.drawGrid();
    this.alignToActiveLayer();
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
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const camera = this.props.map.camera;
    if(this.ctx.setLineDash){
    }
    const data = this.props.map.data;
    this.ctx.beginPath();

    const offsetX = camera.x % data.tilewidth;
    const offsetY = camera.y % data.tilewidth;

    this.ctx.setLineDash([5, 3]);
    // vertical lines
    let i=0;
    for(; i<data.width; i++){
      this.ctx.moveTo(i * data.tilewidth + 0.5 + offsetX, 0);
      this.ctx.lineTo(i * data.tilewidth + 0.5 + offsetX, this.ctx.canvas.height);
    }
    this.ctx.moveTo(i * data.tilewidth - 0.5 + offsetX, 0);
    this.ctx.lineTo(i * data.tilewidth - 0.5 + offsetX, this.ctx.canvas.height);

    // horizontal lines
    i=0;
    for(; i<data.height; i++){
      this.ctx.moveTo(0, i * data.tileheight + 0.5 + offsetY);
      this.ctx.lineTo(this.ctx.canvas.width, i * data.tileheight + 0.5 + offsetY);
    }
    this.ctx.moveTo(0, i * data.tileheight - 0.5 + offsetY);
    this.ctx.lineTo(this.ctx.canvas.width, i * data.tileheight - 0.5 + offsetY);

    this.ctx.strokeStyle="black";
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
