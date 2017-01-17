'use strict'
import _ from 'lodash'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'

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
  }

  renderContent () {
    return (
      <canvas
        ref='canvas'
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseMove={e => { this.onMouseMove(e.nativeEvent) } }
        onMouseLeave={this.onMouseLeave.bind(this)}
        onContextMenu={e => { e.preventDefault(); return false; } } >
      </canvas>
    )
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
      <Dropdown floating labeled button text="Events" id="mgbjr-MapTools-events" className='tilesets icon small ui button'>
        <Dropdown.Menu>
          {this.renderContent(this.tileset)}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}
