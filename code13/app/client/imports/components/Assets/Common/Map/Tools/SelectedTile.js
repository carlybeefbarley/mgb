import TileHelper from '../Helpers/TileHelper.js'

// Represents one selected tile
export default class SelectedTile {
  constructor(prevSelectedTile) {
    if (prevSelectedTile) {
      this.update(prevSelectedTile)
    } else {
      this.x = 0
      this.y = 0
      this.id = 0
      this.gid = 0
    }
  }
  getRawId(width) {
    this.id = this.x + this.y * width
    return this.id
  }
  updateFromId(id, width) {
    this.id = id
    this.x = id % width
    this.y = (id - this.x) / width
  }
  getGid(tileset) {
    this.id = Math.floor(this.x + this.y * tileset.columns)
    this.gid = Math.floor(this.id + tileset.firstgid)
    return this.gid
  }
  getGidFromLayer(layer) {
    this.gid = layer.data[this.getRawId(layer.width)]
    return this.gid
  }
  update(prevTileSelection) {
    this.x = prevTileSelection.x
    this.y = prevTileSelection.y
    this.id = prevTileSelection.id
    this.gid = prevTileSelection.gid
  }
  updateFromMouse(e, ts, spacing = 1) {
    this.updateFromPos(
      TileHelper.getOffsetX(e),
      TileHelper.getOffsetY(e),
      ts.tilewidth,
      ts.tileheight,
      spacing,
    )
    this.gid = this.getGid(ts)
  }
  updateFromPos(x, y, tilewidth, tileheight, spacing = 1) {
    TileHelper.getTileCoordsRel(x, y, tilewidth, tileheight, spacing, this)
  }
  isEqual(another) {
    return another && this.x == another.x && this.y == another.y && this.id == another.id
  }
}
