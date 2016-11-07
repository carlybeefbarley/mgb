import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'

export default {
  handleSave(reason){
    this.quickSave(reason, false, this.refs.map.generatePreview())
  },
  saveForUndo(reason, skipRedo){
    this.saveForUndo(reason, skipRedo)
  },
  getMode(){
    return this.state.editMode
  },
  setMode(mode){
    this.enableMode(mode)
  },
  setPickedObject(index){
    this.setState({activeObject: index})
  }
}
