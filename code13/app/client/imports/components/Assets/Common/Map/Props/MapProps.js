const MapProps = {
  saveThumbnail(data, reason, thumbnail) {
    this.handleSave(data, reason, thumbnail)
    //this.props.handleContentChange(null, thumbnail, "")
  },
  handleSave(reason) {
    this.quickSave(reason, false, this.refs.map.generatePreview())
  },
  saveForUndo(reason, skipRedo) {
    this.saveForUndo(reason, skipRedo)
  },
  getMode() {
    return this.options.mode
  },
  setMode(mode) {
    this.enableMode(mode)
  },
  setPickedObject(index) {
    this.setState({ activeObject: index })
  },
  getCtrlModifier() {
    return this.options.ctrlModifier
  },
  updateMapData(data) {
    this.updateMapData(data)
  },
  updateScale(scale) {
    this.setState({ scale })
    this.saveMeta()
  },
  addImage(img) {
    if (!this.mgb_content2.images) {
      this.mgb_content2.images = []
    }
    this.mgb_content2.images.push(img)
    this.updateMapData(this.mgb_content2)
  },
  updateCameraPos() {
    // console.log("Saving camera pos...")
    this.saveMeta()
  },
}

export default MapProps
