
// Quick lookup map to set/check if cells are blocked for any reason


export default class BlockageMap
{
  reset(w, h)
  {
    this.cells = new Array(w * h)
    this.width = w
    this.height = h	
  }

  constructor() {
		// Does nothing. Caller should use reset() instead to prepare for use
  }	

  offsetforCell(x,y) 
  {
    if (x > this.width || y > this.height)
      console.trace("Incorrect size in BlockageMap")
    return y*this.width + x		// Arranged in rows  
  }
	
  blockEntity(x, y, entityIndex, w = 1, h = 1)
	{
    for (var i = 0; i < w; i++) {
      for (var j = 0; j < h; j++) {
        if (x+i < this.width && y+j < this.height) {
          console.log("block "+(x+i)+","+(y+j)+" to "+entityIndex)
          var c = this.offsetforCell(x+i, y+j)
          var v = this.cells[c]
          this.cells[c] = (v | (1 << entityIndex))
        }
      }
    }
  }
	
  isEntityBlocked(x, y, entityIndex)
	{
    var c = this.offsetforCell(x, y)
    var v = this.cells[c]
    return (v & (1 << entityIndex)) !== 0
  } 
}

// static public consts...
BlockageMap.ENTITY_PLAYER = 0
BlockageMap.ENTITY_NPC = 1