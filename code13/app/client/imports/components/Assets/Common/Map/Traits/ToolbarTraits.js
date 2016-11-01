import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'
import EditModes from '../Tools/EditModes.js'

const TB = {
  togglePreviewState: function(){
    this.options.preview = !this.options.preview
    this.setState({preview: this.options.preview})
  },

  getActiveLayer: function(){
    const c2 = this.props.asset.content2
    return c2.layers[this.state.activeLayer]
  },

  save: function(){
    this.quickSave("Manual save call")
  },

  enableMode: function(mode){
    // this is EditMap Scope
    this.enableMode(mode)
  },
  toggleRandomMode: function(){
    this.options.randomMode = !this.options.randomMode
    this.setState({randomMode: this.options.randomMode})
  },

  preview: function(){
    this.refs.map.togglePreviewState()
  },

  resetCamera: function(){
    this.refs.map.resetCamera()
  },

  undo: function(){
    this.doUndo()
  },

  redo: function(){
    this.doRedo()
  },

  stamp: function(){
    TB.enableMode.call(this, EditModes.stamp)
  },

  terrain: function(){
    TB.enableMode.call(this, EditModes.terrain)
  },

  fill: function(){
    TB.enableMode.call(this, EditModes.fill)
  },

  eraser: function(){
    TB.enableMode.call(this, EditModes.eraser)
  },

  drawRectangle: function(){
    TB.enableMode.call(this, EditModes.drawRectangle)
  },

  drawEllipse: function(){
    TB.enableMode.call(this, EditModes.drawEllipse)
  },

  drawShape: function(){
    TB.enableMode.call(this, EditModes.drawShape)
  },

  rectangle: function(){
    TB.enableMode.call(this, EditModes.rectangle)
  },

  wand: function(){
    TB.enableMode.call(this, EditModes.wand)
  },

  picker: function(){
    TB.enableMode.call(this, EditModes.picker)
  },

  clearSelection: function(){
    this.refs.map.clearSelection()
  },

  togglePolygon: function(){
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.toggleFill) {
      return;
    }
    l.toggleFill()
    this.saveForUndo('Toggle Fill')
  },

  rotateClockwise: function(){
    this.rotate(true)
  },

  rotateCounterClockwise: function(){
    this.rotate(false)
  },

  rotate(cw) {
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.rotate) {
      return;
    }
    if (cw) {
      l.rotate()
    } else {
      l.rotateBack()
    }
  },

  flip: function(){
    const l = this.refs.map.getActiveLayer()
    if (!l || !l.flip) {
      return;
    }
    l.flip()
  },

  showGridToggle: function(){
    this.options.showGrid = !this.options.showGrid
    this.setState({showGrid: this.options.showGrid})
  }
}

export default TB
