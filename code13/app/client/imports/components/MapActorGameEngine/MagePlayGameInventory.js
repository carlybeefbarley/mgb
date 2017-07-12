import InventoryItem from './MageInventoryItem'
import MgbActor from './MageMgbActor'

class EquipmentEffects {
  constructor() {
    this.newActorGraphics = null // null or non-empty String

    this.shotActor = null // null or non-empty String
    this.shotSound = null // null or non-empty String
    this.shotDamageBonus = 0
    this.shotRateBonus = 0
    this.shotRangeBonus = 0

    this.armorEffect = 0

    this.meleeDamageBonus = 0
    this.meleeSound = null // null or non-empty String
    this.meleeRepeatDelayModifier = 0
  }
}

export default class Inventory {
  constructor(handleForceInventoryUpdateFn) {
    this.equipEffects = new EquipmentEffects()
    this._invArray = []
    this.fullEquipmentEffectSummary = ''
    this._handleForceInventoryUpdateFn = handleForceInventoryUpdateFn
  }

  _refreshInventoryUi() {
    this._handleForceInventoryUpdateFn()
  }

  /**
   * get
   *
   * @param {String} name
   * @returns {InventoryItem}
   *
   * @memberOf Inventory
   */
  get(name) {
    for (let i = 0; i < this._invArray.length; i++) {
      if (this._invArray[i] && this._invArray[i].name == name) return this._invArray[i]
    }
    return null
  }

  /**
   *
   *
   * @param {String} name
   * @returns {int}   -1 == Not Found
   *
   * @memberOf Inventory
   */
  _getIdx(name) {
    for (let i = 0; i < this._invArray.length; i++)
      if (this._invArray[i] && this._invArray[i].name == name) return i
    return -1
  }

  /**
   * add
   *
   * @param {InventoryItem} item
   * @returns {void}
   *
   * @memberOf Inventory
   */
  add(item) {
    const found = this.get(item.name)
    if (found) found.count += item.count ? parseInt(item.count) : 0
    else {
      this._invArray.push(item) // should actually fill in gaps
      if (item.autoEquippable) {
        // Hmm, autoEquips!
        var unequipped = this.equip(item) // Note that this can unequip the previous autoEquipped item. That will then go into inventory but we'll nuke it since these aren't meant to hang around
        if (unequipped) this.remove(unequipped, unequipped.count)
      }
    }
    this._refreshInventoryUi()
  }

  //
  /**
   * equip will handle the 'slot' type automatically. If there's another item already equipped in the same slot, that will be unequipped
   * parameter 'state' says it move to equipped state (true) or unequipped (false)
   *
   * @param {InventoryItem} item
   * @param {Boolean} [state=true]
   * @returns {InventoryItem}
   *
   * @memberOf Inventory
   */
  equip(item, state = true) {
    let returnedUnequippedItem = null
    // Do we really have this item, and is it equippable?
    const found = this.get(item.name)
    if (found && found.equippable) {
      // Yes we do, and it is equippabble. So equip it!
      found.equipped = state

      // Do we need to worry about unequipping something else that was already equipped in this slot?
      if (state && (found.equipSlot || found.autoEquippable)) {
        // We should go through now and unequip any other items that were already equipped in this slot

        for (let i = 0; i < this._invArray.length; i++) {
          if (this._invArray[i]) {
            var maybeItemInSameSlot = this._invArray[i]
            if (maybeItemInSameSlot.equipped == true && maybeItemInSameSlot.name != found.name) {
              if (found.autoEquippable) {
                if (maybeItemInSameSlot.autoEquippable) {
                  maybeItemInSameSlot.equipped = false
                  returnedUnequippedItem = maybeItemInSameSlot
                }
              } else if (found.equipSlot) {
                if (maybeItemInSameSlot.equipSlot === found.equipSlot) {
                  maybeItemInSameSlot.equipped = false
                  returnedUnequippedItem = maybeItemInSameSlot
                }
              }
            }
          }
        }
      }
    }
    this._recalculateEquipmentEffects()
    this._refreshInventoryUi()

    return returnedUnequippedItem
  } // Return value is any item that was consequently unequipped

  /**
   *
   *
   * @param {String} itemName
   * @param {int} [count=1]
   * @returns {Boolean} return true if the item was present and removed
   *
   * @memberOf Inventory
   */
  removeByName(itemName, count) {
    var removed = false
    const found = this._getIdx(itemName)
    if (found !== -1) {
      var heldItem = this._invArray[found]
      if (count < heldItem.count) heldItem.count -= count
      else this._invArray[found] = null
      removed = true
    }
    this._recalculateEquipmentEffects()
    this._refreshInventoryUi()

    return removed
  }

  /**
   *
   *
   * @param {InventoryItem} item
   * @param {int} [count=1]
   * @returns {Boolean} return true if the item was present and removed
   *
   * @memberOf Inventory
   */
  remove(item, count = 1) {
    return this.removeByName(item.name, count)
  }

