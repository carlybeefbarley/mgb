import _ from 'lodash'
import React from 'react'
import { Modal, Segment, Grid } from 'semantic-ui-react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import './EditActor.css'
import getDefaultActor from './getDefaultActor.js'

import templates from './TemplateDiffs.js'

import ActorValidator from '../Common/ActorValidator.js'
import actorOptions from '../Common/ActorOptions.js'

import Tabs from './Tabs'
import FormsAll from './Forms/All'
import Spawning from './Forms/Spawning'
import Animations from './Forms/Animations'
import Conditions from './Forms/Conditions'
import NPCBehavior from './Forms/NPCBehavior'
import ObjectBehavior from './Forms/ObjectBehavior'
import CharacterBehavior from './Forms/CharacterBehavior'

export default class EditActor extends React.Component {
  constructor(...props) {
    super(...props)
    this.state = {}
    this.closeModal = false
    this.templateSelected = false
  }

  doSnapshotActivity() {
    let passiveAction = {
      isActor: true, // This could in future have info such as which layer is being edited, but not needed yet
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount() {
    this.doSnapshotActivity()
  }

  handleSave(reason, thumbnail) {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  getTabs(databag) {
    const _makeContent = Element =>
      <Element
        asset={this.props.asset}
        onChange={this.handleSave.bind(this)}
        saveThumbnail={d => this.handleSave(null, d, 'Updating thumbnail')}
        saveText={text => this.props.handleDescriptionChange(text)}
        canEdit={this.props.canEdit}
      />

    const _mkDisabled = actorTypesArray =>
      _.some(actorTypesArray, at => databag.all.actorType === actorOptions.actorType[at])

    const allTabs = [
      {
        tab: 'All',
        content: _makeContent(FormsAll),
      },
      {
        tab: 'Animations',
        content: _makeContent(Animations),
      },
      {
        tab: 'Character Behavior',
        disabled: _mkDisabled(['Item, Wall, or Scenery', 'Item', 'Solid Object', 'Floor', 'Scenery', 'Shot']),
        content: _makeContent(CharacterBehavior),
      },
      {
        tab: 'NPC Behavior',
        disabled: _mkDisabled([
          'Player',
          'Item, Wall, or Scenery',
          'Item',
          'Solid Object',
          'Floor',
          'Scenery',
          'Shot',
        ]),
        content: _makeContent(NPCBehavior),
      },
      {
        tab: 'Object Behavior',
        disabled: _mkDisabled(['Player', 'Non-Player Character (NPC)', 'Scenery', 'Shot']),
        content: _makeContent(ObjectBehavior),
      },
      {
        tab: 'Destruction / Spawning',
        disabled: _mkDisabled(['Player', 'Shot']),
        content: _makeContent(Spawning),
      },

      {
        tab: 'Conditions',
        disabled: _mkDisabled(['Player', 'Shot']),
        content: _makeContent(Conditions),
      },
    ]

    return allTabs
  }

  getTemplates() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-blank"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-object`)}
              data-template="alTemplateScenery"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/blank.png')}
              />
              <b>Blank</b>
              <br />
              A blank template with no effects or behaviors. Used as scenery in the background or foreground
              layer
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-player"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-player`)}
              data-template="alTemplatePlayer"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/player.png')}
              />
              <b>Player</b>
              <br />
              The Player's character
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-enemy"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`)}
              data-template="alTemplateEnemy"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/enemy.png')}
              />
              <b>Enemy</b>
              <br />
              Hostile NPCs that can harm the Player
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-friend"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`)}
              data-template="alTemplateFriend"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/friend.png')}
              />
              <b>Friend</b>
              <br />
              Friendly NPCs that can help the Player
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-floor"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-object`)}
              data-template="alTemplateFloor"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/floor.png')}
              />
              <b>Floor</b>
              <br />
              A floor tile that can have some effect including sliding, pushing, or damaging/healing the
              Player when stepped on
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-solidObject"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-object`)}
              data-template="alTemplateSolidObject"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/solidobject.png')}
              />
              <b>Solid Object</b>
              <br />
              A solid object or wall that obstructs the Player and/or NPCs. Can have effects to be moveable by
              the Player or accessible with the use of an Item
            </Segment>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-item"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-object`)}
              data-template="alTemplateItem"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/item.png')}
              />
              <b>Item</b>
              <br />
              An item that can be picked up or used right away with some effect
            </Segment>
          </Grid.Column>
          <Grid.Column width={8}>
            <Segment
              style={{ height: '100px', verticalAlign: 'middle', cursor: 'pointer', overflow: 'hidden' }}
              id="mgbjr-create-actor-shot"
              onClick={() => joyrideCompleteTag(`mgbjr-CT-create-actor-shot`)}
              data-template="alTemplateShot"
            >
              <img
                style={{ float: 'left', paddingRight: '10px' }}
                src={makeCDNLink('/images/newActor/projectile.png')}
              />
              <b>Shot</b>
              <br />
              A projectile that can be fired by the Player or NPC
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }

  /*
  // No longer used
  getTemplateTabs() {
    return [
      {
        tab: "Basics",
        content: <div className="actor-template ui internally celled grid">
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-player" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-player`) } src={makeCDNLink('/images/newActor/newActor_player.png')} data-template="alTemplatePlayer" />
              <span>The player's character</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-enemy" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`) } src={makeCDNLink("/images/newActor/newActor_enemy.png")} data-template="alTemplateEnemy" />
              <span>Enemies and bosses</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-friend" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`) } src={makeCDNLink("/images/newActor/newActor_friend.png")} data-template="alTemplateFriend" />
              <span>Friendly characters who help the player</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-shot" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-shot`) } src={makeCDNLink("/images/newActor/newActor_shot.png")}  data-template="alTemplateShot" />
              <span>A projectile attack - arrow, fireball, etc"</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-ice" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_ice.png")} data-template="alTemplateIce" />
              <span>A floor tile. Actors who step onto this tile will keep on moving past it</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-floor" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_floor.png")} data-template="alTemplateFloor" />
              <span>A floor tile. Decorative, but has no effect</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-wall" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_wall.png")} data-template="alTemplateWall" />
              <span>A wall. Blocks a player or enemy</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-item" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_item.png")} data-template="alTemplateItem" />
              <span>An item that has some effect</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-slider" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_slider.png")} data-template="alTemplateSlidingBlock" />
              <span>A solid block that can be pushed to make it slide some distance</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-foreground" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-object`) } src={makeCDNLink("/images/newActor/newActor_foreground.png")} data-template="alTemplateFloor" />
              <span>A foreground tile - used on the foreground map layer. Decorative, but has no effect</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Player",
        content: <div id="mgbjr-create-actor-tab-player" className="actor-template ui internally celled grid">
              <span style={{padding: "10px 15px"}}>
              Player characters can have touch, shoot and/or melee -type attacks.<br />
              A player might initially have no way to shoot or attack, but pick up items that provide these abilities.<br />
              A player can use items and talk to Non-Player Characters
              </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_player.png")} data-template="alTemplatePlayer" />
              <span>A player with no attacks. This good for an RPG-style game as the player can gain abilities during the game.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_playerTouch.png")} data-template="alTemplatePlayer_TouchDamage" />
              <span>A player who starts with the ability to do damage by just touching enemies. This is good for 'rampage'-style games.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column" style={{flexWrap: "wrap"}}>
              <div className="eight wide column">
                <img src={makeCDNLink("/images/newActor/newActor_ShotPlayer.png")} data-template="alTemplatePlayer_Shoots" />
                <span>A player who can shoot. This is a good start for action-style games. You will also need an actor for the 'shots'...</span>
              </div>
              <br />
              <div className="eight wide column sub">
                <img src={makeCDNLink("/images/newActor/newActor_shot.png")} data-template="alTemplateShot" />
              < span>A projectile attack - arrow, bullet, fireball, etc. The  'shooting actor' has an option selecting which actor provides the shot graphics.</span>
              </div>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_player.png")} data-template="alTemplatePlayer_MeleeDamage" />
              <span>A player who starts with the ability to do damage using a melee attack. This is good for many kinds of game, but it is a more advanced feature and requires a lot of graphics to be animated.</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Equipment",
        content: <div id="mgbjr-create-actor-tab-equipment" className="actor-template ui internally celled grid">
          <span style={{padding: "10px 15px"}}>
              The player can pick up and then Equip certain items in order to gain or improve abilities...
          </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_ShotArmor.png")} data-template="alTemplateProjectileWeapon" />
              <span>An item that enables the player to shoot. This could be a gun, a bow, a magic spell, a staff, a salt pot etc. You will also need an actor for the 'shots'..</span>
            </div>
            <div className="eight wide column" style={{"boxShadow": "none"}}>
              <img src={makeCDNLink("/images/newActor/newActor_item.png")} data-template="alTemplateShotModifier" />
              <span>A Shot modifier can improve the range, rate, or damage of existing shot attacks. This might be represented as a ring, amulet, etc</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_MeleeWeapon.png")} data-template="alTemplateMeleeWeapon" />
              <span>A Melee weapon enables the player to melee attack. This could be a stick, a sword, a fish, a yoyo etc.. This is a more advanced feature since it requires many animations.</span>
            </div>
            <div className="eight wide column" style={{"boxShadow": "none"}}>
              <img src={makeCDNLink("/images/newActor/newActor_item.png")} data-template="alTemplateMeleeWeaponModifier" />
              <span>A Melee modifier can improve the damage or speed of existing melee attacks. This might be represented as a ring, amulet, etc</span>
            </div>
          </div>
          <div className="row">
            <div className="sixteen wide column">
              <img src={makeCDNLink("/images/newActor/newActor_armour.png")} data-template="alTemplateArmor" />
              <span>Armor increases the player's ability to resist attacks. Multiple pieces of armor can be combined to get a better defense.</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Enemies",
        content: <div id="mgbjr-create-actor-tab-enemies" className="actor-template ui internally celled grid">
          <span style={{padding: "10px 15px"}}>
              Enemies are a kind of 'Non Player Character' actor that can move, shoot, melee (attack) and do touch damage to the player.<br />They can be more complex and spawn/drop items when killed. Enemies cannot use items.
          </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_TouchEnemy.png")} data-template="alTemplateEnemy_TouchDamage" />
              <span>An enemy that moves randomly and can harm the player by touch.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_ShotEnemy.png")} data-template="alTemplateEnemy_Shoots" />
              <span>An enemy that moves randomly and shoots. You will also need an actor for the 'shots'...</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_shot.png")} data-template="alTemplateShot" />
              <span>A projectile attack - arrow, fireball, etc. The  'shooting actor' will select which actor provides the shot graphics.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_ShotEnemy.png")} data-template="alTemplateEnemy_ShootsFromAfar" />
              <span>An enemy that stays away from the player and shoots. You will also need an actor for the 'shots'...</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_Generator.png")} data-template="alTemplateEnemyGenerator" />
              <span>Something that generates new enemies. The rate of generation and what is generated can be selected. This could attack you too!</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_TouchEnemy.png")} data-template="alTemplateEnemy_TouchDamageHuntsPlayer" />
              <span>An enemy that moves towards the player and can harm the player by touch.</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Floors & Pushers",
        content: <div id="mgbjr-create-actor-tab-floors" className="actor-template ui internally celled grid">
          <span style={{padding: "10px 15px"}}>
              'Floor' actors are typically decorative tiles that are placed on the background layer of a map. However, there are special kinds of floor that push actors in certain directions when the actor stands on that floor...
          </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_floor.png")} data-template="alTemplateFloor" />
              <span>A normal floor tile. Decorative, but has no effect</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_ice.png")} data-template="alTemplateIce" />
              <span>A floor that pushes actors onward, as if they were on ice and cannot stop moving</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_BackPush.png")} data-template="alTemplateBounce" />
              <span>A floor that pushes actors back the way they came from</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_RandomPush.png")} data-template="alTemplatePusher_Random" />
              <span>A floor that pushes actors in a randomly chosen direction - North, East, South or West</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_DamageFloor.png")} data-template="alTemplateFriend" />
              <span>A damage-inflicting floor. It might be lava, acid, a spike etc</span>
            </div>
            <div className="eight wide column" style={{height: "130px", position: "relative"}}>
              <div className="directions">
                <img src={makeCDNLink("/images/newActor/newActor_NorthPush.png")} data-template="alTemplatePusher_North" className="north" />
                <img src={makeCDNLink("/images/newActor/newActor_eastpush.png")} data-template="alTemplatePusher_East" className="east" />
                <img src={makeCDNLink("/images/newActor/newActor_SouthPush.png")} data-template="alTemplatePusher_South" className="south" />
                <img src={makeCDNLink("/images/newActor/newActor_WestPush.png")} data-template="alTemplatePusher_West" className="west" />
              </div>
              <span className="has-directions">These floors push the player North, East, South and West respectively</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Walls & Blocks",
        content: <div id="mgbjr-create-actor-tab-walls" className="actor-template ui internally celled grid">
          <span style={{padding: "10px 15px"}}>
            'Wall' actors are placed on the background layer of a map and can stop NPCs and/or players from passing through. There are also 'blocks' which are like walls, except they are placed on the active layer and can be pushed by the player
          </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_wall.png")} data-template="alTemplateWall" />
              <span>This wall prevents all actors from passing through it.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_PlayerBlock.png")} data-template="alTemplateWall_BlocksPlayer" />
              <span>This kind of wall only stops players from passing through it.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_EnemyBlock.png")} data-template="alTemplateWall_BlocksNPC" />
              <span>This kind of wall only stops NPCs and enemy actors from passing through it.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_PlayerBlock.png")} data-template="alTemplateWall_BlocksPlayer" />
              <span>This kind of wall only stops players from passing through it.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_Door.png")} data-template="alTemplateDoor" />
              <span>This kind of wall acts like a door - it allows the player to pass if they are carrying a specified item.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_wall.png")} data-template="alTemplateWall_Conditional" />
              <span>This wall has 'conditional behavior'. This is an example of an advanced feature that lets actors appear or disappear depending on which other actors are currently on the map...</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_slider.png")} data-template="alTemplateSlidingBlock" />
              <span>A solid block that can be pushed to make it slide some distance</span>
            </div>
          </div>
        </div>
      },
      {
        tab: "Items",
        content: <div id="mgbjr-create-actor-tab-item" className="actor-template ui internally celled grid">
          <span style={{padding: "10px 15px"}}>
            Items can be instantly used when encountered, or picked up and used/equipped later.
          </span>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_maxhp.png")} data-template="alTemplateItem_MaxHealthBoost" />
              <span>This instantly raises the player's maximum allowed health level by a specified amount.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_instantHealth.png")} data-template="alTemplateItem_HealNow" />
              <span>This item instantly heals the player by a specified amount.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_HealthPotion.png")} data-template="alTemplateItem_HealLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to heal the player by a specified amount when needed.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_item.png")} data-template="alTemplateItem_InvincibilityNow" />
              <span>This makes the player temporarily invincible.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_InvinciblePotion.png")} data-template="alTemplateItem_InvincibilityLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to make the player temporarily invincible when needed.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_HealthPotion.png")} data-template="alTemplateItem_HealLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to make the player temporarily invincible when needed.</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_instantPoints.png")} data-template="alTemplateItem_ScorePoints" />
              <span>This changes the player's score.</span>
            </div>
            <div className="eight wide column">
              <img src={makeCDNLink("/images/newActor/newActor_Win.png")} data-template="alTemplateItem_VictoryNow" />
              <span>When the player picks up this item, the player wins!</span>
            </div>
          </div>
        </div>
      }
    ]
  }
  */
  handleTemplateClick(e) {
    if (e.target.dataset.template) {
      this.closeModal = true
      this.templateSelected = true
      const templateName = e.target.dataset.template
      this.loadTemplate(templateName)
      this.props.handleDescriptionChange('Created from Template: ' + templateName.replace(/^alTemplate/, ''))
      this.handleSave('Initial Template selected')
      joyrideCompleteTag(`mgbjr-CT-create-actor-any`)
    }
  }
  loadTemplate(tpl) {
    // force defaults
    this.props.asset.content2 = getDefaultActor()
    const t = templates[tpl]
    const d = this.props.asset.content2.databag
    const merge = (a, b) => {
      // Is this different from things like _.merge or Object.Assign()
      for (let i in a) {
        if (typeof b[i] == 'object') merge(a[i], b[i])
        else b[i] = a[i]
      }
    }
    merge(t, d)
    this.forceUpdate()
  }
  loadDefaultTemplate() {
    // force defaults
    const templateName = 'alTemplateScenery'
    this.props.asset.content2 = getDefaultActor()
    const t = templates[templateName]
    const d = this.props.asset.content2.databag

    const merge = (a, b) => {
      // Is this different from things like _.merge or Object.Assign()
      for (let i in a) {
        if (typeof b[i] == 'object') merge(a[i], b[i])
        else b[i] = a[i]
      }
    }
    merge(t, d)
    this.handleSave()
    this.forceUpdate()
  }
  render() {
    const { asset } = this.props
    if (!asset) return null
    const databag = asset.content2.databag
    const LayerValid = ({ layerName, isValid }) =>
      isValid
        ? <strong>{layerName}: Yes&emsp;</strong>
        : <em style={{ color: 'grey' }}>{layerName}: No&emsp;</em>

    return (
      <div className="ui grid edit-actor">
        <b title="This Actor can work on the following Layers of an ActorMap">ActorMap Layers:</b>
        <div id="mgbjr-edit-actor-layerValid">
          <LayerValid layerName="Background" isValid={ActorValidator.isValidForBG(databag)} />
          <LayerValid layerName="Active" isValid={ActorValidator.isValidForActive(databag)} />
          <LayerValid layerName="Foreground" isValid={ActorValidator.isValidForFG(databag)} />
        </div>
        {!databag &&
          !this.closeModal &&
          <Modal
            defaultOpen
            closeOnDocumentClick={false}
            closeOnDimmerClick
            onUnmount={() => {
              if (!this.templateSelected) this.loadDefaultTemplate()
            }}
            onClick={e => {
              this.handleTemplateClick(e)
            }}
          >
            <Modal.Header>
              Choose a template for the type of Actor, then modify the detailed options in the Actor Editor
            </Modal.Header>
            <Modal.Content className="edit-actor">{this.getTemplates()}</Modal.Content>
          </Modal>}
        {databag && <Tabs tabs={this.getTabs(databag)} />}
      </div>
    )
  }
}
