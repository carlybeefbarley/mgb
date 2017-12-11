import _ from 'lodash'
import React from 'react'
import LayerControls from './LayerControls.js'
import { Accordion, List } from 'semantic-ui-react'
import LayerTypes from '/client/imports/components/Assets/Common/Map/Tools/LayerTypes'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import validate from '/imports/schemas/validate'

export default class Layers extends React.Component {
  handleClick = (event, index) => {
    // do not change selection when toggling visibility icon
    if (_.includes(event.target.classList, 'icon')) return

    this.props.setActiveLayer(index)
  }

  showOrHideLayer = (e, i, isVisible) => {
    e.preventDefault()
    e.stopPropagation()

    this.props.toggleLayerVisibilty(i, !isVisible)
  }

  renameLayer(layerId, changed) {
    this.props.renameLayer(layerId, changed.name)
  }

  render() {
    const data = this.props.layers
    const active = this.props.activeLayer
    const layers = []

    // layers goes from bottom to top - as first drawn layer will be last visible - uncomment for performance
    _.times(data.length, i => {
      layers.unshift(
        <List.Item key={i} active={i === active} onClick={e => i !== active && this.handleClick(e, i)}>
          <List.Icon
            name={data[i].visible ? 'unhide' : 'hide'}
            onClick={e => this.showOrHideLayer(e, i, data[i].visible)}
          />
          <List.Content style={{ width: '100%' }}>
            {i === active ? (
              <InlineEdit
                change={this.renameLayer.bind(this, i)}
                text={data[i].name ? data[i].name : '(unnamed)'}
                paramName="name"
                validate={val => validate.notEmpty(val) && validate.lengthCap(val, 255)}
              />
            ) : (
              <span>{data[i].name}</span>
            )}

            <small style={{ float: 'right' }}>
              ({_.findKey(LayerTypes, kv => kv === data[i].type)} layer)
            </small>
          </List.Content>
        </List.Item>,
      )
    })

    const panels = [
      {
        title: 'Layers',
        content: {
          key: 'layers-content',
          content: (
            <div>
              <LayerControls {...this.props} />
              <List selection>{layers}</List>
              {this.props.children}
            </div>
          ),
        },
      },
    ]

    return <Accordion fluid styled panels={panels} defaultActiveIndex={0} />
  }
}
