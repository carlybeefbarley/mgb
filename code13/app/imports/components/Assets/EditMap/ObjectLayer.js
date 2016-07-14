"use strict";
import React from 'react';
import AbstractLayer from "./AbstractLayer.js";
import TileHelper from "./TileHelper.js";
import ObjectHelper from "./ObjectHelper.js";

import LayerTypes from "./Tools/LayerTypes.js";
import EditModes from "./Tools/EditModes.js";

import HandleCollection from "./MapObjects/HandleCollection.js";
import Imitator from "./MapObjects/Imitator.js";
import MultiImitator from "./MapObjects/MultiImitator.js";

// TODO move these to some good place.. probably mapArea???
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;
const TO_DEGREES = (Math.PI / 180);


export default class ObjectLayer extends AbstractLayer {
  constructor(...args){
    super(...args);
    this.kind = LayerTypes.object;
    this._raf = () => {
      this.drawMap();
      window.requestAnimationFrame(this._raf);
    };
    this._raf();
    this.drawDebug = false;
    this._pickedObject = -1;

    this.handles = new HandleCollection(0,0,0,0);

    // store calculated shapeBoxes here
    this.shapeBoxes = {};
    // array with elements to be copied / ctrl C/V
    this.copy = [];

    // reference to highlighted tile object
    this.highlightedObject = null;

    this.selectionBox = {
      x: 0, y: 0, width: 0, height: 1
    };

    this.selection = new MultiImitator(this);

    this.lineWidth = 3;

    this.isDirty = true;

    this.drawInterval = 10000;
    this.nextDraw = Date.now() + this.drawInterval;
  }

  //TODO: change this to abstract box.. and on change - change all elements inside this box
  get pickedObject(){
    if(this.shapeBoxes[this._pickedObject]){
      return this.shapeBoxes[this._pickedObject];
    }
    return this.data.objects[this._pickedObject];
  }

  // this gets called when layer is activated
  activate(){
    if(!this.activeMode) {
      this.map.setMode(EditModes.rectangle);
    }
    super.activate();
  }

  getMaxId(){
    let d;
    let maxId = 1;
    for(let i=0; i<this.data.objects.length; i++){
      d = this.data.objects[i];
      if(d.id > maxId){
        maxId = d.id + 1;
      }
      else{
        maxId++;
      }
    }
    return maxId;
  }
  pickObject(e){
    let obj;
    const x = e.offsetX / this.camera.zoom  - this.camera.x;
    const y = e.offsetY / this.camera.zoom - this.camera.y;

    let ret = -1;
    // reverse order last drawn - first pick
    for(let i=this.data.objects.length-1; i>-1; i--){
      obj = this.data.objects[i];
      if(obj.gid){
        if(ObjectHelper.PointvsTile(obj, x, y)){
          ret = i;
          break;
        }
      }
      else if(obj.polyline || obj.polygon){
        this.shapeBoxes[i] = new Imitator(obj);
        const imit = this.shapeBoxes[i];

        if(ObjectHelper.PointvsAABB(imit, x, y, false, imit.orig.x, imit.orig.y)){
          ret = i;
          break;
        }
      }
      else{
        if(ObjectHelper.PointvsAABB(obj, x, y)){
          ret = i;
          break;
        }
      }
    }
    this._pickedObject = ret;
    return ret;
  }
  selectObject(obj){
    this._pickedObject = this.data.objects.indexOf(obj);
  }
  selectObjects(box){
    let ret = 0;
    this.selection.clear();
    for(let i=0; i<this.data.objects.length; i++) {
      let o = this.data.objects[i];
      if (o.polygon || o.polyline) {
        if (!this.shapeBoxes[i]) {
          this.shapeBoxes[i] = new Imitator(o);
        }
        o = this.shapeBoxes[i];
      }
      this.updateHandles(o);
      if(!ObjectHelper.AABBvsAABB(box, this.handles)){
        continue;
      }
      this.selection.add(o);
      ret++;
    }
    //show single selected object - most use cases will be here
    if(this.selection.length == 1){
      // TODO: figure out a way to get rid of these checks
      // maybe use Imitator like object for all shapes?
      let f = this.selection.first();
      if(f instanceof Imitator){
        f = f.orig;
      }
      this._pickedObject = this.data.objects.indexOf(f);
      this.selection.clear();
    }
    return ret;
  }

