import _ from 'lodash'
import React from 'react'
import { Grid, Form, Divider } from 'semantic-ui-react'
import BaseForm from '../../../Controls/BaseForm.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'
import actorOptions from '../../Common/ActorOptions.js'

export default class ObjectBehavior extends BaseForm {
  get data() {
    return this.props.asset.content2.databag.item
  }

  showInventoryOptions = () => {
    const soundOptions = MgbActor.alCannedSoundsList.map(s => ({
      text: '[builtin]:' + s,
      value: '[builtin]:' + s,
    }))
    const { equippedNewActorGraphics } = this.data.equippedNewActorGraphics

    return (
      <div>
        <Divider />
        <div>
          {equippedNewActorGraphics && (
            <span style={{ color: '#A91313' }}>
              Note: It is recommended that items that can change the player's appearance should use the same
              slot name. This is because only one equipped item can only change how the player looks.
            </span>
          )}
          {this.text('Equipment slot', 'inventoryEquipSlot', 'text', {
            title:
              "Enter a string such as 'weapon' or 'right hand'. The player can only equip one item of any 'slot' at a time",
          })}

          {this.dropArea('New actor graphics', 'equippedNewActorGraphics', 'actor', {
            title:
              "When equipped, use this actor's graphics (base tile &amp; all animations) to show the player. For example, if this item is a weapon, you may have a new set of actor graphics where the actor is carrying the weapon. Sorry, but only one equipped item can override the actor at a time - so choose wisely which slot you want to use this feature with (usually weapons). You can choose ANY actor type for this, since only the graphics of that actor will be use, and all actor types define graphics",
          })}

          {this.bool('Auto-equip item', 'autoEquipYN', {
            title:
              'If yes, then this item is special and automatically is equipped when picked up by the pla yer. It is useful for items like cars, horses, etc. Also, it cannot be explicitly unequipped by the user - it is only changed by another similar item',
          })}

          {this.dropArea('New shot type', 'equippedNewShotActor', 'actor', {
            title: "When equipped, use this 'shot actor' as the shot",
          })}

          {this.dropArea('New Shot sound', 'equippedNewShotSound', 'sound', {
            options: soundOptions,
            title: 'When equipped, use this as the shot sound',
          })}

          {this.text('Shot damage bonus', 'equippedNewShotDamageBonusNum', 'number', {
            title: 'When equipped, increase base shot damage by this amount',
            min: -10000,
            max: 10000,
            default: 0,
          })}

          {this.text('Shot rate bonus', 'equippedNewShotRateBonusNum', 'number', {
            title: 'When equipped, increase base shot rate by this amount',
            min: -20,
            max: 20,
            default: 0,
          })}
          {this.text('Shot range bonus', 'equippedNewShotRangeBonusNum', 'number', {
            title: 'When equipped, increase base shot range by this amount',
            min: -20,
            max: 20,
            default: 0,
          })}
          {this.text('Armor effect', 'equippedArmorEffect', 'number', {
            title: 'When equipped, Reduce damage by this percentage',
            min: -100, // cursed blade? :) originally 0
            max: 100,
            default: 0,
          })}
          {this.text('Melee Damage Bonus', 'equippedNewMeleeDamageBonusNum', 'number', {
            title:
              'When equipped, Increase Melee damage by this number of points. You can also have a negative value - that this item reduces damage - for example a weapon might be fast but reduce base damage',
            min: -10000,
            max: 10000,
            default: 0,
          })}
          {this.dropArea('New Melee sound', 'equippedNewMeleeSound', 'sound', {
            options: soundOptions,
            title: 'When equipped, use this as the Melee sound',
          })}
          {this.text('Melee Repeat rate modifier', 'equippedNewMeleeRepeatDelayModiferNum', 'number', {
            title:
              'This raises or lowers the Melee repeat rate of the character who has equipped the item. If the value is zero, there is no change to melee repeat rate. A positive number increases the delay, a negative number reduces the delay',
            min: -10,
            max: 10,
            default: 0,
          })}
        </div>
        <Divider />
      </div>
    )
  }

