// This code will be incorporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that deals with the TIC structure - TIC means Things In Cell

const MagePlayGameTIC = {
  clearTicTable() {
    // FIXME - needs to sort into larger cells - maybe MgbSystem.tileMax{Width/Height}
    this.G_tic = null
  },

  generateTicTable() {
    // FIXME - needs to sort into larger cells - maybe MgbSystem.tileMax{Width/Height}
    const { activeActors } = this
    this.G_tic = [] // NOT the same as clearing it.. clearing means null

    // Pigeon sort them into cells
    const len = activeActors.length // Taking this out of the 'for' statement speeds things up a little
    for (let AA1 = 0; AA1 < len; AA1++) {
      if (activeActors[AA1].alive) {
        this.ticAdd(activeActors[AA1].x, activeActors[AA1].y, AA1)
        if (activeActors[AA1].x != activeActors[AA1].fromx || activeActors[AA1].fromy != activeActors[AA1].y)
          this.ticAdd(activeActors[AA1].fromx, activeActors[AA1].fromy, AA1) // Item is on the move, so list it in both 'from' and 'to' cells
      }
    }
  },

  ticAdd(x, y, AAidx) {
    const { activeActors, map, G_tic } = this

    var aa = activeActors[AAidx]

    var mW = map.metadata.width
    var mH = map.metadata.height
    var cX = aa.cellSpanX
    var cY = aa.cellSpanY

    x += aa.renderOffsetCellsX
    y += aa.renderOffsetCellsY
    cX += aa.renderOffsetCellsWidth
    cY += aa.renderOffsetCellsHeight

    // Loop is to account for cellSpanX,Y
    for (let x1 = 0; x1 < cX && x + x1 < mW; x1++) {
      for (let y1 = 0; y1 < cY && y + y1 < mH; y1++) {
        if (x + x1 >= 0 && y + y1 >= 0) {
          // Check if cell is in bounds. Note that we don't need to check for the bottom/right edges since that bound is covered by the the loop guards.
          var cell = x + x1 + (y + y1) * mW
          if (G_tic[cell] == null) G_tic[cell] = new Array()
          G_tic[cell][G_tic[cell].length] = AAidx /// TODO - look for dupes?
        }
      }
    }
  },
}

export default MagePlayGameTIC
