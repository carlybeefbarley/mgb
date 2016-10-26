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
import BaseForm from '../../../Controls/BaseForm.js'

import DropArea from '../../../Controls/DropArea.js'
import SmallDD from '../../../Controls/SmallDD.js'

export default class CharacterBehavior extends BaseForm {
  get data(){
    // fix bad things.. temporary
    if(this.props.asset.content2.databag.allChar){
      this.props.asset.content2.databag.allchar = this.props.asset.content2.databag.allChar;
      delete this.props.asset.content2.databag.allChar
    }
    return this.props.asset.content2.databag.allchar
  }

  render() {
    return (
      <div className="ui form">
        {this.text("Movement speed", 'movementSpeedNum', "number", {
          min: 0,
          max: 3,
          step: 0.5
        })}
        {this.bool("Can Move Up \u2191", 'upYN')}
        {this.bool("Can Move Down \u2193", 'downYN')}
        {this.bool("Can Move Left \u2190", 'leftYN')}
        {this.bool("Can Move Right \u2192", 'rightYN')}
        {/*
         <mx:FormItem label="Can Push pushable items:" id="fi_allchar_pushYN" visible="false" includeInLayout="false">
         <mx:ComboBox dataProvider="{MgbActor.alNoYes}" selectedIndex="{actorPiece.actorXML.databag.allchar.pushYN}" id="ui_allchar_pushYN"/>
         </mx:FormItem>

         <mx:FormItem label="Can Jump:" id="fi_allchar_jumpYN" toolTip="{notYet}" visible="false" includeInLayout="false">
         <mx:ComboBox dataProvider="{MgbActor.alNoYes}" selectedIndex="{actorPiece.actorXML.databag.allchar.jumpYN}" id="ui_allchar_jumpYN" editable="false"/>
         </mx:FormItem>


         */}
        <hr />
        {this.dropArea("Actor For Shots", 'shotActor', "actor")}
        {this.data.shotActor &&
          this.dropArea("Sound Effect for Shots", 'soundWhenShooting', "sound")
        }
        {this.data.shotActor &&
          this.text("Shot Rate", 'shotRateNum', "number", {
            min: 0,
            max: 9
          })
        }
        {this.data.shotActor &&
          this.text("Shot Range", 'shotRangeNum', "number", {
            min: 1,
            max: 20
          })
        }
        {this.data.shotActor &&
          this.text("Shot damage against player", 'shotDamageToPlayerNum', "number", {
            min: 0,
            max: 1000
          })
        }
        {this.data.shotActor &&
          this.text("Shot damage against NPCs or Items", 'shotDamageToNPCorItemNum', "number", {
            min: 0,
            max: 1000
          })
        }
        <hr />
        {this.text("Touch Damage Against Players", 'touchDamageToPlayerNum', "number", {
          min: 0,
          max: 1000
        })}
        {this.text("Touch Damage Against NPCS", 'touchDamageToNPCorItemNum', "number", {
          min: 0,
          max: 1000
        })}
        {this.text("Touch Damage Attack chance", 'touchDamageAttackChance', "number", {
          min: 1,
          max: 100,
          title: "Chance of making a touch attack each round. 100% = always"
        })}

        {this.options("Touch Damage Cases", 'touchDamageCases', [
          {text: "When overlapping target", value: "0"},
          {text: "When facing target", value: "1"},
          {text: "When adjacent to target", value: "2"},
        ])}
        <hr />

        {this.text("Melee Damage Against Player", 'meleeDamageToPlayerNum', "number", {
          min: 0,
          max: 1000
        })}

        {this.text("Melee Damage Against Npc", 'meleeDamageToNPCorItemNum', "number", {
          min: 0,
          max: 1000
        })}

        {this.text("Melee Repeat Delay", 'meleeRepeatDelay', "number", {
          min: 0,
          max: 8,
          title: "Number of turns the character must wait before doing another melee attack. Note that a melee attack takes 2 turns."
        })}

        {this.dropArea("Sound Effect Melee", 'soundWhenMelee', "sound")}
      </div>
    )
  }
}
