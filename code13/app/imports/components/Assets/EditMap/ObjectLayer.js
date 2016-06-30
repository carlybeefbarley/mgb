"use strict";
import React from 'react';
import AbstractLayer from "./AbstractLayer.js";
import TileHelper from "./TileHelper.js";
import ObjectHelper from "./ObjectHelper.js";

import LayerTypes from "./Tools/LayerTypes.js";
import EditModes from "./Tools/EditModes.js";

// TODO move these to some good place.. probably mapArea???
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG   = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG   = 0x20000000;

export default class ObjectLayer extends AbstractLayer {
  constructor(...args){
    super(...args);
    this.kind = LayerTypes.object;
    console.log("Object initialised!");
    this._raf = () => {
      this.drawMap();
      window.requestAnimationFrame(this._raf);
    };
    this._raf();
    this.selRect = {
      x: 0, y: 0, width: 0, height: 0
    };

    this.pickedObject = null;
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
    console.log("picking", x, y);
    for(let i=0; i<this.data.objects.length; i++){
      obj = this.data.objects[i];
      if(ObjectHelper.PointvsAABB(obj, x, y)){
        console.log("picked:", obj);
        return obj;
      }
    }
    return null;
  }

  handleMouseMove(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;

    //console.log("mouse:", e.offsetX, e.offsetY);
    //console.log("zoom:", this.camera.zoom);

    if(!this.mouseDown){
      return;
    }


    // TODO: movement X/Y - is not supported by all browsers!
    if(this.pickedObject){
      this.pickedObject.x += e.movementX * this.camera.zoom;
      this.pickedObject.y += e.movementY * this.camera.zoom;
    }

    this.isDirty = true;
  }
  handleMouseDown(ep){
    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    super.handleMouseDown(e);

    if(e.button !== 0){
      return;
    }
    if(this.map.options.mode == EditModes.rectanlge){
      this.pickedObject = this.pickObject(e);
      this.isDirty = true;
    }
  }
  handleMouseUp(ep){

    const e = ep.nativeEvent ? ep.nativeEvent : ep;
    super.handleMouseUp(e);

    if(e.target != this.refs.canvas || e.button !== 0){
      return;
    }

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

      console.log("Added new object:", tileObject);

      this.data.objects.push(tileObject);
      this.isDirty = true;
    }
  }
  onMouseLeave(){
    this.isDirty = true;
    console.log("Mouse leave!");
  }
  onKeyUp(e){
    console.log("Key UP", e.which);
    if(e.which == 46 && this.pickedObject){
      this.deleteObject(this.pickedObject);
      this.pickedObject = null;
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
    for(let i=0; i<this.data.objects.length; i++){
      let o = this.data.objects[i];

      // skip objects invisible to camera
      if(!ObjectHelper.CameravsAABB(this.camera, o)){
        continue;
      }
      // draw tile
      if(o.gid){
        this.drawTile(o);
      }
      // TODO: is there convenient way to separate rectangles and shapes??
      else if(true){
        this.drawRectangle(o);
      }
    }
    this.isDirty = false;
  }

  drawTile(tileObject){
    const gid = tileObject.gid &  ( ~( FLIPPED_HORIZONTALLY_FLAG |
      FLIPPED_VERTICALLY_FLAG |
      FLIPPED_DIAGONALLY_FLAG) );

    const flipX = (tileObject.gid & FLIPPED_HORIZONTALLY_FLAG ? -1 : 1);
    const flipY = (tileObject.gid & FLIPPED_VERTICALLY_FLAG ? -1 : 1);
    const pal = this.map.palette[gid];
    // images might be not loaded
    if(!pal){
      return;
    }

    const cam = this.camera;
    let x = (cam.x + tileObject.x) * cam.zoom;
    let y = (cam.y + tileObject.y) * cam.zoom;
    let w = tileObject.width * cam.zoom;
    let h = tileObject.width * cam.zoom;

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

    const tx = x;
    const ty = y + h;
    // translate to TILED drawing pos
    this.ctx.translate(tx, ty);

    if(tileObject.rotation){
      // rotate
      this.ctx.rotate(tileObject.rotation * (Math.PI / 180));
    }

    // translate to canvas drawing pos
    this.ctx.translate(0, -h);
    if(tileObject.name){
      this.ctx.fillText(tileObject.name, 0, 0);
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

    if(tileObject == this.pickedObject){
      this.ctx.fillStyle="rgba(255,0,0,0.3)";
      this.ctx.fillRect(0, 0, w, h);
    }

    this.ctx.restore();
  }


  drawRectangle(obj){
    const cam = this.camera;
    let x = (cam.x + obj.x) * cam.zoom;
    let y = (cam.y + obj.y) * cam.zoom; // tiled stores coordinates bottom / up
    let w = obj.width * cam.zoom;
    let h = obj.height * cam.zoom;

    this.ctx.save();

    const tx = x;
    const ty = y;

    // translate to TILED drawing pos
    this.ctx.translate(tx, ty);
    if(obj.rotation){
      // rotate
      this.ctx.rotate(obj.rotation * (Math.PI / 180));
    }
    if(obj.name){
      this.ctx.fillText(obj.name, 0, 0);
    }

    this.ctx.strokeRect(0, 0, w, h);
    if(obj == this.pickedObject){
      this.ctx.fillStyle="rgba(255,0,0,0.3)";
      this.ctx.fillRect(0, 0, w, h);
    }

    this.ctx.restore();
  }
}