  // TODO: clean up handle Event functions
  /* Events */
  handleMouseMove(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    super.handleMouseMove(e);

    this.isDirty = true;


    if(!this.mouseDown && e.target == this.refs.canvas){
      this.handles.setActive(
        (this.mouseX / this.camera.zoom - this.camera.x),
        (this.mouseY / this.camera.zoom - this.camera.y)
      );
    }

    if(edit[this.map.options.mode]){
      edit[this.map.options.mode].call(this, e);
    }
  }
  handleMouseDown(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    // TODO: fix - move camera and object at the same time

    super.handleMouseDown(e);
    const prevHandle = this.handles.activeHandle;
    this.handles.setActive(
      this.pointerPosX,
      this.pointerPosY
    );
    // is same handle?
    if(prevHandle && prevHandle == this.handles.activeHandle){
      this.handles.lock();
      // we need to store values somewhere instead of applying these directly
      // for align to grid etc features
      // this.objects[this._pickedObject] - as we don't need imitator itself here
      if(this.pickedObject instanceof Imitator){
        this.clonedObject = new Imitator(_.cloneDeep(this.pickedObject.orig));
      }
      else{
        this.clonedObject = Object.create(this.pickedObject || this.selection);
      }
      this.handleMouseMove(e);
      // we will move handle on next move
      return;
    }
    this.handles.unlock();


    if(edit[this.map.options.mode]){
      edit[this.map.options.mode].call(this, e);
      return;
    }

    if(e.button !== 0){
      this.mouseDown = false;
      return;
    }

    this.map.saveForUndo();
  }
  handleMouseUp(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    super.handleMouseUp(e);
    this.mouseDown = false;
    if(edit[this.map.options.mode]){
      edit[this.map.options.mode].call(this, e);
      return;
    }

    this.handles.unlock();
  }
  onMouseLeave(){
    this.isDirty = true;
    if(this.highlightedObject){
      this.deleteObject(this.highlightedObject);
      this.highlightedObject = null;
    }

  }
  onKeyUp(e){
    // todo Move functions to external file?
    const remove = () => {
      if(this.pickedObject){
        this.deleteObject(this.pickedObject.orig ? this.pickedObject.orig : this.pickedObject);
      }
      this.selection.forEach((o) => {
        let x = o;
        if(o instanceof Imitator){
          x = o.orig;
        }
        this.deleteObject(x);
      });

      this.clearSelection(true);
      this.isDirty = true;
    };
    const paste = () => {
      let minx = Infinity;
      let miny = Infinity;
      this.copy.forEach((data) => {
        minx = Math.min(data.x, minx);
        miny = Math.min(data.y, miny);
      });
      this.copy.forEach((data) => {
        // TODO: require lodash?
        const n = _.cloneDeep(data.obj);
        n.id = this.getMaxId();
        n.x = data.x + this.mouseInWorldX - minx;
        n.y = data.y + this.mouseInWorldY - miny;

        this.clearCache();
        this.data.objects.push(n);
        this.selectObject(n);

        this.clearCache();
        this.isDirty = true;
      });
    };
    const copy = () => {
      this.copy.length = 0;
      const saveCopy = (obj) => {
        const toSave = (obj.orig ? obj.orig : obj);
        this.copy.push({
          obj: toSave,
          x: toSave.x - this.mouseInWorldX,
          y: toSave.y - this.mouseInWorldY
        });
      };
      if(this.pickedObject) {
        saveCopy(this.pickedObject);
      }
      this.selection.forEach(saveCopy);
    };

    // delete key
    if(e.which == 46){
      remove();
    }

    // copy
    if(e.ctrlKey) {
      if (e.which == "V".charCodeAt(0)) {
        paste();
      }
      if (e.which == "C".charCodeAt(0)) {
        copy();
      }
      if(e.which == "X".charCodeAt(0)){
        copy();
        remove();
      }
    }

    if(e.which == "B".charCodeAt(0)){
      this.drawDebug = !this.drawDebug;
      this.draw();
    }
  }
  /* End of Events */