  /**
   *
   *
   *
   * @memberOf Inventory
   */
  _recalculateEquipmentEffects() {
    const { equipEffects, _invArray } = this

    equipEffects.shotActor = null
    equipEffects.shotSound = null
    equipEffects.newActorGraphics = null
    equipEffects.shotDamageBonus = 0
    equipEffects.shotRateBonus = 0
    equipEffects.shotRangeBonus = 0
    equipEffects.armorEffect = 0
    equipEffects.meleeDamageBonus = 0
    equipEffects.meleeRepeatDelayModifier = 0
    equipEffects.meleeSound = null

    let autoEquippedItemProcessed = false
    for (let i = 0; i < _invArray.length; i++) {
      if (_invArray[i]) {
        var item = _invArray[i]
        if (item.equipped) {
          var s = this.ifRealString(item.actor.content2.databag.item.equippedNewShotActor)
          if (s && (equipEffects.shotActor == null || !autoEquippedItemProcessed)) equipEffects.shotActor = s

          s = this.ifRealString(item.actor.content2.databag.item.equippedNewShotSound)
          if (s && (equipEffects.shotSound == null || !autoEquippedItemProcessed)) equipEffects.shotSound = s

          s = this.ifRealString(item.actor.content2.databag.item.equippedNewActorGraphics)
          if (s && (equipEffects.newActorGraphics == null || !autoEquippedItemProcessed))
            equipEffects.newActorGraphics = s

          equipEffects.shotDamageBonus += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedNewShotDamageBonusNum,
          )
          equipEffects.shotRateBonus += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedNewShotRateBonusNum,
          )
          equipEffects.shotRangeBonus += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedNewShotRangeBonusNum,
          )
          equipEffects.armorEffect += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedArmorEffect,
          )

          // Melee
          equipEffects.meleeDamageBonus += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedNewMeleeDamageBonusNum,
          )
          s = this.ifRealString(item.actor.content2.databag.item.equippedNewMeleeSound)
          if (s && (equipEffects.meleeSound == null || !autoEquippedItemProcessed))
            equipEffects.meleeSound = s
          equipEffects.meleeRepeatDelayModifier += MgbActor.intFromActorParam(
            item.actor.content2.databag.item.equippedNewMeleeRepeatDelayModifierNum,
          )

          if (item.autoEquippable) autoEquippedItemProcessed = true // This ensures this piece will always get priority for the non-cumulative effects
        }
      }
    }

    if (equipEffects.armorEffect > 100) equipEffects.armorEffect = 100 // It's a percentage

    this._update_fullEquipmentEffectSummary()
  }

  _update_fullEquipmentEffectSummary() {
    const { equipEffects } = this

    var s = ''
    var sep = '. '
    if (equipEffects.shotActor) s += 'Shoots ' + equipEffects.shotActor + sep
    if (equipEffects.shotDamageBonus)
      s += 'Shot damage ' + this._signNumber(equipEffects.shotDamageBonus) + sep
    if (equipEffects.shotRateBonus) s += 'Shot rate ' + this._signNumber(equipEffects.shotRateBonus) + sep
    if (equipEffects.shotRangeBonus) s += 'Shot Range ' + this._signNumber(equipEffects.shotRangeBonus) + sep
    if (equipEffects.armorEffect) s += 'Armor ' + equipEffects.armorEffect + '%' + sep

    if (equipEffects.meleeDamageBonus) s += 'Melee Damage +' + equipEffects.meleeDamageBonus + sep

    if (equipEffects.meleeRepeatDelayModifier)
      s +=
        (equipEffects.meleeRepeatDelayModifier > 0 ? 'Increase' : 'Decrease') +
        ' melee attack rate by ' +
        Math.abs(equipEffects.meleeRepeatDelayModifier) +
        sep

    this.fullEquipmentEffectSummary = s
  }

  get equipmentShotActorOverride() {
    return this.equipEffects.shotActor
  }

  get equipmentShotSoundOverride() {
    return this.equipEffects.shotSound
  }

  get equipmentShotRateBonus() {
    return this.equipEffects.shotRateBonus
  }

  get equipmentShotRangeBonus() {
    return this.equipEffects.shotRangeBonus
  }

  get equipmentShotDamageBonus() {
    return this.equipEffects.shotDamageBonus
  }

  get equipmentNewActorGraphics() {
    return this.equipEffects.newActorGraphics
  }

  get equipmentArmorEffect() {
    return this.equipEffects.armorEffect
  }

  // Melee
  get equipmentMeleeDamageBonus() {
    return this.equipEffects.meleeDamageBonus
  }

  get equipmentMeleeSoundOverride() {
    return this.equipEffects.meleeSound
  }

  get equipmentMeleeRepeatDelayModifier() {
    return this.equipEffects.meleeRepeatDelayModifier
  }

  // Utils

  _signNumber(i) {
    //debugger
    return (i > 0 ? '+' : '') + i.toString()
  }

  ifRealString(s) {
    return s && s != '' ? s : null // Basically, turn '' into null
  }
}
