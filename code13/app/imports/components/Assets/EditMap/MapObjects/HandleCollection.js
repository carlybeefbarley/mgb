"use strict";
/*
  we wil have 8 handles with 2 actions (resize / rotate)
  + 1 extra handle for a pivot point
 */
const PI2 = Math.PI*2;
class Handle{
  constructor(x, y){
    this.radius = 3;
    this.update(x, y);
  }
  update(x, y){
    this.x = x; this.y = y;
  }
  // TODO: move hover x/y out from draw ?
  draw(ctx, x, y){
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    if(this.vsPoint(x, y)){
      ctx.arc(this.x, this.y, this.radius+2, 0, PI2);
      ctx.fill();

    }
    else{
      ctx.arc(this.x, this.y, this.radius, 0, PI2);
      ctx.stroke();

    }
  }
  vsPoint(x, y){
    return Math.abs(this.x - x) < this.radius && Math.abs(this.y - y) < this.radius
  }
}
// maybe we need to expose these...
const TOP = 0;
const TOP_RIGHT = 1;
const RIGHT = 2;
const BOTTOM_RIGHT = 3;
const BOTTOM = 4;
const BOTTOM_LEFT = 5;
const LEFT = 6;
const TOP_LEFT = 7;
const CENTER = 8;

// this will update for every object...
export default class HandleCollection {
  constructor(x, y, width, height){
    this.handles = [];
    this.action = "resize";
    for(let i=0; i<9; i++){
      this.handles.push(new Handle(0, 0));
    }
    this.update(x, y, width, height);
  }

  update(x, y, width, height){
    const h = this.handles;
    h[TOP_LEFT].update(x, y);
    h[TOP].update(x + width * 0.5, y);
    h[TOP_RIGHT].update(x + width, y);

    h[LEFT].update(x, y + height * 0.5);
    h[CENTER].update(x + width * 0.5, y + height * 0.5);
    h[RIGHT].update(x + width, y + height * 0.5);

    h[BOTTOM_LEFT].update(x, y + height);
    h[BOTTOM].update(x + width * 0.5, y + height);
    h[BOTTOM_RIGHT].update(x + width, y + height);


  }

  draw(ctx, x, y){
    for(let i=0; i<this.handles.length; i++){
      this.handles[i].draw(ctx, x, y);
    }
  }

}