  showPickableOptions = () => {
    const { gainPowerType } = this.data
    return (
      <div>
        {this.textArea('Display a message when picked up', 'useText')}

        {this.text('Heal (or harm) when used', 'healOrHarmWhenUsedNum', 'number', {
          title: 'Positive numbers heal and negative numbers harm',
          min: -1000000,
          max: 1000000,
        })}
        {this.text('Increase Max Health', 'increasesMaxHealthNum', 'number', {
          title: 'Enter the number of points of extra max health this item gives.',
          min: -1000000,
          max: 1000000,
        })}
        {/*this.bool("Gain an Extra Life when used", 'gainExtraLifeYN')  //  ENABLE THIS LINE ONCE WE IMPLEMENT LIVES */}
        {this.text('Score (or lose points) when used', 'gainOrLosePointsNum', 'number', {
          min: -1000000,
          max: 1000000,
          default: 0,
        })}

        {this.bool(
          'Win this level when used',
          'winLevelYN',
          {},
          'mgbjr-CT-edit-actor-winLevel',
          'mgbjr-edit-actor-ObjectBehavior-winLevel',
        )}

        {this.options('Gain a power when used', 'gainPowerType', [
          { text: 'No power', value: '0' },
          { text: 'Cannot be harmed', value: '1' },
        ])}
        {gainPowerType == '1' &&
          this.text('Gain the power for', 'gainPowerSecondsNum', 'number', {
            title: 'seconds',
            max: 300,
          })}
      </div>
    )
  }

  showPushingOptions = () => {
    return (
      <div>
        {this.options('Direction this item pushes other actors', 'itemPushesActorType', [
          { text: 'Up', value: '0' },
          { text: 'Right', value: '1' },
          { text: 'Down', value: '2' },
          { text: 'Left', value: '3' },
          { text: 'Onwards', value: '4' },
          { text: 'Backwards', value: '5' },
          { text: 'Random', value: '6' },
        ])}
        {/*this.text('Distance this item pushes other actors', 'itemPushesActorDistance', 'number', {
          min: 1,
          max: 50,
        })*/}
      </div>
    )
  }

  showFloorDamageOptions = () => {
    return (
      <div>
        {this.text('Heal (or harm) when used', 'healOrHarmWhenUsedNum', 'number', {
          title: 'Positive numbers heal and negative numbers harm',
          min: -1000000,
          max: 1000000,
        })}
      </div>
    )
  }

  renderItemBehavior = behaviorOptions => {
    const { itemActivationType, inventoryEquippableYN } = this.data

    return (
      <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
        <div style={{ marginBottom: '10px' }} id="mgbjr-edit-actor-ObjectBehavior-itemType">
          {this.options(
            'Item Type',
            'itemActivationType',
            behaviorOptions,
            'mgbjr-CT-edit-actor-itemActivation',
          )}
        </div>

        <div>
          {itemActivationType == '4' &&
            this.bool('Equippable?', 'inventoryEquippableYN', {
              title: "'Yes' if this item can be equipped (wielded/worn etc) by the player",
            })}

          {itemActivationType == '4' && inventoryEquippableYN == '1' && this.showInventoryOptions()}

          {(itemActivationType == '4' || itemActivationType == '5' || itemActivationType == '6') &&
            this.showPickableOptions()}
        </div>
      </Form>
    )
  }

