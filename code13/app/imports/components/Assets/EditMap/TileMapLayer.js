import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";

export default class TileMapLayer extends React.Component {

  constructor(...args){
    super(...args);
    this.ctx = null;
  }

  changeTile (e) {
    let index = $(e.target).data("index");
    if (e.ctrlKey) {
      index = 0;
    }
    this.props.onClick(e, index);
    this.forceUpdate();
  }

  handleMouseDown(e){
    if(e.button == 0){
      this.mouseDown = true;
    }
  }
  // this should be triggered on window instead of main element
  handleMouseUp (e){
    if(e.button == 0) {
      this.mouseDown = false;
      this.changeTile(e);
    }
  }

  handleMouseMove(e){
    if(this.mouseDown){
      this.changeTile(e);
    }
  }

  drawTiles(){
    const d = this.props.data.data;
    const map = this.props.map;
    const palette = map.gidCache;
    const mapData = map.data;
    const ctx = this.ctx;

    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    const tiles = [];
    const pos = {x:0, y:0};

    if(!d) {
      return;
    }

    for (let i = 0; i < d.length; i++) {
      TileHelper.getTilePos(i, mapData.width, mapData.tilewidth, mapData.tileheight, pos);
      if(!palette[d[i]]){
        continue;
      }
      const pal = palette[d[i]];
      ctx.drawImage(pal.image,
        pal.x, pal.y, pal.w, pal.h,
        pos.x, pos.y, pal.w, pal.h,
      );
    }

  }

  componentWillUnmount(){
    this.props.map.layers.splice(this.props.map.layers.indexof(this), 1);
  }

  componentDidMount(){
    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();
    this.ctx = canvas.getContext("2d");

    this.props.map.layers.push(this);
  }

  render(){
    return (<div
      ref="layer"
      className={this.props.active ? "tilemap-layer" : "tilemap-layer no-events"}
      data-name={this.props.data.name}

      onMouseMove={this.handleMouseMove.bind(this)}
      onMouseUp={this.handleMouseUp.bind(this)}
      onMouseDown={this.handleMouseDown.bind(this)}

      >
    <canvas ref="canvas" style={{
    width: "100%", height: "100%", display: "block"
    }}></canvas>
    </div>);
  }
}
