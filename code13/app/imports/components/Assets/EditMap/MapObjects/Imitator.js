"use strict";
// This object imitates rectangle from shapes
// TODO: add multi object support - we could use this for selector
export default class Imitator{
  constructor(obj){
    this.update(obj);
  }

  get x(){
    return this.orig.x + this.minx;
  }
  set x(v){
    this.orig.x = v - this.minx;
  }

  get y(){
    return this.orig.y + this.miny;
  }
  set y(v){
    this.orig.y = v - this.miny;
  }

  get width(){
    return this.maxx - this.minx;
  }
  set width(v){
    const prop = v / this.width;
    for(let i=0; i<this.lines.length; i++){
      const l = this.lines[i];
      const x = l.x - this.minx;
      l.x = x * prop + this.minx;
    }
    this.update();
  }


  get height(){
    return this.maxy - this.miny;
  }
  set height(v){
    const prop = v / this.height;
    for(let i=0; i<this.lines.length; i++){
      const l = this.lines[i];
      const y = l.y - this.miny;
      l.y = y * prop + this.miny;
    }
    this.update();
  }

  update(obj = this.orig){
    const lines = obj.polyline || obj.polygon;

    let minx = lines[0].x, maxx = lines[0].x,
      miny = lines[0].y, maxy = lines[0].y;

    for(let j=0; j<lines.length; j++){
      minx = Math.min(lines[j].x, minx);
      miny = Math.min(lines[j].y, miny);
      maxx = Math.max(lines[j].x, maxx);
      maxy = Math.max(lines[j].y, maxy);
    }

    this.minx = minx;
    this.miny = miny;
    this.maxx = maxx;
    this.maxy = maxy;
    this.lines = lines;

    this.orig = obj;
  }

  get rotation(){
    return this.orig.rotation;
  }
  set rotation(val){
    this.orig.rotation = val;
  }

}
