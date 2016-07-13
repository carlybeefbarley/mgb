"use strict";
// This object imitates rectangle from shapes
// TODO: add multi object support - we could use this for selector
export default class MultiImitator{
  constructor(layer){
    // we need layer - as layer contains transformations
    this.layer = layer;
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;

    this.selection = [];
  }

  get x(){
    return this._x;
  }
  set x(v){

  }

  get y(){
    return this._y;
  }
  set y(v){
    this._y = v;
  }

  get width(){
    return this._width;
  }
  set width(v){
    console.log("set width:", v);


    this.update();
  }


  get height(){
    return this._height;
  }
  set height(v){
    console.log("set width:", h);

    this.update();
  }

  get length(){
    return this.selection.length;
  }

  forEach(cb){
    this.selection.forEach(cb);
  }
  add(o){
    if(this.selection.indexOf(o) == -1){
      this.selection.push(o);
    }
    this.update();
  }
  remove(o){
    const index = this.selection.indexOf(o);
    if(index > -1){
      this.selection.splice(index, 1);
    }
    this.update();
  }
  first(){
    if(this.selection.length){
      return this.selection[0];
    }
  }

  clear(){
    this.selection.length = 0;
    this.update();
  }

  update(){
    const obj = this.selection;
    if(!obj.length){
      this._x = this._y = this._width = this._height = 0;
      return;
    }
    let minx = Infinity,
      maxx = -Infinity,
      miny = Infinity,
      maxy = -Infinity;


    let o;

    for(let i=0; i<obj.length; i++){
      this.layer.updateHandles(obj[i]);
      o = this.layer.handles;

      if(o.x < minx){
        minx = o.x;
      }
      if(o.y < miny){
        miny = o.y;
      }
      if(o.x + o.width > maxx){
        maxx = o.x + o.width;
      }
      if(o.y + o.height > maxy){
        maxy = o.y + o.height;
      }
    }

    if(minx == Infinity){
      debugger;
    }
    this._x = minx;
    this._y = miny;
    this._width = maxx - minx;
    this._height = maxy - miny;
  }

  get rotation(){
    return 0;
  }
  set rotation(val){

  }

  empty(){
    return !this.selection.length;
  }
}
