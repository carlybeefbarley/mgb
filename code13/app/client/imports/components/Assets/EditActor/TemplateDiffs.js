//
// This file defines templates for Actors. They are defined as diffs from the defaultActor defined in getDefaultActor.js
//

const TemplateDiffs = {
  // basic
  alTemplateScenery: {}, // this is base template as defined in getDefaultActor.js

  alTemplatePlayer: {
    all: { actorType: '0' },
    allchar: { movementSpeedNum: '1' },
    item: { itemActivationType: '3' },
    itemOrNPC: { destroyableYN: '1' },
  },

  alTemplateEnemy: {
    all: { actorType: '1' },
    allchar: { movementSpeedNum: '1' },
    item: { itemActivationType: '3' },
    itemOrNPC: { destroyableYN: '1' },
    npc: { movementType: '1' },
  },

  alTemplateFriend: {
    all: { actorType: '1' },
    item: { itemActivationType: '3' },
  },

  alTemplateSolidObject: {
    all: { actorType: '6' },
    item: { itemActivationType: '3' },
  },

  alTemplateFloor: {
    all: { actorType: '7' },
    item: { itemActivationType: '0' },
  },

  alTemplateItem: {
    all: { actorType: '5' },
    item: { itemActivationType: '5' },
  },

  alTemplateShot: {
    all: { actorType: '3' },
    item: { itemActivationType: '0' },
  },

  /*
   // player
   // this is for FG tile same as floor
   //alTemplateFloor: { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"0" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplatePlayer_Shoots:      { "allchar": { "shotRateNum":"5", "shotRangeNum":"10", "shotActor":"!!CHOOSE ACTOR!!", "shotDamageToNPCorItemNum":"10" } },
   //alTemplateShot
   alTemplatePlayer_TouchDamage: { "allchar": { "touchDamageToNPCorItemNum":"10" } },
   alTemplatePlayer_MeleeDamage: { "allchar": { "meleeDamageToNPCorItemNum":"10" } },
   alTemplateProjectileWeapon:   { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "inventoryEquipSlot":"weapon", "equippedNewShotActor":"!!CHOOSE ACTOR!!", "equippedNewShotDamageBonusNum":"10", "equippedNewShotRateBonusNum":"5", "equippedNewShotRangeBonusNum":"6" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateShotModifier:       { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "equippedNewShotDamageBonusNum":"10", "equippedNewShotRateBonusNum":"5", "equippedNewShotRangeBonusNum":"6" }, "itemOrNPC": { "destroyableYN":"0" } },

   // equipment
   alTemplateMeleeWeapon:         { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "inventoryEquipSlot":"weapon", "equippedNewActorGraphics":"!!CHOOSE ACTOR!!", "equippedNewMeleeDamageBonusNum":"10", "equippedNewMeleeRepeatDelayModifierNum":"-1" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateMeleeWeaponModifier: { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "equippedNewMeleeDamageBonusNum":"10", "equippedNewMeleeRepeatDelayModifierNum":"-1" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateArmor:               { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "inventoryEquipSlot":"armor", "equippedArmorEffect":"10" }, "itemOrNPC": { "destroyableYN":"0" } },

   // enemies
   alTemplateEnemy_TouchDamage:    { "all": { "actorType":"2" }, "item": { "itemActivationType":"4", "inventoryEquippableYN":"1", "inventoryEquipSlot":"armor", "equippedArmorEffect":"10" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateEnemy_Shoots:         { "all": { "actorType":"1" }, "allchar": { "shotRateNum":"5", "shotRangeNum":"10", "shotActor":"!!CHOOSE ACTOR!!", "shotDamageToPlayerNum":"10" }, "npc": { "movementType":"1" } },
   alTemplateEnemy_ShootsFromAfar: { "all": { "actorType":"1" }, "allchar": { "shotRateNum":"5", "shotRangeNum":"10", "shotActor":"!!CHOOSE ACTOR!!", "shotDamageToPlayerNum":"10" }, "npc": { "movementType":"3" } },
   alTemplateEnemyGenerator:       { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"0" }, "itemOrNPC": { "destroyableYN":"0", "dropsObjectRandomlyName":"!!CHOOSE ACTOR!!", "dropsObjectRandomlyChance":"5" } },
   alTemplateEnemy_TouchDamageHuntsPlayer: { "all": { "actorType":"1" }, "allchar": { "touchDamageToPlayerNum":"10" }, "npc": { "movementType":"2" } },

   // Floors & Pushers
   //alTemplateFloor
   //alTemplateIce
   alTemplateBounce:        { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"5" } },
   alTemplatePusher_Random: { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"6" } },
   alTemplateFloor_Damager: { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"9", "healOrHarmWhenUsedNum":"10" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplatePusher_North:  { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"0" } },
   alTemplatePusher_East:   { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"1" } },
   alTemplatePusher_South:  { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"2" } },
   alTemplatePusher_West:   { "all": { "actorType":"2" }, "item":    { "itemActivationType":"8", "itemPushesActorType":"3" } },

   // Walls & Blocks
   //alTemplateWall
   alTemplateWall_BlocksPlayer: { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"1" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateWall_BlocksNPC:    { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"2" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateDoor:              { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "keyForThisDoor":"!!CHOOSE ACTOR!!" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateWall_Conditional:  { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"0" }, "itemOrNPC": { "destroyableYN":"0", "appearIf":"1", "conditionsActor":"!!CHOOSE ACTOR!!" } },
   //alTemplateSlidingBlock

   // Items
   alTemplateItem_MaxHealthBoost:     { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"5", "increasesMaxHealthNum":"5" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_HealNow:            { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"5", "healOrHarmWhenUsedNum":"10" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_HealLater:          { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"4", "healOrHarmWhenUsedNum":"10" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_InvincibilityNow:   { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"5", "gainPowerType":"1", "gainPowerSecondsNum":"20", "useText":"I feel invincible!!" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_InvincibilityLater: { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"4", "gainPowerType":"1", "gainPowerSecondsNum":"20", "useText":"An invincibilty potion!!" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_ScorePoints:        { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"5", "gainOrLosePointsNum":"1" }, "itemOrNPC": { "destroyableYN":"0" } },
   alTemplateItem_VictoryNow:         { "all": { "actorType":"2" }, "allchar": { "movementSpeedNum":"0" }, "item": { "itemActivationType":"5", "winLevelYN":"1" }, "itemOrNPC": { "destroyableYN":"0" } }
   */
}

export default TemplateDiffs
