"use strict";
import ObjectHelper from "../ObjectHelper.js";
/*
  we wil have 8 handles with 2 actions (resize / rotate)
  + 1 extra handle for a pivot point
 */
const PI2 = Math.PI*2;
const TO_DEGREES = (Math.PI / 180);
class Handle{
  constructor(x, y){
    this.radius = 3;
    this.update(x, y);
  }
  update(x, y){
    this.x = x; this.y = y;
  }
  // TODO: move hover x/y out from draw ?
  draw(ctx, active = false){
    ctx.beginPath();

    if(active){
      ctx.fillStyle = "rgba(255,0,0,1)";
      ctx.arc(this.x, this.y, this.radius*2, 0, PI2);
      ctx.fill();
    }
    else{
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.arc(this.x, this.y, this.radius, 0, PI2);
      ctx.stroke();

    }
  }
  rotate(angle, pivotX, pivotY){
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = ObjectHelper.rpx(sin, cos, this.x, this.y, pivotX, pivotY);
    const y = ObjectHelper.rpy(sin, cos, this.x, this.y, pivotX, pivotY);
    this.x = x;
    this.y = y;
  }
  vsPoint(x, y){
    return Math.abs(this.x - x) < this.radius && Math.abs(this.y - y) < this.radius;
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
    this.activeHandle = null;
    this.activeHandleType = -1;

    for(let i=0; i<9; i++){
      this.handles.push(new Handle(0, 0));
    }
    this.update(x, y, width, height);
  }

  update(x, y, width, height, angleDegrees){
    const angle = angleDegrees * TO_DEGREES;
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

    if(angle){
      const p = h[BOTTOM_LEFT];
      h[TOP].rotate(angle, p.x, p.y);
      h[TOP_LEFT].rotate(angle, p.x, p.y);
      h[TOP_RIGHT].rotate(angle, p.x, p.y);

      h[LEFT].rotate(angle, p.x, p.y);
      h[CENTER].rotate(angle, p.x, p.y);
      h[RIGHT].rotate(angle, p.x, p.y);

      h[BOTTOM_LEFT].rotate(angle, p.x, p.y);
      h[BOTTOM].rotate(angle, p.x, p.y);
      h[BOTTOM_RIGHT].rotate(angle, p.x, p.y);
    }

  }

  draw(ctx, x, y){
    for(let i=0; i<this.handles.length; i++){
      this.handles[i].draw(ctx, this.handles[i] == this.activeHandle);
    }
  }
  // idea behind this is to move points around and then figure what has changed
  moveActiveHandle(udx, udy, obj, type = this.activeHandleType){
    if(!udx && !udy){
      return;
    }
    let dx = udx;
    let dy = udy;
    //if(obj.rotation){
      const p = this.handles[BOTTOM_LEFT];
      const sin = Math.sin(-obj.rotation * TO_DEGREES);
      const cos = Math.cos(-obj.rotation * TO_DEGREES);
      dx = ObjectHelper.rpx(sin, cos, udx, udy, 0, 0);
      dy = ObjectHelper.rpy(sin, cos, udx, udy, 0, 0);
   // }

    console.log("move:",  udx + "=>"+dx, udy + "=>" +dy);

    switch (type) {
      case CENTER:
        this.activeHandle.x += dx;
        this.activeHandle.y += dy;
        break;

      case BOTTOM:
        obj.height += dy;
        obj.y += dy;
        break;
      case TOP:
        obj.height -= dy;
        //obj.y += dy;
        break;

      case LEFT:
        obj.x += dx;
        obj.width -= dx;
        break;
      case RIGHT:
        obj.width += dx;
        break;

      case TOP_LEFT:
        this.moveActiveHandle(dx, dy, obj, TOP);
        this.moveActiveHandle(dx, dy, obj, LEFT);
        break;
      case TOP_RIGHT:
        this.moveActiveHandle(dx, dy, obj, TOP);
        this.moveActiveHandle(dx, dy, obj, RIGHT);
        break;
      case BOTTOM_LEFT:
        this.moveActiveHandle(dx, dy, obj, BOTTOM);
        this.moveActiveHandle(dx, dy, obj, LEFT);
        break;
      case BOTTOM_RIGHT:
        this.moveActiveHandle(dx, dy, obj, BOTTOM);
        this.moveActiveHandle(dx, dy, obj, RIGHT);
        break;

    }

  }

  setActive(x, y){
    this.activeHandle = null;
    this.activeHandleType = -1;
    for(let i=0; i<this.handles.length; i++){
      if(this.handles[i].vsPoint(x, y)){
        this.activeHandleType = i;
        this.activeHandle = this.handles[i];
        return true;
      }
    }
    return false;
  }
}