  updateHandles(obj){
    // tile
    if(obj.gid){
      this.handles.update(
        obj.x,
        obj.y - obj.height,
        obj.width,
        obj.height,
        obj.rotation,
        obj.x,
        obj.y
      );
    }
    else if(obj instanceof Imitator){
      this.handles.update(
        obj.x,
        obj.y,
        obj.width,
        obj.height,
        obj.rotation,
        obj.orig.x,
        obj.orig.y
      );
    }
    else if(true){
      this.handles.update(
        obj.x,
        obj.y,
        obj.width,
        obj.height,
        obj.rotation,
        obj.x,
        obj.y
      );
    }
  }
  clearSelection(alsoSelectedObjects = false){
    this.handles.clearActive();
    if(alsoSelectedObjects){
      this.selection.clear();
    }
    this._pickedObject = -1;
  }

  deleteObject(obj){
    const index = this.data.objects.indexOf(obj);
    if(index > -1) {
      delete this.shapeBoxes[index];
      this.data.objects.splice(index, 1);
      this.clearCache();
      this.isDirty = true;
    }
  }
  rotateObject(rotation, object = this.pickedObject){
    const angle = rotation * Math.PI/180;
    ObjectHelper.rotateObject(object, angle);
    this.draw();
  }
  toggleFill(){
    if(this.pickedObject && this.pickedObject.orig){
      if(this.pickedObject.orig.polyline){
        this.pickedObject.orig.polygon = this.pickedObject.orig.polyline;
        delete this.pickedObject.orig.polyline;
      }
      else if(this.pickedObject.orig.polygon){
        this.pickedObject.orig.polyline = this.pickedObject.orig.polygon;
        delete this.pickedObject.orig.polygon;
      }
    }
    this.draw();
  }
  setPickedObject(obj, index){
    this._pickedObject = index;
    // TODO: make this more automatic
    if(obj.polygon || obj.polyline) {
      if (this.shapeBoxes[index]) {
        this.shapeBoxes[index].update(obj)
      }
      else {
        this.shapeBoxes[index] = new Imitator(obj);
      }
    }
    this.highlightSelected();
  }
  clearCache(){
    Object.keys(this.shapeBoxes).forEach((k) => {
      delete this.shapeBoxes[k];
    });
  }

  /* DRAWING methods */
  queueDraw(timeout){
    if(this.nextDraw - Date.now() > timeout) {
      this.nextDraw = Date.now() + timeout;
    }
  }
  draw(){
    this.isDirty = true;
  }
  drawMap(){
    // TODO: draw check can be moved to the parent
    if( !( this.isDirty || this.nextDraw < Date.now() ) || !this.isVisible) {
      return;
    }

    this.isDirty = false;
    // force refresh after a while
    this.nextDraw = Date.now() + this.drawInterval;

    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height);
    // Don't loop through all objects.. use quadtree here some day
    // when we will support unlimited size streaming maps :D
    // TODO: clean up ifs
    for(let i=0; i<this.data.objects.length; i++){
      let o = this.data.objects[i];
      if(o.polygon || o.polyline){
        if(!this.shapeBoxes[i]){
          this.shapeBoxes[i] = new Imitator(o);
        }
        o = this.shapeBoxes[i];
      }
      // skip objects invisible to camera
      if(!ObjectHelper.CameravsAABB(this.camera, o)){
        continue;
      }
      // draw tile
      if(o.gid){
        this.drawTile(o);
      }
      else if(o.orig){
        if(o.orig.polyline){
          this.drawPolyline(o.orig);
        }
        else{
          this.drawPolyline(o.orig, true);
        }
      }
      // TODO: is there convenient way to separate rectangles and shapes??
      else if(o.ellipse){
        this.drawEllipse(o);
      }
      else if(true){
        this.drawRectangle(o);
      }
    }

