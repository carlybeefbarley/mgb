"use strict";
import React from 'react';
import Tile from './Tile.js';
import TileSelection from "./Tools/TileSelection.js";
import EditModes from "./Tools/EditModes.js";
import LayerTypes from "./Tools/LayerTypes.js";
import TileCollection from "./Tools/TileCollection.js";
import AbstractLayer from "./AbstractLayer.js";
import TileHelper from "./TileHelper.js";

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;

export default class TileMapLayer extends AbstractLayer {
  /* lifecycle functions */
  constructor(...args){
    super(...args);
    this.ctx = null;
    this.prevTile = null;
    this.mouseDown = false;

    this.drawInterval = 10000;
    this.nextDraw = Date.now() + this.drawInterval;

    this.kind = LayerTypes.tile;


    this.startingTilePos = null;
    this.lastTilePos = null;
    // if dirty - needs to be cleaned....

    this.isDirtySelection = false;
    this.isDirty = true;
    this.isMouseOver = false;
    this.lastTimeout = 0;

    this.drawInfo = {
      v: 1,
      h: 1,
      d: 0
    };

    this.ctrl = {
      v: 1,
      h: 1,
      d: 0
    };

    this._mup = this.handleMouseUp.bind(this);

    this._raf = () => {
      this._drawTiles();
      window.requestAnimationFrame(this._raf);
    };
    this._raf();


  }
  componentDidMount(...args){
    super.componentDidMount(...args);
    this.drawTiles();

  }

  componentWillUnmount(...args){
    super.componentWillUnmount(...args);
  }

  activate(){
    if(this.activeMode){
      this.map.setMode(this.activeMode);
    }
  }
  deactivate(){
    this.activeMode = this.map.options.mode;
  }
  /* endof lifecycle functions */

  get options(){
    return this.props.data;
  }
  get map(){
    return this.props.map;
  }

  isActive(){
    return this.options == map.data.layers[map.activeLayer];
  }

  increaseSizeToTop(pos){
    for(let i=0; i<this.options.width; i++){
      this.options.data.unshift(0);
    }
    this.options.y -= this.map.data.tileheight;
    this.options.height++;
  }

  increaseSizeToRight(pos){
    // one step at the time..
    // this method will be called more - if necessary
    // reverse as first splice will resize array
    for(let i=this.options.height; i>0; i--){
      this.options.data.splice(i * this.options.width, 0, 0);
    }
    this.options.width++;
  }

  increaseSizeToBottom(pos){
    for(let i=0; i<this.options.width; i++){
      this.options.data.push(0);
    }
    this.options.height++;
  }

  increaseSizeToLeft(pos){
    this.options.x -= this.map.data.tilewidth;
    // reverse as first splice will resize array
    for(let i=this.options.height - 1; i>-1; i--){
      this.options.data.splice(i*this.options.width, 0, 0);
    }
    this.options.width++;
  }

  rotate(){
    //this.ctrl.h = this.ctrl.h > 0 ? -1 : 1;
    this.ctrl.d = !this.ctrl.d;

    if(this.ctrl.h == 1 && this.ctrl.v == 1) {
      this.ctrl.h = -1;
    }
    else{
      if(this.ctrl.v == 1){
        this.ctrl.v = -1;
      }
      else{
        if(this.ctrl.h == -1){
          this.ctrl.h = 1;
        }
        else{
          this.ctrl.v = 1;
        }
      }
    }
  }
  rotateBack(){
    //this.ctrl.h = this.ctrl.h > 0 ? -1 : 1;
    this.ctrl.d = !this.ctrl.d;

    if(this.ctrl.h == 1 && this.ctrl.v == 1) {
      this.ctrl.v = -1;
    }
    else{
      if(this.ctrl.h == 1){
        this.ctrl.h = -1;
      }
      else{
        if(this.ctrl.v == -1){
          this.ctrl.v = 1;
        }
        else{
          this.ctrl.h = 1;
        }
      }
    }
  }
  flip(){
    this.ctrl.h = this.ctrl.h > 0 ? -1 : 1;
  }

  fixRotation(id){
    if(this.ctrl.h == -1){
      this.options.data[id] |= FLIPPED_HORIZONTALLY_FLAG;
    }
    if(this.ctrl.v == -1){
      this.options.data[id] |= FLIPPED_VERTICALLY_FLAG;
    }
    if(this.ctrl.d){
      this.options.data[id] |= FLIPPED_DIAGONALLY_FLAG;
    }
  }

