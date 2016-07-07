"use strict";
const TO_DEGREES = (Math.PI / 180);

// collection with useful functions
const ObjectHelper = window.ObjectHelper = {
  // aabb may be any object who contains: {x, y, width, height}
  AABBvsAABB: (box1, box2) => {
    return  !(
      box1.x + box1.width < box2.x ||
      box1.y + box1.height < box2.y ||
      box1.x > box2.x + box2.width ||
      box1.y > box2.y + box2.height);
  },

  // camera has inverse x/y
  CameravsAABB: (cam, box) => {
    return  !(
      // add extra space to all box sides as pos to camera is related from drawing position
      // and also rotation point in tiled is left / bottom corner
      -cam.x + cam.dwidth < box.x - box.width ||
      -cam.y + cam.dheight < box.y - box.height ||
      -cam.x > box.x + box.width * 2 ||
      -cam.y > box.y + box.height * 2);
  },
  PointvsAABB: (box, x, y) => {
    return !(box.x > x || box.y > y || box.x + box.width  < x || box.y + box.height < y);
  },

  PointvsTile: (box, x, y) => {
    if(box.rotation){
      // rotate one point to opposite direction instead of 4 box points
      const angle = -box.rotation * TO_DEGREES;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const nx = ObjectHelper.rpx(sin, cos, x, y, box.x, box.y);
      const ny = ObjectHelper.rpy(sin, cos, x, y, box.x, box.y);

      // transform coords to match bottom / up drawing
      return ObjectHelper.PointvsAABB(box, nx, ny + box.height);
    }
    // transform coords to match bottom / up drawing
    return ObjectHelper.PointvsAABB(box, x, y + box.height);
  },
  // rotate per x
  rpx: (sin, cos, x, y, cx, cy) => {
    return (x - cx)*cos - (y - cy)*sin + cx;
  },
  rpy: (sin, cos, x, y, cx, cy) => {
    return (y - cy)*cos + (x - cx)*sin + cy;
  },

  rotateObject: (o, angle) => {
    const oldAngle = o.rotation * Math.PI/180;

    const ccx = o.x + (o.width * 0.5);
    let ccy;
    // tile objects are upside down
    if(o.gid){
      ccy = o.y - (o.height * 0.5);
    }
    else{
      ccy = o.y + (o.height * 0.5);
    }

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
  },

  createTileObject: (pal, id, x, y) => {
    return {
      "gid": pal.gid,
      "height": pal.h,
      "id": id,
      "name": "(unnamed)",
      "rotation":0,
      "type": "",
      "visible": true,
      "width":pal.w,
      x, y
    }
  }
};

export default ObjectHelper;
