"use strict";
const TO_RADIANS = (Math.PI / 180);
const TO_DEGREES = 1/TO_RADIANS;
// collection with useful functions
const ObjectHelper = {
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
  PointvsAABB: (box, x, y, skipRotation, px = box.x, py = box.y) => {
    let nx = x;
    let ny = y;
    if(box.rotation && !skipRotation){
      // rotate one point to opposite direction instead of 4 box points
      const angle = -box.rotation * TO_RADIANS;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      nx = ObjectHelper.rpx(sin, cos, x, y, px, py);
      ny = ObjectHelper.rpy(sin, cos, x, y, px, py);
    }

    return !(box.x > nx || box.y > ny || box.x + box.width < nx || box.y + box.height < ny);
  },

  PointvsTile: (box, x, y) => {
    if(box.rotation){
      // rotate one point to opposite direction instead of 4 box points
      const angle = -box.rotation * TO_RADIANS;
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);
      const nx = ObjectHelper.rpx(sin, cos, x, y, box.x, box.y);
      const ny = ObjectHelper.rpy(sin, cos, x, y, box.x, box.y);

      // transform coords to match bottom / up drawing
      return ObjectHelper.PointvsAABB(box, nx, ny + box.height, true);
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
    if(o.orig){
      return ObjectHelper.rotateShape(o, angle);
    }
    const oldAngle = o.rotation * Math.PI/180;

    // ccx / ccy - is same as pivot point
    const ccx = o.x + (o.width * 0.5);
    let ccy;
    // tile objects are upside down
    if(o.gid){
      ccy = o.y - (o.height * 0.5);
    }
    else{
      ccy = o.y + (o.height * 0.5);
    }

    let centerx = ccx;
    let centery = ccy;
    if(oldAngle) {
      const csin = Math.sin(oldAngle);
      const ccos = Math.cos(oldAngle);
      centerx = ObjectHelper.rpx(csin, ccos, ccx, ccy, o.x, o.y);
      centery = ObjectHelper.rpy(csin, ccos, ccx, ccy, o.x, o.y);
    }

    const sin = Math.sin(angle - oldAngle);
    const cos = Math.cos(angle - oldAngle);
    const x = ObjectHelper.rpx(sin, cos, o.x, o.y, centerx, centery);
    const y = ObjectHelper.rpy(sin, cos, o.x, o.y, centerx, centery);

    o.x = x;
    o.y = y;
    o.rotation = angle * TO_DEGREES;
  },

  rotateShape: (o, angle) => {
    const oldAngle = o.rotation * Math.PI/180;

    // ccx / ccy - is same as pivot point
    const ccx = o.x + (o.width * 0.5);
    const ccy = o.y + (o.height * 0.5);

    let centerx = ccx;
    let centery = ccy;
    if(oldAngle) {
      const csin = Math.sin(oldAngle);
      const ccos = Math.cos(oldAngle);
      centerx = ObjectHelper.rpx(csin, ccos, ccx, ccy, o.orig.x, o.orig.y);
      centery = ObjectHelper.rpy(csin, ccos, ccx, ccy, o.orig.x, o.orig.y);
    }

    const sin = Math.sin(angle - oldAngle);
    const cos = Math.cos(angle - oldAngle);
    const x = ObjectHelper.rpx(sin, cos, o.orig.x, o.orig.y, centerx, centery);
    const y = ObjectHelper.rpy(sin, cos, o.orig.x, o.orig.y, centerx, centery);

    o.orig.x = x;
    o.orig.y = y;
    o.rotation = angle * TO_DEGREES;
    o.update();
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
  },

  createRectangle: (id, x, y, width = 1, height = 1, name = "(unnamed rectangle #"+id+")") => {
    return {
      height,
      id,
      name,
      width, x, y,

      "rotation":0,
      "type":"",
      "visible":true
    };
  },
  createEllipse:  (id, x, y, width = 1, height = 1, name = "(unnamed elipse #"+id+")") => {
    const ellipse = ObjectHelper.createRectangle(id, x, y, width, height, name);
    ellipse.ellipse = true;
    return ellipse;
  },
  createPolyline: (id, x, y, width = 1, height = 1, name = "(unnamed shape #"+id+")") => {
    return {
      height,
      id,
      name,
      width, x, y,

      polyline: [{
        "x": 0,
        "y": 0
      }],
      "rotation": 0,
      "type": "",
      "visible": true,
    };
  },
  drawEllipse:  (ctx, x, y, w, h) => {
    var kappa = 0.5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    ctx.closePath();
    ctx.stroke();
  }
};

export default ObjectHelper;
