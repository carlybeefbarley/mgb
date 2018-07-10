import MgbActor from './MageMgbActor'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on the Shooting behaviors

const MagePlayGameShoot = {
  actorCanShoot(aa_idx) {
    const { activeActors, AA_player_idx, inventory } = this
    var rateBonus = aa_idx == AA_player_idx ? inventory.equipmentShotRateBonus : 0

    return (
      activeActors[aa_idx].alive &&
      rateBonus + activeActors[aa_idx].maxActiveShots > activeActors[aa_idx].currentActiveShots
    )
  },

  actorCreateShot(aa_idx, stepStyleOverride = NaN) {
    const { actors, activeActors, AA_player_idx, inventory, map, ownerName } = this
    var actor = activeActors[aa_idx]
    var ap = actors[actor.ACidx]
    var spawn = ap ? ap.content2.databag.allchar.shotActor : null

    if (aa_idx == AA_player_idx && inventory.equipmentShotActorOverride)
      spawn = inventory.equipmentShotActorOverride

    if (!spawn || spawn == '') {
      this.logGameBug("Shot not defined for actor '" + ap.name + "'")
      return
    }
    // Spawn the shot. We need to make sure we don't shoot ourself :)
    var aa_shot_idx = this.playSpawnNewActor(
      this.loadActorByName(spawn),
      actor.x + (actor.cellSpanX > 2 ? 1 : 0),
      actor.y + (actor.cellSpanY > 2 ? 1 : 0),
      true,
    )
    if (-1 != aa_shot_idx) {
      var shot = activeActors[aa_shot_idx]

      if (isNaN(stepStyleOverride)) shot.stepStyle = actor.stepStyle
      else shot.stepStyle = stepStyleOverride
      shot.stepCount = 1
      shot.isSliding = true // Shot is a type of sliding item
      shot.isAShot = true // Obviously..
      shot.moveSpeed = 1 // Special case - see note in class definition
      actor.currentActiveShots++
      shot.actorWhoFiredShot = aa_idx
      shot.shotRange = MgbActor.intFromActorParam(ap.content2.databag.allchar.shotRangeNum)
      if (aa_idx == AA_player_idx) shot.shotRange += inventory.equipmentShotRangeBonus

      // If the actor is moving the same way as the bullet, then the bullet needs to move one step ahead
      if ((actor.yMovePerTween || actor.xMovePerTween) && shot.stepStyle == actor.stepStyle) {
        this.calculateNewEnemyPosition(aa_shot_idx) // Actor's moving.. need to keep ahead of the actor
        if (this.checkIfActorObstructed(aa_shot_idx, true)) {
          this.destroyShot(shot)
          return
        }
      }
      if (shot.y < 0 || shot.x < 0 || shot.x > map.metadata.width - 1 || shot.y > map.metadata.height - 1) {
        // Not a valid new space, so the shot is spent
        this.destroyShot(shot)
        return
      }
      // The space is available. Convert intended move into per-tween amounts and move
      shot.shotDamageToNPC = MgbActor.intFromActorParam(ap.content2.databag.allchar.shotDamageToNPCorItemNum)

      if (aa_idx == AA_player_idx) shot.shotDamageToNPC += inventory.equipmentShotDamageBonus

      shot.shotDamageToPlayer = MgbActor.intFromActorParam(ap.content2.databag.allchar.shotDamageToPlayerNum)
      //            shot.xMovePerTween = (shot.x - shot.fromx) * (mapPiece.actorWidth / (G_tweensPerTurn - (G_tweenCount-1)));
      //            shot.yMovePerTween = (shot.y - shot.fromy) * (mapPiece.actorHeight / (G_tweensPerTurn - (G_tweenCount-1)));
      this.clearTicTable() // Important, need to invalidate the collision detection cache. TODO Potentially just update the cells we know have changed - i.e. aai.x,aai.y
      var shotSound = ap.content2.databag.allchar.soundWhenShooting
      if (aa_idx == AA_player_idx && inventory.equipmentShotSoundOverride)
        shotSound = inventory.equipmentShotSoundOverride
      MgbActor.playCannedSound(shotSound, ap.content2, ownerName)
    }
  },

  destroyShot(
    shot, // shot is an ActiveActor
  ) {
    const { activeActors } = this

    if (!shot.alive || !shot.isAShot) this.logBug('destroyShot called on an actor which is not a shot')
    shot.alive = false
    shot.dyingAnimationFrameCount = 0
    shot._image = null
    if (shot.actorWhoFiredShot != -1) activeActors[shot.actorWhoFiredShot].currentActiveShots-- // FIXME: Small issue here: What if the actor had since died and been respawned - fix by new code when actor dies - set all it's shots to be unowned (shot.actorWhoFiredShot = -1)
  },
}

export default MagePlayGameShoot
