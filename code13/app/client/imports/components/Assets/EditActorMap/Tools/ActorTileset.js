import _ from 'lodash'
import React from 'react'
import { Label, Segment, Grid, Icon, Popup } from 'semantic-ui-react'

import { showToast } from '/client/imports/modules'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers.js'
import QLink from '/client/imports/routes/QLink'

const _tilesetHintText = 'Drag & Drop Actor assets here so they can be used on Map'
const TilesetDropHintMsg = () => (
  <span>
    <QLink style={{ cursor: 'pointer' }} query={{ _fp: 'assets' }}>
      Drag
    </QLink>{' '}
    &amp; drop Actors here so they may be used on your ActorMap
  </span>
)

export default class ActorTileset extends React.Component {
  // getter - returns active tileset
  get tileset() {
    return this.props.tilesets[this.props.activeTileset]
  }

  getTilesetLayer(tileset) {
    if (ActorHelper.checks['Background'](tileset)) return 'Background'
    if (ActorHelper.checks['Active'](tileset)) return 'Active'
    if (ActorHelper.checks['Foreground'](tileset)) return 'Foreground'
  }

  selectTileset(index, tileset) {
    this.props.clearActiveSelection()
    const selectedTile = new SelectedTile()
    const gid = selectedTile.getGid(tileset)
    this.props.selectTile(selectedTile)
    this.props.selectTileset(index)
    joyrideCompleteTag(`mgbjr-CT-MapTools-actors-selectTile`)
  }

  removeTileset = () => {
    if (!this.props.activeTileset || this.props.activeTileset.firstgid === 1) {
      return
    } // Don't remove Events
    this.props.removeTileset(this.props.activeTileset)
    this.props.clearActiveSelection()
  }

  onDropOnLayer(e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    joyrideCompleteTag(`mgbjr-CT-MapTools-actors-drop`)
    if (!asset) return

    // TODO: create nice popup
    if (asset.kind !== 'actor') {
      showToast.warning('TD: Only Actors are supported in ActorMap ')
      return
    }

    const name = asset.dn_ownerName + ':' + asset.name
    if (_.some(this.props.tilesets, { name })) {
      showToast.warning(`TD: This Map already contains Asset '${name}'`)
      return
    }

    this.props.startLoading()
    const tileset = {
      columns: 1,
      firstgid: 0,
      image: '',
      imageheight: 0,
      imagewidth: 0,
      margin: 0,
      name,
      spacing: 0,
      tilecount: 1,
      tileheight: 32,
      tilewidth: 32,
    }

    const nextId = Infinity
    const map = { [name]: tileset }
    ActorHelper.loadActor(name, map, nextId, {}, null, () => {
      this.props.addActor(map[name])
      if (tileset.actor && tileset.actor.databag)
        this.props.setActiveLayerByName(this.getTilesetLayer(tileset))
    })
  }

  renderEmpty() {
    return (
      <Segment id="mgbjr-MapTools-actors" style={{ display: 'flex', height: '100%' }}>
        <Label attached="top">Actors</Label>
        <div
          className="tilesets accept-drop"
          onDrop={this.onDropOnLayer.bind(this)}
          onDragOver={DragNDropHelper.preventDefault}
          style={{ maxHeight: '100%', width: '100%' }}
        >
          <div
            style={{ fontSize: '140%', textAlign: 'center', zIndex: 1, textwidth: '100%', height: '100%' }}
          >
            <TilesetDropHintMsg />
          </div>
        </div>
      </Segment>
    )
  }

  // Render functions for Actors
  renderActors(from = 0, to = this.props.tilesets.length) {
    return (
      <Grid columns="equal" style={{ width: '100%', margin: 0 }}>
        {this.renderTileset(from, to, this.genTilesetImage)}
      </Grid>
    )
  }