  getTilePosInfo(e){
    const map = this.props.map;
    const pos = new TileSelection();
    pos.updateFromPos(
      (e.offsetX / this.camera.zoom - this.camera.x) ,
      (e.offsetY / this.camera.zoom - this.camera.y) ,
      map.data.tilewidth, map.data.tileheight, 0
    );
    pos.getRawId(this.options.width);
    pos.gid = this.options.data[pos.id];
    return pos;
  }

  selectRectangle(pos){
    const map = this.map;
    if(!this.startingTilePos){
      if(!map.tmpSelection.length){
        map.tmpSelection.pushUniquePos(new TileSelection(pos));
      }
      return;
    }

    let startx, endx, starty, endy;
    if(this.startingTilePos.x < pos.x){
      startx = this.startingTilePos.x;
      endx = pos.x;
    }
    else{
      startx = pos.x;
      endx = this.startingTilePos.x;
    }
    if(this.startingTilePos.y < pos.y){
      starty = this.startingTilePos.y;
      endy = pos.y;
    }
    else{
      starty = pos.y;
      endy = this.startingTilePos.y;
    }

    for(let y = starty; y<=endy; y++){
      pos.y = y;
      if(pos.y < 0 || pos.y > this.options.height - 1){
        continue;
      }
      for(let x = startx; x<=endx; x++){
        pos.x = x;
        if(pos.x < 0 || pos.x > this.options.width - 1){
          continue;
        }
        pos.getGidFromLayer(this.options);
        map.tmpSelection.pushUniquePos(new TileSelection(pos));
      }
    }

    this.drawTiles();
  }

  // large maps are still slow on movement..
  // dirty rectalngles (in our case dirty tiles :) are great for super fast map movement
  draw(){
    this.isDirty = true;
  }

  queueDrawTiles(timeout){

    // this might be heavier than redrawing - need to research how heavy is set/clear Timeout!!! + new fn
    if(this.nextDraw - Date.now() > timeout) {
      this.nextDraw = Date.now() + timeout;
    }

  }

  drawTiles() {
    this.isDirty = true;
  }

