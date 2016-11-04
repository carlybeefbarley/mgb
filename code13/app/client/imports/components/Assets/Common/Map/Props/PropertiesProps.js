export default {
  getActiveObject () {
    const l = this.refs.map.getActiveLayer()
    if (l && l.pickedObject)
      return l.pickedObject
    return null
  },
  resize(){
    this.refs.map.resize()
  }
}
