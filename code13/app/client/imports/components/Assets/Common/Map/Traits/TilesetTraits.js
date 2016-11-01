import TileHelper from '../Helpers/TileHelper.js'

export default {
  // tileset -> map proxy - don't need to change state
  clearActiveSelection: function(){
    this.refs.map.clearActiveSelection()
  },
  selectTile: function(tile){
    this.refs.map.collection.pushOrRemove(tile)
  },
  pushUnique: function(tile){
    this.refs.map.collection.pushUnique(tile)
  },
  resetActiveLayer: function(){
    const l = this.refs.map.getActiveLayer()
    l && l.resetRotation && l.resetRotation()
  },
  // TODO(stauzs): this seems a little bit awkward - but better that adding collection as props
  isTileSelected: function(gid){
    return this.refs.map.collection.indexOfGid(gid)
  },


  setMode: function(mode){
    this.setState({activeMode: mode})
    // update active tool
    // this.map.refs.toolbar.forceUpdate()
  },

  // TODO: add warning
  removeTileset: function(){
    const c2 = this.props.asset.content2
    const justRemoved = c2.tilesets.splice(this.state.activeTileset, 1)
    this.cache.update()
    TileHelper.zeroOutUnreachableTiles(c2, this.cache.tiles)

    this.quickSave("Removed Tileset: " + justRemoved[0].name)
    this.setState({activeTileset: this.state.activeTileset > 0 ? this.state.activeTileset -1 : 0})
  },
  selectTileset: function(id){
    console.log("Active tileset:", id)
    this.setState({activeTileset: id})
  },

  updateTilesetFromData: function(data, ref = null, fixGids = false){
    const c2 = this.props.asset.content2
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
  }
}
