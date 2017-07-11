// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on cell-realted utilities

const MagePlayGameCellUtil = {
  cell(x, y) {
    if (x > this.map.metadata.width || y > this.map.metadata.height)
      throw new Error('Invalid coordinates for map')
    return y * this.map.metadata.width + x // Arranged in rows
  },

  /**
   *
   *
   * @param {Array} cellList
   * @param {ActiveActor} actor
   * @param {int} stepStyle
   */
  addCellsActorIsFacingToCellList(cellList, actor, stepStyle) {
    var x,
      y,
      w = 1,
      h = 1

    switch (stepStyle) {
      case 0: // North
        x = actor.x
        y = actor.y - 1
        w = actor.cellSpanX
        break
      case 1:
        x = actor.x + actor.cellSpanX
        y = actor.y
        h = actor.cellSpanY
        break
      case 2:
        x = actor.x
        y = actor.y + actor.cellSpanY
        w = actor.cellSpanX
        break
      case 3:
        x = actor.x - 1
        y = actor.y
        h = actor.cellSpanY
    }
    for (let i = x; i < x + w; i++) {
      for (let j = y; j < y + h; j++) {
        this.addValidCellToCellList(cellList, i, j)
      }
    }
  },

  /**
   *
   *
   * @param {Array} cellList
   * @param {any} x
   * @param {any} y
   */
  addValidCellToCellList(cellList, x, y) {
    var cellIndex = this.cell(x, y, true)
    if (cellIndex != -1) cellList.push(cellIndex)
  },
}

export default MagePlayGameCellUtil