  genTilesetImage(index, isActive, tileset) {
    const FittedImage = ({ src, height = '80px', ...rest }) => (
      // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
      <div
        className="mgb-pixelated"
        style={{
          background: `url("${src}") no-repeat center center`,
          height,
          backgroundSize: 'contain',
        }}
        {...rest}
      />
    )
    const types = [
      'Player',
      'Non-Playable Character (NPC)',
      'Item, Wall, or Scenery',
      'Scenery',
      'Shot',
      'Item',
      'Solid Object',
      'Floor',
    ]
    const tsName = tileset.name.indexOf(':') === -1 ? tileset.name : tileset.name.split(':').pop()
    const title = `${tsName} (${tileset.imagewidth}x${tileset.imageheight})\n${types[
      parseInt(tileset.actor.databag.all.actorType)
    ]}`

    return (
      <Grid.Column
        title={title}
        className={'tilesetPreview' + (isActive ? ' selectedTileset' : '')}
        key={index}
        onClick={() => {
          this.selectTileset(index, tileset)
        }}
        style={{
          minWidth: '70px',
          width: 'calc(50% - 1em)',
          maxHeight: 'calc(50% - 1em)',
          margin: '0.5em',
          padding: 0,
          borderRadius: '.28571429rem',
          border: 'none',
          boxShadow: '0 1px 3px 0 grey, 0 0 0 1px grey',
          opacity: 0.8,
        }}
      >
        <FittedImage
          src={makeCDNLink(tileset.image, makeExpireTimestamp(120) /*Allow super small cache ?*/)}
        />
        <Label
          attached="bottom"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            textAlign: 'center',
            padding: 0,
            verticalAlign: 'middle',
            maxHeight: '1.5em',
          }}
        >
          {<p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{tsName}</p>}
        </Label>
      </Grid.Column>
    )
  }

  renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList) {
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    let count = 0

    for (let i = from; i < to; i++) {
      if (!tss[i].actor) {
        this.props.removeTileset(this.props.activeTileset)
        // TODO - some kind of logging?
        return // return null?
      }
      if (ActorHelper.checks[this.props.getActiveLayerData().name](tss[i])) {
        tilesets.push(genTemplate.call(this, i, tss[i] === ts, tss[i]))
        count++
      }
    }

    // Dummy div for left-justified two-column grid that resizes and centers when switched to single column for smaller widths
    if (count % 2 !== 0) {
      tilesets.push(
        <Grid.Column
          key={-1}
          style={{ height: 0, minWidth: '70px', width: 'calc(50% - 1em)', margin: '0.5em' }}
        />,
      )
    }

    return tilesets
  }
  render() {
    if (!this.props.tilesets || (this.props.tilesets && !(this.props.tilesets.length > 1)))
      return this.renderEmpty()

    // TODO: Some kind of (Showing n of m) using something like...
    const layerData = this.props.getActiveLayerData()
    const layerName = layerData ? layerData.name : 'Background'
    const isEventLayer = layerName === 'Events'
    const numActorsthisLayer = _.filter(this.props.tilesets, t => t.actor && ActorHelper.checks[layerName](t))
      .length
    const numActorsTotal = this.props.tilesets.length - 1

    return (
      <Segment
        id="mgbjr-MapTools-actors"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Label attached="top">
          {isEventLayer ? 'Actors' : `${layerName} Actors`}
          {!isEventLayer && (
            <Icon
              size="large"
              name="trash"
              onClick={this.removeTileset}
              style={{ position: 'absolute', top: '5px', right: '-5px', cursor: 'pointer' }}
              title="Remove selected Actor from this ActorMap"
            />
          )}
        </Label>
        {isEventLayer ? (
          <div
            className="actor-disabled-hint"
            style={{ width: '100%', opacity: 1, backgroundColor: '#e8e8e8' }}
          >
            <p style={{ color: 'black', borderTop: 'none', paddingTop: 0 }}>
              You cannot use Actors in the Events layer. Use the Events Tool instead for setting Music and
              Warp .
            </p>
          </div>
        ) : (
          <div
            className="tilesets accept-drop"
            data-drop-text={_tilesetHintText}
            onDrop={this.onDropOnLayer.bind(this)}
            onDragOver={DragNDropHelper.preventDefault}
            style={{ flex: '1 1 auto', height: '0px', maxHeight: '100%', overflowY: 'auto' }}
          >
            {this.renderActors(1)}
            <div>
              <Popup
                on="hover"
                mouseEnterDelay={800}
                size="small"
                inverted
                trigger={
                  <small>
                    {numActorsthisLayer} of your {numActorsTotal} dragged-in Actors are compatible with this
                    layer.
                  </small>
                }
                header={`Actors list for '${layerName}' layer`}
                position="left center"
                content="This box only displays Actors who have behavior types that work on the currently selected layer. For example, a 'player' Actor can only be used on the Active layer. Select a different layer above to see other actors."
              />
            </div>
          </div>
        )}
      </Segment>
    )
  }
}
