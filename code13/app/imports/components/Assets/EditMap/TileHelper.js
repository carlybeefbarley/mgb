"use strict";
const TileHelper = {
  // TODO: take in to account margins and paddings
  getTilePos: (id, width, tilewidth, tileheight, ret = {x:0, y:0}) => {
    ret.x = (id % width) * tilewidth;
    ret.y = Math.floor(id / width) * tileheight;
    return ret;
  }

};
export default TileHelper;
