import _ from 'lodash'
import React from 'react'
import LayerControls from './LayerControls.js'
import { Accordion, List } from 'semantic-ui-react'

export default class Layers extends React.Component {
  handleClick = (event, index) => {
    // do not change selection when toggling visibility icon
    if (_.includes(event.target.classList, 'icon'))
      return

    this.props.setActiveLayer(index)
  }

  showOrHideLayer = (e, i, isVisible) => {
    e.preventDefault()
    e.stopPropagation()

    this.props.toggleLayerVisibilty(i, !isVisible)
  }

  render () {
    const data = this.props.layers
    const active = this.props.activeLayer
    const layers = []

    // layers goes from bottom to top - as first drawn layer will be last visible
    _.times(data.length, (i) => {
      layers.unshift(
        <List.Item
          key={i}
          active={i == active}
          onClick={(e) => this.handleClick(e, i)}
          content={data[i].name}
          icon={{
            name: data[i].visible ? 'unhide' : 'hide',
            onClick: (e) => this.showOrHideLayer(e, i, data[i].visible)
          }}
        />
      )
    })

    const panels = [
      {
        title: 'Layers',
        content: (
          <div>
            <LayerControls {...this.props} />
            <List selection>
              {layers}
            </List>
          </div>
        )
      }
    ]

    return <Accordion fluid styled panels={panels} defaultActiveIndex={0} />
  }
}
