/*
movementSpeed:
canMoveUp:
canMoveDown:
canMoveLeft:
canMoveRight:
ActorForShots:
TouchDamageAgainstPlayers
TouchDamageAgainstNPCS
TouchDamageAttackChance
TouchDamageCases
MeleeDamageAgainstPlayer
MeleeDamageAgainstNpc
SoundEffectMelee
MeleeRepeatDelay
----------------------
 movementSpeedNum
 upYN
 downYN
 leftYN
 rightYN
 shotRateNum
 shotRangeNum
 soundWhenShooting
 shotActor
 pushYN
 jumpYN
 shotDamageToPlayerNum
 shotDamageToNPCorItemNum
 touchDamageToPlayerNum
 touchDamageToNPCorItemNum
 touchDamageAttackChance
 touchDamageCases
 meleeDamageToPlayerNum
 meleeDamageToNPCorItemNum
 soundWhenMelee
 meleeRepeatDelay

 */
import React from 'react'
import BaseForm from '../BaseForm.js'

import DropArea from '../components/DropArea.js'
import SmallDD from '../components/SmallDD.js'


const actorTypes = [
  {text: 'Player', value: "0"},
  {text: 'Non-Player Character (NPC)', value: "1"},
  {text: 'Item, Wall or Scenery', value: "2"},
  {text: 'Shot', value: "3"}
]

export default class All extends BaseForm {
  get data(){
    return this.props.asset.content2.databag.allchar
  }

  render() {
    return (
      <div className="ui form">
        {this.text("Movement speed", 'movementSpeed', "number")}
        {this.bool("Can Move Up \u2191", 'upYN')}
        {this.bool("Can Move Down \u2193", 'downYN')}
        {this.bool("Can Move Left \u2190", 'leftYN')}
        {this.bool("Can Move Right \u2192", 'rightYN')}

        {this.dropArea("Actor For Shots", 'shotActor', "actor")}

        {this.text("Touch Damage Against Players", 'touchDamageToPlayerNum', "number")}
        {this.text("Touch Damage Against NPCS", 'touchDamageToNPCorItemNum', "number")}
        {this.text("Touch Damage Attack chance", 'touchDamageAttackChance', "number")}





        {/*
movementSpeed: movementSpeedNum
canMoveUp: upYN
canMoveDown: downYN
canMoveLeft: leftYN
canMoveRight: rightYN
.....
ActorForShots: shotActor
TouchDamageAgainstPlayers: touchDamageToPlayerNum
TouchDamageAgainstNPCS: touchDamageToNPCorItemNum
TouchDamageAttackChance: touchDamageAttackChance
TouchDamageCases: touchDamageCases
MeleeDamageAgainstPlayer: meleeDamageToPlayerNum
MeleeDamageAgainstNpc: meleeDamageToNPCorItemNum
SoundEffectMelee: soundWhenMelee
MeleeRepeatDelay: meleeRepeatDelay

        {this.options("Actor Type", 'actorType', actorTypes)}
        {this.text("Description", 'description')}
        {this.text("Initial Heath", 'initialHealthNum', "number", {min: "1"} )}
        {this.text("Initial Max Health", 'initialMaxHealthNum', "number", {min: "1"} )}

        {this.dropArea("Sound When Harmed", 'soundWhenHarmed', "sound")}
        {this.dropArea("Sound When Healed", 'soundWhenHealed', "sound")}
        {this.dropArea("Sound When Killed", 'soundWhenKilled', "sound")}

        {this.dropArea("Graphics", "graphic", "graphic")}
        */}
      </div>
    )
  }
}
