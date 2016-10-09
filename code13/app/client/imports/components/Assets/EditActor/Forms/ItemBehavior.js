import React from 'react'
import BaseForm from '../BaseForm.js'

import DropArea from '../components/DropArea.js'
import SmallDD from '../components/SmallDD.js'
/*
 {this.text("Movement speed", 'movementSpeed', "number")}
 {this.bool("Can Move Up \u2191", 'upYN')}
 {this.bool("Can Move Down \u2193", 'downYN')}
 {this.bool("Can Move Left \u2190", 'leftYN')}
 {this.bool("Can Move Right \u2192", 'rightYN')}
 <hr />
 {this.dropArea("Actor For Shots", 'shotActor', "actor")}
 <hr />
 {this.text("Touch Damage Against Players", 'touchDamageToPlayerNum', "number")}
 {this.text("Touch Damage Against NPCS", 'touchDamageToNPCorItemNum', "number")}
 {this.text("Touch Damage Attack chance", 'touchDamageAttackChance', "number")}

 {this.options("Touch Damage Cases", 'touchDamageCases', [
 {text: "When overlapping target", value: "0"},
 {text: "When facing target", value: "1"},
 {text: "When adjacent to target", value: "2"},
 ])}
 <hr />

 {this.text("Melee Damage Against Player", 'meleeDamageToPlayerNum', "number")}
 {this.text("Melee Damage Against Npc", 'meleeDamageToNPCorItemNum', "number")}
 {this.text("Melee Repeat Delay", 'meleeRepeatDelay', "number")}

 {this.dropArea("Sound Effect Melee", 'soundWhenMelee', "sound")}
 }*/

export default class ItemBehavior extends BaseForm {
  get data(){
    return this.props.asset.content2.databag.item
  }
  showInventoryOptions(){
    return (
      <div>
        {this.text("Equipment slot", "inventoryEquipSlot", "text", {
          title: "Enter a string such as 'weapon' or 'right hand'. The player can only equip one item of any 'slot' at a time"
        })}

        {this.dropArea("New actor graphics", "equippedNewActorGraphics","actor", {
          title:"When equipped, use this actor's graphics (base tile &amp; all animations) to show the player. For example, if this item is a weapon, you may have a new set of actor graphics where the actor is carrying the weapon. Sorry, but only one equipped item can override the actor at a time - so choose wisely which slot you want to use this feature with (usually weapons). You can choose ANY actor type for this, since only the graphics of that actor will be use, and all actor types define graphics"
        })}
        {this.data.equippedNewActorGraphics &&
        <div>Note: It is recommended that items that can change the player look should use a slot called 'change_player_look'. This is because only one equipped item can only change how the player looks.</div>
        }

        {this.bool("Auto-equip item", 'autoEquipYN', {
          title: "If yes, then this item is special and automatically is equipped when picked up by the player. It is useful for items like cars, horses, etc. Also, it cannot be explicitly unequipped by the user - it is only changed by another similar item"
        })
        }

        {this.dropArea("New shot type", "equippedNewShotActor", "actor", {
          title: "When equipped, use this 'shot actor' as the shot"
        })}

        {this.dropArea("New Shot sound", "equippedNewShotSound", "sound", {
          title: "When equipped, use this as the shot sound"
        })}

        {this.text("Shot damage bonus", 'equippedNewShotDamageBonusNum', "number", {
          title: "When equipped, increase base shot damage by this amount",
          min: -1000,
          max: 1000
        })}

        {this.text("Shot rate bonus", 'equippedNewShotDamageBonusNum', "number", {
          title: "When equipped, increase base shot rate by this amount",
          min: -20,
          max: 20
        })}
        {this.text("Shot range bonus", 'equippedNewShotRangeBonusNum', "number", {
          title: "When equipped, increase base shot range by this amount",
          min: -20,
          max: 20
        })}
        {this.text("Armor effect", 'equippedArmorEffect', "number", {
          title: "When equipped, Reduce damage by this percentage",
          min: -100, // cursed blade? :) originally 0
          max: 100
        })}
        {this.text("Melee Damage Bonus", 'equippedNewMeleeDamageBonusNum', "number", {
          title: "When equipped, Increase Melee damage by this number of points. You can also have a negative value - that this item reduces damage - for example a weapon might be fast but reduce base damage",
          min: -100,
          max: 100
        })}
        {this.dropArea("New Melee sound", "equippedNewMeleeSound", "sound", {
          title: "When equipped, use this as the shot sound"
        })}
        {this.text("Melee Repeat rate modifier", 'equippedNewMeleeDamageBonusNum', "number", {
          title: "This raises or lowers the Melee repeat rate of the character who has equipped the item. If the value is zero, there is no change to melee repeat rate. A positive number increases the delay, a negative number reduces the delay",
          min: -10,
          max: 10
        })}

      </div>
    )
  }

