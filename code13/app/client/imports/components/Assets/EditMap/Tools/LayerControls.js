'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../../Common/Map/Helpers/TileHelper.js'
import LayerTypes from '../../Common/Map/Tools/LayerTypes.js'

export default class LayerControls extends React.Component {

  get options () {
    return this.props.options
  }
  constructor (...args) {
    super(...args)
  }

  componentDidMount () {
    $('.ui.dropdown').dropdown()
  }

  addLayer (type) {
    this.props.addLayer(type)
  }

  render () {
    const highlightClassName = `ui floated icon button ${this.options.highlightActiveLayer ? 'primary' : ''}`

    const rise = (
    <button className={this.props.activeLayer < this.props.layers.length - 1 ? 'ui floated icon button' : 'ui floated icon button disabled'} onClick={this.props.raiseLayer} title='Raise Layer'>
      <i className='angle up icon'></i>
    </button>
    )
    const lower = (
    <button className={this.props.activeLayer > 0
      ? 'ui floated icon button'
      : 'ui floated icon button disabled'
      } onClick={this.props.lowerLayer} title='Lower Layer'>
      <i className='angle down icon'></i>
    </button>
    )

    // TODO(dgolds): get nice highlight layer icon - atm - paste was closest I could find
    return (
      <div className='ui mini' style={{ position: 'relative', top: '-10px' }}>
        <div className='ui icon buttons mini' title='New Layer'>
          <div className='ui dropdown button'>
            <i className='add icon'></i>
            <div className='menu'>
              <div className='item' onClick={this.addLayer.bind(this, LayerTypes.tile)}>
                Add New Tile Layer
              </div>
              <div className='item' onClick={this.addLayer.bind(this, LayerTypes.image)}>
                Add New Image Layer
              </div>
              <div className='item' onClick={this.addLayer.bind(this, LayerTypes.object)}>
                Add New Object Layer
              </div>
            </div>
          </div>
          <button className={highlightClassName} onClick={this.props.highlightActiveLayerToggle} title='Highlight Active layer'>
            <i className='paste icon'></i>
          </button>
        </div>
        <div className='ui icon buttons mini'>
          {rise}
          {lower}
        </div>
        <div className='ui icon buttons right floated mini' title='Remove Active Layer'>
          {this.props.layers.length && <button className='ui icon button' onClick={this.props.removeLayer}>
            <i className='remove icon'></i>
          </button>
          }
        </div>
      </div>
    )
  }
}
