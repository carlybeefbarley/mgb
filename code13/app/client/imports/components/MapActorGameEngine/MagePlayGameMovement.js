// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on the Movement & Melee behaviors

import MgbActor from './MageMgbActor'
import BlockageMap from './MageBlockageMap'

// need to handle gameActions
const MagePlayGameMovement = {
  calculateNewPlayerPosition(stepStyleOverride) {
    const { activeActors, AA_player_idx, G_player_action, map } = this
    var plyr = activeActors[AA_player_idx]

    if (G_player_action.melee) this.startMeleeIfAllowed(plyr, true)

    if (!plyr.inMelee()) {
      // These actions can only be happen if the player is *not* in the middle of melee.
      // TODO: Should we queue up the keyboard input anyway?

      if (G_player_action.shoot && this.actorCanShoot(AA_player_idx)) {
        this.actorCreateShot(AA_player_idx)
        G_player_action.shoot = false
      }
      if (
        (stepStyleOverride == 0 || (stepStyleOverride == -1 && G_player_action.up)) &&
        plyr.y < map.metadata.height
      ) {
        plyr.y--
        plyr.stepStyle = 0
      }
      if ((stepStyleOverride == 2 || (stepStyleOverride == -1 && G_player_action.down)) && plyr.y >= 0) {
        plyr.y++
        plyr.stepStyle = 2
      }
      if ((stepStyleOverride == 3 || (stepStyleOverride == -1 && G_player_action.left)) && plyr.x >= 0) {
        plyr.x--
        plyr.stepStyle = 3
      }
      if (
        (stepStyleOverride == 1 || (stepStyleOverride == -1 && G_player_action.right)) &&
        plyr.x < map.metadata.width
      ) {
        plyr.x++
        plyr.stepStyle = 1
      }
    }
  },

  // AAi is the index into activeActors[] for this enemy/item
  // stepStyleOverride is -1 for no override, or 0..3 for an override    // TODO
  calculateNewEnemyPosition(AAi, stepStyleOverride = -1) {
    const { actors, activeActors, AA_player_idx } = this

    var enemyAA = activeActors[AAi]
    var enemy = actors[enemyAA.ACidx]

    if (enemyAA.isSliding) {
      if (enemyAA.isAShot && enemyAA.stepCount > enemyAA.shotRange) this.destroyShot(enemyAA)
      else if (
        !enemyAA.isAShot &&
        enemyAA.stepCount > MgbActor.intFromActorParam(enemy.content2.databag.item.pushToSlideNum)
      )
        this.playStopItemSliding(enemyAA)
      else {
        switch (enemyAA.stepStyle) {
          case 0:
            enemyAA.y--
            break // North
          case 1:
            enemyAA.x++
            break // East
          case 2:
            enemyAA.y++
            break // South
          case 3:
            enemyAA.x--
            break // West
        }
        enemyAA.stepCount++
      }
    } else if (stepStyleOverride != -1) {
      enemyAA.stepStyle = stepStyleOverride
      switch (enemyAA.stepStyle) {
        case 0:
          enemyAA.y--
          break // North
        case 1:
          enemyAA.x++
          break // East
        case 2:
          enemyAA.y++
          break // South
        case 3:
          enemyAA.x--
          break // West
      }
      enemyAA.stepCount++
    } else if (enemyAA.moveSpeed > 0 || (enemyAA.moveSpeed < 1 && Math.random() < enemyAA.moveSpeed)) {
      var t = MgbActor.intFromActorParam(enemy.content2.databag.npc.movementType)
      var aggroRange = MgbActor.intFromActorParam(enemy.content2.databag.npc.aggroRange)
      var tilesFromPlayerSquared =
        Math.pow(enemyAA.x - activeActors[AA_player_idx].x, 2) +
        Math.pow(enemyAA.y - activeActors[AA_player_idx].y, 2)

      if (aggroRange) {
        // This will become either alMovementType_Random or alMovementType_ToPlayer - depending on proximity. Range check using pythogras' theorem
        if (tilesFromPlayerSquared < Math.pow(aggroRange, 2)) t = MgbActor.alMovementType_ToPlayer
      }

      switch (t) {
        case MgbActor.alMovementType_None:
          break
        case MgbActor.alMovementType_Random:
          if (0 == enemyAA.stepCount || Math.random() < 0.1) {
            var moves = [-1, 0, 1, 2, 3]
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.upYN))
              moves.splice(moves.indexOf(0), 1)
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.rightYN))
              moves.splice(moves.indexOf(1), 1)
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.downYN))
              moves.splice(moves.indexOf(2), 1)
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.leftYN))
              moves.splice(moves.indexOf(3), 1)
            if (moves.length == 1) break

            enemyAA.stepStyle = moves[Math.floor(Math.random() * moves.length)] // Choose a direction
          }
          switch (enemyAA.stepStyle) {
            case 0: // North
              enemyAA.y--
              break
            case 1: // East
              enemyAA.x++
              break
            case 2: // South
              enemyAA.y++
              break
            case 3: // West
              enemyAA.x--
              break
            case -1: // No movement
              break
          }
          enemyAA.stepCount++
          break
        case MgbActor.alMovementType_ToPlayer:
          if (enemyAA.x < activeActors[AA_player_idx].x) {
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.rightYN)) break

            enemyAA.x++
            enemyAA.stepStyle = 1
          } else if (enemyAA.x > activeActors[AA_player_idx].x) {
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.leftYN)) break

            enemyAA.x--
            enemyAA.stepStyle = 3
          } else {
            if (enemyAA.y < activeActors[AA_player_idx].y) {
              if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.downYN)) break

              enemyAA.y++
              enemyAA.stepStyle = 2
            } else if (enemyAA.y > activeActors[AA_player_idx].y) {
              if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.upYN)) break

              enemyAA.y--
              enemyAA.stepStyle = 0
            }
          }
          break
        case MgbActor.alMovementType_FromPlayer:
          if (enemyAA.x < activeActors[AA_player_idx].x) {
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.rightYN)) break

            enemyAA.x--
            enemyAA.stepStyle = 1
          } else if (enemyAA.x > activeActors[AA_player_idx].x) {
            if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.leftYN)) break

            enemyAA.x++
            enemyAA.stepStyle = 3
          } else {
            if (enemyAA.y < activeActors[AA_player_idx].y) {
              if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.downYN)) break

              enemyAA.y--
              enemyAA.stepStyle = 2
            } else if (enemyAA.y > activeActors[AA_player_idx].y) {
              if (!MgbActor.intFromActorParam(enemy.content2.databag.allchar.upYN)) break

              enemyAA.y++
              enemyAA.stepStyle = 0
            }
          }
          break
        default:
          throw new Error('Unknown Actor MovementType in ' + enemy.name)
      }

      if (tilesFromPlayerSquared < 36) {
        // 36 = 6^2 - hardcoded but reasonable :)
        var meleeDamage1 = MgbActor.intFromActorParam(enemy.content2.databag.allchar.meleeDamageToPlayerNum)
        var meleeDamage2 = MgbActor.intFromActorParam(
          enemy.content2.databag.allchar.meleeDamageToNPCorItemNum,
        )
        if (meleeDamage1 > 0 || meleeDamage2 > 0) this.startMeleeIfAllowed(enemyAA, false)
      }

      if (this.actorCanShoot(AAi)) {
        t = MgbActor.intFromActorParam(enemy.content2.databag.npc.shotAccuracyType)
        var shotStepStyle
        if (t == MgbActor.alShotAccuracy_random || t == MgbActor.alShotAccuracy_poor)
          shotStepStyle = MgbActor.intFromActorParam(Math.random() * 4)
        else {
          // alShotAccuracy_good or alShotAccuracy_great
          if (enemyAA.x - activeActors[AA_player_idx].x < -1) shotStepStyle = 1
          else if (enemyAA.x - activeActors[AA_player_idx].x > 1) shotStepStyle = 3
          else {
            if (enemyAA.y - activeActors[AA_player_idx].y < -1) shotStepStyle = 2
            else if (enemyAA.y - activeActors[AA_player_idx].y > 1) shotStepStyle = 0
          }
        }
        this.actorCreateShot(AAi, shotStepStyle)
      }
    }
    // TODO: Needs to be much smarter, also need to handle speed > 1
  },

  startMeleeIfAllowed(
    actor,
    isPlayer, // actor is ActiveActor. return true if started ok
  ) {
    const { actors, inventory, ownerName } = this
    if (!actor.inMelee() && actor.turnsBeforeMeleeReady == 0) {
      var ms = null
      actor.meleeStep = 0
      var ap = actors[actor.ACidx]
      if (isPlayer) ms = inventory.equipmentMeleeSoundOverride
      MgbActor.playCannedSound(
        MgbActor.isSoundNonNull(ms) ? ms : ap.content2.databag.allchar.soundWhenMelee,
        ap.content2,
        ownerName,
      )
      return true
    }
    return false
  },

  // Each layer is handled specially as follows:
  // 1. layerBackground is just held in the map.mapLayer[layerBackground] array of cells
  // 2. layerActive is held in the activeActors array
  // 3. layerForeground isn't checked - by convention it's just for visual effect
  // Note that if the actor is the player and the obstruction is a pushable item, then we say not-obstructed..
  //    ...the tweening moves will resolve what action should occur
  checkIfActorObstructed(AAidxToCheck, checkActives = false) {
    const { actors, activeActors, AA_player_idx, map, backgroundBlockageMap } = this
    var obstructed = false
    var aa = activeActors[AAidxToCheck] // This is the actor that wants to move
    var aa_p = actors[aa.ACidx] // this is it's actor piece
    var cX = aa.cellSpanX + aa.x
    var cY = aa.cellSpanY + aa.y
    var mW = map.metadata.width
    var mH = map.metadata.height

    for (let x = aa.x; x < cX && x < mW && obstructed == false; x++) {
      for (let y = aa.y; y < cY && y < mH && obstructed == false; y++) {
        var cellToCheck = this.cell(x, y) // put this in a var to eliminate multiple lookups.

        // 1. Check the background layer. These don't change so we can work out behavior by the generic actorCache[] properties
        if (
          backgroundBlockageMap.isEntityBlocked(
            x,
            y,
            AA_player_idx == AAidxToCheck ? BlockageMap.ENTITY_PLAYER : BlockageMap.ENTITY_NPC,
          )
        )
          obstructed = true

        // 2. Check the activeActors. To do this we take advantage of the G_tic table
        if (checkActives && !obstructed) {
          if (!this.G_tic) this.generateTicTable() // Positions have changed enough that we have to update the tic table
          if (this.G_tic[cellToCheck] && this.G_tic[cellToCheck].length > 0) {
            for (let i = 0; i < this.G_tic[cellToCheck].length && !obstructed; i++) {
              var AAInCell = this.G_tic[cellToCheck][i]
              var ACidx = activeActors[AAInCell].ACidx
              var ap = actors[ACidx]
              if (activeActors[AAInCell].alive && AAInCell != AAidxToCheck) {
                var itemAct = MgbActor.intFromActorParam(ap.content2.databag.item.itemActivationType)
                if (AA_player_idx == AAidxToCheck) {
                  const aType = MgbActor.intFromActorParam(ap.content2.databag.all.actorType)
                  // Does this thing obstruct a player? (Slidable blocks aren't obstructions...)
                  if (
                    (itemAct == MgbActor.alItemActivationType_BlocksPlayer ||
                      itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC) &&
                    !(
                      aType == MgbActor.alActorType_NPC &&
                      MgbActor.intFromActorParam(ap.content2.databag.itemOrNPC.destroyableYN) == 1 &&
                      MgbActor.intFromActorParam(aa_p.content2.databag.allchar.touchDamageToNPCorItemNum) > 0
                    ) &&
                    ((aType != MgbActor.alActorType_Item && [4, 5, 6, 7].indexOf(aType) === -1) ||
                      0 == MgbActor.intFromActorParam(ap.content2.databag.item.pushToSlideNum))
                  )
                    obstructed = true
                } else {
                  // Does this thing obstruct an enemy?
                  if (
                    MgbActor.intFromActorParam(aa_p.content2.databag.all.actorType) ==
                      MgbActor.alActorType_Shot &&
                    (MgbActor.intFromActorParam(ap.content2.databag.all.actorType) ==
                      MgbActor.alActorType_Player ||
                      MgbActor.intFromActorParam(ap.content2.databag.all.actorType) ==
                        MgbActor.alActorType_NPC)
                  ) {
                    // enemies & players don't block bullets :)  - they get handled in the collision code
                  } else if (
                    MgbActor.intFromActorParam(ap.content2.databag.all.actorType) ==
                      MgbActor.alActorType_Shot &&
                    (MgbActor.intFromActorParam(aa_p.content2.databag.all.actorType) ==
                      MgbActor.alActorType_Player ||
                      MgbActor.intFromActorParam(aa_p.content2.databag.all.actorType) ==
                        MgbActor.alActorType_NPC)
                  ) {
                    // again, enemies & players don't block bullets - just checking with the order switched
                  } else if (AA_player_idx == AAInCell) {
                    // NPC is trying to occupy the same space as the player... is this OK?
                    if (MgbActor.intFromActorParam(aa_p.content2.databag.npc.canOccupyPlayerSpaceYN) == 1)
                      obstructed = false
                    else obstructed = true
                  } else if (
                    itemAct == MgbActor.alItemActivationType_BlocksNPC ||
                    itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC
                  )
                    obstructed = true
                }
              }
            }
          }
        }
      }
    }

    return obstructed
  },
}

export default MagePlayGameMovement
