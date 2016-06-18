import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";
import TileSelection from "./Tools/TileSelection.js";
import EditModes from "./Tools/EditModes.js";
import TileCollection from "./Tools/TileCollection.js";


export default class TileMapLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args){
    super(...args);
    this.ctx = null;
    this.prevTile = null;
    this.mouseDown = false;
    this.kind = "tilemaplayer";
    this._mup = this.handleMouseUp.bind(this);

    this.startingTilePos = null;
    this.lastTilePos = null;
    // if dirty - needs to be cleaned....
    this.isDirtySelection = false;
  }
  componentDidMount(){
    this.adjustCanvas();
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");

    this.props.map.layers.push(this);
    //console.log("Added tilemap layer to map!", this.options.name, this.props.map.layers);

    this.drawTiles();

    document.body.addEventListener("mouseup", this._mup);

  }
  componentWillUnmount(){
    const index = this.props.map.layers.indexOf(this);
    if(index > -1){
      this.props.map.layers.splice(index, 1);
      //console.log("Removed tilemap layer from map!", this.options.name, this.props.map.layers);
    }
    document.body.removeEventListener("mouseup", this._mup);

  }
  /* endof lifecycle functions */

  get options(){
    return this.props.data;
  }
  get map(){
    return this.props.map;
  }

  adjustCanvas(){
    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();
  }

  getTilePosInfo(e){
    const map = this.props.map;
    const pos = new TileSelection();
    pos.updateFromPos(
      (e.offsetX / map.camera.zoom - map.camera.x) ,
      (e.offsetY / map.camera.zoom - map.camera.y) ,
      map.data.tilewidth, map.data.tileheight, 0
    );
    pos.getRawId(this.options.width);
    pos.gid = this.options.data[pos.id];
    return pos;
  }

  isActive(){
    return this.options == map.data.layers[map.activeLayer];
  }

  selectRectangle(pos){
    const map = this.map;
    if(!this.startingTilePos){
      if(!map.tmpSelection.length){
        //console.log("single!", map.tmpSelection.length);
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

    const widthInTiles = Math.ceil(  (this.ctx.canvas.width / camera.zoom) / mapData.tilewidth  );
    const heightInTiles = Math.ceil( (this.ctx.canvas.height / camera.zoom) / mapData.tileheight);

    let skipy = Math.floor(-camera.y / mapData.tileheight);
    // at least for now
    if(skipy < 0){skipy = 0;}
    let endy = skipy + heightInTiles;
    endy = Math.min(endy,  mapData.height);
    endy += 1;

    let skipx = Math.floor(-camera.x / mapData.tilewidth);
    if(skipx < 0){skipx = 0;}
    let endx = skipx + widthInTiles;
    endx = Math.min(endx, this.options.width);
    endx += 1;

    // loop through large tiles
    skipx -= widthInTiles;
    skipy -= heightInTiles;

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

        const pal = palette[d[i]];
        if (pal) {
          this.drawTile(pal, pos, map.spacing);
        }
      }
    }

    this.drawSelection();
    this.drawSelection(true);
  }
  drawTile(pal, pos, spacing = 0, clear = false){
    const map = this.props.map;
    const camera = map.camera;

    let drawX = (pos.x * (map.data.tilewidth  + spacing) + camera.x) * camera.zoom;
    let drawY = (pos.y * (map.data.tileheight + spacing) + camera.y) * camera.zoom;

    let drawW = pal.w * camera.zoom;
    let drawH = pal.h * camera.zoom;

    // TODO: move these strings somewhere outside
    if(this.options.tileStartDrawPosition && this.options.tileStartDrawPosition !== "rightup"){
      // default browser canvas
      if(this.options.tileStartDrawPosition == "rightdown"){
      }
      else if(this.options.tileStartDrawPosition == "leftdown") {
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
      }
      else if(this.options.tileStartDrawPosition == "leftup"){
        drawX -= (drawW - map.data.tilewidth * camera.zoom);
        drawY -= (drawH - map.data.tileheight * camera.zoom);
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
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w , pal.h ,
      drawX, drawY,
      drawW, drawH
    );

  }
  highlightTiles(e, force = true){
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

    /*if(this.prevTile && false){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
        return;
      }
      const pal = palette[layer.data[this.prevTile.id]];
      // this one clears selection
      if(pal && !this.prevTile.outOfBounds){
        this.drawTile(pal, this.prevTile, map.spacing, true);
      }
      else{
        // hmm.... why this is broken - and why this is required at all???
        this.highlightTile(this.prevTile);
      }
    }*/

    // clear all brefore drawing
    // TODO: clear only selected tiles?
    this.drawTiles();

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
    this.drawSelection();

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


      const pal = palette[sel.gid];
      if(pal){
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
    this.prevTile = null;
    this.map.tmpSelection.clear();
    if(this.isDirtySelection){
      this.map.selection.clear();
    }

    this.drawTiles();
  }
  /* end of events */

  render(){
    // TODO - probably we can leave only canvas element here
    return (<div
      ref="layer"
      className={this.isActive() ? "tilemap-layer" : "tilemap-layer no-events"}
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

/* !!! this - in this scope is instance of tilemap layer (above) */
const edit = {
  debug: function(e, mouseUp){
    const pos = this.getTilePosInfo(e);
    pos.gid = this.options.data[pos.id];
    //console.log("debug - "+this.map.options.mode+": ", pos);
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
edit[EditModes.stamp] = function(e, up){
  // nothing from tileset is selected
  const pos = this.getTilePosInfo(e);
  if(this.lastTilePos && this.lastTilePos.isEqual(pos) && !up){
    return;
  }
  this.lastTilePos = pos;
  //console.log(pos);
  if(!this.map.collection.length){
    return;
  }

  if(!this.mouseDown && !up) {
    this.highlightTiles(e);
    return;
  }
  if(e.type == "mousedown" && e.target == this.refs.canvas){
    this.map.saveForUndo();
  }


  if (this.map.options.randomMode) {
    let ts = this.map.collection.random();
    if (this.map.selection.length > 0) {
      if (this.map.selection.indexOfId(pos.id) > -1) {
        this.options.data[pos.id] = ts.gid;
      }
    }
    else {
      if ( !(pos.x < 0 || pos.x > this.options.width-1 || pos.y < 0 || pos.y > this.options.height-1) ) {
        this.options.data[pos.id] = ts.gid;
      }
    }
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
    if (tpos.x < 0 || tpos.x > this.options.width-1 || tpos.y < 0 || tpos.y > this.options.height-1) {
      //console.log("out of bounds!");

      //this.mouseDown = false;
      continue;
    }
    tpos.id = tpos.x + tpos.y * this.options.width;
    if (this.map.selection.length > 0) {
      if (this.map.selection.indexOfId(tpos.id) > -1) {
        this.options.data[tpos.id] = ts.gid;
      }
    }
    else {
      this.options.data[tpos.id] = ts.gid;
    }
  }
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
edit[EditModes.rectanlge] = function(e, mouseUp){
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
      //console.error("Something not right!!");
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
