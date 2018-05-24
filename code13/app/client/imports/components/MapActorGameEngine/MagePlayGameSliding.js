import MgbSystem from './MageMgbSystem'

// This code will be incoportaed by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on the Sliding behaviors

const MagePlayGameSliding = {
  playPushItemToStartSliding(AA_pusher_idx, AA_item_idx) {
    // 0. Some shortcuts
    const { activeActors, map, G_tweensPerTurn, G_tweenCount } = this
    const aap = activeActors[AA_pusher_idx]
    const aai = activeActors[AA_item_idx]

    // 1. Work out direction of movement
    var dx = aap.x - aap.fromx
    var dy = aap.y - aap.fromy
    if (dy < 0 && dx == 0) aai.stepStyle = 0
    else if (dx > 0 && dy == 0)
      // N
      aai.stepStyle = 1
    else if (dy > 0 && dx == 0)
      // E
      aai.stepStyle = 2
    else if (dx < 0 && dy == 0)
      // S
      aai.stepStyle = 3
    else {
      // W
      // Do nothing for diagonals ("Unknown direction type ("+dx+","+dy+") in playPushItemToStartSliding()")
      return
    }

    // 2. Move the block
    aai.isSliding = true
    aai.moveSpeed = 1 // Special case - see note in class definition
    this.calculateNewEnemyPosition(AA_item_idx)
    if (
      aai.y < 0 ||
      aai.x < 0 ||
      aai.x >= map.metadata.width ||
      aai.y >= map.metadata.height ||
      this.checkIfActorObstructed(AA_item_idx, true)
    ) {
      // Not a valid new space; revert to staying in place
      aai.x = aai.fromx
      aai.y = aai.fromy
      aai.stepCount = 0 // Reset the step count; used to trigger a new movement choice.
      aai.isSliding = false
      aai.moveSpeed = 0 // Special case - see note in class definition

      // This means the pusher is blocked also - we need to put them back in place
      aap.x = aap.fromx
      aap.y = aap.fromy
      aap.xMovePerTween = 0 // TODO: Might be nicer to calculate how to tween this..?
      aap.yMovePerTween = 0 // TODO: Might be nicer to calculate how to tween this..?
      aap.renderX = aap.fromx * MgbSystem.tileMinWidth
      aap.renderY = aap.fromy * MgbSystem.tileMinHeight
    } else {
      // The space is available. Convert intended move into per-tween amounts and move
      aai.xMovePerTween =
        (aai.x - aai.fromx) * (MgbSystem.tileMinWidth / (G_tweensPerTurn - (G_tweenCount - 1)))
      aai.yMovePerTween =
        (aai.y - aai.fromy) * (MgbSystem.tileMinHeight / (G_tweensPerTurn - (G_tweenCount - 1)))
      this.clearTicTable() // Important, need to invalidate the collision detection cache. TODO Potentially just update the cells we know have changed - i.e. aai.x,aai.y
    }
  },

  // Called when either a sliding block hits something solid, OR when a shot has hit it's target.
  // This function only handles the effects on the shot/block, not on what it hit
  playStopItemSliding(
    aai, //aai is an ActiveActor
  ) {
    aai.isSliding = false
    aai.moveSpeed = 0
    aai.stepCount = 0
    aai.renderX = aai.x * MgbSystem.tileMinWidth
    aai.renderY = aai.y * MgbSystem.tileMinHeight
    if (aai.isAShot) this.destroyShot(aai)
  },
}

export default MagePlayGameSliding
