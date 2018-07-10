import _ from 'lodash'
import TileHelper from '../Helpers/TileHelper.js'
import EditModes from '../Tools/EditModes.js'

const TilesetProps = {
  // tileset -> map proxy - don't need to change state
  clearActiveSelection() {
    this.refs.map.clearActiveSelection()
  },
  selectTile(tile) {
    this.refs.map.collection.pushOrRemove(tile)
    // it's annoying to pick stamp tool after picking tile
    if ([EditModes.stamp, EditModes.fill].indexOf(this.options.mode) === -1) {
      this.enableMode(EditModes.stamp)
    }
  },
  pushUnique(tile) {
    this.refs.map.collection.pushUnique(tile)
  },
  resetActiveLayer() {
    const l = this.refs.map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
  },
  isTileSelected(gid) {
    return this.refs.map ? this.refs.map.collection.indexOfGid(gid) : -1
  },

  setMode(mode) {
    this.setState({ activeMode: mode })
  },

  // TODO: add warning
  removeTileset(id = this.state.activeTileset) {
    const c2 = this.mgb_content2
    if (!c2.tilesets.length) {
      return
    }
    const reason = 'Removed Tileset: ' + c2.tilesets[id].name

    this.saveForUndo(reason)
    this.setState({ activeTileset: this.state.activeTileset > 0 ? this.state.activeTileset - 1 : 0 })

    c2.tilesets.splice(id, 1)
    // update cache - so we can zero out tiles
    this.cache.update(c2, () => {
      // async call - map can be unloaded already
      if (!this.cache) return

      TileHelper.zeroOutUnreachableTiles(c2, this.cache.tiles)

      this.cache.update(c2, () => {
        // async call map can be removed already
        if (!this.cache) return
        this.quickSave(reason)
        this.setState({ activeTileset: this.state.activeTileset })
      })
    })
  },
  selectTileset(id) {
    this.setState({ activeTileset: id })
  },

  updateTilesetFromData(data, ref = null, fixGids = false) {
    const c2 = this.mgb_content2
    let ts
    if (data && data.imagewidth == data.tilewidth) {
      ts = TileHelper.genTileset(c2, data.image, data.imagewidth, data.imageheight)
      ts.name = data.name
    } else {
      // set known size
      ts = TileHelper.genTileset(
        c2,
        data.image,
        data.imagewidth,
        data.imageheight,
        data.tilewidth,
        data.tileheight,
        data.name,
      )
    }
    ts.tiles = data.tiles
    const tss = c2.tilesets

    if (!ref) {
      tss.push(ts)
    } else {
      for (let i in ts) {
        if (i == 'firstgid') {
          continue
        }
        ref[i] = ts[i]
      }
      // sen name for tilesets with one image
      if (data.name) {
        ref.name = data.name
      }
    }

    if (fixGids) {
      TileHelper.fixTilesetGids(c2)
    }

    if (!ref) {
      this.setState({ activeTileset: tss.length - 1 })
    }

    this.quickSave('Added new tileset: ' + data.name)
  },

  getActiveLayerData() {
    return this.mgb_content2.layers[this.state.activeLayer]
  },

  addActor(ts) {
    // make sure we don't collide gids
    ts.firstgid = Infinity // nothing is infinite
    this.mgb_content2.tilesets.push(ts)
    // this function will change infinity to real GID
    TileHelper.fixTilesetGids(this.mgb_content2)
    this.updateMap()
    this.quickSave('Added actor')
  },

  setActiveLayerByName(name) {
    const layers = this.mgb_content2.layers
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].name == name) {
        this.setState({ activeLayer: i })
        return
      }
    }
  },
  startLoading() {
    this.setState({ isLoading: true })
  },
}

export default TilesetProps
