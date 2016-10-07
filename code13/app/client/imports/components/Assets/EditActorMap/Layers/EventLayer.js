'use strict'

import TileMapLayer from './TileMapLayer.js'

export default class EventLayer extends TileMapLayer {
  insertTile(id, gid){
    this.options.data[id] = gid
    console.log("HERE!")
  }
  /*constructor(...a){
    super(...a)
    //console.log("Event layer init...")
  }
  _draw(){
    super._draw()
    console.log("Draw Tile")
  }
  drawTile(tile){
    super.drawTile(tile)
    console.log("Draw Tile")
  }*/
}
