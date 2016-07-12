"use strict";
// This object imitates rectangle from shapes
// TODO: add multi object support - we could use this for selector
export default class MultiImitator{
  constructor(obj){
    this._x = 0;
    this._y = 0;
    this._width = 0;
    this._height = 0;

    this.selection = [];
    if(obj){
      this.update(obj);
    }
  }

  get x(){
    return this._x;
  }
  set x(v){
    this._x = v;
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
    this.update();
  }


  get height(){
    return this._height;
  }
  set height(v){
    this.update();
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
    const f = obj[0];
    let minx = f.x,
      maxx = f.x + f.width,
      miny = f.y,
      maxy = f.y + f.width;

    for(let i=0; i<obj.length; i++){
      if(obj[i].x < minx){
        minx = obj[i].x;
      }
      if(obj[i].y < miny){
        miny = obj[i].y;
      }
      if(obj[i].x + obj[i].width > maxx){
        maxx = obj[i].x + obj[i].width;
      }
      if(obj[i].y + obj[i].height > maxy){
        maxy = obj[i].y + obj[i].height;
      }
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
    this.rotation = val;
  }

  empty(){
    return !this.selection.length;
  }
}
