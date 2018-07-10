import _ from 'lodash'
import React from 'react'
import { Label, Segment } from 'semantic-ui-react'
import LayerControls from './LayerControls.js'
import { joyrideStore } from '/client/imports/stores'

export default class Layers extends React.Component {
  componentDidMount() {}

  handleClick(layerNum) {
    if (layerNum !== 3) this.props.setActiveLayer(layerNum)
    joyrideStore.completeTag(`mgbjr-CT-MapTools-layers-select${layerNum}`)
  }
  showOrHideLayer(layerId, wasVisible, e) {
    e.preventDefault()
    e.stopPropagation()
    this.props.toggleLayerVisibilty(layerId, !wasVisible)
  }

  render() {
    const data = this.props.layers
    const active = this.props.activeLayer
    const layers = []

    // layers goes from bottom to top - as first drawn layer will be last visible
    for (let i = data.length - 1; i > -1; i--) {
      let className = 'icon' + (data[i].visible ? ' unhide' : ' hide')
      // Make Events unclickable
      let layerDiv =
        i !== 3 ? (
          <div
            key={i}
            className={i === active ? 'bold active' : 'item'}
            onClick={this.handleClick.bind(this, i)}
            href="javascript:;"
          >
            <i
              className={className}
              style={{ cursor: 'pointer' }}
              onClick={this.showOrHideLayer.bind(this, i, data[i].visible)}
            />
            <a href="javascript:;">
              <i className={`ui ${i === active ? 'right caret' : ''} icon`} />
              {data[i].name}
            </a>
          </div>
        ) : (
          <div
            key={i}
            className={i === active ? 'bold active' : 'item'}
            onClick={this.handleClick.bind(this, i)}
          >
            <i
              className={className}
              style={{ cursor: 'pointer' }}
              onClick={this.showOrHideLayer.bind(this, i, data[i].visible)}
            />
            <i className={`ui ${i === active ? 'right caret' : ''} icon`} />
            {data[i].name}
          </div>
        )

      // <i className={`ui ${i == active ? 'right caret' : ''} icon`} />
      layers.push(layerDiv)
    }
    return (
      <Segment id="mgbjr-MapTools-layers" style={{ margin: 0 }}>
        <Label attached="top">Layers</Label>
        <LayerControls {...this.props} />
        {layers}
      </Segment>
    )
  }
}
