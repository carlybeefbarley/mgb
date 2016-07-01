"use strict";
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
