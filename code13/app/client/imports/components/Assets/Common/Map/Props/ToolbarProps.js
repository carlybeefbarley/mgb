import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'
import EditModes from '../Tools/EditModes.js'
import Camera from '../Camera'

const TB = {
  togglePreviewState: function() {
    this.options.preview = !this.options.preview
    this.setState({ preview: this.options.preview })
  },

  play: function() {
    if (!this.state.isPlaying) this.props.handleSaveNowRequest()
    this.setState({ isPlaying: !this.state.isPlaying })
  },

  getActiveLayer: function() {
    const c2 = this.mgb_content2
    return c2.layers[this.state.activeLayer]
  },

  save: function() {
    this.quickSave('Manual save call')
  },

  enableMode: function(mode) {
    // this is EditMap Scope
    this.enableMode(mode)
  },

  toggleRandomMode: function() {
    this.options.randomMode = !this.options.randomMode
    this.setState({ randomMode: this.options.randomMode })
  },

  preview: function() {
    this.options.preview = !this.options.preview
    this.setState({ preview: this.options.preview })
  },

  resetCamera: function() {
    this.refs.map.resetCamera()
    this.setState({ preview: this.options.preview })
  },
  fitMap: function() {
    this.refs.map.fitMap()
    this.setState({ preview: this.options.preview })
  },
  fitMapH: function(e) {
    this.refs.map.fitMap(Camera.HORIZONTAL)
    this.setState({ preview: this.options.preview })
  },
  fitMapV: function(e) {
    this.refs.map.fitMap(Camera.VERTICAL)
    this.setState({ preview: this.options.preview })
  },
  undo: function() {
    this.doUndo()
  },

  redo: function() {
    this.doRedo()
  },
  view: function() {
    this.refs.map.clearSelection()
    TB.enableMode.call(this, EditModes.view)
  },
  stamp: function() {
    TB.enableMode.call(this, EditModes.stamp)
  },

  terrain: function() {
    TB.enableMode.call(this, EditModes.terrain)
  },

  fill: function() {
    TB.enableMode.call(this, EditModes.fill)
  },

  eraser: function() {
    TB.enableMode.call(this, EditModes.eraser)
    this.refs.map.clearSelection()

    const activeLayer = this.refs.map.getActiveLayer()
    activeLayer.deleteSelection && activeLayer.deleteSelection()
  },

  drawRectangle: function() {
    TB.enableMode.call(this, EditModes.drawRectangle)
  },

  drawEllipse: function() {
    TB.enableMode.call(this, EditModes.drawEllipse)
  },

  drawShape: function() {
    TB.enableMode.call(this, EditModes.drawShape)
  },

  rectangle: function() {
    TB.enableMode.call(this, EditModes.rectangle)
  },

  wand: function() {
    TB.enableMode.call(this, EditModes.wand)
  },

  picker: function() {
    TB.enableMode.call(this, EditModes.picker)
  },

  clearSelection: function() {
    this.refs.map.clearSelection()
  },

  togglePolygon: function() {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.toggleFill) {
      return
    }
    l.toggleFill()
    this.saveForUndo('Toggle Fill')
  },

  rotateClockwise: function() {
    TB.rotate.call(this, true)
  },

  rotateCounterClockwise: function() {
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

  flip: function() {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.flip) {
      return
    }
    l.flip()
  },

  showGridToggle: function() {
    this.options.showGrid = !this.options.showGrid
    this.setState({ showGrid: this.options.showGrid })
  },

  toggleCtrlModifier: function() {
    this.options.ctrlModifier = !this.options.ctrlModifier
    this.setState({ ctrlModifier: this.options.ctrlModifier })
  },

  zoomIn: function() {
    this.refs.map && this.refs.map.zoomIn()
    this.refs.toolbar && this.refs.toolbar.setState({ zoomLevel: this.options.camera.zoom })
  },

  zoomOut: function() {
    this.refs.map && this.refs.map.zoomOut()
    this.refs.toolbar && this.refs.toolbar.setState({ zoomLevel: this.options.camera.zoom })
  },
}

export default TB
