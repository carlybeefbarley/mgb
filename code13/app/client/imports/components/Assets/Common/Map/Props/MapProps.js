import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'

export default {
  saveThumbnail(thumbnail){
    this.props.handleContentChange(null, thumbnail, "")
  },
  handleSave(reason){
    this.quickSave(reason, false, this.refs.map.generatePreview())
  },
  saveForUndo(reason, skipRedo){
    this.saveForUndo(reason, skipRedo)
  },
  getMode(){
    return this.options.mode
  },
  setMode(mode){
    this.enableMode(mode)
  },
  setPickedObject(index){
    this.setState({activeObject: index})
  },
  getCtrlModifier(){
    return this.options.ctrlModifier
  }
}
