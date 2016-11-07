import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'

export default {
  handleSave(reason){
    this.quickSave(reason, false, this.refs.map.generatePreview())
  },
  saveForUndo(reason, skipRedo){
    this.saveForUndo(reason, skipRedo)
  },
  getActiveLayer(){
    if(!this.refs.map){
      return null
    }
    return this.refs.map.getActiveLayer()
  },
  lowerOrRaiseObject(lower){
    this.saveForUndo('Raise object')
    this.refs.map.lowerOrRaiseObject(lower)
  },
  showOrHideObject(index){
    const activeLayer = this.refs.map.getActiveLayer()
    const objects = activeLayer.data.objects
    objects[index].visible = !objects[index].visible
  },
  setPickedObject(index){
    const l = this.refs.map.getActiveLayer()
    if (!l) {
      return
    }
    l.setPickedObjectSlow(index)
  }
}