    this.highlightSelected();

  }
  drawTile(obj){
    const gid = obj.gid &  ( ~( FLIPPED_HORIZONTALLY_FLAG |
      FLIPPED_VERTICALLY_FLAG |
      FLIPPED_DIAGONALLY_FLAG) );

    const flipX = (obj.gid & FLIPPED_HORIZONTALLY_FLAG ? -1 : 1);
    const flipY = (obj.gid & FLIPPED_VERTICALLY_FLAG ? -1 : 1);
    let pal = this.map.palette[gid];
    // images might be not loaded
    if(!pal){
      return;
    }


    let tileId = pal.gid - (pal.ts.firstgid);
    const tileInfo = pal.ts.tiles[tileId];
    // TODO: this repeats from TileMapLayer - clean up and create separate function get_GID or similar
    if(tileInfo){
      if(tileInfo.animation){
        const delta = Date.now() - this.map.startTime;
        let tot = 0;
        let anim;
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
              let ngid = anim.tileid + pal.ts.firstgid;
              this.queueDraw(anim.duration - (tot - relDelta));
              pal = this.map.palette[ngid];
            }
            break;
          }
        }
        this.queueDraw(anim.duration - (tot - relDelta));
      }
    }

    const cam = this.camera;
    let x = (cam.x + obj.x) * cam.zoom;
    let y = (cam.y + obj.y) * cam.zoom;
    let w = obj.width * cam.zoom;
    let h = obj.height * cam.zoom;

    if(this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== "rightup"){
      if(this.options.mgb_tiledrawdirection == "leftdown") {
        x -= w;
      }
      else if(this.options.mgb_tiledrawdirection == "leftup"){
        x -= w;
        y -= h;
      }
    }
    else{
      y -= h;
    }

    // TODO: create custom transformation functions
    // transform only once - and cache transformation
    this.ctx.save();

    this.ctx.translate(x, y + h);
    if(obj.rotation){
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES);
    }

    // translate to canvas drawing pos
    this.ctx.translate(0, -h);
    if(this.drawDebug && obj.name){
      this.ctx.fillText(obj.name + "("+obj.x.toFixed(2)+","+obj.y.toFixed(2)+")", 0, 0);
    }

    if(flipX < 0 || flipY < 0){
      // translate to middle point of drawing
      this.ctx.translate(w*0.5, h*0.5);
      //flip
      this.ctx.scale(flipX, flipY);
      // translate back
      this.ctx.translate(-w*0.5, -h*0.5);
    }
    this.ctx.drawImage(pal.image, pal.x, pal.y, pal.w, pal.h, 0, 0, w, h);
    if(obj == this.highlightedObject){
      this.ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
      this.ctx.fillRect( 0, 0, w, h);
    }
    this.ctx.restore();
  }
  drawRectangle(obj){
    const cam = this.camera;
    let x = (cam.x + obj.x) * cam.zoom;
    let y = (cam.y + obj.y) * cam.zoom;
    let w = obj.width * cam.zoom;
    let h = obj.height * cam.zoom;

    this.ctx.save();

    // translate to TILED drawing pos
    this.ctx.translate(x, y);
    if(obj.rotation){
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES);
    }
    if(this.drawDebug && obj.name){
      this.ctx.fillText(obj.name, 0, 0);
    }
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeRect(0.5, 0.5, w, h);
    this.ctx.restore();
  }
  drawEllipse(obj){
    const cam = this.camera;
    let x = (cam.x + obj.x) * cam.zoom;
    let y = (cam.y + obj.y) * cam.zoom;
    let w = obj.width * cam.zoom;
    let h = obj.height * cam.zoom;

    this.ctx.save();

    // translate to TILED drawing pos
    this.ctx.translate(x, y);
    if(obj.rotation){
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES);
    }
    if(this.drawDebug && obj.name){
      this.ctx.fillText(obj.name, 0, 0);
    }
    this.ctx.lineWidth = this.lineWidth;
    ObjectHelper.drawEllipse(this.ctx, 0.5, 0.5, w, h);
    //this.ctx.strokeRect(0.5, 0.5, w, h);
    this.ctx.restore();
  }
  drawPolyline(o){
    const cam = this.camera;
    let x = (cam.x + o.x) * cam.zoom;
    let y = (cam.y + o.y) * cam.zoom;

    this.ctx.save();
    // translate to TILED drawing pos
    this.ctx.translate(x, y);
    if(o.rotation){
      // rotate
      this.ctx.rotate(o.rotation * TO_DEGREES);
    }
    if(this.drawDebug && o.name){
      this.ctx.fillText(o.name, 0, 0);
    }

    const lines = o.polyline ? o.polyline : o.polygon;

    this.ctx.beginPath();
    this.ctx.moveTo(lines[0].x, lines[0].y);
    for(let i=1; i<lines.length; i++){
      this.ctx.lineTo(lines[i].x * this.camera.zoom, lines[i].y * this.camera.zoom);
    }

    if(o.polygon){
      this.ctx.lineTo(lines[0].x * this.camera.zoom, lines[0].y * this.camera.zoom);
      this.ctx.fillStyle="rgba(70, 70, 70, 1)";
      this.ctx.fill();
    }

    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke();
    this.ctx.restore();
  }
  // this one is drawing on the grid layer - as overlay
  highlightSelected(){
    // TODO: don't hide grid's layer ( never ever ) - rename to overlay???
    this.map.refs.grid.draw();
    let obj = this.pickedObject;

    const cam = this.camera;
    const ctx = this.map.refs.grid.ctx;
    if(this.selectionBox.width > 0 && this.selectionBox.height > 0) {
      ctx.strokeRect(
        (this.selectionBox.x + cam.x) * cam.zoom,
        (this.selectionBox.y + cam.y) * cam.zoom,
        this.selectionBox.width * cam.zoom,
        this.selectionBox.height * cam.zoom
      );
    }
    //this.selectionBox

    if(!this.selection.empty()){
      obj = this.selection;
    }

    if(obj){
      this.updateHandles(obj);
      // draw on grid which is always on the top

      this.handles.draw(ctx, cam);
    }
  }
  /* END of DRAWING methods */
}

