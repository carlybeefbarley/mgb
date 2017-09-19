import MgbActor from './MageMgbActor'

const MagePlayGameDamage = {
  checkForTouchDamageAtStartOfTween() {
    this.generateTicTable()
    const { actors, activeActors, G_tic, AA_player_idx } = this
    // Calculate moves (watch out for obstructions)
    for (let AA = 0; AA < activeActors.length; AA++) {
      const actor = activeActors[AA]
      const ap = actors[actor.ACidx]
      const touchDamageToNpcOrItem = MgbActor.intFromActorParam(
        ap.content2.databag.allchar.touchDamageToNPCorItemNum,
      )
      const touchDamageToPlayer = MgbActor.intFromActorParam(
        ap.content2.databag.allchar.touchDamageToPlayerNum,
      )
      const touchDamageCase = MgbActor.intFromActorParam(ap.content2.databag.allchar.touchDamageCases)

      if (
        touchDamageCase != MgbActor.alTouchDamageCases_WhenOverlapped &&
        actor.alive == true &&
        (touchDamageToNpcOrItem != 0 || touchDamageToPlayer != 0)
      ) {
        // Actor is alive, and has some touch damage effect that goes beyond overlapped squares (that case is handled in the collision system, not here in this adjacency system)
        // For this actor, build the list of cells we need to check for touch damage. This is affected by actor size, position, direction, and touch damage rules
        let cellList = []
        if (touchDamageCase == MgbActor.alTouchDamageCases_WhenAdjacent) {
          // need to add all 4 directions
          for (let k = 0; k < 4; k++) this.addCellsActorIsFacingToCellList(cellList, actor, k)
        } else {
          // Just add one direction
          this.addCellsActorIsFacingToCellList(cellList, actor, actor.stepStyle)
        }
        // Now look in each cell
        for (let i = 0; i < cellList.length; i++) {
          const cellToCheck = cellList[i]
          if (G_tic[cellToCheck] && G_tic[cellToCheck].length > 0) {
            // and look at every actor that is in that cell
            for (let j = 0; j < G_tic[cellToCheck].length; j++) {
              const AAInCell = G_tic[cellToCheck][j]
              const ACidx = activeActors[AAInCell].ACidx
              const hitThing_ap = actors[ACidx]
              const touchDamageToApply =
                AAInCell == AA_player_idx ? touchDamageToPlayer : touchDamageToNpcOrItem
              if (
                AAInCell != AA &&
                0 == MgbActor.intFromActorParam(hitThing_ap.content2.databag.item.pushToSlideNum) // Can't do touch damage to self or sliding blocks
              )
                this.applyDamageToActor(
                  AAInCell,
                  hitThing_ap,
                  touchDamageToApply,
                  MgbActor.intFromActorParam(ap.content2.databag.allchar.touchDamageAttackChance),
                )
            }
          }
        }
      }
    }
  },

  // This routine checks for aliveness, damageability, invulnerability, player armor and also plays sounds. Doesn't automatically calculate % chance of attack - sincethat depends on factors
  applyDamageToActor(
    actorIdx,
    ap,
    damage,
    attackChancePct = 100,
    playDamageSound = true, // returns true if the actor did receive damage
  ) {
    const { activeActors, AA_player_idx, ownerName } = this

    if (
      damage &&
      attackChancePct != 100 &&
      attackChancePct != 0 // 0 == 100%.. older objects have this value as 0 since it was introduced later
    )
      damage = 100 * Math.random() < attackChancePct ? damage : 0

    if (damage) {
      if (actorIdx == AA_player_idx) damage = this.reduceDamageByPlayerArmor(damage)
      if (
        activeActors[actorIdx].alive == false ||
        (MgbActor.alGainPowerType_Invulnerable == activeActors[actorIdx].activePower &&
          activeActors[actorIdx].activePowerUntilGetTime >= new Date().getTime()) //TODO - check why this used to be G_tweenSinceMapStarted
      )
        damage = 0
      if (MgbActor.intFromActorParam(ap.content2.databag.itemOrNPC.destroyableYN) != 1) damage = 0
    }
    if (damage) {
      activeActors[actorIdx].health -= damage
      if (playDamageSound)
        MgbActor.playCannedSound(ap.content2.databag.all.soundWhenHarmed, ap.content2, ownerName) // TODO: ap1.content2.databag.all.visualEffectWhenHarmedType
    }
    return damage != 0
  },

  reduceDamageByPlayerArmor(baseDamage) {
    const { inventory } = this
    let result = Math.floor(baseDamage * (100 - inventory.equipmentArmorEffect) / 100)
    if (result < 1 && baseDamage >= 1) result = Math.random() < result ? 1 : 0 // we'll turn this into a % chance to get 1 damage
    return result > 0 ? result : 0 // Never return a -ve number
  },
}

export default MagePlayGameDamage