  _drawTiles(){
    if( !( this.isDirty || this.nextDraw < Date.now() ) || !this.isVisible) {
      return;
    }
    const ts = this.props.data;
    const d = ts.data;
    const map = this.map;
    const palette = map.gidCache;
    const mapData = map.data;
    const ctx = this.ctx;
    const camera = this.camera;

    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    const pos = {x:0, y:0};
    if(!d) {
      return;
    }

    // TODO: isDIrty actually is same as next draw < Date.now() - unneeded flag
    this.isDirty = false;
    this.nextDraw = Date.now() + this.drawInterval;

    const widthInTiles = Math.ceil(  (this.ctx.canvas.width / camera.zoom) / mapData.tilewidth  );
    const heightInTiles = Math.ceil( (this.ctx.canvas.height / camera.zoom) / mapData.tileheight);

    let skipy = Math.floor(-camera.y / mapData.tileheight);
    // at least for now
    if(skipy < 0){skipy = 0;}
    let endy = skipy + heightInTiles*2;
    endy = Math.min(endy, this.options.height);
    //endy += 1;

    let skipx = Math.floor(-camera.x / mapData.tilewidth);
    let endx = skipx + widthInTiles*2;
    endx = Math.min(endx, this.options.width);
    //endx += 1;

    // loop through large tiles
    skipx -= widthInTiles;
    skipy -= heightInTiles;

    if(skipx < 0){skipx = 0;}
    if(skipy < 0){skipy = 0;}

    let i=0;
    for (let y = skipy; y < endy; y++) {
      for(let x = skipx; x < endx; x++) {
        //debugger;
        i = x + y * this.options.width;
        // skip empty tiles
        if (!d[i]) {
          continue;
        }
        TileHelper.getTilePosRel(i, this.options.width, mapData.tilewidth, mapData.tileheight, pos);

        const tileId = d[i] & ( ~(FLIPPED_HORIZONTALLY_FLAG |
                                FLIPPED_VERTICALLY_FLAG |
                                FLIPPED_DIAGONALLY_FLAG) );

        this.drawInfo.h = (d[i] & FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1;
        this.drawInfo.v = (d[i] & FLIPPED_VERTICALLY_FLAG  ) ? -1 : 1;
        this.drawInfo.d = (d[i] & FLIPPED_DIAGONALLY_FLAG  );

        const pal = palette[tileId];
        if (pal) {
          this.drawTile(pal, pos, map.spacing);
        }
      }
    }

    this.drawInfo.d = this.ctrl.d;
    this.drawInfo.v = this.ctrl.v;
    this.drawInfo.h = this.ctrl.h;

    if(this.isMouseOver == true) {
      this._highlightTiles();
    }
    this.drawSelection();
    this.drawSelection(true);

  }
  drawTile(pal, pos, spacing = 0, clear = false){
    if(pal.ts.tiles){
      let tileId = pal.gid - (pal.ts.firstgid);
      const tileInfo = pal.ts.tiles[tileId];
      if(tileInfo){
        if(tileInfo.animation){
          const delta = Date.now() - this.map.startTime;
          // TODO: cache this!
          let tot = 0;
          let anim;
          /* e.g.
           duration: 200
           tileid: 11
           */
          for(let i=0; i<tileInfo.animation.length; i++){
            tot += tileInfo.animation[i].duration;
          }
          const relDelta = delta % tot;
          tot = 0;
          for(let i=0; i<tileInfo.animation.length; i++){
            anim = tileInfo.animation[i];
            tot += anim.duration;
            if(tot > relDelta){
              if(anim.tileid != tileId){
                let gid = anim.tileid + pal.ts.firstgid;
                this.queueDrawTiles(anim.duration - (tot - relDelta)  + 1);
                this.drawTile(this.map.palette[gid], pos, spacing, clear);
                return;
              }
              break;
            }
          }
          this.queueDrawTiles(anim.duration - (tot - relDelta) + 1);
        }
      }
    }

    const map = this.props.map;
    const camera = this.camera;

    let drawX = (pos.x * (map.data.tilewidth  + spacing) + camera.x) * camera.zoom;
    let drawY = (pos.y * (map.data.tileheight + spacing) + camera.y) * camera.zoom;

    let drawW = pal.w * camera.zoom;
    let drawH = pal.h * camera.zoom;

    // TODO: remove this at some point!!!
    if(this.options.tiledrawdirection){
      this.options.mgb_tiledrawdirection = this.options.tiledrawdirection;
      delete this.options.tiledrawdirection;
    }

    // TODO: move these strings somewhere outside
    // tileStartDrawPosition changed to mgb_tiledrawdirection

    if(this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== "rightup"){

      if(this.options.mgb_tiledrawdirection == "leftdown") {
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
      }
      else if(this.options.mgb_tiledrawdirection == "leftup"){
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
        drawY -= (drawH - map.data.tileheight * camera.zoom);
      }
      // default browser canvas - do nothing
      else if(this.options.mgb_tiledrawdirection == "rightdown"){

      }
    }
    // default for tiled is: right up
    else{
      drawY -= (drawH - map.data.tileheight * camera.zoom);
    }

    if(clear){
      this.ctx.clearRect(
        drawX, drawY,
        map.data.tilewidth * camera.zoom,
        map.data.tileheight * camera.zoom
      );
    }
    this.ctx.save();
    const tx = drawX + drawW * 0.5;
    const ty = drawY + drawH * 0.5;
    this.ctx.translate(tx, ty);


    if(this.drawInfo.d){
      // there should be more elegant way to rotate / flip tile
      this.ctx.rotate(-Math.PI * 0.5 * this.drawInfo.h * this.drawInfo.v);
      this.ctx.scale(this.drawInfo.h * -1, this.drawInfo.v);
    }
    else{
      this.ctx.scale(this.drawInfo.h, this.drawInfo.v);
    }

    this.ctx.translate(-tx, -ty);
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w , pal.h ,
      drawX, drawY,
      drawW, drawH
    );
    this.ctx.restore();
  }

  //drawTiles will call this
  _highlightTiles(e = this.lastEvent){
    const map = this.props.map;
    const ts = map.map.tilesets[map.activeTileset];
    const palette = map.gidCache;
    const camera = this.camera;
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
      pos.outOfBounds = true;
    }
    else if(pos.x < 0){
      pos.outOfBounds = true;
    }
    if(pos.y > layer.height){
      pos.outOfBounds = true;
    }
    else if(pos.y < 0){
      pos.outOfBounds = true;
    }
    pos.id = pos.x + pos.y * layer.width;

