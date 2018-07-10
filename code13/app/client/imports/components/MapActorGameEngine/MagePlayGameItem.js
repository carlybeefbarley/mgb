import MgbMap from './MageMgbMap'
import MgbActor from './MageMgbActor'
import ActiveActor from './MageActiveActorClass'

// This code will be incoporated by MagePlayGame.js so that it becomes part of the MagePlayGame class
// This file contains the part of the class that is primarily focussed on Items and their behaviors

const MagePlayGameItem = {
  useItemOnPlayer(itemAA) {
    const { actors, activeActors } = this
    var itemAP = actors[activeActors[itemAA].ACidx]
    this.useItemActorOnPlayer(itemAP)
  },

  useItemActorOnPlayer(
    itemAP, // This just handles the effects on the player, not the resulting effects (visuals, messages, destruction etc) on the item
  ) {
    const { actors, activeActors, AA_player_idx, ownerName } = this
    var increasesMaxHealth = MgbActor.intFromActorParam(itemAP.content2.databag.item.increasesMaxHealthNum)
    if (increasesMaxHealth && activeActors[AA_player_idx].maxHealth != 0) {
      activeActors[AA_player_idx].maxHealth += increasesMaxHealth
      var ap = actors[activeActors[AA_player_idx].ACidx]
      MgbActor.playCannedSound(
        increasesMaxHealth > 0
          ? ap.content2.databag.all.soundWhenHealed
          : ap.content2.databag.all.soundWhenHarmed,
        ap.content2,
        ownerName,
      )
      // TODO: Player's content2.databag.all.visualEffectWhenHarmedType / content2.databag.all.visualEffectWhenHealedType
    }

    var heal = MgbActor.intFromActorParam(itemAP.content2.databag.item.healOrHarmWhenUsedNum)
    var playHarmedSound = true
    if (heal) {
      if (heal < 0 && activeActors[AA_player_idx].activePower == MgbActor.alGainPowerType_Invulnerable) {
        heal = 0
        playHarmedSound = false
      }

      activeActors[AA_player_idx].health += heal
      ap = actors[activeActors[AA_player_idx].ACidx]
      if (heal > 0) {
        MgbActor.playCannedSound(ap.content2.databag.all.soundWhenHealed, ap.content2, ownerName)
      } else {
        if (playHarmedSound) {
          MgbActor.playCannedSound(ap.content2.databag.all.soundWhenHarmed, ap.content2, ownerName)
        }
      }
      // TODO: ap1.content2.databag.all.visualEffectWhenHarmedType
      // TODO: Player's content2.databag.all.visualEffectWhenHarmedType / content2.databag.all.visualEffectWhenHealedType
    }
    if (1 == MgbActor.intFromActorParam(itemAP.content2.databag.item.gainExtraLifeYN)) {
      activeActors[AA_player_idx].extraLives++
      // TODO: content2.databag.all.visualEffectWhenHealedType
    }
    var points = MgbActor.intFromActorParam(itemAP.content2.databag.item.gainOrLosePointsNum)
    if (points) {
      activeActors[AA_player_idx].score += points
    }
    if (1 == MgbActor.intFromActorParam(itemAP.content2.databag.item.winLevelYN)) {
      activeActors[AA_player_idx].winLevel = true
    }
    var power = MgbActor.intFromActorParam(itemAP.content2.databag.item.gainPowerType)
    if (power) {
      // Note, this just replaces any previous power; there is no accumulation of concurrent powers...
      activeActors[AA_player_idx].activePower = power
      var powersecs = MgbActor.intFromActorParam(itemAP.content2.databag.item.gainPowerSecondsNum)
      var nowMS = new Date().getTime()
      if (0 == powersecs)
        activeActors[AA_player_idx].activePowerUntilGetTime = nowMS * 10 // 10 times 1970-to-now :)
      else activeActors[AA_player_idx].activePowerUntilGetTime = nowMS + powersecs * 1000 //1000ms=1s
    }
  },

  inventoryDialogActionHandler(action, item) {
    if (!item) return
    const { activeActors, AA_player_idx } = this
    switch (action) {
      case 'DESTROY':
        this.inventory.remove(item)
        break
      case 'DROP':
        // Find an adjacent free space
        var p = this.findAdjacentFreeCellForDrop(AA_player_idx, activeActors[AA_player_idx].stepStyle)
        if (p) {
          this.playSpawnNewActor(item.actor.name, p.x, p.y, true, true) // @@@@@@ CHANGE TO TRUE -- SO DROPS NOW PERSIST?
          this.inventory.remove(item)
        }
        this.hideInventory()
        break
      case 'EQUIP':
        this.inventory.equip(item, !item.equipped)
        break
      case 'USE':
        this.useItemActorOnPlayer(item.actor)
        this.inventory.remove(item)
        this.hideInventory() // This way the effect is immediate
        break
    }
  },

  /**
   *
   *
   * @param {int} AAindexOfActorWhoIsDroppingAnItem
   * @param {int} preferredDirection - As a 'stepstyle'
   * @param {Boolean} [CheckActiveLayer=false] - Need to explicitly ask for the Active layer to be checked
   * @returns {Point}
   */
  findAdjacentFreeCellForDrop(
    AAindexOfActorWhoIsDroppingAnItem,
    preferredDirection,
    CheckActiveLayer = false,
  ) {
    const { activeActors } = this

    var aa = activeActors[AAindexOfActorWhoIsDroppingAnItem]
    var goodPoint = null

    for (let d = 0; d < 4; d++) {
      var r = this._nextPoint(aa.x, aa.y, aa.cellSpanX, aa.cellSpanY, d)
      if (false === this._isObstructedForThisDrop(r.x, r.y, CheckActiveLayer)) {
        if (d == preferredDirection) return r
        else goodPoint = r
      }
    }
    return goodPoint // can be null
  },

  /**
   *
   *
   * @param {int} x
   * @param {int} y
   * @param {int} w
   * @param {int} h
   * @param {int} stepStyle
   * @returns {Point}
   */
  _nextPoint(
    x,
    y,
    w,
    h,
    stepStyle, // TODO - - handle larger sizes for drops
  ) {
    var r = { x, y }

    switch (stepStyle) {
      case 0:
        r.y--
        break
      case 1:
        r.x += w
        break
      case 2:
        r.y += h
        break
      case 3:
        r.x--
        break
    }
    return r
  },

  /**
   *
   *
   * @param {int} x
   * @param {int} y
   * @param {Boolean} CheckActiveLayer
   * @returns {Boolean}
   */
  _isObstructedForThisDrop(x, y, CheckActiveLayer) {
    const { map, actors, activeActors } = this
    var obstructed = false // until we prove otherwise
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return true // doh!

    var cellToCheck = this.cell(x, y)
    var ACidx = map.mapLayer[MgbMap.layerBackground][cellToCheck]
    // 1. Check the background layer. These don't change so we can work out behavior by the generic actorCache[] properties
    if (ACidx) {
      var ap = actors[ACidx]
      if (ap) {
        var itemAct = MgbActor.intFromActorParam(ap.content2.databag.item.itemActivationType)
        if (
          itemAct == MgbActor.alItemActivationType_BlocksPlayer ||
          itemAct == MgbActor.alItemActivationType_BlocksPlayerAndNPC
        )
          obstructed = true
      }
    }

    // 2. Check actives

    if (CheckActiveLayer && !obstructed) {
      for (let AA = 0; AA < activeActors.length && !obstructed; AA++) {
        var actor = activeActors[AA]
        if (actor.alive && actor.x == x && actor.y == y) obstructed = true
      }
    }

    return obstructed
  },
}

export default MagePlayGameItem
