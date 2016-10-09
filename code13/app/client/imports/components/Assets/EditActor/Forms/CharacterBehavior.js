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


        {/*

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
