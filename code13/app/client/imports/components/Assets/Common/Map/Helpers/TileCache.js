// cache stores all loaded images and creates tile map for further reference
import TileHelper from './TileHelper'
import {observe} from "/client/imports/helpers/assetFetchers"


export default class TileCache {
  constructor(data, onReady){
    // store data for forced updates ( e.g. if external image has been changed)
    this.data = data
    this.images = {}
    this.tiles = {}
    this.observers = {}

    this.toLoad = 0;
    this.loaded = 0;

    this.update(data, onReady)
  }

  cleanUp() {
    for (let i in this.observers) {
      this.observers[i].subscription.stop()
    }
    this.observers = null
  }

  _onReady(){
    this.onReady && window.setTimeout(() => {this.onReady()}, 0)
  }

  // TODO(stauzs): implement lazy cache - return old cache and in background update to new version - when ready - callback
  update(data = this.data, onReady = null){
    this.data = data
    // always overwrite onReady with latest function - to avoid race conditions
    this.onReady = onReady

    this.updateLayers(data)
    this.updateImages(data)
    this.updateTilesets(data)

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
    if(!images){
      return
    }
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
      // try to fix image
      let src = ts.image
      if(!src.startsWith("./") && !src.startsWith("/")){
        const name = src.substr(0, src.lastIndexOf('.')) || src
        src = `/api/asset/png/${Meteor.user().username}/${name}`
      }

      ts.image = src
      this._loadImage(src)
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




    const id = src.split("/").pop()
    // already observing changes
    if(this.observers[src]){
      return
    }

    const loadImage = () => {
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
    }

    this.observers[src] = observe(id, (changes) => {
      loadImage()
    })
    loadImage()

    return
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
