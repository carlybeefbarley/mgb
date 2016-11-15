'use strict'
import LayerTypes from '../Tools/LayerTypes.js'
import ObjectHelper from './ObjectHelper.js'

export const ROTATE = {
  '90': 0xA0,
  '180': 0xC0,
  '270': 0x60
}

const TileHelper = {
  FLIPPED_HORIZONTALLY_FLAG: 0x80000000,
  FLIPPED_VERTICALLY_FLAG: 0x40000000,
  FLIPPED_DIAGONALLY_FLAG: 0x20000000,

  // TODO: take in to account margins and paddings
  getTilePos: (id, widthInTiles, tilewidth, tileheight, ret = {x: 0, y: 0}) => {
    ret.x = (id % widthInTiles) * tilewidth
    ret.y = Math.floor(id / widthInTiles) * tileheight
    return ret
  },

  getTilePosRel: (id, widthInTiles, tilewidth, tileheight, ret = {x: 0, y: 0}) => {
    ret.x = (id % widthInTiles)
    ret.y = Math.floor(id / widthInTiles)
    return ret
  },

  getTilePosWithOffsets: (id, widthInTiles, tilewidth, tileheight, margin = 0 , spacing = 0 , ret = {x: 0, y: 0}) => {
    let tx = (id % widthInTiles)
    let ty = Math.floor(id / widthInTiles)

    ret.x = margin + tx * tilewidth + tx * spacing
    ret.y = margin + ty * tileheight + ty * spacing

    return ret
  },

  getTileCoordsRel: (x, y, tilewidth, tileheight, spacing = 0 , ret = {x: 0, y: 0}) => {
    ret.x = Math.floor(x / (tilewidth + spacing))
    ret.y = Math.floor(y / (tileheight + spacing))
    return ret
  },

  getTilesetWidth: (tileset, spacing = 1) => {
    tileset.tilewidth = tileset.tilewidth || 32
    tileset.tileheight = tileset.tileheight || 32
    tileset.columns = tileset.columns || tileset.imagewidth / tileset.tilewidth

    return tileset.columns * (tileset.tilewidth + spacing)
  },

  getTilesetHeight: (tileset, spacing = 1) => {
    tileset.tilewidth = tileset.tilewidth || 32
    tileset.tileheight = tileset.tileheight || 32
    tileset.columns = tileset.columns || tileset.imagewidth / tileset.tilewidth
    return (tileset.tilecount / tileset.columns) * (spacing + tileset.tileheight) - spacing
  },
  /* helpers */
  normalizePath: (raw) => {
    let val = raw
    if (raw.indexOf(location.origin) == 0) {
      val = val.substr(location.origin.length)
    }
    return val
  },
  extractName: (path) => {
    return path.substring(path.lastIndexOf('/') + 1)
  },

  rotateTile(gid, deg) {
    // remove all rotations
    let ngid = gid // & ((1 << 30) - 1)
    if (ROTATE[deg]) {
      // append new rotation
      ngid |= ROTATE[deg]
    }
    return ngid
  },
  flipTileX(gid) {
    return gid | TileHelper.FLIPPED_VERTICALLY_FLAG
  },
  flipTileY(gid) {
    return gid | TileHelper.FLIPPED_HORIZONTALLY_FLAG
  },

  /* generators */
  genNewMap: (widthInTiles = 2 , heightInTiles = 2 , tilewidth = 32 , tileheight = 32 , numlayers = 1) => {
    let layers = new Array(numlayers)

    for (let i = 0; i < numlayers; i++) {
      layers[i] = TileHelper.genLayer(widthInTiles, heightInTiles, 'Layer ' + (i + 1))
    }
    return {
      version: 1,
      nextobjectid: 1,
      width: widthInTiles,
      height: heightInTiles,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      tilesets: [],
      images: [],
      tileheight,
      tilewidth,
      meta: {
        options: {
          // empty maps aren't visible without grid
          showGrid: 1,
          camera: { _x: 0, _y: 0, _zoom: 1 },
          preview: false,
          mode: 'stamp',
          randomMode: false
        }
      },
      layers
    }
  },

  genLayer: (widthInTiles = 32 , heightInTiles = 32 , name = 'Layer') => {
    const mapSize = widthInTiles * heightInTiles

    const layer = {
      data: [],
      name: name,
      draworder: 'topdown',
      width: widthInTiles,
      height: heightInTiles,
      type: 'tilelayer',
      visible: true,
      x: 0,
      y: 0
    }
    for (let j = 0; j < mapSize; j++) {
      layer.data.push(0)
    }
    return layer
  },

  genImageLayer: (name) => {
    return {
      'image': '',
      'name': name,
      'opacity': 1,
      'type': 'imagelayer',
      'visible': true,
      'x': 0,
      'y': 0
    }
  },

  genObjectLayer: (name) => {
    return {
      'draworder': 'topdown',
      'name': name,
      'opacity': 1,
      'type': 'objectgroup',
      'visible': true,
      objects: [],
      'x': 0,
      'y': 0
    }
  },

  genTileset: (map, imagepath, imagewidth, imageheight, tilewidth = map.tilewidth , tileheight = map.tileheight , name = TileHelper.extractName(imagepath) , margin = -1 , spacing = -1) => {

    let path = TileHelper.normalizePath(imagepath)

    const extraPixels = imagewidth % tilewidth
    const columns = (imagewidth - extraPixels) / tilewidth
    let rows = (imageheight - (imageheight % tileheight)) / tileheight

    if (margin != -1) {
      if (spacing == -1) {
        spacing = 0
      }
    }

    const autoGuess = spacing == -1 || (tilewidth == imagewidth && imagewidth > map.tilewidth * 5)

    // guess spacing and margin - should give wow! effect to users :)
    if (autoGuess) {
      if (!extraPixels) {
        spacing = 0
        margin = 0
      }
      // assume that margin and spacing tends to be equal
      const spacingColumns = columns - 1
      // all goes to margin
      if (extraPixels < spacingColumns) {
        margin = extraPixels
        spacing = 0
      }
      // all goes to spacing
      else if (extraPixels % spacingColumns == 0) {
        spacing = extraPixels / spacingColumns
        margin = 0
      }
      // very common case when all sides of tile has equal white space
      else if (extraPixels % (columns + 1) == 0) {
        margin = extraPixels % (columns + 1)
        spacing = margin
      }else {
        margin = extraPixels % spacingColumns
        spacing = (extraPixels - extraPixels % spacingColumns) / spacingColumns
      }

      // adjust rows - as we have added margin and spacing
      while(margin + (tileheight + spacing) * rows - spacing > imageheight && rows){
        rows--
      }
    }

    if (margin == -1) {
      if ((imagewidth % tilewidth) % 2) {
        margin = (imagewidth % tilewidth) / 2
      }
    }

    const tilecount = columns * rows
    let firstgid = 101
    for (let i = 0; i < map.tilesets.length; i++) {
      const ts = map.tilesets[i]
      let nextgid = TileHelper.getNextGid(ts)
      //let nextgid = map.tilesets[i].firstgid + map.tilesets[i].tilecount
      if (nextgid > firstgid) {
        firstgid = nextgid
      }
    }

    return {
      columns,
      firstgid,
      image: path,
      imagewidth,
      imageheight,
      spacing,
      margin,
      name,
      tilecount,
      tileheight,
      tilewidth
    }
  },

  /* fixing something that is broken */
  zeroOutUnreachableTiles: (mapdata, gidCache) => {
    for(let i=0; i<mapdata.layers.length; i++){
      const layer = mapdata.layers[i]
      if(LayerTypes.isTilemapLayer(layer.type)){
        for(let j=0; j<layer.data.length; j++){
          const tile = layer.data[j] & 0xfffffff // last 28 bits (1 << 28) - 1
          if(tile && !gidCache[tile]){
            layer.data[j] = 0
          }
        }
      }
      else if(layer.type == LayerTypes.object){
        for(let j=0; j<layer.objects.length; j++){
          const tile = layer.objects[j];
          if(typeof(tile) !== "object"){
            layer.objects[j] = ObjectHelper.createEmptyTileObject();
          }
          const gid = tile.gid & 0xfffffff // last 28 bits (1 << 28) - 1
          if(gid && !gidCache[gid]){
            tile.gid = 0
          }
        }
      }
    }
    TileHelper.fixTilesetGids(mapdata)
  },

  fixTilesetGids: (mapdata) => {
    let nextGid = 1
    const changedTiles = {} // map with changed tiles

    for(let i=0; i<mapdata.tilesets.length; i++){

      const ts = mapdata.tilesets[i]
      if(ts.firstgid != nextGid){
        for(let j=0; j<ts.tilecount; j++){
          changedTiles[ts.firstgid + j] = nextGid + j
        }
        ts.firstgid = nextGid
      }

      nextGid = TileHelper.getNextGid(ts)
    }

    for(let i=0; i<mapdata.layers.length; i++){
      const layer = mapdata.layers[i]
      if(LayerTypes.isTilemapLayer(layer.type)){
        for(let j=0; j<layer.data.length; j++){
          const tile = layer.data[j]
          if(changedTiles[tile]){
            layer.data[j] = changedTiles[tile]
          }
        }
      }
      else if(layer.type == LayerTypes.object){
        for(let j=0; j<layer.objects.length; j++){
          const tile = layer.objects[j]
          if(tile.gid && changedTiles[tile.gid]){
            layer.objects[j].gid = changedTiles[tile.gid]
          }
        }
      }
    }
  },

  getNextGid: (ts) => {
    return ts.firstgid + (Math.floor(ts.tilecount/100) + 1) * 100
  },

  getOffsetX: (e) => {
    if(e.offsetX !== void(0)){
      return e.offsetX
    }
    const box = e.target.getBoundingClientRect()
    if(e.clientX !== void(0)){
      return e.clientX - box.left
    }
    if(e.touches){
      const t = e.touches[0]
      return t.clientX - box.left
    }
    return 0
  },
  getOffsetY: (e) => {
    if(e.offsetY !== void(0)){
      return e.offsetY
    }
    const box = e.target.getBoundingClientRect()
    if(e.clientY !== void(0)){
      return e.clientY - box.top
    }
    if(e.touches){
      const t = e.touches[0]
      return t.clientY - box.top
    }
    return 0
  }
}
export default TileHelper
