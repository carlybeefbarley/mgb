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

  get tileset(){
    return this.props.tilesets[0]
  }

  onMouseDown(e) {
    super.onMouseDown(e)
    this.props.setActiveLayerByName("Events")
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
  renderContent () {
    return (
      <div className='active tilesets'>
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
    const ts = this.tileset
    // actions don't have actor..
    if (!ts.actor)
      ts.actor = {}

    return (
      <div className='mgbAccordionScroller tilesets'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Events </span>
          </div>
          <div className="content active" style={{height: "52px"}}>
            {this.renderContent(this.tileset)}
          </div>
        </div>
      </div>
    )
  }
}
