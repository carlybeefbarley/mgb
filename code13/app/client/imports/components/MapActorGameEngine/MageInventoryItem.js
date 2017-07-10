import MgbActor from './MageMgbActor'

// Note on equipping and counts: If an item is equipped
// and count > 1, then we show
//    1         in the equipped list, and
//    count-1   in the inventory list

export default class InventoryItem {
  /**
   * Creates an instance of InventoryItem.
   * 
   * @param {MgbActor} actor
   * @param {Boolean} [equipped=false]
   * @param {int} [count=1]
   * 
   * @memberOf InventoryItem
   */
  constructor(actor, equipped = false, count = 1) {
    this.actor = actor // Actor for this item
    this.equipped = equipped // True if this is equipped
    this.count = count // Number of them carried
  }

  get name() {
    return this.actor ? this.actor.name : null
  }

  get image() {
    return this.actor ? this.actor._image : null
  }

  // return description. If no description field, then use the actor name
  get description() {
    if (!this.actor) return null

    var desc = MgbActor.stringFromActorParam(this.actor.content2.databag.all.description)
    return desc && desc.length > 0 ? desc : this.actor.name
  }

  get equippable() {
    return (
      this.actor && MgbActor.intFromActorParam(this.actor.content2.databag.item.inventoryEquippableYN) === 1
    )
  }

  get usable() {
    if (!this.actor) return null

    var activation = MgbActor.intFromActorParam(this.actor.content2.databag.item.itemActivationType)
    return activation === MgbActor.alItemActivationType_PlayerPicksUpUsesLater && this.equippable === false
  }

  get autoEquippable() {
    return this.equippable && MgbActor.intFromActorParam(this.actor.content2.databag.item.autoEquipYN) == 1
  }

  get equipSlot() {
    if (this.actor && this.equippable)
      return MgbActor.stringFromActorParam(this.actor.content2.databag.item.inventoryEquipSlot)
    else return null
  }

  get equipDescription() {
    var s = this.equipSlot
    return (this.equippable ? 'Equippable' : '') + (s ? ' in ' + s : '')
  }
}
