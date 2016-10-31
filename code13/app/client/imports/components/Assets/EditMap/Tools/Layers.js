import _ from 'lodash'
import React from 'react'
import LayerControls from './LayerControls.js'

export default class Layers extends React.Component {

  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  handleClick (layerNum) {
    this.props.setActiveLayer(layerNum)
  }
  showOrHideLayer (layerId, wasVisible, e) {
    e.preventDefault()
    e.stopPropagation()

    this.props.toggleLayerVisibilty(layerId, !wasVisible)
  }

  render () {
    const data = this.props.layers
    const active = this.props.activeLayer

    let layers = []
    // layers goes from bottom to top - as first drawn layer will be last visible
    for (let i = data.length - 1; i > -1; i--) {
      let className = 'icon'
      + (data[i].visible ? ' unhide' : ' hide')

      layers.push(
        <div
          key={i}
          className={(i == active ? 'bold active' : 'item')}
          onClick={this.handleClick.bind(this, i)}
          href='javascript:;'>
          <i className={className} onClick={this.showOrHideLayer.bind(this, i, data[i].visible)}></i>
          <a href='javascript:;'>
            {data[i].name}
          </a>
        </div>
      )
    }
    return (
      <div className='mgbAccordionScroller'>
        <div className='ui fluid styled accordion'>
          <div className='active title'>
            <span className='explicittrigger'><i className='dropdown icon'></i> Layers</span>
          </div>
          <div className='active content menu'>
            <LayerControls
              {...this.props}
              options={this.props.options}
              />
            {layers}
          </div>
        </div>
      </div>
    )
  }
}
