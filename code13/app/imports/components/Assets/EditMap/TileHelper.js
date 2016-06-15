"use strict";
const TileHelper = {
  // TODO: take in to account margins and paddings
  getTilePos: (id, widthInTiles, tilewidth, tileheight, ret = {x:0, y:0}) => {
    ret.x = (id % widthInTiles) * tilewidth;
    ret.y = Math.floor(id / widthInTiles) * tileheight;
    return ret;
  },

  getTilePosRel: (id, widthInTiles, tilewidth, tileheight, ret = {x:0, y:0}) => {
    ret.x = (id % widthInTiles);
    ret.y = Math.floor(id / widthInTiles);
    return ret;
  },

  getTilePosWithOffsets: (id, widthInTiles, tilewidth, tileheight, margin = 0, spacing = 0, ret = {x:0, y:0}) => {
    let tx = (id % widthInTiles);
    let ty = Math.floor(id / widthInTiles);

    ret.x = margin + tx * tilewidth + tx*spacing;
    ret.y = margin + ty * tileheight + ty*spacing;

    return ret;
  },

  getTileCoordsRel: (x, y, tilewidth, tileheight, spacing = 0, ret = {x: 0, y: 0} ) => {
    ret.x = Math.floor(x / (tilewidth + spacing));
    ret.y = Math.floor(y / (tileheight + spacing) );
    return ret;
  },

  getTilesetWidth: (tileset, spacing = 1) => {
    return tileset.columns * (tileset.tilewidth + spacing);
  },

  getTilesetHeight: (tileset, spacing = 1) => {
    return (tileset.tilecount / tileset.columns) * (spacing + tileset.tileheight);
  },

  genNewMap: (widthInTiles = 20, heightInTiles = 20, tilewidth = 32, tileheight = 32, numlayers = 1) => {
    let layers = new Array(numlayers);

    for(let i=0; i<numlayers; i++){
      layers[i] = TileHelper.genLayer(widthInTiles, heightInTiles, "Layer "+(i+1));
    }
    return {
      version:      1,
      nextobjectid: 1,
      width:        widthInTiles,
      height:       heightInTiles,
      orientation:  "orthogonal",
      renderorder:  "right-down",
      tilesets:     [],
      tileheight,
      tilewidth,
      layers
    };
  },

  genLayer: (widthInTiles = 32, heightInTiles = 32, name = "Layer") => {
    const mapSize = widthInTiles * heightInTiles;

    const layer = {
      data: [],
      name: name,
      draworder: "topdown",
      width: widthInTiles,
      height: heightInTiles,
      type: "tilelayer",
      visible: true,
      x: 0,
      y: 0
    };
    for(let j=0; j<mapSize; j++){
      layer.data.push(0);
    }
    return layer;
  },

  normalizePath: (raw) => {
    let val = raw;
    if (raw.indexOf(location.origin) == 0) {
      val = val.substr(location.origin.length);
    }
    return val;
  },
  extractName: (path) => {
    return path.substring(path.lastIndexOf("/") + 1);
  },

  genTileset: (map, imagepath, imagewidth, imageheight,
               tilewidth = map.tilewidth, tileheight = map.tileheight, name = TileHelper.extractName(imagepath), margin = -1, spacing = -1) => {

    let path = TileHelper.normalizePath(imagepath);

    const extraPixels = imagewidth % tilewidth;
    const columns = (imagewidth - extraPixels) / tilewidth;
    let rows = (imageheight - (imageheight % tileheight)) / tileheight;

    if(margin != -1){
      if(spacing == -1){
        spacing = 0;
      }
    }

    // guess spacing and margin - should give wow! effect to users :)
    if(spacing == -1){
      if(!extraPixels){
        spacing = 0;
        margin = 0;
      }
      // assume that margin and spacing tends to be equal
      const spacingColumns = columns - 1;
      // all goes to margin
      if(extraPixels < spacingColumns){
        // TODO: divide margin with 2?
        margin = extraPixels;
        spacing = 0;
      }
      // all goes to spacing
      else if(extraPixels % spacingColumns == 0){
        // TODO: divide margin with 2?
        spacing = extraPixels / spacingColumns;
        margin = 0;
      }
      // very common case when all sides of tile has equal white space
      else if(extraPixels % (columns + 1) == 0){
        margin = extraPixels % (columns + 1);
        spacing = margin;
      }
      else{
        // TODO: divide margin with 2?
        margin = extraPixels % spacingColumns;
        spacing = (extraPixels - extraPixels % spacingColumns) / spacingColumns;
      }

      // adjust rows - as we have added margin and spacing
      while(margin + (tileheight + spacing) * rows - spacing > imageheight && rows){
        rows--;
      }
    }

    if (margin == -1) {
      if ((imagewidth % tilewidth) % 2) {
        margin = (imagewidth % tilewidth) / 2;
      }
    }

    const tilecount = columns * rows;
    let firstgid = 1;
    for(let i=0; i<map.tilesets.length; i++){
      let nextgid = map.tilesets[i].firstgid + map.tilesets[i].tilecount;
      if( nextgid > firstgid){
        firstgid = nextgid;
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
  }

};
export default TileHelper;
