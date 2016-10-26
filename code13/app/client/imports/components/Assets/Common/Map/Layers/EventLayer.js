'use strict'

import TileMapLayer from './TileMapLayer.js'

export default class EventLayer extends TileMapLayer {
  insertTile(id, gid){
    const actions = {
      "1": "jump",
      "2": "music" //"music: loops=10000,source=joco/Skullcrusher%20Mountain.mp3",
    }
    this.map.showModal(actions[gid], (opts) => {
      //this.options.
      this.options.data[id] = gid;
      if(gid == "1"){
        this.options.mgb_events[id] = `jump: x=${opts.x || 0},y=${opts.y || 0},mapname=${opts.map}`
      }
      else if(gid == "2"){
        if(!opts.music){
          return;
        }
        this.options.mgb_events[id] = `music: loops=10000,source=${opts.music}`
      }
      this.map.save("Add action: "+ actions[gid]);
    })
    console.log("HERE!")
  }

  getInfo(){
    let ret = super.getInfo()
    if(!this.tilePosInfo || !this.options.mgb_events[this.tilePosInfo.id]){
      return ret;
    }
    ret += "\n"
    ret += this.options.mgb_events[this.tilePosInfo.id]
    return ret
  }

  _increaseSizeToTop (pos) {

    for (let i = 0; i < this.options.width; i++) {
      this.options.data.unshift(0)
      this.options.mgb_events.unshift(0)
    }
    this.options.y -= this.map.data.tileheight
    this.options.height++
    // adjust map to biggest layer
    if(this.map.options.height < this.options.height){
      this.map.options.height = this.options.height
    }
  }
  _increaseSizeToRight (pos) {
    // one step at the time..
    // this method will be called more - if necessary
    // reverse as first splice will resize array
    for (let i = this.options.height; i > 0; i--) {
      this.options.data.splice(i * this.options.width, 0, 0)
      this.options.mgb_events.splice(i * this.options.width, 0, 0)
    }
    this.options.width++
    // adjust map to biggest layer
    if(this.map.options.width < this.options.width){
      this.map.options.width = this.options.width
    }
  }
  _increaseSizeToBottom (pos) {
    for (let i = 0; i < this.options.width; i++) {
      this.options.data.push(0)
      this.options.mgb_events.push('')
    }
    this.options.height++
    // adjust map to biggest layer
    if(this.map.options.height < this.options.height){
      this.map.options.height = this.options.height
    }
  }
  _increaseSizeToLeft (pos) {
    this.options.x -= this.map.data.tilewidth
    // reverse as first splice will resize array
    for (let i = this.options.height - 1; i > -1; i--) {
      this.options.data.splice(i * this.options.width, 0, 0)
      this.options.mgb_events.splice(i * this.options.width, 0, 0)
    }
    this.options.width++
    // adjust map to biggest layer
    if(this.map.options.width < this.options.width){
      this.map.options.width = this.options.width
    }
  }

}
