import React from 'react'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import './EditActor.css'
import getDefaultActor from './getDefaultActor.js'

import templates from './TemplateDiffs.js'

import ActorValidator from '../Common/ActorValidator.js'
import actorOptions from '../Common/ActorOptions.js'

import Tabs from './Tabs.js'
import FormsAll from './Forms/All'
import Spawning from './Forms/Spawning'
import Animations from './Forms/Animations'
import Conditions from './Forms/Conditions'
import NPCBehavior from './Forms/NPCBehavior'
import ItemBehavior from './Forms/ItemBehavior'
import CharacterBehavior from './Forms/CharacterBehavior'
import { Modal } from 'semantic-ui-react'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

export default class EditActor extends React.Component {
  constructor(...props) {
    super(...props)
    this.state = {}
    this.isModalVisible = false
  }

  doSnapshotActivity() {
    let passiveAction = {
      isActor: true // This could in future have info such as which layer is being edited, but not needed yet
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount() {
    this.doSnapshotActivity()
  }

  handleSave(reason, thumbnail) {
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  getTabs(databag) {

    return [
      {
        tab: "All",
        content: <FormsAll asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "Animations",
        content: <Animations asset={this.props.asset} onchange={this.handleSave.bind(this)}/>
      },
      {
        tab: "Character Behavior",
        disabled: (
          databag.all.actorType == actorOptions.actorType['Item, Wall or Scenery']
            || databag.all.actorType == actorOptions.actorType['Shot']
        ),
        content: <CharacterBehavior asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "NPC Behavior",
        disabled: (
          databag.all.actorType == actorOptions.actorType['Player']
            || databag.all.actorType == actorOptions.actorType['Item, Wall or Scenery']
            || databag.all.actorType == actorOptions.actorType['Shot']
        ),
        content: <NPCBehavior asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "Item Behavior",
        disabled: (
          databag.all.actorType == actorOptions.actorType['Player']
            || databag.all.actorType == actorOptions.actorType['Non-Player Character (NPC)']
            || databag.all.actorType == actorOptions.actorType['Shot']
        ),
        content: <ItemBehavior asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "Destruction / Spawning",
        disabled: (
          databag.all.actorType == actorOptions.actorType['Player']
          || databag.all.actorType == actorOptions.actorType['Shot']
        ),
        content: <Spawning asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      },
      {
        tab: "Conditions",
        disabled: (
          databag.all.actorType == actorOptions.actorType['Player']
          || databag.all.actorType == actorOptions.actorType['Shot']
        ),
        content: <Conditions asset={this.props.asset} onchange={this.handleSave.bind(this)} saveThumbnail={(d) => {
          this.handleSave(null, d, "Updating thumbnail")
        }}/>
      }
    ]
  }

  getTemplateTabs() {
    return [
      {
        tab: "Basics",
        content: <div className="actor-template ui internally celled grid">
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-player" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-player`) } src="/images/newActor/newActor_player.png" data-template="alTemplatePlayer" />
              <span>The player's character</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-enemy" className="mgbjr-create-actor-NPC" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`) } src="/images/newActor/newActor_enemy.png" data-template="alTemplateEnemy" />
              <span>Enemies and bosses</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-friend" className="mgbjr-create-actor-NPC" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-NPC`) } src="/images/newActor/newActor_friend.png" data-template="alTemplateFriend" />
              <span>Friendly characters who help the player</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-shot" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-shot`) } src="/images/newActor/newActor_shot.png"  data-template="alTemplateShot" />
              <span>A projectile attack - arrow, fireball, etc"</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-ice" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-ice`) } src="/images/newActor/newActor_ice.png" data-template="alTemplateIce" />
              <span>A floor tile. Actors who step onto this tile will keep on moving past it</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-floor" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-floor`) } src="/images/newActor/newActor_floor.png" data-template="alTemplateFloor" />
              <span>A floor tile. Decorative, but has no effect</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-wall" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-wall`) } src="/images/newActor/newActor_wall.png" data-template="alTemplateWall" />
              <span>A wall. Blocks a player or enemy</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-item" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-item`) } src="/images/newActor/newActor_item.png" data-template="alTemplateItem" />
              <span>An item that has some effect</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img id="mgbjr-create-actor-slider" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-slider`) } src="/images/newActor/newActor_slider.png" data-template="alTemplateSlidingBlock" />
              <span>A solid block that can be pushed to make it slide some distance</span>
            </div>
            <div className="eight wide column">
              <img id="mgbjr-create-actor-foreground" onClick={ () => joyrideCompleteTag(`mgbjr-CT-create-actor-foreground`) } src="/images/newActor/newActor_foreground.png" data-template="alTemplateFloor" />
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
              <img src="/images/newActor/newActor_player.png" data-template="alTemplatePlayer" />
              <span>A player with no attacks. This good for an RPG-style game as the player can gain abilities during the game.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_playerTouch.png" data-template="alTemplatePlayer_TouchDamage" />
              <span>A player who starts with the ability to do damage by just touching enemies. This is good for 'rampage'-style games.</span>
            </div>

          </div>
          <div className="row">
            <div className="eight wide column" style={{flexWrap: "wrap"}}>
              <div className="eight wide column">
                <img src="/images/newActor/newActor_ShotPlayer.png" data-template="alTemplatePlayer_Shoots" />
                <span>A player who can shoot. This is a good start for action-style games. You will also need an actor for the 'shots'...</span>
              </div>
              <br />
              <div className="eight wide column sub">
                <img src="/images/newActor/newActor_shot.png" data-template="alTemplateShot" />
              < span>A projectile attack - arrow, bullet, fireball, etc. The  'shooting actor' has an option selecting which actor provides the shot graphics.</span>
              </div>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_player.png" data-template="alTemplatePlayer_MeleeDamage" />
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
              <img src="/images/newActor/newActor_ShotArmor.png" data-template="alTemplateProjectileWeapon" />
              <span>An item that enables the player to shoot. This could be a gun, a bow, a magic spell, a staff, a salt pot etc. You will also need an actor for the 'shots'..</span>
            </div>
            <div className="eight wide column" style={{"boxShadow": "none"}}>
              <img src="/images/newActor/newActor_item.png" data-template="alTemplateShotModifier" />
              <span>A Shot modifier can improve the range, rate, or damage of existing shot attacks. This might be represented as a ring, amulet, etc</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_MeleeWeapon.png" data-template="alTemplateMeleeWeapon" />
              <span>A Melee weapon enables the player to melee attack. This could be a stick, a sword, a fish, a yoyo etc.. This is a more advanced feature since it requires many animations.</span>
            </div>
            <div className="eight wide column" style={{"boxShadow": "none"}}>
              <img src="/images/newActor/newActor_item.png" data-template="alTemplateMeleeWeaponModifier" />
              <span>A Melee modifier can improve the damage or speed of existing melee attacks. This might be represented as a ring, amulet, etc</span>
            </div>
          </div>

          <div className="row">
            <div className="sixteen wide column">
              <img src="/images/newActor/newActor_armour.png" data-template="alTemplateArmor" />
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
              <img src="/images/newActor/newActor_TouchEnemy.png" data-template="alTemplateEnemy_TouchDamage" />
              <span>An enemy that moves randomly and can harm the player by touch.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_ShotEnemy.png" data-template="alTemplateEnemy_Shoots" />
              <span>An enemy that moves randomly and shoots. You will also need an actor for the 'shots'...</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_shot.png" data-template="alTemplateShot" />
              <span>A projectile attack - arrow, fireball, etc. The  'shooting actor' will select which actor provides the shot graphics.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_ShotEnemy.png" data-template="alTemplateEnemy_ShootsFromAfar" />
              <span>An enemy that stays away from the player and shoots. You will also need an actor for the 'shots'...</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_Generator.png" data-template="alTemplateEnemyGenerator" />
              <span>Something that generates new enemies. The rate of generation and what is generated can be selected. This could attack you too!</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_TouchEnemy.png" data-template="alTemplateEnemy_TouchDamageHuntsPlayer" />
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
              <img src="/images/newActor/newActor_floor.png" data-template="alTemplateFloor" />
              <span>A normal floor tile. Decorative, but has no effect</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_ice.png" data-template="alTemplateIce" />
              <span>A floor that pushes actors onward, as if they were on ice and cannot stop moving</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_BackPush.png" data-template="alTemplateBounce" />
              <span>A floor that pushes actors back the way they came from</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_RandomPush.png" data-template="alTemplatePusher_Random" />
              <span>A floor that pushes actors in a randomly chosen direction - North, East, South or West</span>
            </div>
          </div>
          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_DamageFloor.png" data-template="alTemplateFriend" />
              <span>A damage-inflicting floor. It might be lava, acid, a spike etc</span>
            </div>
            <div className="eight wide column" style={{height: "130px", position: "relative"}}>
              <div className="directions">
                <img src="/images/newActor/newActor_NorthPush.png" data-template="alTemplatePusher_North" className="north" />
                <img src="/images/newActor/newActor_eastpush.png" data-template="alTemplatePusher_East" className="east" />
                <img src="/images/newActor/newActor_SouthPush.png" data-template="alTemplatePusher_South" className="south" />
                <img src="/images/newActor/newActor_WestPush.png" data-template="alTemplatePusher_West" className="west" />
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
              <img src="/images/newActor/newActor_wall.png" data-template="alTemplateWall" />
              <span>This wall prevents all actors from passing through it.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_PlayerBlock.png" data-template="alTemplateWall_BlocksPlayer" />
              <span>This kind of wall only stops players from passing through it.</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_EnemyBlock.png" data-template="alTemplateWall_BlocksNPC" />
              <span>This kind of wall only stops NPCs and enemy actors from passing through it.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_PlayerBlock.png" data-template="alTemplateWall_BlocksPlayer" />
              <span>This kind of wall only stops players from passing through it.</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_Door.png" data-template="alTemplateDoor" />
              <span>This kind of wall acts like a door - it allows the player to pass if they are carrying a specified item.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_wall.png" data-template="alTemplateWall_Conditional" />
              <span>This wall has 'conditional behavior'. This is an example of an advanced feature that lets actors appear or disappear depending on which other actors are currently on the map...</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_slider.png" data-template="alTemplateSlidingBlock" />
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
              <img src="/images/newActor/newActor_maxhp.png" data-template="alTemplateItem_MaxHealthBoost" />
              <span>This instantly raises the player's maximum allowed health level by a specified amount.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_instantHealth.png" data-template="alTemplateItem_HealNow" />
              <span>This item instantly heals the player by a specified amount.</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_HealthPotion.png" data-template="alTemplateItem_HealLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to heal the player by a specified amount when needed.</span>
            </div>
            <div className="eight wide column">
              <img src="/images/newActor/newActor_item.png" data-template="alTemplateItem_InvincibilityNow" />
              <span>This instantly makes the player temporarily invincible.</span>
            </div>
          </div>


          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_InvinciblePotion.png" data-template="alTemplateItem_InvincibilityLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to make the player temporarily invincible when needed.</span>
            </div>

            <div className="eight wide column">
              <img src="/images/newActor/newActor_HealthPotion.png" data-template="alTemplateItem_HealLater" />
              <span>This is a potion/meal/herb/etc that can be carried and used to make the player temporarily invincible when needed.</span>
            </div>
          </div>

          <div className="row">
            <div className="eight wide column">
              <img src="/images/newActor/newActor_instantPoints.png" data-template="alTemplateItem_ScorePoints" />
              <span>This instantly changes the player's score.</span>
            </div>

            <div className="eight wide column">
              <img src="/images/newActor/newActor_Win.png" data-template="alTemplateItem_VictoryNow" />
              <span>Victory! When the player picks up this item, the game is immediately over and they have won!</span>
            </div>

          </div>
        </div>
      }
    ]
  }

  handleTemplateClick(e) {
    if (e.target.dataset.template) {
      const templateName = e.target.dataset.template
      this.loadTemplate(templateName)
      this.props.handleDescriptionChange("Created from Template: " + templateName.replace(/^alTemplate/, ''))      
      this.handleSave("Initial Template selected")
      joyrideCompleteTag(`mgbjr-CT-create-actor-any`)
    }
  }

  loadTemplate(tpl) {
    // force defaults
    this.props.asset.content2 = getDefaultActor()

    const t = templates[tpl]
    const d = this.props.asset.content2.databag
    const merge = (a, b) => {     // Is this different from things like _.merge or Object.Assign()
      for (let i in a) {
        if (typeof b[i] == "object") 
          merge(a[i], b[i])
        else
          b[i] = a[i]        
      }
    }

    merge(t, d)
    this.forceUpdate()
  }

  render() {
    const { asset } = this.props
    if (!asset)
      return null
    
    const databag = asset.content2.databag
    const showTemplate = !databag
    
    const LayerValid = ( {layerName, isValid } ) => (isValid ? <strong>{layerName}: Yes&emsp;</strong> : <em style={{color: 'grey'}}>{layerName}: No&emsp;</em>)

    return (
      <div className='ui grid edit-actor'>
        <b title='This Actor can work on the following Layers of an ActorMap'>ActorMap Layers:</b>
        <div id="mgbjr-edit-actor-layerValid">
          <LayerValid layerName='Background' isValid={ActorValidator.isValidForBG(databag)} />
          <LayerValid layerName='Active'     isValid={ActorValidator.isValidForActive(databag)} />
          <LayerValid layerName='Foreground' isValid={ActorValidator.isValidForFG(databag)} />
        </div>

        { showTemplate && 
          <Modal defaultOpen closeOnDocumentClick={false} closeOnRootNodeClick={false}onClick={(e)=>{this.handleTemplateClick(e)}}>
            <Modal.Header>
              Choose the style of Actor you want to create, then modify the detailed choices in the Actor Editor
            </Modal.Header>
            <Modal.Content className="edit-actor">
              <Tabs tabs={this.getTemplateTabs()}/>
            </Modal.Content>
          </Modal>
        }
        { !showTemplate &&
          <Tabs tabs={this.getTabs(databag)}/>
        }
      </div>
    )
  }
}
