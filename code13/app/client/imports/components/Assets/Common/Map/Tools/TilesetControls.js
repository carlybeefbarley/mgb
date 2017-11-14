import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
export default class TilesetControls extends React.Component {
  removeTileset = () => {
    this.props.removeTileset(this.props.activeTileset)
  }
  render() {
    return (
      <div className="ui mini">
        <div className="ui icon buttons mini" style={{ position: 'relative', top: '-10px' }} />
        {this.props.tileset && (
          <div
            className="ui icon buttons right floated mini"
            title="Remove Active Tileset"
            style={{ position: 'relative', top: '-10px' }}
          >
            <button className="ui icon button" onClick={this.removeTileset}>
              <i className="remove icon" />
            </button>
          </div>
        )}
      </div>
    )
  }
}