    let sel;
    if(map.options.randomMode){
      sel = map.collection.random();
      if(sel) {
        const pal = palette[sel.gid];
        if(pal){
          this.ctx.globalAlpha = 0.6;
          this.drawTile(pal, pos, map.spacing);
          this.ctx.globalAlpha = 1;
        }
      }
      this.highlightTile(pos, "rgba(0,0,255,0.3)", ts);
    }
    else if( map.collection.length){
      this.ctx.globalAlpha = 0.6;
      const tpos = new TileSelection(pos);
      let ox = map.collection[0].x;
      let oy = map.collection[0].y;
      // TODO: this is messy and repeats for this layer an map in general - move to external source or smth like that
      // as highlight and map modify uses same logic only on different conditions
      for(let i=0; i<map.collection.length; i++){
        sel = map.collection[i];

        if(sel) {
          tpos.x = pos.x + sel.x - ox;
          tpos.y = pos.y + sel.y - oy;

          let gid = sel.gid;
          // TODO: way to apply transformations to multiple tiles
          if(map.collection.length > 1) {
            this.drawInfo.h = (gid & FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1;
            this.drawInfo.v = (gid & FLIPPED_VERTICALLY_FLAG  ) ? -1 : 1;
            this.drawInfo.d = (gid & FLIPPED_DIAGONALLY_FLAG  );
          }
          gid &= ( ~( FLIPPED_HORIZONTALLY_FLAG |
          FLIPPED_VERTICALLY_FLAG |
          FLIPPED_DIAGONALLY_FLAG) );

          const pal = palette[gid];
          if(pal){
            this.drawTile(pal, tpos, map.spacing);
          }
          this.highlightTile(tpos, "rgba(0,0,255,0.3)", ts);

        }
      }
      this.ctx.globalAlpha = 1;
    }
    this.prevTile = pos;

  }
  highlightTile(pos, fillStyle, ts){
    const map = this.props.map;
    const camera = this.camera;

    // make little bit smaller highlight - while zooming - alpha bleeds out a little bit
    let drawX = (pos.x * (map.data.tilewidth  + map.spacing) + camera.x) * camera.zoom;
    let drawY = (pos.y * (map.data.tileheight + map.spacing) + camera.y) * camera.zoom + 0.5;

    let drawW = map.data.tilewidth  * camera.zoom;
    let drawH = map.data.tileheight * camera.zoom;


    if(this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== "rightup"){

      if(this.options.mgb_mgb_tiledrawdirection == "leftdown") {
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
      }
      else if(this.options.mgb_tiledrawdirection == "leftup"){
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
        drawY -= (drawH - map.data.tileheight * camera.zoom);
      }
      // default browser canvas - do nothing
      else if(this.options.mgb_tiledrawdirection == "rightdown"){

      }
    }
    // default for tiled is: right up
    else{
      drawY -= (drawH - map.data.tileheight * camera.zoom);
    }

    if(!fillStyle){
      this.ctx.clearRect(drawX, drawY, drawW, drawH);
    }
    else{
      this.ctx.fillStyle = fillStyle;
      this.ctx.fillRect(drawX + 0.5, drawY + 0.5, drawW - 1, drawH - 1);
    }
  }

