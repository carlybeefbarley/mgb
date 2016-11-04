export default {
  getActiveObject () {
    if(!this.refs.map){
      return null
    }
    const l = this.refs.map.getActiveLayer()
    if (l && l.pickedObject)
      return l.pickedObject
    return null
  },
  resize(data){
    this.refs.map.resize(data)
    this.quickSave("Resize Map")
  },
  updateTileset(data){
    const reason = "Changed Tileset properties"
    this.saveForUndo(reason)
    this.state.content2.tilesets[this.state.activeTileset] = data
    this.quickSave(reason)
  },
  updateLayer(data){
    const reason = "Changed Layer properties"
    this.saveForUndo(reason)
    this.state.content2.layers[this.state.activeLayer] = data
    this.quickSave(reason)
  },
  updateObject(data){

  },
  changeTileSize(data){
    this.saveForUndo()
  }
}
