import React from 'react'
import { Label, Segment, Grid, Icon } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers.js'
import _ from 'lodash'


export default class ActorTileset extends React.Component {

  componentWillMount() {
    // Properly update imported actor names and gids
    if (this.props.tilesets && this.props.tilesets.length > 1) {
      // Assumes if first actor does not have owner:asset convention and has improper gid, the rest are too
      if (this.props.tilesets[1].name.indexOf(':') === -1) 
        this.props.fixImportNames()
      if (this.props.tilesets[1].firstgid < 100) {		
        this.props.fixImportGids()}
    }
  }

  // getter - returns active tileset
  get tileset(){
    return this.props.tilesets[this.props.activeTileset]
  }

  getTilesetLayer(tileset) {
    if (ActorHelper.checks["Background"](tileset))
      return "Background"
    if (ActorHelper.checks["Active"](tileset))
      return "Active"
    if (ActorHelper.checks["Foreground"](tileset))
      return "Foreground"
  }

  selectTileset(index, tileset) {
    this.props.clearActiveSelection()
    const selectedTile = new SelectedTile()
    const gid = selectedTile.getGid(tileset)
    this.props.selectTile(selectedTile)
    this.props.selectTileset(index)
  }

  removeTileset = () => {
    if (!this.props.activeTileset || this.props.activeTileset.firstgid === 1) { return } // Don't remove Events
    this.props.removeTileset(this.props.activeTileset)
    this.props.clearActiveSelection()
  }

  onDropOnLayer (e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    joyrideCompleteTag(`mgbjr-CT-MapTools-actors-drop`)
    if (!asset)
      return

    // TODO: create nice popup
    if (asset.kind !== "actor") {
      showToast("TD: Only Actors are supported in ActorMap ", 'warning')
      return
    }

    const name = asset.dn_ownerName +":"+ asset.name
    if (_.some(this.props.tilesets, { name: name } ))
    {
      showToast(`TD: This Map already contains Asset '${name}'`, 'warning')
      return
    }

    this.props.startLoading()
    const tileset = {
      columns:      1,
      firstgid:     0,
      image:        '',
      imageheight:  0,
      imagewidth:   0,
      margin:       0,
      name:         name,
      spacing:      0,
      tilecount:    1,
      tileheight:   32,
      tilewidth:    32
    }

    const nextId = Infinity
    const map = { [name] : tileset }
    ActorHelper.loadActor(name, map, nextId, {}, null, () => {
      this.props.addActor(map[name])
    })

    /*
    $.when(this.props.updateTilesetFromData(this.props.mgb_content2)).then(() => {
      this.selectTileset(this.props.tilesets[this.props.tilesets.length - 1])
    })
    */
  }

  renderEmpty() {
    return (
      <Segment id="mgbjr-MapTools-actors" style={{display: 'flex', height: '100%'}}>
        <Label attached='top'>
          Actors
        </Label>
        <div
          className='active content tilesets accept-drop'
          onDrop={this.onDropOnLayer.bind(this)}
          onDragOver={DragNDropHelper.preventDefault}
          style={{maxHeight: '100%', width: '100%'}}
        >
          <div style={{fontSize: '140%', textAlign: 'center', zIndex: 1, textwidth: '100%', height: '100%'}}>Drop asset here to create TileSet</div>
        </div>
      </Segment>
    )
  }

  // Render functions for Actors
  renderActors(from = 0, to = this.props.tilesets.length){
    return (
      <Grid columns='equal' style={{width: '100%', margin: 0}}>
        {this.renderTileset(from, to, this.genTilesetImage)}
      </Grid>
    )
  }

  genTilesetImage(index, isActive, tileset){
    const FittedImage = ({ src, height = '80px', ...rest}) => (
      // This is <div> instead of <img> so that it won't have the border that chrome puts on if src has no content
      <div 
        className='mgb-pixelated'
        style={{
          background: `url(${src}) no-repeat center center`,
          height: height,
          backgroundSize: 'contain'
        }} 
        {...rest}
        />
    )
    const types = ['Player', 'Non-Playable Character (NPC)', 'Item, Wall, or Scenery']
    const tsName = tileset.name.indexOf(':') === -1 ? tileset.name : tileset.name.split(':').pop()
    const title = `${tsName} (${tileset.imagewidth}x${tileset.imageheight})\n${types[parseInt(tileset.actor.databag.all.actorType)]}`

    return (
      <Grid.Column
        title={title}
        className={"tilesetPreview" + ( isActive ? " selectedTileset" : '')}
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
          opacity: 0.8
        }}
        >
        <FittedImage src={makeCDNLink(tileset.image, makeExpireTimestamp(30) /*Allow super small cache ?*/)} />
        <Label attached='bottom' style={{backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white', textAlign: 'center', padding: 0, verticalAlign: 'middle', maxHeight: '1.5em'}}>
          {
            <p style={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{tsName}</p>
          }
        </Label>
      </Grid.Column >

    )
  }

  renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList){
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    let count = 0

    for (let i = from; i < to; i++) {
      if(!tss[i].actor){
        this.props.removeTileset(this.props.activeTileset)
        return
      }
      if (ActorHelper.checks[this.props.getActiveLayerData().name](tss[i])) {
        tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
        count++
      }
    }

    // Dummy div for left-justified two-column grid that resizes and centers when switched to single column for smaller widths
    if (count % 2 !== 0) {
      tilesets.push(<Grid.Column key={-1} style={{height: 0, minWidth: '70px', width: 'calc(50% - 1em)', margin: '0.5em'}} />)
    }

    return tilesets
  }
  render(){
    if (!this.props.tilesets || (this.props.tilesets && !(this.props.tilesets.length > 1)))
      return this.renderEmpty()

    const label = this.props.getActiveLayerData().name === 'Events' ? 'Actors' : `${this.props.getActiveLayerData().name} Actors`

    return (
      <Segment id="mgbjr-MapTools-actors" style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
        <Label attached='top'>
          {label}
          {
          this.props.getActiveLayerData().name !== "Events" &&
          <Icon
              size='large'
              name='trash'
              onClick={this.removeTileset}
              style={{position: 'absolute', top: '5px', right: '-5px', cursor: 'pointer'}}
          />
          }
        </Label>
        {
          this.props.getActiveLayerData().name === "Events"
          ?
          <div className="actor-disabled-hint" style={{width: '100%', opacity: 1, backgroundColor: '#e8e8e8'}}>
            <p className="title active" style={{color: 'black', borderTop: "none", paddingTop: 0}}>You cannot use Actors in the Events layer. Use the Events Tool instead.</p>
          </div>
          :
          <div
            className='active content tilesets accept-drop'
            data-drop-text='Drop asset here to create TileSet'
            onDrop={this.onDropOnLayer.bind(this)}
            onDragOver={DragNDropHelper.preventDefault}
            style={{flex: '1 1 auto', height: '0px', maxHeight: '100%', overflowY: 'auto'}}
            >
            {this.renderActors(1)}
          </div>
        }
      </Segment>
    )
  }
}
