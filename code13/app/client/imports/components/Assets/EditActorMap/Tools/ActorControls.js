import _ from 'lodash'
import React from 'react'
import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
export default class ActorControls extends React.Component {
  removeTileset = () => {
    this.props.removeTileset(this.props.activeTileset)
  }
  render() {
    return (
      <div className="ui mini">
        <div className="ui icon buttons mini" style={{ position: 'relative', top: '-10px' }} />
        {this.props.activeTileset > 0 && (
          <div
            className="ui icon buttons right floated mini"
            title="Remove Actor"
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