  drawSelection(tmp){
    if(!this.isActive()) {
      return;
    }
    const map = this.map;
    const ts = map.map.tilesets[map.activeTileset];
    const palette = map.palette;

    let sel;
    const toDraw = tmp ? map.tmpSelection : map.selection;
    for(let i=0; i<toDraw.length; i++){
      sel = toDraw[i];
      if(!sel) {
        continue;
      }

      let gid = sel.gid &  ( ~( FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG |
        FLIPPED_DIAGONALLY_FLAG) );

      const pal = palette[gid];
      if(pal){
        this.drawInfo.h = (sel.gid & FLIPPED_HORIZONTALLY_FLAG) ? -1 : 1;
        this.drawInfo.v = (sel.gid & FLIPPED_VERTICALLY_FLAG  ) ? -1 : 1;
        this.drawInfo.d = (sel.gid & FLIPPED_DIAGONALLY_FLAG  );

        this.ctx.globalAlpha = 0.5;
        this.drawTile(pal, sel, map.spacing);
        this.ctx.globalAlpha = 1;
      }
      const color = tmp ? "rgba(0, 255, 0, 0.1)" : "rgba(0, 127, 255, 0.1)";
      this.highlightTile(sel, color, ts);

    }
  }
  /* events */
  handleMouseDown(e){
    if(e.button == 0){
      this.mouseDown = true;
      // simulate 0 px movement
      this.handleMouseMove(e);
    }
  }
  // this should be triggered on window instead of main element
  handleMouseUp (e){

    if(e.button !== 0) {
      return;
    }
    const nat = e.nativeEvent ? e.nativeEvent : e;

    this.mouseDown = false;
    if(e.target == this.refs.canvas){
      this.lastEvent = nat;
      if(edit[map.options.mode]){
        if(!this.options.visible){
          return;
        }
        edit[map.options.mode].call(this, nat, true);
      }
      else{
        edit.debug.call(this, nat, true);
      }
    }
  }
  handleMouseMove(e){
    const nat = e.nativeEvent ? e.nativeEvent : e;
    this.lastEvent = nat;
    if(e.target !== this.refs.canvas){
      return
    }

    this.isMouseOver = true;
    if(edit[map.options.mode]){
      // not visible
      if(!this.options.visible){
        return;
      }
      edit[map.options.mode].call(this, nat);
    }
    else{
      edit.debug.call(this, nat);
    }
  }
  onMouseLeave(e){
    const nat = e.nativeEvent ? e.nativeEvent : e;
    this.isMouseOver = false;
    this.map.tmpSelection.clear();
    this.lastEvent = nat;
    if(this.isDirtySelection){
      this.map.selection.clear();
    }

    this.drawTiles();
  }

  onKeyUp(e){
    const w = e.which;
    /*
     if(w == "A".charCodeAt(0)){
     this.ctrl.v = this.ctrl.v > 0 ? -1 : 1;
     }
     if(w == "S".charCodeAt(0)){
     this.ctrl.h = this.ctrl.h > 0 ? -1 : 1;
     }
     if(w == "D".charCodeAt(0)){
     this.ctrl.d = !this.ctrl.d;
     }*/

    if(w == "Z".charCodeAt(0)){
      if(!e.shiftKey){
        this.rotate();
      }
      else{
        this.rotateBack();
      }
    }
    if(w == "X".charCodeAt(0)){
      this.flip();
    }
    this.draw();
  }
  /* end of events */

}

