"use strict";

const Camera = function(map){
  this.map = map;
  // backwards compatibility with older maps.. should be safe to remove in the future
  if(!map.options.camera){
    map.options.camera = {x: 0, y: 0, zoom: 1};
  }
  if( !map.options.camera.zoom || isNaN(map.options.camera.zoom) ){
    map.options.camera.zoom = 1;
  }
  this._x = map.options.camera.x;
  this._y = map.options.camera.y;
  this._zoom = map.options.camera.zoom;
  this._lastx = 0;
  this._lasty = 0;
};

Camera.prototype = {
  set x(val){
    this.map.options.camera.x = val;
    this._lastx = this._x;
    this._x = val;
  },
  get x(){return this._x},
  set y(val){
    this.map.options.camera.y = val;
    this._lasty = this._y;
    this._y = val;
  },
  get movementX(){
    const ret = this._lastx - this._x;
    // this._lastx = this._x;
    return ret;
  },
  get movementY(){
    const ret = this._lasty - this._y;
    //this._lasty = this._y;
    return ret;
  },
  get width(){
    return this.map.refs.mapElement.offsetWidth;
  },
  get height(){
    return this.map.refs.mapElement.offsetHeight;
  },
  get dwidth(){
    return this.map.refs.mapElement.offsetWidth / this.zoom;
  },
  get dheight(){
    return this.map.refs.mapElement.offsetHeight / this.zoom;
  },
  get y(){return this._y},
  set zoom(val){
    this.map.options.camera.zoom = val;
    this._zoom = val;
  },
  get zoom(){return this._zoom},

  reset(){

    this.x = 0;
    this.y = 0;
    this.zoom = 1;

    this.map.redraw();
  }
};

export default Camera;
