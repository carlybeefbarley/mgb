"use strict";
import TileHelper from '../TileHelper.js';

export default class TileSelection {
  constructor(prevTileSelection){
    if(prevTileSelection){
      this.x = prevTileSelection.x;
      this.y = prevTileSelection.y;
      this.gid = prevTileSelection.gid;
    }
    else{
      this.x = 0;
      this.y = 0;
      this.gid = 0;
    }
  }
  getId(tileset, spacing = 1){
    this.gid = this.x + this.y * (spacing + Math.floor(tileset.imagewidth / (tileset.tilewidth + spacing))) + tileset.firstgid;
    return this.gid;
  }
  update(prevTileSelection){
    this.x = prevTileSelection.x;
    this.y = prevTileSelection.y;
    this.gid = prevTileSelection.gid;
  }
  updateFromMouse(e, ts, spacing = 1){
    this.updateFromPos(e.offsetX, e.offsetY, ts.tilewidth, ts.tileheight, spacing);
    this.gid = this.getId(ts);
  }
  updateFromPos(x, y, tilewidth, tileheight, spacing = 1){
    TileHelper.getTileCoordsRel(
      (x < 0 ? 0 : x),
      (y < 0 ? 0 : y),
      tilewidth, tileheight, spacing, this);
  }
  getMapId(map){
    return this.x + this.y * map.width;
  }
}