// TODO: move these to separate file
let obj, endPoint, pointCache = {x: 0, y: 0};
const edit = {};
edit[EditModes.drawRectangle] = function(e){
  if(e.type == "mousedown"){
    if((e.buttons & 0x2) == 0x2){
      return;
    }
    obj = ObjectHelper.createRectangle(this.getMaxId(), this.pointerPosX, this.pointerPosY);
    this.map.saveForUndo();

    this.clearCache();
    this.data.objects.push(obj);
    this.draw();
    return;
  }
  if(!obj){
    return;
  }
  if(e.type == "mouseup"){
    this.setPickedObject(obj, this.data.objects.length - 1);
    obj = null;
    return;
  }

  const x1 = this.pointerPosX;
  const x2 = this.pointerPosX + this.movementX;
  const y1 = this.pointerPosY;
  const y2 = this.pointerPosY + this.movementY;

  obj.x = Math.min(x1, x2);
  obj.width = Math.abs(this.movementX);

  obj.y = Math.min(y1, y2);
  obj.height = Math.abs(this.movementY);

  const tw = this.map.data.tilewidth;
  const th = this.map.data.tileheight;

  if(e.ctrlKey){
    obj.x = Math.round(obj.x / tw) * tw;
    obj.y = Math.round(obj.y / th) * th;
    obj.width = Math.round(obj.width / tw) * tw;
    obj.height = Math.round(obj.height / th) * th;
  }
};
edit[EditModes.drawEllipse] = function(e){
  if(e.type == "mousedown"){
    if((e.buttons & 0x2) == 0x2){
      return;
    }
    obj = ObjectHelper.createEllipse(this.getMaxId(), this.pointerPosX, this.pointerPosY);
    this.map.saveForUndo();
    this.clearCache();
    this.data.objects.push(obj);
    this.draw();
    return;
  }
  if(!obj){
    return;
  }
  if(e.type == "mouseup"){
    this.setPickedObject(obj, this.data.objects.length - 1);
    obj = null;
    return;
  }

  const x1 = this.pointerPosX;
  const x2 = this.pointerPosX + this.movementX;
  const y1 = this.pointerPosY;
  const y2 = this.pointerPosY + this.movementY;

  obj.x = Math.min(x1, x2);
  obj.width = Math.abs(this.movementX);

  obj.y = Math.min(y1, y2);
  obj.height = Math.abs(this.movementY);

  const tw = this.map.data.tilewidth;
  const th = this.map.data.tileheight;

  if(e.ctrlKey){
    obj.x = Math.round(obj.x / tw) * tw;
    obj.y = Math.round(obj.y / th) * th;
    obj.width = Math.round(obj.width / tw) * tw;
    obj.height = Math.round(obj.height / th) * th;
  }
};
edit[EditModes.drawShape] = function(e){
  console.log("draw shape!!!");
  if(e.type == "mousedown"){
    if(!obj){
      if((e.buttons & 0x2) == 0x2){
        return;
      }
      obj = ObjectHelper.createPolyline(this.getMaxId(), this.pointerPosX, this.pointerPosY);
      if(e.ctrlKey) {
        const tw = this.map.data.tilewidth;
        const th = this.map.data.tileheight;
        obj.x = Math.round(obj.x / tw) * tw;
        obj.y = Math.round(obj.y / th) * th;
      }
      this.clearCache();
      this.data.objects.push(obj);
      // first point is always at 0,0
      endPoint = {x:0, y:0};
      pointCache.x = 0;
      pointCache.y = 0;
      this.map.saveForUndo();
      obj.polyline.push(endPoint);
      this.draw();
      return;
    }
    else{
      // are buttons FLAGS?
      if((e.buttons & 0x2) == 0x2){
        obj.polyline.pop();

        // TODO: this is ugly - move to function??
        this.setPickedObject(obj, this.data.objects.length - 1);

        obj = null;
        endPoint = null;
        this.draw();
        return;
      }
      else{
        endPoint = {x:endPoint.x, y:endPoint.y};
        obj.polyline.push(endPoint);
      }
    }
    return;
  }

  if(!obj){
    return;
  }
  const tw = this.map.data.tilewidth;
  const th = this.map.data.tileheight;

  endPoint.x += e.movementX * this.camera.zoom;
  endPoint.y += e.movementY * this.camera.zoom;
  pointCache.x += e.movementX * this.camera.zoom;
  pointCache.y += e.movementY * this.camera.zoom;

  if(e.ctrlKey){
    endPoint.x = Math.round(pointCache.x / tw) * tw;
    endPoint.y = Math.round(pointCache.y / th) * th;
  }
};
edit[EditModes.stamp] = function(e){
  if(!this.map.collection.length || e.target != this.refs.canvas){
    return;
  }
  const tile = this.map.collection[0];
  const pal = this.map.palette[tile.gid];
  const tw = this.map.data.tilewidth;
  const th = this.map.data.tileheight;
  const cam = this.camera;
  let x = e.offsetX / cam.zoom - cam.x;
  let y = (e.offsetY + pal.h ) * cam.zoom - cam.y;

  if(!e.ctrlKey){
    x = Math.floor(x / tw) * tw;
    y = Math.floor(y / th) * th;
  }

  if(!this.highlightedObject){
    this.highlightedObject = ObjectHelper.createTileObject(
      pal, this.getMaxId(),
      x, y
    );
    this.clearCache();
    this.data.objects.push(this.highlightedObject);
  }

  if(e.type == "mouseup"){
    this.highlightedObject = null;
    return;
  }

  this.highlightedObject.x = x;
  this.highlightedObject.y = y;
};

