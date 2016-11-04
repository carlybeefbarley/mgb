'use strict'
import _ from 'lodash'
import React from 'react'

import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import EditModes from '../../Common/Map/Tools/EditModes.js'
import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorValidator from '../../Common/ActorValidator.js'

import ActorControls from './ActorControls.js'
import Tileset from '../../Common/Map/Tools/TileSet.js'


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
    if (!asset)
      return

    if (asset.kind != "actor") {
      alert("TD: Only actors are supported in the actor map")
      return
    }

    console.log("Dropped asset", asset)
    const name = asset.dn_ownerName +":"+ asset.name
    const tileset = {
      columns: 1,
      firstgid: 0,
      image: '',
      imageheight: 0,
      imagewidth: 0,
      margin: 0,
      name: name,
      spacing: 0,
      tilecount: 1,
      tileheight: 32,
      tilewidth: 32
    }
    // TODO: make clean load actor method
    const nextId = Infinity
    const map = { [name] : tileset }
    ActorHelper.loadActor(name, map, nextId, {}, null, () => {
      //this.map.data.tilesets.push(map[name]) // if loaded from cache map loses
      this.props.addActor(map[name])
    })
  }

  renderEmpty () {
    return (
      <div className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Actors</span>
          </div>
          { this.renderContent(false) }
        </div>
      </div>
    )
  }
  renderContent (tileset) {
    return (
      <div
        className='active tilesets accept-drop'
        data-drop-text='Drop asset here to create TileSet'
        onDrop={this.onDropOnLayer.bind(this)}
        onDragOver={DragNDropHelper.preventDefault}>

        { !tileset
          ? <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>Drop Actor (from side panel) here to add it to map</p>
          : <ActorControls
          activeTileset={this.tilesetIndex}
          removeTileset={this.props.removeTileset}
          ref='controls' />
        }
        <div className='tileset' ref='layer' style={{ maxHeight: '250px', overflow: 'auto', clear: 'both' }}>
          <canvas
            ref='canvas'
            onMouseDown={this.onMouseDown.bind(this)}
            onMouseUp={this.onMouseUp.bind(this)}
            onMouseMove={e => { this.onMouseMove(e.nativeEvent) } }
            onMouseLeave={this.onMouseLeave.bind(this)}
            onContextMenu={e => { e.preventDefault(); return false; } } >
          </canvas>
        </div>
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
    const tilesets = this.renderTileset(1)
    const ts = this.tileset
    if(!ts){
      return this.renderEmpty()
    }
    // actions don't have actor..
    if (!ts.actor)
      ts.actor = {}

    const layer = this.props.getActiveLayerData()

    let isValidForLayer = layer ? ActorHelper.checks[layer.name](ts) : true  // There's some case when loading a map to play it when this isn't ready yet

    return (
      <div className='mgbAccordionScroller tilesets'>
        <div className='ui fluid styled accordion'>
          <div
            className='active title accept-drop'
            >
            <span className='explicittrigger'><i className='dropdown icon'></i> Actors</span>
            <div className='ui simple dropdown top right basic grey below label item'
                 style={{ float: 'right', paddingRight: '20px', 'whiteSpace': 'nowrap', 'maxWidth': '70%', "minWidth": "50%", top: "-5px" }}>
              <i className='dropdown icon'></i>
              <span className='tileset-title' title={ts.imagewidth + 'x' + ts.imageheight}
                    style={{ 'textOverflow': 'ellipsis', 'maxWidth': '85%', float: 'right', 'overflow': 'hidden' }}>{ts.name} {ts.imagewidth + 'x' + ts.imageheight}</span>
              <div className='floating ui tiny green label'>
                {this.props.tilesets.length - 1}
              </div>
              <div className='menu' style={{"maxHeight": "295px", "overflow": "auto", "maxWidth": "50px"}}>
                {tilesets}
              </div>
            </div>
          </div>
          <div className="content active actor-tileset-content">
            {!isValidForLayer && <div className="actor-disabled-hint">
              <em>{ts.name}</em> is not valid for selected layer <em>{layer.name}</em>
              <small>{this.renderValidLayerInfo(ActorHelper.checks, ts, layer.name)}</small>
            </div>}
            {this.renderContent(ts)}
          </div>
        </div>
      </div>
    )
  }
}
