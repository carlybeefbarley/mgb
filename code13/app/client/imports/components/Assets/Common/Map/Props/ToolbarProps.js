import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'
import EditModes from '../Tools/EditModes.js'
import Camera from '../Camera'

const TB = {
  togglePreviewState() {
    this.options.preview = !this.options.preview
    this.setState({ preview: this.options.preview })
  },

  play() {
    if (!this.state.isPlaying) this.props.handleSaveNowRequest()
    this.setState({ isPlaying: !this.state.isPlaying })
  },

  getActiveLayer() {
    const c2 = this.mgb_content2
    return c2.layers[this.state.activeLayer]
  },

  save() {
    this.quickSave('Manual save call')
  },

  enableMode(mode) {
    // this is EditMap Scope
    this.enableMode(mode)
  },

  toggleRandomMode() {
    this.options.randomMode = !this.options.randomMode
    this.setState({ randomMode: this.options.randomMode })
  },

  preview() {
    this.options.preview = !this.options.preview
    this.setState({ preview: this.options.preview })
  },

  resetCamera() {
    this.refs.map.resetCamera()
    this.setState({ preview: this.options.preview })
  },
  fitMap() {
    this.refs.map.fitMap()
    this.setState({ preview: this.options.preview })
  },
  fitMapH(e) {
    this.refs.map.fitMap(Camera.HORIZONTAL)
    this.setState({ preview: this.options.preview })
  },
  fitMapV(e) {
    this.refs.map.fitMap(Camera.VERTICAL)
    this.setState({ preview: this.options.preview })
  },
  undo() {
    this.doUndo()
  },

  redo() {
    this.doRedo()
  },
  view() {
    this.refs.map.clearSelection()
    TB.enableMode.call(this, EditModes.view)
  },
  stamp() {
    TB.enableMode.call(this, EditModes.stamp)
  },

  terrain() {
    TB.enableMode.call(this, EditModes.terrain)
  },

  fill() {
    TB.enableMode.call(this, EditModes.fill)
  },

  eraser() {
    TB.enableMode.call(this, EditModes.eraser)
    this.refs.map.clearSelection()

    const activeLayer = this.refs.map.getActiveLayer()
    activeLayer.deleteSelection && activeLayer.deleteSelection()
  },

  drawRectangle() {
    TB.enableMode.call(this, EditModes.drawRectangle)
  },

  drawEllipse() {
    TB.enableMode.call(this, EditModes.drawEllipse)
  },

  drawShape() {
    TB.enableMode.call(this, EditModes.drawShape)
  },

  rectangle() {
    TB.enableMode.call(this, EditModes.rectangle)
  },

  wand() {
    TB.enableMode.call(this, EditModes.wand)
  },

  picker() {
    TB.enableMode.call(this, EditModes.picker)
  },

  clearSelection() {
    this.refs.map.clearSelection()
  },

  togglePolygon() {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.toggleFill) {
      return
    }
    l.toggleFill()
    this.saveForUndo('Toggle Fill')
  },

  rotateClockwise() {
    TB.rotate.call(this, true)
  },

  rotateCounterClockwise() {
    TB.rotate.call(this, false)
  },

  rotate(cw) {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.rotate) {
      return
    }
    if (cw) {
      l.rotate()
    } else {
      l.rotateBack()
    }
  },

  flip() {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.flip) {
      return
    }
    l.flip()
  },

  showGridToggle() {
    this.options.showGrid = !this.options.showGrid
    this.setState({ showGrid: this.options.showGrid })
  },

  toggleCtrlModifier() {
    this.options.ctrlModifier = !this.options.ctrlModifier
    this.setState({ ctrlModifier: this.options.ctrlModifier })
  },

  zoomIn() {
    this.refs.map && this.refs.map.zoomIn()
    this.refs.toolbar && this.refs.toolbar.setState({ zoomLevel: this.options.camera.zoom })
  },

  zoomOut() {
    this.refs.map && this.refs.map.zoomOut()
    this.refs.toolbar && this.refs.toolbar.setState({ zoomLevel: this.options.camera.zoom })
  },
}

export default TB
