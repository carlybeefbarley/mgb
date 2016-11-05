// cache stores all loaded images and creates tile map for further reference
import TileHelper from './TileHelper'

export default class TileCache {
  constructor(data, onReady){
    // store data for forced updates ( e.g. if external image has been changed)
    this.data = data
    this.images = {}
    this.tiles = {}

    this.toLoad = 0;
    this.loaded = 0;

    this.update(data, onReady)
  }

  _onReady(){
    console.log("onReady")
    // remove from stack.. simulate async call - just in case we don't anything to load
    this.onReady && this.onReady() /*window.setTimeout(() => {

    }, 0)*/
  }
  // TODO(stauzs): implement lazy cache - return old cache and in background update to new version - when ready - callback
  update(data = this.data, onReady = null){
    this.data = data
    this.updateLayers(data)
    this.updateImages(data)
    this.updateTilesets(data)
    this.onReady = onReady

    // this should trigger only if there is no loading images or all images come from cache
    if(this.toLoad == this.loaded){
      this._onReady()
    }
  }

  // check for images appended directly on layer
  // TODO(stauzs): check also for tiles - TMX allows to append image to tile directly
  updateLayers(data){
    const layers = data.layers;
    for(let i=0; i<layers.length; i++){
      if(layers[i].image){
        this._loadImage(layers[i].image)
      }
    }
  }

  updateImages(data){
    const images = data.images;
    for(let i=0; i<images.length; i++){
      this._loadImage(images[i])
    }
  }

  updateTilesets(data){
    const tss = data.tilesets
    const pos = {x: 0, y: 0}
    const self = this
    this.tiles = {}
    for(let i=0; i<tss.length; i++){
      const ts = tss[i]
      this._loadImage(ts.image)
      for (let j = 0; j < ts.tilecount; j++) {
        TileHelper.getTilePosWithOffsets(j, Math.floor((ts.imagewidth + ts.spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, ts.margin, ts.spacing, pos)
        const gid = ts.firstgid + j

        const tileInfo = {
          gid,
          // fix reference to image and size
          get image (){
            return self.images[ts.image]
          },
          w: ts.tilewidth,
          h: ts.tileheight,
          x: pos.x,
          y: pos.y,
          ts: ts
        }

        this.tiles[gid] = tileInfo
      }
    }
  }

  _loadImage(src, force = false){
    // image is loading or loaded
    if(!force && this.images[src] !== void(0)){
      return
    }
    const img = new Image()
    this.images[src] = img
    this.toLoad++
    img.onload = () => {
      this.loaded++
      if(this.toLoad == this.loaded){
        this._onReady()
      }
    }
    img.onerror = () => {
      img.onload()
      delete this.images[src]
      // TODO(stauzs): push errors - or load nice fallback image
    }
    img.src = src
    /*
    useful for debug
    img.style.zIndex = 99999
    img.style.position = "relative"
    document.body.appendChild(img)
    */
  }
}
