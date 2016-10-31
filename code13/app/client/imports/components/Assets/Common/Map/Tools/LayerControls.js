'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import LayerTypes from './LayerTypes.js'

export default class LayerControls extends React.Component {

  constructor (...args) {
    super(...args)
  }

  componentDidMount () {
    $('.ui.dropdown').dropdown()
    this.updateOptions()
  }

  get map () {
    const parent = this.props.layer
    return parent.props.info.content.map
  }
  get options () {
    return this.map.meta.options
  }

  addLayer (type) {
    const parent = this.props.layer
    const map = parent.props.info.content.map
    const lss = map.data.layers
    map.saveForUndo('Add Layer')

    // TODO: check for duplicate names..
    // TODO: get rid of strings
    let ls
    if (type == LayerTypes.tile) {
      ls = TileHelper.genLayer(map.data.width, map.data.height, 'Tile Layer ' + (lss.length + 1))
    }
    else if (type == LayerTypes.image) {
      ls = TileHelper.genImageLayer('Image Layer ' + (lss.length + 1))
    }
    else if (type == LayerTypes.object) {
      ls = TileHelper.genObjectLayer('Object Layer ' + (lss.length + 1))
    }

    lss.push(ls)
    map.forceUpdate()
    parent.forceUpdate()
  }

  render () {
    const highlightClassName = `ui floated icon button ${this.options.highlightActiveLayers ? 'primary' : ''}`
    const showGridClassName = `ui floated icon button ${this.options.showGrid ? 'primary' : ''}`

    const rise = (
    <button className={this.map.activeLayer < this.map.data.layers.length - 1 ? 'ui floated icon button' : 'ui floated icon button disabled'} onClick={this.raiseLayer.bind(this)} title='Raise Layer'>
      <i className='angle up icon'></i>
    </button>
    )
    const lower = (
    <button className={this.map.activeLayer > 0 ? 'ui floated icon button' : 'ui floated icon button disabled'} onClick={this.lowerLayer.bind(this)} title='Lower Layer'>
      <i className='angle down icon'></i>
    </button>
    )

    return (
      <div className='ui mini' style={{ position: 'relative', top: '-10px' }}>
        <div className='ui icon buttons mini' title='New Layer'>
        {/*
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
          */}
          <button className={highlightClassName} onClick={this.highlightActiveLayerToggle.bind(this)} title='Highlight Active layer'>
            <i className='idea icon' />&nbsp;Highlight active
          </button>
        </div>
        {/*
        <div className='ui icon buttons mini'>
          {rise}
          {lower}
        </div>
        <div className='ui icon buttons right floated mini' title='Remove Active Layer'>
          <button className='ui icon button' onClick={this.removeLayer.bind(this)}>
            <i className='remove icon'></i>
          </button>
        </div>
        */}
      </div>
    )
  }
}
