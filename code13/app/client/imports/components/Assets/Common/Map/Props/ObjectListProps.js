const ObjectListProps = {
  handleSave(reason) {
    this.quickSave(reason, false, this.refs.map.generatePreview())
  },
  saveForUndo(reason, skipRedo) {
    this.saveForUndo(reason, skipRedo)
  },
  getActiveLayer() {
    if (!this.refs.map) {
      return null
    }
    return this.refs.map.getActiveLayer()
  },
  lowerOrRaiseObject(lower) {
    const msg = lower ? 'Lower object' : 'Raise object'
    this.saveForUndo(msg)
    this.refs.map.lowerOrRaiseObject(lower)
    this.quickSave(msg)
  },
  showOrHideObject(index) {
    const activeLayer = this.refs.map.getActiveLayer()
    const objects = activeLayer.data.objects

    const msg = objects[index].visible ? 'Hide object' : 'Reveal object'

    objects[index].visible = !objects[index].visible
    this.quickSave(msg)
  },
  setPickedObject(index) {
    const l = this.refs.map.getActiveLayer()
    if (!l) {
      return
    }
    l.setPickedObjectSlow(index)
  },
  removeObject() {
    this.refs.map.removeObject()
  },
}

export default ObjectListProps
