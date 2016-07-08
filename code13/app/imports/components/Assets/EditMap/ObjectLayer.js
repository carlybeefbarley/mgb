"use strict";
import React from 'react';
import AbstractLayer from "./AbstractLayer.js";
import TileHelper from "./TileHelper.js";
import ObjectHelper from "./ObjectHelper.js";

import LayerTypes from "./Tools/LayerTypes.js";
import EditModes from "./Tools/EditModes.js";

import HandleCollection from "./MapObjects/HandleCollection.js";
import Imitator from "./MapObjects/Imitator.js";

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
    this.selRect = {
      x: 0, y: 0, width: 0, height: 0
    };
    this.drawDebug = false;
    this._pickedObject = null;
    // as noun :)
    this.handles = new HandleCollection(0,0,0,0);

    // store calculated shapeBoxes here
    this.shapeBoxes = {};
  }

  //TODO: change this to abstract box.. and on change - change all elements inside this box
  get pickedObject(){
    if(this.shapeBoxes[this._pickedObject]){
      return this.shapeBoxes[this._pickedObject];
    }
    return this.data.objects[this._pickedObject];
  }

  activate(){
    if(!this.activeMode) {
      this.map.setMode(EditModes.rectanlge);
    }
    super.activate();
  }

  getMaxId(){
    let d;
    let maxId = 0;
    for(let i=0; i<this.data.objects.length; i++){
      d = this.data.objects[i];
      if(d.id > maxId){
        maxId = d.id + 1;
      }
    }
    return maxId;
  }

  pickObject(e){
    let obj;
    const x = e.offsetX / this.camera.zoom  - this.camera.x;
    const y = e.offsetY / this.camera.zoom - this.camera.y;

    // reverse order last drawn - first pick
    for(let i=this.data.objects.length-1; i>-1; i--){
      obj = this.data.objects[i];
      if(obj.gid){
        if(ObjectHelper.PointvsTile(obj, x, y)){
          console.log("picked tile:", obj);
          return i;
        }
      }
      else if(obj.polyline || obj.polygon){
        this.shapeBoxes[i] = new Imitator(obj);
        const imit = this.shapeBoxes[i];

        if(ObjectHelper.PointvsAABB(imit, x, y, false, imit.orig.x, imit.orig.y)){
          console.log("picked:", imit);
          return i;
        }
      }
      else{
        if(ObjectHelper.PointvsAABB(obj, x, y)){
          console.log("picked:", obj);
          return i;
        }
      }
    }
    return null;
  }

  handleMouseMove(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;

    this.mouseY = e.offsetY;//;/ - this.camera. / this.map.camera.zoom;
    this.mouseX = e.offsetX;// / this.map.camera.zoom;

    this.isDirty = true;

    if(!this.mouseDown){
      this.handles.setActive(
        (this.mouseX / this.camera.zoom - this.camera.x),
        (this.mouseY / this.camera.zoom - this.camera.y)
      );
      return;
    }


    const dx = (e.movementX / this.camera.zoom);
    const dy = (e.movementY / this.camera.zoom);
    // TODO: movement X/Y - is not supported by all browsers!
    this.movementX += dx;
    this.movementY += dy;

    const nx = this.startPosX + this.movementX;
    const ny = this.startPosY + this.movementY;

    if(this.handles.activeHandle){
      this.handles.moveActiveHandle(dx, dy, this.clonedObject);
      // TODO: create some sort of replicator object who can convert global changes to local e.g. basic rectangle to shape
      let selected  = this.pickedObject;
      if(e.ctrlKey){
        if(this.handles.activeHandleType != 9){
          if(selected.orig && selected.orig == this.clonedObject.orig){
            debugger;
          }
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
    // else move object

    // todo
    if(this.pickedObject){

      const tw = this.map.data.tilewidth;
      const th = this.map.data.tileheight;

      this.pickedObject.x = nx; // + this.camera.movementX;
      this.pickedObject.y = ny; //(e.movementY / this.camera.zoom);// + this.camera.movementY;

      if(e.ctrlKey){
        let dx = this.pickedObject.orig ? this.pickedObject.minx % tw : 0;
        let dy = this.pickedObject.orig ? this.pickedObject.miny % th : 0;

        this.pickedObject.x = Math.round(this.pickedObject.x / tw) * tw + dx;
        this.pickedObject.y = Math.round(this.pickedObject.y / th) * th + dy;
      }
    }

  }

  handleMouseDown(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    if(e.button !== 0){
      this.mouseDown = false;
      return;
    }
    super.handleMouseDown(e);

    // these seems too hackish (ugly).. find better place for this.. ? custom event handler ? or at least put these in the abstract layer (super)?
    this.movementX = 0;
    this.movementY = 0;
    this.startPosX= 0;
    this.startPosY = 0;
    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;

    const prevHandle = this.handles.activeHandle;
    this.handles.setActive(
      (this.mouseX / this.camera.zoom - this.camera.x),
      (this.mouseY / this.camera.zoom - this.camera.y)
    );
    // is same handle?
    if(prevHandle && prevHandle == this.handles.activeHandle){
      this.handles.lock();
      // we need to store values somewhere instead of applying these directly
      // for align to grid etc features
      // this.objects[this._pickedObject] - as we don't need imitator itself here
      if(this.pickedObject instanceof Imitator){
        this.clonedObject = new Imitator(_.cloneDeep(this.pickedObject.orig));
        if(this.clonedObject.orig == this.pickedObject.orig){
          debugger;
        }

      }
      else{
        this.clonedObject = Object.assign({}, this.pickedObject);
      }
      this.handleMouseMove(e);
      // we will move handle on next move
      return;
    }

    this.map.saveForUndo();


    if(this.map.options.mode == EditModes.rectanlge){
      this._pickedObject = this.pickObject(e);
      if(this.pickedObject) {
        this.startPosX = this.pickedObject.x;
        this.startPosY = this.pickedObject.y;
      }
      this.isDirty = true;
    }
  }

  handleMouseUp(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    super.handleMouseUp(e);

    if(e.target != this.refs.canvas || e.button !== 0){
      return;
    }
    this.mouseDown = false;
    this.handles.unlock();


    // this puts new tile Object on the map
    if(this.map.collection.length && this.map.options.mode == EditModes.stamp){
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

      const tileObject = ObjectHelper.createTileObject(
        pal, this.getMaxId(),
        x, y
      );

      this.map.saveForUndo();
      this.data.objects.push(tileObject);
      this.isDirty = true;
    }
  }

  onMouseLeave(){
    this.isDirty = true;
  }

  onKeyUp(e){
    if(e.which == 46 && this.pickedObject){
      this.deleteObject(this.pickedObject);
      this._pickedObject = null;
    }

    if(e.which == "B".charCodeAt(0)){
      this.drawDebug = !this.drawDebug;
      this.draw();
    }
  }

  deleteObject(obj){
    this.data.objects.splice(this.data.objects.indexOf(obj), 1);
    this.isDirty = true;
  }

  draw(){
    this.isDirty = true;
  }
  drawMap(){
    if(!this.isDirty){
      return;
    }
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
      else if(true){
        this.drawRectangle(o);
      }
    }

    this.highlightSelected();
    this.isDirty = false;
  }

  rotateObject(rotation, object = this.pickedObject){
    const angle = rotation * Math.PI/180;
    ObjectHelper.rotateObject(object, angle);
    this.draw();
  }

  highlightSelected(){
    // TODO: don't hide grid's layer ( never ever ) - rename to overlay???
    this.map.refs.grid.draw();
    if(this.pickedObject){
      // tile
      if(this.pickedObject.gid){

        this.handles.update(
          (this.pickedObject.x),
          (this.pickedObject.y - this.pickedObject.height),
          this.pickedObject.width,
          this.pickedObject.height,
          this.pickedObject.rotation,
          this.pickedObject.x,
          this.pickedObject.y
        );
      }
      else if(this.pickedObject instanceof Imitator){
        this.handles.update(
          this.pickedObject.x,
          this.pickedObject.y,
          this.pickedObject.width,
          this.pickedObject.height,
          this.pickedObject.rotation,
          this.pickedObject.orig.x,
          this.pickedObject.orig.y
        );
      }
      else if(true){
        this.handles.update(
          this.pickedObject.x,
          this.pickedObject.y,
          this.pickedObject.width,
          this.pickedObject.height,
          this.pickedObject.rotation,
          this.pickedObject.x,
          this.pickedObject.y
        );
      }
      // draw on grid which is always on the top


      this.handles.draw(this.map.refs.grid.ctx, this.camera);
    }
  }

  drawTile(obj){
    const gid = obj.gid &  ( ~( FLIPPED_HORIZONTALLY_FLAG |
      FLIPPED_VERTICALLY_FLAG |
      FLIPPED_DIAGONALLY_FLAG) );

    const flipX = (obj.gid & FLIPPED_HORIZONTALLY_FLAG ? -1 : 1);
    const flipY = (obj.gid & FLIPPED_VERTICALLY_FLAG ? -1 : 1);
    const pal = this.map.palette[gid];
    // images might be not loaded
    if(!pal){
      return;
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

    this.ctx.translate(x, y);

    if(this.drawDebug) {
      //picking debug
      this.ctx.strokeRect(0.5, 0.5, obj.width, obj.height);
    }

    this.ctx.translate(0, h);
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

    if(obj == this.pickedObject){
      this.ctx.fillStyle="rgba(255,0,0,0.3)";
      this.ctx.fillRect(0, 0, w, h);
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

    this.ctx.strokeRect(0.5, 0.5, w, h);
    if(obj == this.pickedObject){
      this.ctx.fillStyle="rgba(255,0,0,0.3)";
      this.ctx.fillRect(0.5, 0.5, w, h);
    }

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
    this.ctx.lineTo(lines[0].x * this.camera.zoom, lines[0].y * this.camera.zoom);

    this.ctx.stroke();
    if(o.polygon){
      this.ctx.fillStyle="rgba(70, 70, 70, 1)";
      this.ctx.fill();
    }
    this.ctx.restore();
  }
}
