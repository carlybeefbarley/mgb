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
    return this.props.asset.content2.databag.all
  }

  render() {
    return (
      <div className="ui form">
        {this.text("Movement speed", 'movementSpeed', "number")}
        {this.bool("Can Move Up", 'upYN')}
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
