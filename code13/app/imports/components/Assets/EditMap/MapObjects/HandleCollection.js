"use strict";
import ObjectHelper from "../ObjectHelper.js";
/*
  we wil have 8 handles with 2 actions (resize / rotate)
  + 1 extra handle for a pivot point
 */
const PI2 = Math.PI*2;
const FROM_DEGREES = (Math.PI / 180);
const FROM_RADIANS = 1/FROM_DEGREES;
class Handle{
  constructor(x, y){
    this.radius = 3;
    this.update(x, y);
  }
  update(x, y){
    this.x = x; this.y = y;
  }
  // TODO: move hover x/y out from draw ?
  draw(ctx, camera, active = false){
    ctx.beginPath();

    if(active){
      ctx.fillStyle = "rgba(255,0,0,1)";
      ctx.arc((this.x + camera.x) * camera.zoom, (this.y + camera.y) * camera.zoom, this.radius*2, 0, PI2);
      ctx.fill();
    }
    else{
      ctx.fillStyle = "rgba(255,0,0,0.5)";
      ctx.arc((this.x + camera.x) * camera.zoom, (this.y + camera.y) * camera.zoom, this.radius, 0, PI2);
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
const ROTATE = 9;

// this will update for every object...
export default class HandleCollection {
  constructor(x, y, width, height){
    this.handles = [];
    this.action = "resize";
    this.activeHandle = null;
    this.activeHandleType = -1;

    for(let i=0; i<10; i++){
      this.handles.push(new Handle(0, 0));
    }
    this.update(x, y, width, height);
  }

  lock(){
    this.isLocked = true;
  }
  unlock(){
    this.isLocked = false;
  }
  update(x, y, width, height, angleDegrees){
    const angle = angleDegrees * FROM_DEGREES;
    const h = this.handles;

    h[TOP_LEFT].update(x, y);
    h[TOP].update(x + width * 0.5, y);
    h[TOP_RIGHT].update(x + width, y);

    h[LEFT].update(x, y + height * 0.5);
    h[CENTER].update(x + width * 0.5, y + height * 0.5);

    if(!this.isLocked){
      h[ROTATE].update(x + width * 0.5, y - height * 0.5);
    }

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

      if(!this.isLocked){
        h[ROTATE].rotate(angle, p.x, p.y);
      }

      h[RIGHT].rotate(angle, p.x, p.y);

      h[BOTTOM_LEFT].rotate(angle, p.x, p.y);
      h[BOTTOM].rotate(angle, p.x, p.y);
      h[BOTTOM_RIGHT].rotate(angle, p.x, p.y);
    }

  }

  draw(ctx, camera){
    for(let i=0; i<this.handles.length; i++){
      // skip center handle - as it don't have any functionality atm
      if(i == CENTER){
        continue;
      }
      this.handles[i].draw(ctx, camera, this.handles[i] == this.activeHandle);
    }
  }
  // idea behind this is to move points around and then figure what has changed
  moveActiveHandle(udx, udy, obj, type = this.activeHandleType){
    if(!udx && !udy){
      return;
    }
    // TODO: split this function?
    switch(type){
      case TOP_LEFT:
        this.moveActiveHandle(udx, udy, obj, TOP);
        this.moveActiveHandle(udx, udy, obj, LEFT);
        return;
      case TOP_RIGHT:
        this.moveActiveHandle(udx, udy, obj, TOP);
        this.moveActiveHandle(udx, udy, obj, RIGHT);
        return;
      case BOTTOM_LEFT:
        this.moveActiveHandle(udx, udy, obj, BOTTOM);
        this.moveActiveHandle(udx, udy, obj, LEFT);
        return;
      case BOTTOM_RIGHT:
        this.moveActiveHandle(udx, udy, obj, BOTTOM);
        this.moveActiveHandle(udx, udy, obj, RIGHT);
        return;
    }


    let dx = udx;
    let dy = udy;

    // if no rotation we can skip extra calculations
    if(obj.rotation){
      const sin = Math.sin(-obj.rotation * FROM_DEGREES);
      const cos = Math.cos(-obj.rotation * FROM_DEGREES);
      dx = ObjectHelper.rpx(sin, cos, udx, udy, 0, 0);
      dy = ObjectHelper.rpy(sin, cos, udx, udy, 0, 0);
    }


    // TODO: add pivot point e.g. 50% of left & right would do 50% smaller changes to left and 50% smaller changes to right
    switch (type) {
      case ROTATE:
        const h = this.handles[ROTATE];
        h.x += udx;
        h.y += udy;

        const base = this.handles[BOTTOM_LEFT];
        const center = this.handles[CENTER];
        const an = Math.atan2(h.y - center.y, h.x - center.x) + Math.PI * 0.5;

        // this will rotate around base point
        //obj.rotation = an * FROM_RADIANS;

        // this will rotate around middle
        this.rotateObject(obj, an);

        break;

      case BOTTOM:
        obj.x -= dy * Math.sin(obj.rotation * FROM_DEGREES);
        obj.y += dy * Math.cos(obj.rotation * FROM_DEGREES);
        obj.height += dy;
        break;

      case TOP:
        obj.height -= dy;
        break;

      case LEFT:
        obj.x += dx * Math.cos(obj.rotation * FROM_DEGREES);
        obj.y += dx * Math.sin(obj.rotation * FROM_DEGREES);
        obj.width -= dx;
        break;

      case RIGHT:
        obj.width += dx;
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

  rotateObject(o, angle){
    const oldAngle = o.rotation * Math.PI/180;

    const ccx = o.x + (o.width * 0.5);
    const ccy = o.y - (o.height * 0.5);

    const csin = Math.sin(oldAngle);
    const ccos = Math.cos(oldAngle);

    const centerx = ObjectHelper.rpx(csin, ccos, ccx, ccy, o.x, o.y);
    const centery = ObjectHelper.rpy(csin, ccos, ccx, ccy, o.x, o.y);


    const sin = Math.sin(angle - oldAngle);
    const cos = Math.cos(angle - oldAngle);
    const x = ObjectHelper.rpx(sin, cos, o.x, o.y, centerx, centery);
    const y = ObjectHelper.rpy(sin, cos, o.x, o.y, centerx, centery);

    o.x = x;
    o.y = y;
    o.rotation = angle * (180 / Math.PI);
  }

}