  renderSolidBehavior = behaviorOptions => {
    const { itemActivationType, pushToSlideNum } = this.data

    return (
      <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
        <div style={{ marginBottom: '10px' }} id="mgbjr-edit-actor-ObjectBehavior-type">
          {this.options('Solid Object Type', 'itemActivationType', behaviorOptions)}
        </div>

        <div>
          {(itemActivationType == '1' || itemActivationType == '3') &&
            this.text('Player can push object to slide it', 'pushToSlideNum', 'number', {
              title:
                "If the value here is '0', then this is just a normal wall or other obstruction that cannot move. However, if the value is not zero, this item will be able to slide when pushed - 'a sliding block' and this can be used for puzzles or as a weapon for the player",
              min: 0,
              max: 50,
            })}

          {/* hmm - not used?
          (itemActivationType == "1" ||
            itemActivationType == "3" ) && (pushToSlideNum > 0) &&
              this.bool("Sliding block can squish players?", 'squishPlayerYN')
          */}

          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum > 0 &&
            this.bool('Sliding block can squish NPCs?', 'squishNPCYN', {
              title: "If you want sliding blocks to be able to kill enemy NPCs, then select 'yes' here.",
            })}

          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum == '0' &&
            this.dropArea('Item that acts as a key:', 'keyForThisDoor', 'actor', {
              title: "If the player is carrying the specified 'key' item, then the player can go past",
            })}
          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum == '0' &&
            this.bool('Key is consumed when used', 'keyForThisDoorConsumedYN', {
              title: "Select Yes if the 'key' is taken from the player when used",
            })}
        </div>
      </Form>
    )
  }

  renderFloorBehavior = behaviorOptions => {
    const { itemActivationType } = this.data

    return (
      <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
        <div style={{ marginBottom: '10px' }} id="mgbjr-edit-actor-ObjectBehavior-type">
          {this.options('Floor Type', 'itemActivationType', behaviorOptions)}
        </div>
        <div>
          {itemActivationType == '8' && this.showPushingOptions()}
          {itemActivationType == '9' && this.showFloorDamageOptions()}
        </div>
      </Form>
    )
  }

  renderAll = () => {
    const { itemActivationType, pushToSlideNum, inventoryEquippableYN } = this.data

    return (
      <Form style={!this.props.canEdit ? { pointerEvents: 'none' } : {}}>
        <div style={{ marginBottom: '10px' }} id="mgbjr-edit-actor-ObjectBehavior-type">
          {this.options('Object Behavior', 'itemActivationType', actorOptions.itemActivationType)}
        </div>

        <div>
          {(itemActivationType == '1' || itemActivationType == '3') &&
            this.text('Player can push object to slide it', 'pushToSlideNum', 'number', {
              title:
                "If the value here is '0', then this is just a normal wall or other obstruction that cannot move. However, if the value is not zero, this item will be able to slide when pushed - 'a sliding block' and this can be used for puzzles or as a weapon for the player",
              max: 50,
            })}

          {/* hmm - not used?
        (itemActivationType == "1" ||
          itemActivationType == "3" ) && (pushToSlideNum > 0) &&
            this.bool("Sliding block can squish players?", 'squishPlayerYN')
        */}

          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum > 0 &&
            this.bool('Sliding block can squish NPCs?', 'squishNPCYN', {
              title: "If you want sliding blocks to be able to kill enemy NPCs, then select 'yes' here.",
            })}

          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum == '0' &&
            this.dropArea('Item that acts as a key:', 'keyForThisDoor', 'actor', {
              title: "If the player is carrying the specified 'key' item, then the player can go past",
            })}
          {(itemActivationType == '1' || itemActivationType == '3') &&
            pushToSlideNum == '0' &&
            this.bool('Key is consumed when used', 'keyForThisDoorConsumedYN', {
              title: "Select Yes if the 'key' is taken from the player when used",
            })}

          {itemActivationType == '4' &&
            this.bool('Equippable?', 'inventoryEquippableYN', {
              title: "'Yes' if this item can be equipped (wielded/worn etc) by the player",
            })}

          {itemActivationType == '4' && inventoryEquippableYN == '1' && this.showInventoryOptions()}

          {(itemActivationType == '4' ||
            itemActivationType == '5' ||
            itemActivationType == '6' ||
            itemActivationType == '7') &&
            this.showPickableOptions()}

          {itemActivationType == '8' && this.showPushingOptions()}
          {itemActivationType == '9' && this.showFloorDamageOptions()}
        </div>
      </Form>
    )
  }

  render() {
    let behaviorOptions = null
    const actorType = this.props.asset.content2.databag.all.actorType
    const objectByItemActivation = [
      'Scenery, Floor',
      'Wall',
      'Wall',
      'Wall',
      'Item',
      'Item',
      'Item',
      '',
      'Floor',
      'Floor',
    ]

    if (actorType === actorOptions.actorType['Item'])
      behaviorOptions = this.renderItemBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '4' || type === '5' || type === '6' // || type === '7'
        }),
      )
    else if (actorType === actorOptions.actorType['Solid Object'])
      behaviorOptions = this.renderSolidBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '1' || type === '2' || type === '3'
        }),
      )
    else if (actorType === actorOptions.actorType['Floor'])
      behaviorOptions = this.renderFloorBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '0' || type === '8' || type === '9'
        }),
      )
    else if (actorType === actorOptions.actorType['Scenery'])
      behaviorOptions = <div className="ui message ">This ActorType doesn't use this set of options</div>

    return (
      <Grid style={{ minHeight: '50vh' }} centered container>
        <Grid.Column>{behaviorOptions ? behaviorOptions : this.renderAll()}</Grid.Column>
      </Grid>
    )
  }
}