// TODO: rework this and clean up
let phase = 0; // 0 - selecting; 1 - moving;
edit[EditModes.rectangle] = function(e){
  if((e.buttons & 0x2) == 0x2){
    return;
  }

  let dx = (e.movementX / this.camera.zoom);
  let dy = (e.movementY / this.camera.zoom);

  const nx = this.startPosX + this.movementX;
  const ny = this.startPosY + this.movementY;

  if(this.mouseDown && phase == 1){

    if(this.handles.activeHandle){
      this.handles.moveActiveHandle(dx, dy, this.clonedObject);
      // TODO: create some sort of replicator object who can convert global changes to local e.g. basic rectangle to shape
      let selected  = this.pickedObject ? this.pickedObject : this.selection;
      if(e.ctrlKey){
        if(this.handles.activeHandleType != 9){
          selected.x = Math.round(this.clonedObject.x / this.map.data.tilewidth) * this.map.data.tilewidth;
          selected.y = Math.round(this.clonedObject.y / this.map.data.tileheight) * this.map.data.tileheight;

          selected.width = Math.round(this.clonedObject.width / this.map.data.tilewidth) * this.map.data.tilewidth;
          selected.height = Math.round(this.clonedObject.height / this.map.data.tileheight) * this.map.data.tileheight;
        }
        else{
          // TODO: move to config rotation step?
          const newRotation = Math.round(this.clonedObject.rotation / 15) * 15;
          this.rotateObject(newRotation, selected);
        }
      }
      else{
        selected.x = this.clonedObject.x;
        selected.y = this.clonedObject.y;
        selected.width = this.clonedObject.width;
        selected.height = this.clonedObject.height;
        selected.rotation = this.clonedObject.rotation;
      }
      return;
    }
  }

  if(e.type == "mousedown"){
    this.isDirty = true;
    this.mouseDown = true;
    this.map.saveForUndo();
    if(this.pickObject(e) > -1) {
      this.startPosX = this.pickedObject.x;
      this.startPosY = this.pickedObject.y;
      phase = 1;
      return;
    }

    phase = 0;
    this.selection.clear();
    obj = this.selectionBox;
    obj.x = this.pointerPosX;
    obj.y = this.pointerPosY;
    return;
  }

  if(this.mouseDown && phase == 1) {
    if (this.pickedObject) {

      this.pickedObject.x = nx;
      this.pickedObject.y = ny;

      if (e.ctrlKey) {
        const tw = this.map.data.tilewidth;
        const th = this.map.data.tileheight;
        dx = this.pickedObject.orig ? this.pickedObject.minx % tw : 0;
        dy = this.pickedObject.orig ? this.pickedObject.miny % th : 0;

        this.pickedObject.x = Math.round(this.pickedObject.x / tw) * tw + dx;
        this.pickedObject.y = Math.round(this.pickedObject.y / th) * th + dy;
      }
      return;
    }

    if(this.selection.length > 1){

    }

  }


  if(!obj){
    return;
  }

  let selCount = 0;
  if(e.type == "mouseup"){
    selCount = this.selectObjects(obj);

    if(selCount > 0){
      phase = 1;
    }
    else{
      phase = 0;
    }

    if(selCount == 1 && this.pickedObject){
      this.startPosX = this.pickedObject.x;
      this.startPosY = this.pickedObject.y;
    }
    else{
      this.clearSelection();
    }
    // invalidate
    this.selectionBox.width = 0;
    this.selectionBox.height = 0;
    this.startPosX = 0;
    this.startPosY = 0;


    obj = null;

    this.draw();
    return;
  }

  const x1 = this.pointerPosX;
  const x2 = this.pointerPosX + this.movementX;
  const y1 = this.pointerPosY;
  const y2 = this.pointerPosY + this.movementY;

  obj.x = Math.min(x1, x2);
  obj.width = Math.abs(this.movementX);
  obj.y = Math.min(y1, y2);
  obj.height = Math.abs(this.movementY);

  selCount = this.selectObjects(obj);
  if(selCount == 1 && this.pickedObject){
    this.startPosX = this.pickedObject.x;
    this.startPosY = this.pickedObject.y;
  }
  if(selCount == 0){
    this.clearSelection();
  }

};
