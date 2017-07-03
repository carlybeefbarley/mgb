import LayerTypes from '../Tools/LayerTypes.js'
import TileHelper from '../Helpers/TileHelper.js'
const Prefixes = {
  tileLayer: "Tile Layer ",
  imageLayer: "Image Layer ",
  objectLayer: "Object Layer "
}
export default {

  setActiveLayer: function(id){
    this.setState({activeLayer: id})
  },

  toggleLayerVisibilty: function(id, isVisible){
    const c2 = this.mgb_content2
    c2.layers[id].visible = isVisible
    this.quickSave("ToggleLayerVisibility")
  },

  addLayer: function(type){
    const c2 = this.mgb_content2
    const lss = c2.layers

    // TODO: check for duplicate names..
    let ls
    if (type === LayerTypes.tile) {
      ls = TileHelper.genLayer(c2.width, c2.height, Prefixes.tileLayer + (lss.length + 1))
    }
    else if (type === LayerTypes.image) {
      ls = TileHelper.genImageLayer(Prefixes.imageLayer + (lss.length + 1))
    }
    else if (type === LayerTypes.object) {
      ls = TileHelper.genObjectLayer(Prefixes.objectLayer + (lss.length + 1))
    }
    lss.push(ls)

    this.quickSave("Added layer")
    return ls
  },

  removeLayer: function(){
    const c2 = this.mgb_content2
    const lss = c2.layers
    lss.splice(this.state.activeLayer, 1)
    if (this.state.activeLayer >= c2.layers.length) {
      this.setState({activeLayer: c2.layers.length - 1})
    }

    this.quickSave('Remove Layer')
  },

  raiseLayer: function(){
    const c2 = this.mgb_content2
    const lss = c2.layers
    const layer = lss.splice(this.state.activeLayer, 1)

    lss.splice(this.state.activeLayer + 1, 0, layer[0])
    this.setState({
      activeLayer: this.state.activeLayer + 1
    })

    this.quickSave('Raise Layer')
  },

  lowerLayer: function(){
    const c2 = this.mgb_content2
    const lss = c2.layers
    const layer = lss.splice(this.state.activeLayer, 1)

    lss.splice(this.state.activeLayer - 1, 0, layer[0])
    this.setState({
      activeLayer: this.state.activeLayer - 1
    })

    this.quickSave('Lower Layer')
  },

  highlightActiveLayerToggle: function(){
    this.options.highlightActiveLayer = !this.options.highlightActiveLayer
    this.setState({
      content2: this.mgb_content2
    })
  },

  renameLayer: function(id, newName){
    const c2 = this.mgb_content2
    const reason = 'Renamed layer ' + c2.layers[id].name + ' to ' + newName
    c2.layers[id].name = newName
    this.quickSave(reason)
  }
}
