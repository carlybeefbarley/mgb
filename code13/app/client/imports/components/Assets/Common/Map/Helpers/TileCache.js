// cache stores all loaded images and creates tile map for further reference
import TileHelper from './TileHelper'
import { observeAsset, makeCDNLink } from '/client/imports/helpers/assetFetchers'
import { AssetKindEnum } from '/imports/schemas/assets'

export default class TileCache {
  constructor(data, onReady) {
    // store data for forced updates ( e.g. if external image has been changed)
    this.data = data
    this.images = {}
    this.tiles = {}
    this.observers = {}

    this.errors = []

    this.toLoad = 0
    this.loaded = 0

    this.updateStack = []

    this.update(data, onReady)
  }

  getErrors() {
    // TODO: make user friendly error message.. probably not here but on higher level..
    return this.errors
  }

  cleanUp() {
    for (let i in this.observers) {
      this.observers[i].subscription.stop()
    }
    this.observers = null
    this.updateStack = []
  }

  _onReady() {
    window.setTimeout(() => {
      this.onReady && this.onReady()
      this.inProgress = false
      this._doNextUpdate()
    }, 0)
  }

  update(data, onReady) {
    this.updateStack.push([data, onReady])
    this._doNextUpdate()
  }
  _doNextUpdate() {
    if (!this.inProgress && this.updateStack.length) this._update.apply(this, this.updateStack.shift())
  }
  // TODO(stauzs): implement lazy cache - return old cache and in background update to new version - when ready - callback
  _update(data = this.data, onReady = null) {
    this.inProgress = true
    this.data = data
    // always overwrite onReady with latest function - to avoid race conditions
    this.onReady = onReady

    this.updateLayers(data)
    this.updateImages(data)
    this.updateTilesets(data)

    // this should trigger only if there is no loading images or all images come from cache
    if (this.toLoad === this.loaded) {
      this._onReady()
    }
  }

  // check for images appended directly on layer
  // TODO(stauzs): check also for tiles - TMX allows to append image to tile directly
  updateLayers(data) {
    const layers = data.layers
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].image) {
        this._loadImage(layers[i].image)
      }
    }
  }

  updateImages(data) {
    const images = data.images
    if (!images) {
      return
    }
    for (let i in images) {
      this._loadImage(images[i])
    }
  }

  updateTilesets(data) {
    const tss = data.tilesets
    const pos = { x: 0, y: 0 }
    const self = this
    this.tiles = {}
    for (let i = 0; i < tss.length; i++) {
      const ts = tss[i]

      this._loadImage(ts.image)
      for (let j = 0; j < ts.tilecount; j++) {
        TileHelper.getTilePosWithOffsets(
          j,
          Math.floor((ts.imagewidth + ts.spacing) / ts.tilewidth),
          ts.tilewidth,
          ts.tileheight,
          ts.margin,
          ts.spacing,
          pos,
        )
        const gid = ts.firstgid + j

        const tileInfo = {
          gid,
          // fix reference to image and size
          get image() {
            return self.images[ts.image]
          },
          w: ts.tilewidth,
          h: ts.tileheight,
          x: pos.x,
          y: pos.y,
          ts,
        }

        this.tiles[gid] = tileInfo
      }
    }
  }

  _loadImage(src, force = false) {
    const id = src.split('/').pop()
    // already observing changes
    if (this.observers[src]) {
      return
    }

    const loadImage = preventCache => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      this.toLoad++
      img.onload = () => {
        this.loaded++
        this.images[src] = img
        if (this.toLoad == this.loaded) {
          this._onReady()
        }
      }
      img.onerror = () => {
        // try to fix image
        if (!src.startsWith('./') && !src.startsWith('/')) {
          const name = src.substr(0, src.lastIndexOf('.')) || src
          src = `/api/asset/png/${Meteor.user().username}/${name}`
          img.onerror = () => {
            delete this.images[src]
            this.errors.push(src)
            img.src = makeCDNLink('/images/error.png')
          }
          img.src = makeCDNLink(`/api/asset/png/${Meteor.user().username}/${name}`)
        } else {
          // load missing image
          this.errors.push(src)
          img.src = makeCDNLink('/images/error.png')
        }

        // TODO(stauzs): push errors - or load nice fallback image
      }
      img.src = src + (preventCache ? '?' + preventCache : '')
    }

    let toObserve = id
    if (src.startsWith('/api/asset/png/')) {
      const fpart = src.split('/')
      // user / name
      if (fpart.length == 6) {
        toObserve = {
          name: fpart.pop(),
          dn_ownerName: fpart.pop(),
          isDeleted: false,
          kind: AssetKindEnum.graphic,
        }
      }
    }

    this.observers[src] = observeAsset(toObserve, null, (id, changes) => {
      // prevent cache - as browser will ignore etag in this case
      loadImage(changes.updatedAt.getTime())
    })
    loadImage(Date.now())

    // // image is loading or loaded
    // if (!force && this.images[src] !== void 0) {
    //   return
    // }
    // const img = new Image()
    // this.images[src] = img
    // this.toLoad++
    // img.onload = () => {
    //   this.loaded++
    //   if (this.toLoad == this.loaded) {
    //     this._onReady()
    //   }
    // }
    // img.onerror = () => {
    //   img.onload()
    //   delete this.images[src]
    //   // TODO(stauzs): push errors - or load nice fallback image
    // }
    // img.src = src
    // /*
    // useful for debug
    // img.style.zIndex = 99999
    // img.style.position = "relative"
    // document.body.appendChild(img)
    // */
  }
}
