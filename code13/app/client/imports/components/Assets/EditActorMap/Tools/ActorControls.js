'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
export default class ActorControls extends React.Component {
  render () {
    return (
      <div className='ui mini'>
        <div className='ui icon buttons mini' style={{ position: 'relative', top: '-10px' }}>
        </div>
        {this.active > 0 &&
        <div className='ui icon buttons right floated mini' title='Remove Actor'
             style={{ position: 'relative', top: '-10px' }}>
          <button className='ui icon button' onClick={this.props.removeTileset}>
            <i className='remove icon'></i>
          </button>
        </div>
        }
      </div>
    )
  }
}
