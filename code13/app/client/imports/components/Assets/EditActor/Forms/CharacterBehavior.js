import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

export default class CharacterBehavior extends BaseForm {
  get data() {
    const { asset } = this.props
    if (asset.content2.databag.allChar) {
      // fix case error from older assets... temporary because of typo in early version of this editor
      asset.content2.databag.allchar = asset.content2.databag.allChar
      delete asset.content2.databag.allChar
      console.warn('Had to repair Actor allChar/allchar: Asset id#' + asset._id)
    }
    return asset.content2.databag.allchar
  }

  render() {
    const soundOptions = { options: MgbActor.alCannedSoundsList.map( s => ( { text: s, value: s } ) ) }

    return (
      <div className="ui form">
        <div id="mgbjr-edit-actor-tab-CharacterBehavior-movement">
          {this.text("Movement speed", 'movementSpeedNum', "number", {
            min: 0,
            max: 3,
            step: 0.5
          })}
          { this.bool("Can Move Up \u2191",    'upYN')}
          { this.bool("Can Move Down \u2193",  'downYN')}
          { this.bool("Can Move Left \u2190",  'leftYN')}
          { this.bool("Can Move Right \u2192", 'rightYN')}
        </div>
        <hr />

        <div id="mgbjr-edit-actor-tab-CharacterBehavior-shot">
          {this.dropArea("Actor For Shots", 'shotActor', "actor")}
          {this.data.shotActor &&
            this.dropArea("Sound Effect for Shots", 'soundWhenShooting', "sound", soundOptions)
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
        </div>
        <hr />
        <div id="mgbjr-edit-actor-tab-CharacterBehavior-touch">
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
            { text: "When overlapping target",   value: "0"},
            { text: "When facing target",        value: "1"},
            { text: "When adjacent to target",   value: "2"},
          ])}
        </div>
        <hr />
        <div id="mgbjr-edit-actor-tab-CharacterBehavior-melee">
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

          {this.dropArea("Sound Effect Melee", 'soundWhenMelee', "sound", soundOptions)}
        </div>
      </div>
    )
  }
}
