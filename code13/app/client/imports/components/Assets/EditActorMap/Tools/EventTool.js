import _ from 'lodash'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import Tileset from '../../Common/Map/Tools/TileSet.js'

export default class EventTool extends Tileset {
  get tileset() {
    return this.props.tilesets[0]
  }

  onMouseDown(e) {
    super.onMouseDown(e)
    this.props.setActiveLayerByName('Events')
  }

  renderContent() {
    return (
      <canvas
        ref="canvas"
        onMouseDown={this.onMouseDown.bind(this)}
        onMouseUp={this.onMouseUp.bind(this)}
        onMouseMove={e => {
          this.onMouseMove(e.nativeEvent)
        }}
        onMouseLeave={this.onMouseLeave.bind(this)}
        onContextMenu={e => {
          e.preventDefault()
          return false
        }}
      />
    )
  }

  render() {
    const ts = this.tileset
    // actions don't have actor..
    if (!ts.actor) ts.actor = {}

    return (
      <Dropdown
        simple
        text="Events&nbsp;"
        id="mgbjr-MapTools-events"
        className="tilesets icon small ui button"
        disabled={this.props.isPlaying}
      >
        <Dropdown.Menu>{this.renderContent()}</Dropdown.Menu>
      </Dropdown>
    )
  }
}
