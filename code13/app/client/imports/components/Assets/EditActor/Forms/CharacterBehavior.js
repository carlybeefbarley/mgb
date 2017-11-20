import React from 'react'
import { Grid, Form, Divider } from 'semantic-ui-react'
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
    const soundOptions = {
      options: MgbActor.alCannedSoundsList.map(s => ({ text: '[builtin]:' + s, value: '[builtin]:' + s })),
    }
    const actorType = this.props.asset.content2.databag.all.actorType
    const shotActor = this.data.shotActor

    return (
      <Grid style={{ minHeight: '50vh' }} centered container>
        <Grid.Column>
          <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
            <div id="mgbjr-edit-actor-CharacterBehavior-movement">
              {actorType === '1' && (
                <span style={{ color: '#A91313' }}>
                  Note: 'movement frequency' works as a probability of an NPC moving each turn
                </span>
              )}

              {actorType === '1' &&
                this.text('Movement Frequency', 'movementSpeedNum', 'number', {
                  min: 0,
                  max: 1,
                  default: 1,
                  step: 0.1,
                })}
              {this.bool('Can Move Up \u2191', 'upYN')}
              {this.bool('Can Move Down \u2193', 'downYN')}
              {this.bool('Can Move Left \u2190', 'leftYN')}
              {this.bool('Can Move Right \u2192', 'rightYN')}
            </div>
            <Divider />
            <div id="mgbjr-edit-actor-CharacterBehavior-shot">
              {this.dropArea('Actor For Shots', 'shotActor', 'actor')}
              {shotActor &&
                this.dropArea('Sound Effect for Shots', 'soundWhenShooting', 'sound', soundOptions)}
              {shotActor &&
                this.text('Shot Rate', 'shotRateNum', 'number', {
                  min: 0,
                  max: 9,
                  default: 1,
                })}
              {shotActor &&
                this.text('Shot Range', 'shotRangeNum', 'number', {
                  min: 1,
                  max: 20,
                  default: 1,
                })}
              {shotActor &&
                actorType !== 0 &&
                this.text('Shot damage against player', 'shotDamageToPlayerNum', 'number', {
                  min: 0,
                  max: 1000000,
                  default: 0,
                })}
              {shotActor &&
                this.text('Shot damage against NPCs or Items', 'shotDamageToNPCorItemNum', 'number', {
                  min: 0,
                  max: 1000000,
                  default: 1,
                })}
            </div>
            <Divider />
            <div id="mgbjr-edit-actor-CharacterBehavior-touch">
              {actorType !== 0 &&
                this.text('Touch Damage Against Players', 'touchDamageToPlayerNum', 'number', {
                  min: 0,
                  max: 1000000,
                  default: 0,
                })}
              {this.text('Touch Damage Against NPCS', 'touchDamageToNPCorItemNum', 'number', {
                min: 0,
                max: 1000000,
                default: 0,
              })}
              {this.text('Touch Damage Attack chance', 'touchDamageAttackChance', 'number', {
                min: 1,
                max: 100,
                default: 100,
                title: 'Chance of making a touch attack each round. 100% = always',
              })}

              {this.options('Touch Damage Cases', 'touchDamageCases', [
                { text: 'When overlapping target', value: '0' },
                { text: 'When facing target', value: '1' },
                { text: 'When adjacent to target', value: '2' },
              ])}
            </div>
            <Divider />
            <div id="mgbjr-edit-actor-CharacterBehavior-melee">
              {actorType !== 0 &&
                this.text('Melee Damage Against Player', 'meleeDamageToPlayerNum', 'number', {
                  min: 0,
                  max: 1000000,
                  default: 0,
                })}

              {this.text('Melee Damage Against Npc', 'meleeDamageToNPCorItemNum', 'number', {
                min: 0,
                max: 1000000,
                default: 1,
              })}

              {this.text('Melee Repeat Delay', 'meleeRepeatDelay', 'number', {
                min: 0,
                max: 8,
                default: 0,
                title:
                  'Number of turns the character must wait before doing another melee attack. Note that a melee attack takes 2 turns.',
              })}

              {this.dropArea('Sound Effect Melee', 'soundWhenMelee', 'sound', soundOptions)}
            </div>
          </Form>
        </Grid.Column>
      </Grid>
    )
  }
}
