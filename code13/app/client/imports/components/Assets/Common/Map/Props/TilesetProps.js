import TileHelper from '../Helpers/TileHelper.js'
import EditModes from '../Tools/EditModes.js'

export default {
  // tileset -> map proxy - don't need to change state
  clearActiveSelection: function(){
    this.refs.map.clearActiveSelection()
  },
  selectTile: function(tile){
    this.refs.map.collection.pushOrRemove(tile)
    // it's annoying to pick stamp tool after picking tile
    if([EditModes.stamp, EditModes.fill].indexOf(this.options.mode) === -1){
      this.enableMode(EditModes.stamp)
    }
  },
  pushUnique: function(tile){
    this.refs.map.collection.pushUnique(tile)
  },
  resetActiveLayer: function(){
    const l = this.refs.map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
  },
  isTileSelected: function(gid){
    return this.refs.map ? this.refs.map.collection.indexOfGid(gid) : -1
  },


  setMode: function(mode){
    this.setState({activeMode: mode})
  },

  // TODO: add warning
  removeTileset: function(id = this.state.activeTileset){
    const c2 = this.mgb_content2
    const reason = "Removed Tileset: " + c2.tilesets[id].name

    this.saveForUndo(reason)

    c2.tilesets.splice(id, 1)
    this.cache.update(c2)

    this.state.activeTileset = this.state.activeTileset > 0 ? this.state.activeTileset -1 : 0
    TileHelper.zeroOutUnreachableTiles(c2, this.cache.tiles)

    this.quickSave(reason)
    this.setState({activeTileset: this.state.activeTileset})
  },
  selectTileset: function(id){
    this.setState({activeTileset: id})
  },

  updateTilesetFromData: function(data, ref = null, fixGids = false){
    const c2 = this.mgb_content2
    let ts
    if (data.imagewidth == data.tilewidth) {
      ts = TileHelper.genTileset(c2, data.image, data.imagewidth, data.imageheight)
      ts.name = data.name
    }
    // set known size
    else {
      ts = TileHelper.genTileset(c2, data.image, data.imagewidth, data.imageheight,
        data.tilewidth, data.tileheight, data.name
      )
    }
    ts.tiles = data.tiles
    const tss = c2.tilesets

    if(!ref) {
      tss.push(ts)
    }
    else{
      for(let i in ts){
        if(i == "firstgid"){
          continue;
        }
        ref[i] = ts[i]
      }
      // sen name for tilesets with one image
      if(data.name){
        ref.name = data.name
      }
    }

    if(fixGids){
      TileHelper.fixTilesetGids(c2)
    }

    if(!ref) {
      this.setState({activeTileset: tss.length - 1})
    }

    this.quickSave("Added new tileset: " + data.name)
  },


  getActiveLayerData: function(){
    return this.mgb_content2.layers[this.state.activeLayer]
  },
  addActor: function(ts){
    // make sure we don't collide gids
    ts.firstgid = Infinity // nothing is infinite
    this.mgb_content2.tilesets.push(ts)
    // this function will change infinity to real GID
    TileHelper.fixTilesetGids(this.mgb_content2)
    this.quickSave("Added actor")
  },
  setActiveLayerByName: function(name){
    const layers = this.mgb_content2.layers
    for(let i=0; i<layers.length; i++){
      if(layers[i].name == name){
        this.setState({activeLayer: i})
        return;
      }
    }
  },
  startLoading: function(){
    this.setState({isLoading: true})
  }
}