/* !!! this - in this scope is instance of tilemap layer (above) */
const edit = {
  debug: function(e, mouseUp){
    const pos = this.getTilePosInfo(e);
    pos.gid = this.options.data[pos.id];
  }
};
//???
edit[EditModes.fill] = function(e, up){
  const pos = this.getTilePosInfo(e);

  if(up){
    this.map.saveForUndo();

    let temp = this.map.tmpSelection;
    for(let i=0; i<temp.length; i++){
      this.options.data[temp[i].id] = temp[i].gid;
    }

    for(let i=0; i<this.map.selection.length; i++){
      this.map.selection[i].gid = this.options.data[this.map.selection[i].id];
    }

    temp.clear();
    this.drawTiles();
    return;
  }

  if(this.lastTilePos && this.lastTilePos.isEqual(pos)){
    return;
  }

  if(!this.map.collection.length){
    return;
  }

  if(!this.map.selection.length || this.isDirtySelection){
    this.map.selection.clear();
    // fill with magic wand
    edit[EditModes.wand].call(this, e);
    edit[EditModes.wand].call(this, e, true);
    this.isDirtySelection = true;
  }

  this.map.tmpSelection.clear();

  const temp = this.map.selection;
  this.lastTilePos = pos;

  const arr = this.map.collection.to2DimArray();

  let minx = this.options.width;
  let miny = this.options.height;
  for(let i=0; i<temp.length; i++){
    if(temp[i].x < minx){
      minx = temp[i].x;
    }
    if(temp[i].y < miny){
      miny = temp[i].y;
    }
  }

  let datay;
  for(let i=0; i<temp.length; i++){
    let ins = new TileSelection(temp[i]);

    datay = arr[(temp[i].y + miny) % arr.length];
    if(this.map.options.randomMode){
      ins.gid = this.map.collection.random().gid;
    }
    else{
      ins.gid = datay[(temp[i].x + minx) % datay.length].gid;
    }
    if (ins.gid) {
      ins.getRawId(this.options.width);
      if (this.map.selection.indexOfId(ins.id) > -1) {
        this.map.tmpSelection.push(ins);
      }
    }
  }
  this.drawTiles();
  return;
};
edit[EditModes.stamp] = function(e, up, saveForUndo = true){
  // button 2 is for the map movement and 3d rotate
  // we will use shift + button 1
  if(e.shiftKey){
    if(up){
      this.map.swapOutSelection();
      this.map.selectionToCollection();
      this.map.selection.clear();
    }
    else{
      edit[EditModes.rectangle].call(this, e, up);
    }
    this.drawTiles();
    return;
  }
  if(e.ctrlKey){
    edit[EditModes.eraser].call(this, e, up);
    this.drawTiles();
    return;
  }
  // nothing from tileset is selected
  const pos = this.getTilePosInfo(e);
  if(this.lastTilePos && this.lastTilePos.isEqual(pos) && !up && e.type != "mousedown"){
    return;
  }
  this.lastTilePos = pos;
  if(!this.map.collection.length){
    return;
  }

  if(!this.mouseDown && !up) {
    this.drawTiles(e);
    return;
  }
  if(e.type == "mousedown" && e.target == this.refs.canvas){
    saveForUndo && this.map.saveForUndo();
  }


  if (this.map.options.randomMode) {
    let ts = this.map.collection.random();
    if (this.map.selection.length > 0) {
      if (this.map.selection.indexOfId(pos.id) > -1) {
        this.options.data[pos.id] = ts.gid;
        this.fixRotation(pos.id);
      }
    }
    else {

      if( pos.x < 0 ){
        this.increaseSizeToLeft(pos);
        edit[EditModes.stamp].call(this, e, up, false);
        return;
      }
      if( pos.y < 0 ){
        this.increaseSizeToTop(pos);
        edit[EditModes.stamp].call(this, e, up, false);
        return;
      }
      if(pos.x > this.options.width-1){
        this.increaseSizeToRight(pos);
        edit[EditModes.stamp].call(this, e, up, false);
        return;
      }
      if ( pos.y > this.options.height-1) {
        this.increaseSizeToBottom(pos);
        // force "up" - increasing to bottom doesn't change position
        edit[EditModes.stamp].call(this, e, true, false);
        return;
      }

      this.options.data[pos.id] = ts.gid;
      this.fixRotation(pos.id);

    }
    this.map.redrawGrid();
    this.drawTiles();
    return;
  }

  const ox = this.map.collection[0].x;
  const oy = this.map.collection[0].y;

  let tpos = new TileSelection(pos);
  for (let i = 0; i < this.map.collection.length; i++) {
    let ts = this.map.collection[i];
    tpos.x = ts.x + pos.x - ox;
    tpos.y = ts.y + pos.y - oy;

    if( tpos.x < 0 ){
      this.increaseSizeToLeft(tpos);
      edit[EditModes.stamp].call(this, e, up, false);
      return;
    }
    if( tpos.y < 0 ){
      this.increaseSizeToTop(tpos);
      edit[EditModes.stamp].call(this, e, up, false);
      return;
    }
    if(tpos.x > this.options.width-1){
      this.increaseSizeToRight(tpos);
      edit[EditModes.stamp].call(this, e, up), false;
      return;
    }
    if ( tpos.y > this.options.height-1) {
      this.increaseSizeToBottom(tpos);
      edit[EditModes.stamp].call(this, e, true, false);
      return;
    }
    tpos.id = tpos.x + tpos.y * this.options.width;
    if (this.map.selection.length > 0) {
      if (this.map.selection.indexOfId(tpos.id) > -1) {
        this.options.data[tpos.id] = ts.gid;
        this.fixRotation(tpos.id);
      }
    }
    else {
      this.options.data[tpos.id] = ts.gid;
      this.fixRotation(tpos.id);
    }
  }
  this.map.redrawGrid();
  this.drawTiles();
};
edit[EditModes.eraser] = function(e, up){
  if(!this.mouseDown && !up) {
    return;
  }
  const layer = this.options;
  const pos = this.getTilePosInfo(e);

  if (this.map.selection.length > 0) {
    if (this.map.selection.indexOfId(pos.id) > -1) {
      this.map.saveForUndo();
      layer.data[pos.id] = 0;
    }
  }
  else {
    this.map.saveForUndo();
    layer.data[pos.id] = 0;
  }
  this.drawTiles();
};
/* selections */
edit[EditModes.rectangle] = function(e, mouseUp){
  this.drawTiles();
  const pos = this.getTilePosInfo(e);
  pos.gid = this.options.data[pos.id];
  if(mouseUp){
    if(!e.shiftKey && !e.ctrlKey){
      this.map.selection.clear();
    }
    if(e.shiftKey && e.ctrlKey){
      this.map.keepDiffInSelection();
    }
    else if(e.ctrlKey){
      this.map.removeFromSelection();
    }
    else{
      this.map.swapOutSelection();
    }
    this.drawTiles();
    return;
  }
  if(e.type == "mousedown"){
    this.startingTilePos = new TileSelection(pos);
    if(this.map.tmpSelection.length){
      this.selectRectangle(pos);
    }
    else{
      this.map.tmpSelection.clear();
    }
    this.drawTiles();
  }
  else if(this.mouseDown){
    this.map.tmpSelection.clear();
    this.selectRectangle(pos);
  }
  this.lastTilePos = pos;
  this.isDirtySelection = false;
};
edit[EditModes.wand] = function(e, up, collection = this.map.tmpSelection){
  this.drawTiles();
  if(up){
    if(!e.shiftKey){
      this.map.selection.clear();
    }
    this.map.swapOutSelection();
    this.drawTiles();
    return;
  }

  const pos = this.getTilePosInfo(e);
  if(this.lastTilePos && this.lastTilePos.isEqual(pos)){
    return;
  }
  collection.clear();
  this.lastTilePos = pos;


  pos.gid = this.options.data[pos.id];
  // this is basically same as pathfinding
  const frontier = [];
  const buff = [];
  const np = new TileSelection();
  let check = 0;

  const done = () => {
    while(buff.length){
      collection.pushUniquePos(buff.pop());
    }
    this.drawTiles();
  };
  const isUnique = (p) => {
    for(let i=0; i<buff.length; i++){
      if(buff[i].id == p.id){
        return false;
      }
    }
    for(let i=0; i<frontier.length; i++){
      if(frontier[i].id == p.id){
        return false;
      }
    }
    return true;
  };
  const addToFrontier = (p) => {
    if(p.x >= 0 && p.x < this.options.width && p.y >= 0 && p.y < this.options.height) {
      if(pos.gid == p.gid && isUnique(p)){
        frontier.push(p);
        return true;
      }
    }
    return false;
  };

  const fillSelection = () => {
    check++;
    if(this.options.width * this.options.height < check){
      done();
      return;
    }
    if(!frontier.length){
      done();
      return;
    }
    const p = frontier.shift();

    if(p.gid == pos.gid) {
      buff.push(p);

      np.update(p);

      if(p.x < this.options.width - 1){
        np.x = p.x + 1;
        np.getGidFromLayer(this.options);
        addToFrontier(new TileSelection(np));
      }
      if(p.x > 0) {
        np.x = p.x - 1;
        np.getGidFromLayer(this.options);
        addToFrontier(new TileSelection(np));
      }

      np.x = p.x;
      if(p.y < this.options.height - 1){
        np.y= p.y + 1;
        np.getGidFromLayer(this.options);
        addToFrontier(new TileSelection(np));
      }
      if(p.y > 0) {
        np.y = p.y - 1;
        np.getGidFromLayer(this.options);
        addToFrontier(new TileSelection(np));
      }

    }
    fillSelection();
  };
  if(addToFrontier(pos)){
    fillSelection();
  }
  this.isDirtySelection = false;
};
edit[EditModes.picker] = function(e, up){
  this.drawTiles();
  if(up){
    if(!e.shiftKey && !e.ctrlKey){
      this.map.selection.clear();
    }
    if(e.shiftKey && e.ctrlKey){
      this.map.keepDiffInSelection();
    }
    else if(e.ctrlKey){
      this.map.removeFromSelection();
    }
    else{
      this.map.swapOutSelection();
    }
    this.drawTiles();
    return;
  }
  const pos = this.getTilePosInfo(e);
  if(this.lastTilePos && this.lastTilePos.isEqual(pos)){
    return;
  }
  this.map.tmpSelection.clear();
  this.lastTilePos = pos;
  const tmp = new TileSelection();
  const d = this.options.data;
  for(let i=0; i<this.options.width * this.options.height; i++){
    if(pos.gid == d[i]) {
      tmp.updateFromId(i, this.options.width);
      tmp.getGidFromLayer(this.options);
      this.map.tmpSelection.push(new TileSelection(tmp));
    }
  }
  this.drawTiles();
  this.isDirtySelection = false;
};
