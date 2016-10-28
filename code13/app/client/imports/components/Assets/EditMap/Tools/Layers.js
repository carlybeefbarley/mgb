import _ from 'lodash'
import React from 'react'
import LayerControls from './LayerControls.js'

export default class Layers extends React.Component {

  componentDidMount () {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }
  get map () {
    return this.props.map
  }

  handleClick (layerNum) {
    let l = this.map.getActiveLayer()
    l && l.deactivate()

    this.map.activeLayer = layerNum

    l = this.map.getActiveLayer()
    l && l.activate()

    this.map.update()

  // this.forceUpdate()
  }
  showOrHideLayer (layer, visible, e) {
    e.preventDefault()
    e.stopPropagation()

    const mapData = this.map.data
    mapData.layers[layer].visible = !visible

    this.forceUpdate()

    setTimeout(() => {
      this.map.forceUpdate()
    }, 0)
  }

  render () {
    if(!this.map){
      return <div />
    }
    let layers = []

    const data = this.map.data
    const active = this.map.state.activeLayer
    // layers goes from bottom to top - as first drawn layer will be last visible
    for (let i = data.layers.length - 1; i > -1; i--) {
      let className = 'icon'
      + (data.layers[i].visible ? ' unhide' : ' hide')

      layers.push(
        <div
          key={i}
          className={(i == active ? 'bold active' : 'item')}
          onClick={this.handleClick.bind(this, i)}
          href='javascript:;'>
          <i className={className} onClick={this.showOrHideLayer.bind(this, i, data.layers[i].visible)}></i>
          <a href='javascript:;'>
            {data.layers[i].name}
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
            <LayerControls layer={this} />
            {layers}
          </div>
        </div>
      </div>
    )
  }
}
