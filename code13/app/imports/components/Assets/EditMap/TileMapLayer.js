import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";

export default class TileMapLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args){
    super(...args);
    this.ctx = null;
    this.prevTile = null;
    this.mouseDown = false;
    this.kind = "tilemaplayer";
    this._mup = this.handleMouseUp.bind(this);
  }

  componentDidMount(){
    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();
    this.ctx = canvas.getContext("2d");

    console.log("Added tilemap layer to map!", this.options.name);
    this.props.map.layers.push(this);

    this.drawTiles();

    document.body.addEventListener("mouseup", this._mup);
  }
  componentWillUnmount(){
    const index = this.props.map.layers.indexOf(this);
    if(index > -1){
      console.log("Removed tilemap layer to map!", this.options.name);
      this.props.map.layers.splice(this.props.map.layers.indexOf(this), 1);
    }
    document.body.removeEventListener("mouseup", this._mup);
  }
  /* endof lifecycle functions */

  get options(){
    return this.props.data;
  }

  changeTile (ere, e = ere.nativeEvent, force = false) {
    // do nothing if layer is not visible
    if(!this.options.visible){
      return;
    }
    if(!this.prevTile){
      this.highlightTiles(ere, e);
    }

    let index = this.prevTile.id;
    if (e.ctrlKey) {
      index = 0;
    }
    this.props.onClick(e, index);
    this.highlightTiles(ere, e, true);
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
      TileHelper.getTilePosRel(i, mapData.width, mapData.tilewidth, mapData.tileheight, pos);
      const pal = palette[d[i]];
      if(pal){
        this.drawTile(pal, pos, map.spacing);
      }
    }
  }
  drawTile(pal, pos, spacing = 0, clear = false){
    const camera = this.props.map.camera;
    if(clear){
      this.ctx.clearRect(
        pos.x * (pal.ts.tilewidth  + spacing) + camera.x,
        pos.y * (pal.ts.tileheight + spacing) + camera.y,
        pal.w, pal.h);
    }
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w, pal.h,
      pos.x * (pal.ts.tilewidth  + spacing) + camera.x,
      pos.y * (pal.ts.tileheight + spacing) + camera.y,
      pal.w, pal.h,
    );
  }
  highlightTiles(ere, e = ere.nativeEvent, force = true){
    const map = this.props.map;
    const ts = map.map.tilesets[map.activeTileset];
    const palette = map.gidCache;
    const camera = this.props.map.camera;
    const layer = map.data.layers[map.activeLayer];

    const pos = {
      x: 0,
      y: 0,
      id: 0
    };

    TileHelper.getTileCoordsRel(e.offsetX - camera.x, e.offsetY - camera.y, map.data.tilewidth, map.data.tileheight, map.spacing, pos);
    pos.id = pos.x + pos.y * layer.width;

    if(this.prevTile){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
        return;
      }
      const pal = palette[layer.data[this.prevTile.id]];
      if(pal){
        this.drawTile(pal, this.prevTile, map.spacing, true);
      }
      else{
        this.ctx.clearRect(
          this.prevTile.x * (map.data.tilewidth  + map.spacing) + camera.x,
          this.prevTile.y * (map.data.tileheight + map.spacing) + camera.y,
          map.data.tilewidth, map.data.tileheight
        );
      }
    }

    //TODO: draw full selection with multiple tiles
    const sel = map.selection[0];
    if(sel) {
      this.ctx.globalAlpha = 0.6;
      const pal = palette[sel];
      this.drawTile(pal, pos, map.spacing);
      this.ctx.globalAlpha = 1;
    }

    this.ctx.fillStyle = "rgba(0,0,255, 0.2)";
    this.ctx.fillRect(
      pos.x * (map.data.tilewidth + map.spacing) + camera.x,
      pos.y * (map.data.tileheight + map.spacing) + camera.y,
      map.data.tilewidth, map.data.tileheight
    );

    this.prevTile = pos;

  }

  /* events */
  handleMouseDown(e){
    if(e.button == 0){
      this.mouseDown = true;
      this.handleMouseMove(e);
    }
  }

  // this should be triggered on window instead of main element
  handleMouseUp (e){
    if(e.button !== 0) {
      return;
    }
    this.mouseDown = false;
    if(e.target == this.refs.canvas){
      this.changeTile(e, e, true);
    }
  }

  handleMouseMove(e){
    if(this.mouseDown){
      this.changeTile(e, e.nativeEvent, true);
    }
    else{
      this.highlightTiles(e);
    }
  }
  onMouseLeave(e){
    this.prevTile = null;
    this.drawTiles();
  }
  /* end of events */

  render(){
    // TODO - probably we can leave only canvas element here
    return (<div
      ref="layer"
      className={this.props.active ? "tilemap-layer" : "tilemap-layer no-events"}
      data-name={this.props.data.name}
      >
    <canvas ref="canvas"
            onMouseMove={this.handleMouseMove.bind(this)}
            onMouseDown={this.handleMouseDown.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}
            style={{
              width: "100%", height: "100%", display: "block"
            }}>
    </canvas>
    </div>);
  }
}
