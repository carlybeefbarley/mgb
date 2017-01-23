'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import LayerTypes from './LayerTypes.js'

export default class LayerControls extends React.Component {
  get options () {
    return this.props.options
  }

  componentDidMount () {
    $('.ui.dropdown').dropdown()
  }

  addLayer (type) {
    this.props.addLayer(type)
  }

  render () {
    const highlightClassName = `ui floated icon blue button ${this.options.highlightActiveLayer ? 'inverted' : ''}`

    return (
      <div className='ui mini' style={{ position: 'relative', top: '-10px' }}>
        <div className='ui icon buttons mini'>
          <button className={highlightClassName} onClick={this.props.highlightActiveLayerToggle} title='Highlight Active layer'>
            <i className='idea icon' />&nbsp;Highlight active
          </button>
        </div>
      </div>
    )
  }
}
