import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";
import TileSelection from "./Tools/TileSelection.js";
import EditModes from "./Tools/EditModes.js";

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
    this.adjustCanvas();
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");

    this.props.map.layers.push(this);
    console.log("Added tilemap layer to map!", this.options.name, this.props.map.layers);

    this.drawTiles();

    document.body.addEventListener("mouseup", this._mup);

  }
  componentWillUnmount(){
    const index = this.props.map.layers.indexOf(this);
    if(index > -1){
      this.props.map.layers.splice(index, 1);
      console.log("Removed tilemap layer from map!", this.options.name, this.props.map.layers);
    }
    document.body.removeEventListener("mouseup", this._mup);

  }
  /* endof lifecycle functions */

  adjustCanvas(){
    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();
  }

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

    if(this.prevTile.outOfBounds){
      alert("adding tile outside of the tileset bounds not supported.. yet");
      this.mouseDown = false;
      return;
    }
    this.props.onClick(e, this.prevTile);
    this.highlightTiles(ere, e, true);
  }

  getTilePosInfo(e){
    const map = this.props.map;
    const ts = map.data.tilesets[map.activeTileset];
    const pos = new TileSelection();
    pos.updateFromPos(
      (e.offsetX + map.camera.x) * map.camera.zoom,
      (e.offsetY + map.camera.y) * map.camera.zoom,
      map.data.tilewidth, map.data.tileheight, 0);

    pos.id = pos.getMapId(map.data);
    map.selection.push(pos);
    return pos;
  }

  // large maps are still slow on movement..
  // dirty rectalngles (in our case dirty tiles :) are great for super fast map movement
  drawTiles(){

    const ts = this.props.data;
    const d = ts.data;
    const map = this.props.map;
    const palette = map.gidCache;
    const mapData = map.data;
    const ctx = this.ctx;
    const camera = map.camera;

    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    const pos = {x:0, y:0};
    if(!d) {
      return;
    }

    let skipy = Math.floor(-camera.y / mapData.tileheight);
    // at least for now
    if(skipy < 0){skipy = 0;}
    let endy = Math.ceil(skipy + (this.ctx.canvas.height / camera.zoom) / mapData.tileheight);
    endy = Math.min(endy,  mapData.height);
    endy += 1;

    let skipx = Math.floor(-camera.x / mapData.tilewidth);
    if(skipx < 0){skipx = 0;}
    let endx = Math.ceil(skipx + (this.ctx.canvas.width / camera.zoom) / mapData.tilewidth);
    endx = Math.min(endx, mapData.width);
    endx += 1;

    let i=0;
    for (let y = skipy; y < endy; y++) {
      for(let x = skipx; x < endx; x++) {
        i = x + y * mapData.height;
        // skip empty tiles
        if (!d[i]) {
          continue;
        }
        TileHelper.getTilePosRel(i, mapData.width, mapData.tilewidth, mapData.tileheight, pos);

        const pal = palette[d[i]];
        if (pal) {
          this.drawTile(pal, pos, map.spacing);
        }
      }
    }
  }
  drawTile(pal, pos, spacing = 0, clear = false){
    const map = this.props.map;
    const camera = map.camera;

    const drawX = (pos.x * (map.data.tilewidth  + spacing) + camera.x) * camera.zoom;
    const drawY = (pos.y * (map.data.tileheight + spacing) + camera.y) * camera.zoom;

    const drawW = pal.w * camera.zoom;
    const drawH = pal.h * camera.zoom

    if(clear){
      this.ctx.clearRect(
        drawX, drawY,
        map.data.tilewidth * camera.zoom,
        map.data.tileheight * camera.zoom
      );
    }
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w , pal.h ,
      drawX, drawY,
      drawW, drawH
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
      id: 0,
      outOfBounds: false
    };

    TileHelper.getTileCoordsRel(e.offsetX / camera.zoom - camera.x, e.offsetY / camera.zoom - camera.y, map.data.tilewidth, map.data.tileheight, map.spacing, pos);

    // TODO: resize layer so we can push in new tiles
    if(pos.x >= layer.width){
      //console.log("Out of bound to right");
      pos.outOfBounds = true;
      //return;
    }
    else if(pos.x < 0){
      //console.log("Out of bound to left");
      pos.outOfBounds = true;
    }
    if(pos.y > layer.height){
      //console.log("Out of bound to bottom");
      pos.outOfBounds = true;
    }
    else if(pos.y < 0){
      //console.log("Out of bound to top");
      pos.outOfBounds = true;
    }
    pos.id = pos.x + pos.y * layer.width;

    if(this.prevTile && (map.options.randomMode || map.selection.length < 2)){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
        return;
      }
      const pal = palette[layer.data[this.prevTile.id]];
      if(pal && !this.prevTile.outOfBounds){
        this.drawTile(pal, this.prevTile, map.spacing, true);
      }
      else{
        this.highlightTile(this.prevTile);
      }
    }

    let sel;
    if(map.options.randomMode){
      sel = map.selection.random();
      if(sel) {
        this.ctx.globalAlpha = 0.6;
        const pal = palette[sel.gid];
        this.drawTile(pal, pos, map.spacing);
        this.ctx.globalAlpha = 1;
      }
      this.highlightTile(pos, "rgba(0,0,255,0.3)", ts);
    }
    else if( map.selection.length){
      // clear all brefore drawing
      // TODO: clear only selected tiles?
      this.drawTiles();
      let tpos = new TileSelection(pos);
      const ox = map.selection[0].x;
      const oy = map.selection[0].y;
      // TODO: this is messy and repeats for this layer an map in general - move to external source or smth like that
      // as highlight and map modify uses same logic only on different conditions
      for(let i=0; i<map.selection.length; i++){
        sel = map.selection[i];

        if(sel) {
          tpos.x = pos.x + sel.x - ox;
          tpos.y = pos.y + sel.y - oy;

          this.ctx.globalAlpha = 0.6;
          const pal = palette[sel.gid];
          if(pal){
            this.drawTile(pal, tpos, map.spacing);
          }
          this.highlightTile(tpos, "rgba(0,0,255,0.3)", ts);
          this.ctx.globalAlpha = 1;
        }
      }
    }

    this.prevTile = pos;

  }
  highlightTile(pos, fillStyle, ts){
    const map = this.props.map;
    const camera = map.camera;
    let width, height;
    // make little bit smaller highlight - while zooming - alpha bleeds out a little bit
    const drawX = (pos.x * (map.data.tilewidth  + map.spacing) + camera.x) * camera.zoom;
    const drawY = (pos.y * (map.data.tileheight + map.spacing) + camera.y) * camera.zoom + 0.5;

    const drawW = map.data.tilewidth  * camera.zoom;
    const drawH = map.data.tileheight * camera.zoom;

    if(!fillStyle){
      this.ctx.clearRect(drawX, drawY, drawW, drawH);
    }
    else{
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillRect(drawX + 0.5, drawY + 0.5, drawW - 1, drawH - 1);
    }
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
      const map = this.props.map;
      const layer = map.data.layers[map.activeLayer];
      if(map.options.mode == EditModes.fill){
        map.selection.clear();
        const pos = this.getTilePosInfo(e.nativeEvent);
        pos.gid = layer.data[pos.id];
        map.selection.push(pos);
        console.log("pick: ", pos);
      }
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
              //width: "100%", height: "100%",
              display: "block"
            }}>
    </canvas>
    </div>);
  }
}
