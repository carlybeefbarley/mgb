import React from 'react'
import { Label, Segment } from 'semantic-ui-react'
import LayerControls from './LayerControls.js'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'


export default class Layers extends React.Component {

  componentDidMount () {
  }

  handleClick (layerNum) {
    this.props.setActiveLayer(layerNum)
  }
  showOrHideLayer (layerId, wasVisible, e) {
    e.preventDefault()
    e.stopPropagation()

    this.props.toggleLayerVisibilty(layerId, !wasVisible)
  }
  renameLayer(layerId, changed){
    this.props.renameLayer(layerId, changed.name)
  }

  render () {
    const data = this.props.layers
    const active = this.props.activeLayer
    const layers = []

    // layers goes from bottom to top - as first drawn layer will be last visible
    for (let i = data.length - 1; i > -1; i--) {
      let className = 'icon'
      + (data[i].visible ? ' unhide' : ' hide')
      // <i className={`ui ${i == active ? 'right caret' : ''} icon`} />
      layers.push(
        <div
          key={i}
          className={(i === active ? 'bold active' : 'item')}
          href='javascript:;'>
          <i className={className}
             onClick={this.showOrHideLayer.bind(this, i, data[i].visible)}></i>
          <span>
            <i className={`ui ${i === active ? 'right caret' : ''} icon`} />
            <InlineEdit
              change={this.renameLayer.bind(this, i)} text={data[i].name + '-> here'} paramName="name"
              validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
            />
          </span>
        </div>
      )
    }
    return (
      <Segment id="mgbjr-MapTools-layers" style={{"margin":0}}>
        <Label attached='top'>Layers</Label>
          <LayerControls {...this.props} />
          {layers}
      </Segment>
    )
  }
}
