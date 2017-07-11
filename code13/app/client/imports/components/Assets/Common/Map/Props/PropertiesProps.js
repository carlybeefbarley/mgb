/* this -> EditMap instance */

const PropertiesProps = {
  getActiveObject() {
    if (!this.refs.map) {
      return null
    }
    const l = this.refs.map.getActiveLayer()
    if (l && l.pickedObject) return l.pickedObject
    return null
  },
  resize(data) {
    this.refs.map.resize(data)
    this.quickSave('Resize Map')
  },
  updateTileset(data) {
    const reason = 'Changed Tileset properties'
    this.saveForUndo(reason)
    this.mgb_content2.tilesets[this.state.activeTileset] = data
    this.quickSave(reason)
  },
  updateLayer(data) {
    const reason = 'Changed Layer properties'
    this.saveForUndo(reason)
    this.mgb_content2.layers[this.state.activeLayer] = data
    this.quickSave(reason)
  },
  // data contains reference to object - only saving is needed
  updateObject(data) {
    this.quickSave(`Changed ${data.name} Properties`)
  },
  changeTileSize(data) {
    const reason = 'Changed Layer properties'
    this.saveForUndo(reason)
    this.mgb_content2.tilewidth = data.tilewidth
    this.mgb_content2.tileheight = data.tileheight
    this.quickSave(reason)
  },
}

export default PropertiesProps
