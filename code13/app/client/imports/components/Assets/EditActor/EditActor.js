import _ from 'lodash'
import React from 'react'
import { Modal, Segment, Grid } from 'semantic-ui-react'
import { joyrideStore } from '/client/imports/stores'
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
    this.state = {
      isTemplateSelected: false,
    }
  }

  doSnapshotActivity = () => {
    let passiveAction = {
      isActor: true, // This could in future have info such as which layer is being edited, but not needed yet
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  componentDidMount() {
    this.doSnapshotActivity()
  }

  handleSave = (reason, thumbnail) => {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }
    this.props.handleContentChange(this.props.asset.content2, thumbnail, reason)
  }

  getTabs = databag => {
    const _makeContent = Element => (
      <Element
        asset={this.props.asset}
        onChange={this.handleSave.bind(this)}
        saveThumbnail={d => this.handleSave(null, d, 'Updating thumbnail')}
        saveText={text => this.props.handleDescriptionChange(text)}
        canEdit={this.props.canEdit}
      />
    )

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

  getTemplates = () => {
    const segmentStyle = {
      height: '100%',
      verticalAlign: 'middle',
      overflow: 'hidden',
      cursor: 'pointer',
      border: '1px solid rgba(34,36,38,.15)',
      boxShadow: '0 1px 2px 0 rgba(34,36,38,.15)',
    }

    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={8}>
            <Segment
              id="mgbjr-create-actor-scenery"
              onClick={this.handleTemplateClick('Scenery')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-player"
              onClick={this.handleTemplateClick('Player')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-enemy"
              onClick={this.handleTemplateClick('Enemy')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-friend"
              onClick={this.handleTemplateClick('Friend')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-floor"
              onClick={this.handleTemplateClick('Floor')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-solidobject"
              onClick={this.handleTemplateClick('SolidObject')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-item"
              onClick={this.handleTemplateClick('Item')}
              style={segmentStyle}
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
              id="mgbjr-create-actor-shot"
              onClick={this.handleTemplateClick('Shot')}
              style={segmentStyle}
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

  renderTemplates = () => {
    return (
      <div>
        <h3 style={{ textAlign: 'center' }}>
          Choose a template for the type of Actor, then modify the detailed options in the Actor Editor
        </h3>
        <div className="edit-actor">{this.getTemplates()}</div>
      </div>
    )
  }

  handleTemplateClick = actorType => () => {
    this.setState({ isTemplateSelected: true })
    this.loadTemplate('alTemplate' + actorType)
    this.props.handleDescriptionChange('Created from Template: ' + actorType)
    this.handleSave('Initial Template selected')
    joyrideStore.completeTag(`mgbjr-CT-create-actor-${actorType.toLowerCase()}`)
  }
  handleModalClose = () => {
    if (!this.state.isTemplateSelected) this.loadDefaultTemplate()
  }
  loadTemplate = tpl => {
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
  loadDefaultTemplate = () => {
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
      isValid ? (
        <strong>{layerName}: Yes&emsp;</strong>
      ) : (
        <em style={{ color: 'grey' }}>{layerName}: No&emsp;</em>
      )

    return (
      <Grid className="edit-actor">
        {databag ? (
          <div style={{ width: '100%', overflow: 'hidden' }}>
            <div>
              <b title="This Actor can work on the following Layers of an ActorMap">ActorMap Layers:</b>
              <div id="mgbjr-edit-actor-layerValid">
                <LayerValid layerName="Background" isValid={ActorValidator.isValidForBG(databag)} />
                <LayerValid layerName="Active" isValid={ActorValidator.isValidForActive(databag)} />
                <LayerValid layerName="Foreground" isValid={ActorValidator.isValidForFG(databag)} />
              </div>
            </div>

            <Tabs tabs={this.getTabs(databag)} />
          </div>
        ) : (
          this.renderTemplates()
        )}
      </Grid>
    )
  }
}
