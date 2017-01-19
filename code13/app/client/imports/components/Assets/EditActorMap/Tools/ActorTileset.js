'use strict'
import _ from 'lodash'
import React from 'react'
import { Label, Segment, Grid, Button, Icon } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'

import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import EditModes from '../../Common/Map/Tools/EditModes.js'
import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorValidator from '../../Common/ActorValidator.js'

import ActorControls from './ActorControls.js'
import Tileset from '../../Common/Map/Tools/TileSet.js'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

const _dragHelpMsg = 'Drop Actor Assets here to use them in this ActorMap'

export default class ActorTool extends Tileset {
  constructor(){
    super()
    this.tilesetIndex = 1
  }
  
  get tileset(){
    return this.props.tilesets[this.tilesetIndex]
  }

  componentWillReceiveProps(p){
    if(p.activeTileset > 0){
      this.tilesetIndex = p.activeTileset
    }
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
    if (_.some(this.props.tilesets, { name: name } ) )
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
  }

  genActorImage(index, isActive, tileset){
    const title = `${tileset.name} ${tileset.imagewidth}x${tileset.imageheight}`
    return (
      <div
        title={title}
        className={"tilesetPreview" + (isActive ? " active" : '')}
        key={index}
        onClick={(tileset) => {
          const selectedTile = new SelectedTile()
          selectedTile.getGid(tileset)
          this.props.selectTile(selectedTile)
        }}
        >
        <img src={tileset.image}/>
        <span className="tilesetPreviewTitle">{tileset.name}</span>
      </div>
    )
  }
  
  /*
  renderActors(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList){
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    const layer = this.props.getActiveLayerData()
    let isValidForLayer = layer ? ActorHelper.checks[layer.name](ts) : true  // There's some case when loading a map to play it when this isn't ready yet
    
    for (let i = from; i < to; i++) {
      if (isValidForLayer)
        tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
    }
    return tilesets
  }

  renderEmpty () {
    return (
       <Segment id="mgbjr-MapTools-actors" className='tilesets' style={{'height': '100%', 'margin':0 }}>
        <Label attached='top'>Actors </Label>
        <div className="content active actor-tileset-content">
          { this.renderContent(false) }
        </div>
      </Segment>
    )
  }
  */
  
  renderContent (tilesets) {
    return (
      <div>
        <div
          className='active tilesets accept-drop'
          data-drop-text={_dragHelpMsg}
          onDrop={this.onDropOnLayer.bind(this)}
          onDragOver={DragNDropHelper.preventDefault}/>
        {
          !tilesets 
          ? 
          <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
          : 
          <div>
            <Button icon 
              onClick={this.props.removeTileset(this.props.activeTileset)}
              style={{float:'right'}}>
              <Icon name='trash' />
            </Button>
  
            {
              this.renderActors(1, tilesets.length, this.genActorImage).length > 0 
              ? 
              this.renderActors(1, tilesets.length, this.genActorImage)
              :
              <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
            }
          </div>
        }
      </div>
    )
  }

  renderValidLayerInfo(checks, ts, active) {
    // how this differs from native [].reverse?
    return _.reverse(
      _.map(checks, (c, i) => {
          const isValid = c(ts);
          return(
            <div style={{ fontFamily: 'monospace', marginLeft: '2em', cursor: (isValid ? "pointer" : "auto") }}
                 key={i}
                 onClick={isValid ? () => {this.props.setActiveLayerByName(i)} : null}>
              {active == i ?
                <strong><i className='ui caret right icon' />{i}</strong> : <span><i className='ui icon' />{i}</span>}
                : &emsp;{isValid ?
                  <strong>Valid</strong>
                  : <small>Not valid</small>}
            </div>
          )
        }
      ))
  }

  render () {
    if (!this.props.tilesets.length) {
      return this.renderEmpty()
    }

    return (
      <Segment id="mgbjr-MapTools-actors" className='tilesets' style={{boxSizing: 'inherit', display: 'block', height: '100%', margin: 0}}>
        <Label attached='top'>Actors {this.renderOpenListButton(1)} {this.renderForModal(1)}</Label>
          <div className="content active actor-tileset-content">
            { this.renderContent(this.props.tilesets) }
          </div>
      </Segment>
    )
  }
}
      if (isValidForLayer)