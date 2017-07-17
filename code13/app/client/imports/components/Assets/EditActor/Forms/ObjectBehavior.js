import _ from 'lodash'
import React from 'react'
import BaseForm from '../../../Controls/BaseForm.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'
import actorOptions from '../../Common/ActorOptions.js'

export default class ObjectBehavior extends BaseForm {
  get data() {
    return this.props.asset.content2.databag.item
  }

  showInventoryOptions() {
    const soundOptions = MgbActor.alCannedSoundsList.map(s => ({
      text: '[builtin]:' + s,
      value: '[builtin]:' + s,
    }))

    return (
      <div>
        <hr />
        {this.data.equippedNewActorGraphics && (
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
        })}

        {this.text('Shot rate bonus', 'equippedNewShotRateBonusNum', 'number', {
          title: 'When equipped, increase base shot rate by this amount',
          min: -20,
          max: 20,
        })}
        {this.text('Shot range bonus', 'equippedNewShotRangeBonusNum', 'number', {
          title: 'When equipped, increase base shot range by this amount',
          min: -20,
          max: 20,
        })}
        {this.text('Armor effect', 'equippedArmorEffect', 'number', {
          title: 'When equipped, Reduce damage by this percentage',
          min: -100, // cursed blade? :) originally 0
          max: 100,
        })}
        {this.text('Melee Damage Bonus', 'equippedNewMeleeDamageBonusNum', 'number', {
          title:
            'When equipped, Increase Melee damage by this number of points. You can also have a negative value - that this item reduces damage - for example a weapon might be fast but reduce base damage',
          min: -10000,
          max: 10000,
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
        })}
        <hr />
      </div>
    )
  }

  showPickableOptions() {
    return (
      <div>
        {this.textArea('Display a message when picked up', 'useText')}

        {this.text('Heal (or harm) when used', 'healOrHarmWhenUsedNum', 'number', {
          title:
            'Enter the number of points of damage this item applies or heals. For example, if this was a healing item, and the number here was 5, it would heal by 5 points. If this was a harming item, and the number was 10, it would inflict 10 damage points',
          min: -10000,
          max: 10000,
        })}
        {this.text('Increase Max Health', 'increasesMaxHealthNum', 'number', {
          title: 'Enter the number of points of extra max health this item gives.',
          min: -10000,
          max: 10000,
        })}
        {/*this.bool("Gain an Extra Life when used", 'gainExtraLifeYN')  //  ENABLE THIS LINE ONCE WE IMPLEMENT LIVES */}
        {this.text('Score (or lose points) when used', 'gainOrLosePointsNum', 'number')}
        {this.bool('Win this level when used', 'winLevelYN')}
        {this.options('Gain a power when used', 'gainPowerType', [
          { text: 'No power', value: '0' },
          { text: 'Cannot be harmed', value: '1' },
        ])}
        {this.data.gainPowerType == '1' &&
          this.text('Gain the power for', 'gainPowerSecondsNum', 'number', {
            title: 'seconds',
            max: 60,
          })}
      </div>
    )
  }

  showPushingOptions() {
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
        {this.text('Distance this item pushes other actors', 'itemPushesActorDistance', 'number', {
          min: 1,
          max: 50,
        })}
      </div>
    )
  }

  showFloorDamageOptions() {
    return (
      <div>
        {this.text('Heal (or harm) when used', 'healOrHarmWhenUsedNum', 'number', {
          title:
            'Enter the number of points of damage this item applies or heals. For example, if this was a healing item, and the number here was 5, it would heal by 5 points. If this was a harming item, and the number was 10, it would inflict 10 damage points',
          min: -10000,
          max: 10000,
        })}
      </div>
    )
  }

  renderItemBehavior(behaviorOptions) {
    return (
      <div style={!this.props.canEdit ? { pointerEvents: 'none' } : {}} className="ui form">
        <div id="mgbjr-edit-actor-tab-ObjectBehavior-type">
          {this.options('Item Type', 'itemActivationType', behaviorOptions)}
        </div>

        {this.data.itemActivationType == '4' &&
          this.bool('Equippable?', 'inventoryEquippableYN', {
            title: "'Yes' if this item can be equipped (wielded/worn etc) by the player",
          })}

        {this.data.itemActivationType == '4' &&
          this.data.inventoryEquippableYN == '1' &&
          this.showInventoryOptions()}

        {(this.data.itemActivationType == '4' ||
          this.data.itemActivationType == '5' ||
          this.data.itemActivationType == '6') &&
          // this.data.itemActivationType == '7') 
          this.showPickableOptions()}
      </div>
    )
  }

  renderSolidBehavior(behaviorOptions) {
    return (
      <div style={!this.props.canEdit ? { pointerEvents: 'none' } : {}} className="ui form">
        <div id="mgbjr-edit-actor-tab-ObjectBehavior-type">
          {this.options('Solid Object Type', 'itemActivationType', behaviorOptions)}
        </div>

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.text('Player can push object to slide it', 'pushToSlideNum', 'number', {
            title:
              "If the value here is '0', then this is just a normal wall or other obstruction that cannot move. However, if the value is not zero, this item will be able to slide when pushed - 'a sliding block' and this can be used for puzzles or as a weapon for the player",
            max: 50,
          })}

        {/* hmm - not used?
        (this.data.itemActivationType == "1" ||
          this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum > 0) &&
            this.bool("Sliding block can squish players?", 'squishPlayerYN')
        */}

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum > 0 &&
          this.bool('Sliding block can squish NPCs?', 'squishNPCYN', {
            title: "If you want sliding blocks to be able to kill enemy NPCs, then select 'yes' here.",
          })}

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum == '0' &&
          this.dropArea('Item that acts as a key:', 'keyForThisDoor', 'actor', {
            title: "If the player is carrying the specified 'key' item, then the player can go past",
          })}
        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum == '0' &&
          this.bool('Key is consumed when used', 'keyForThisDoorConsumedYN', {
            title: "Select Yes if the 'key' is taken from the player when used",
          })}
      </div>
    )
  }

  renderFloorBehavior(behaviorOptions) {
    return (
      <div style={!this.props.canEdit ? { pointerEvents: 'none' } : {}} className="ui form">
        <div id="mgbjr-edit-actor-tab-ObjectBehavior-type">
          {this.options('Floor Type', 'itemActivationType', behaviorOptions)}
        </div>
        {this.data.itemActivationType == '8' && this.showPushingOptions()}
        {this.data.itemActivationType == '9' && this.showFloorDamageOptions()}
      </div>
    )
  }

  renderAll() {
    return (
      <div style={!this.props.canEdit ? { pointerEvents: 'none' } : {}} className="ui form">
        <div id="mgbjr-edit-actor-tab-ObjectBehavior-type">
          {this.options('Object Type', 'itemActivationType', actorOptions.itemActivationType)}
        </div>

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.text('Player can push object to slide it', 'pushToSlideNum', 'number', {
            title:
              "If the value here is '0', then this is just a normal wall or other obstruction that cannot move. However, if the value is not zero, this item will be able to slide when pushed - 'a sliding block' and this can be used for puzzles or as a weapon for the player",
            max: 50,
          })}

        {/* hmm - not used?
        (this.data.itemActivationType == "1" ||
          this.data.itemActivationType == "3" ) && (this.data.pushToSlideNum > 0) &&
            this.bool("Sliding block can squish players?", 'squishPlayerYN')
        */}

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum > 0 &&
          this.bool('Sliding block can squish NPCs?', 'squishNPCYN', {
            title: "If you want sliding blocks to be able to kill enemy NPCs, then select 'yes' here.",
          })}

        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum == '0' &&
          this.dropArea('Item that acts as a key:', 'keyForThisDoor', 'actor', {
            title: "If the player is carrying the specified 'key' item, then the player can go past",
          })}
        {(this.data.itemActivationType == '1' || this.data.itemActivationType == '3') &&
          this.data.pushToSlideNum == '0' &&
          this.bool('Key is consumed when used', 'keyForThisDoorConsumedYN', {
            title: "Select Yes if the 'key' is taken from the player when used",
          })}

        {this.data.itemActivationType == '4' &&
          this.bool('Equippable?', 'inventoryEquippableYN', {
            title: "'Yes' if this item can be equipped (wielded/worn etc) by the player",
          })}

        {this.data.itemActivationType == '4' &&
          this.data.inventoryEquippableYN == '1' &&
          this.showInventoryOptions()}

        {(this.data.itemActivationType == '4' ||
          this.data.itemActivationType == '5' ||
          this.data.itemActivationType == '6' ||
          this.data.itemActivationType == '7') &&
          this.showPickableOptions()}

        {this.data.itemActivationType == '8' && this.showPushingOptions()}
        {this.data.itemActivationType == '9' && this.showFloorDamageOptions()}
      </div>
    )
  }

  render() {
    let behaviorOptions = null

    if (this.props.asset.content2.databag.all.actorType === actorOptions.actorType['Item'])
      behaviorOptions = this.renderItemBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '4' || type === '5' || type === '6' || type === '7'
        }),
      )
    else if (this.props.asset.content2.databag.all.actorType === actorOptions.actorType['Solid Object'])
      behaviorOptions = this.renderSolidBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '1' || type === '2' || type === '3'
        }),
      )
    else if (this.props.asset.content2.databag.all.actorType === actorOptions.actorType['Floor'])
      behaviorOptions = this.renderFloorBehavior(
        _.pickBy(actorOptions.itemActivationType, type => {
          return type === '0' || type === '8' || type === '9'
        }),
      )
    else if (this.props.asset.content2.databag.all.actorType === actorOptions.actorType['Scenery'])
      behaviorOptions = <div className="ui message ">This ActorType doesn't use this set of options</div>

    return <div>{behaviorOptions ? behaviorOptions : this.renderAll()}</div>
  }
}
