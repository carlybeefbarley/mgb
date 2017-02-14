export default () => {
  return {
      "databag": {
        "all": {
          "actorType": "0",
          "description": "",
          "name": "",
          "initialHealthNum": "1",
          "initialMaxHealthNum": "0",
          "gravityYN": "0",
          "soundWhenHarmed": '[builtin]:none',
          "soundWhenHealed": '[builtin]:none',
          "soundWhenKilled": '[builtin]:none',
          "visualEffectWhenHarmedType": "0",
          "visualEffectWhenHealedType": "0",
          "visualEffectWhenKilledType": "0",
          "defaultGraphicName": ""
        },
        "allchar": {
          "movementSpeedNum": "1",
          "upYN": "1",
          "downYN": "1",
          "leftYN": "1",
          "rightYN": "1",
          "shotRateNum": "1",
          "shotRangeNum": "1",
          "soundWhenShooting": '[builtin]:none',
          "shotActor": "",
          "pushYN": "0",
          "jumpYN": "0",
          "shotDamageToPlayerNum": "0",
          "shotDamageToNPCorItemNum": "0",
          "touchDamageToPlayerNum": "0",
          "touchDamageToNPCorItemNum": "0",
          "touchDamageAttackChance": "100",
          "touchDamageCases": "0",
          //"meleeYN": "1",
          "meleeDamageToPlayerNum": "0",
          "meleeDamageToNPCorItemNum": "0",
          "soundWhenMelee": '[builtin]:none',
          "meleeRepeatDelay": "0"
        },
        "playercharacter": "",
        "npc": {
          "movementType": "0",
          "aggroRange": "0",
          "canOccupyPlayerSpaceYN": "0",
          "shotAccuracyType": "0",
          "talkText": "",
          "talkTextFontIndex": "0",
          "responseChoice1": "",
          "takesObjectOnChoice1": "",
          "takesObjectCountOnChoice1Num": "1",
          "takeObjectTypeOnChoice1": "0",
          "dropsObjectOnChoice1": "",
          "responseChoice1DropPersistsYN": "0",
          "responseChoice1StayYN": "1",
          "saysWhatOnChoice1": "",
          "responseChoice2": "",
          "takesObjectOnChoice2": "",
          "takesObjectCountOnChoice2Num": "1",
          "takeObjectTypeOnChoice2": "0",
          "dropsObjectOnChoice2": "",
          "responseChoice2DropPersistsYN": "0",
          "responseChoice2StayYN": "1",
          "saysWhatOnChoice2": "",
          "responseChoice3": "",
          "takesObjectOnChoice3": "",
          "takesObjectCountOnChoice3Num": "1",
          "takeObjectTypeOnChoice3": "0",
          "dropsObjectOnChoice3": "",
          "responseChoice3DropPersistsYN": "0",
          "responseChoice3StayYN": "1",
          "saysWhatOnChoice3": ""
        },
        "item": {
          "itemActivationType": "3",
          "inventoryEquippableYN": "0",
          "inventoryEquipSlot": "",
          "visualEffectWhenUsedType": "0",
          "pushToSlideNum": "0",
          "squishPlayerYN": "0",
          "squishNPCYN": "0",
          "healOrHarmWhenUsedNum": "0",
          "increasesMaxHealthNum": "0",
          "gainExtraLifeYN": "0",
          "gainOrLosePointsNum": "0",
          "winLevelYN": "0",
          "gainPowerType": "0",
          "gainPowerSecondsNum": "0",
          "useText": "",
          "itemPushesActorType": "4",
          "itemPushesActorDistance": "1",
          "keyForThisDoor": "",
          "keyForThisDoorConsumedYN": "0",
          "autoEquipYN": "0",
          "equippedNewActorGraphics": "",
          "equippedNewShotActor": "",
          "equippedNewShotSound": '[builtin]:none',
          "equippedNewShotDamageBonusNum": "0",
          "equippedNewShotRateBonusNum": "0",
          "equippedNewShotRangeBonusNum": "0",
          "equippedArmorEffect": "0",
          "equippedNewMeleeDamageBonusNum": "0",
          "equippedNewMeleeSound": '[builtin]:none',
          "equippedNewMeleeRepeatDelayModifierNum": "0"
        },
        "itemOrNPC": {
          "destroyableYN": "1",
          "scoreOrLosePointsWhenShotByPlayerNum": "0",
          "scoreOrLosePointsWhenKilledByPlayerNum": "0",
          "dropsObjectWhenKilledName": "",
          "dropsObjectWhenKilledChance": "100",
          "dropsObjectWhenKilledName2": "",
          "dropsObjectWhenKilledChance2": "100",
          "dropsObjectRandomlyName": "",
          "dropsObjectRandomlyChance": "100",
          "respawnOption": "0",
          "appearIf": "0",
          "appearCount": "0",
          "conditionsActor": ""
        }
      },
      "animationTable": [
        {
          "action": "face north",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step north 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step north 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step north 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step north 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "face east",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step east 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step east 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step east 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step east 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "face south",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step south 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step south 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step south 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step south 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "face west",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step west 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step west 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step west 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "step west 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 9",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 10",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 11",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 12",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 13",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 14",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 15",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary 16",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee north 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee east 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee south 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "melee west 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 9",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 10",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 11",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 12",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 13",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 14",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 15",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary north 16",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 9",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 10",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 11",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 12",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 13",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 14",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 15",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary east 16",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 9",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 10",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 11",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 12",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 13",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 14",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 15",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary south 16",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 1",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 2",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 3",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 4",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 5",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 6",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 7",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 8",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 9",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 10",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 11",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 12",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 13",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 14",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 15",
          "tileName": "",
          "effect": "no effect"
        },
        {
          "action": "stationary west 16",
          "tileName": "",
          "effect": "no effect"
        }
      ]
  }
}