  showPickableOptions(){
    return (
      <div>
        {this.textArea("Display a message when picked up", 'useText')}

        {this.text("Heal (or harm) when used", 'healOrHarmWhenUsedNum', "number", {
          title: "Enter the number of points of damage this item applies or heals. For example, if this was a healing item, and the number here was 5, it would heal by 5 points. If this was a harming item, and the number was 10, it would inflict 10 damage points",
          max: 100
        })}
        {this.text("Increase Max Health", 'healOrHarmWhenUsedNum', "number", {
          title: "Enter the number of points of extra max health this item gives.",
          min: -1000,
          max: 1000
        })}
        {this.bool("Win an extra life when used", 'gainExtraLifeYN')}
        {this.text("Score (or lose points) when used", 'gainOrLosePointsNum', "number")}
        {this.text("Increase Max Health", 'healOrHarmWhenUsedNum', "number", {
          title: "Enter the number of points of extra max health this item gives.",
          min: -1000,
          max: 1000
        })}
        {this.bool("Win this level when used", 'winLevelYN')}
        {this.options("Gain a power when used", 'gainPowerType', [
          {text: "No power", value: "0"},
          {text: "Cannot be harmed", value: "1"},
        ])}
        {this.data.gainPowerType == "1" &&
        this.text("Gain the power for", 'gainPowerSecondsNum', "number", {
          title: "seconds",
          max: 30
        })}
      </div>
    )
  }

  showPushingOptions(){
    return (
      <div>
        {this.options("Direction this item pushes other actors", 'itemPushesActorType', [
          {text: "Up", value: "0"},
          {text: "Right", value: "1"},
          {text: "Down", value: "2"},
          {text: "Left", value: "3"},
          {text: "Onwards", value: "4"},
          {text: "Backwards", value: "5"},
          {text: "Random", value: "6"}
        ])}
        {this.text("Distance this item pushes other actors", 'itemPushesActorDistance', "number", {
          min: 1,
          max: 50
        })}

      </div>
    )
  }
  showFloorDamageOptions(){
    {this.text("Heal (or harm) when used", 'healOrHarmWhenUsedNum', "number", {
      title: "Enter the number of points of damage this item applies or heals. For example, if this was a healing item, and the number here was 5, it would heal by 5 points. If this was a harming item, and the number was 10, it would inflict 10 damage points",
      max: 100
    })}
  }
  render() {
    return (
      <div className="ui form">
        {this.options("Item Activation", 'itemActivationType', [
          {text: "Inactive", value: "0"},
          {text: "Blocks Player", value: "1"},
          {text: "Blocks NPC", value: "2"},
          {text: "Blocks Player + NPC", value: "3"},
          {text: "Player Picks up, uses later", value: "4"},
          {text: "Player Picks up, uses immediately", value: "5"},
          {text: "Player uses, but leaves the item", value: "6"},
          {text: "Player shoots item to use it", value: "7"},
          {text: "Pushes actors in a direction", value: "8"},
          {text: "Floor that causes damage", value: "9"}
        ])}

        {(this.data.itemActivationType == "1" ||
            this.data.itemActivationType == "3" ) &&
          this.text("Player can push object to slide it", 'pushToSlideNum', "number", {
            title: "If the value here is '0', then this is just a normal wall or other obstruction that cannot move. However, if the value is not zero, this item will be able to slide when pushed - 'a sliding block' and this can be used for puzzles or as a weapon for the player",
            max: 50
          })
        }

        {(this.data.itemActivationType == "1" ||
          this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum == "1") &&
            this.bool("Sliding block can squish players?", 'squishPlayerYN')
        }

        {(this.data.itemActivationType == "1" ||
          this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum == "1") &&
            this.bool("Sliding block can squish NPCs?", 'squishNPCYN', {
              title: "If you want sliding bocks to be able to kill enemy NPCs, then select 'yes' here."
            })
        }

        {(this.data.itemActivationType == "1" ||
            this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum == "0") &&
              this.dropArea("Item that acts as a key:", "keyForThisDoor", "actor", {
                title: "If the player is carrying the specified 'key' item, then the player can go past"
              })
        }
        {(this.data.itemActivationType == "1" ||
          this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum == "0") &&
            this.bool("Key is consumed when used", "keyForThisDoorConsumedYN", {
              title: "Select Yes if the key is taken from the player when used"
            })
        }

        {this.data.itemActivationType == "4" &&
          this.bool("Equippable?", 'inventoryEquippableYN', {
            title: "'Yes' if this item can be equipped (wielded/worn etc) by the player"
          })
        }

        {this.data.inventoryEquippableYN == "1" && this.showInventoryOptions()}


        {(this.data.itemActivationType == "4" || this.data.itemActivationType == "5"
          || this.data.itemActivationType == "6") &&
          this.showPickableOptions()
        }

        {this.data.inventoryEquippableYN == "8" && this.showPushingOptions()}
        {this.data.inventoryEquippableYN == "9" && this.showFloorDamageOptions()}
      </div>
    )
  }
}
