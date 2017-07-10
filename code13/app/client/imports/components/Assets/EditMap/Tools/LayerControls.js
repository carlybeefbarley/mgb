import _ from 'lodash'
import React from 'react'
import LayerTypes from '../../Common/Map/Tools/LayerTypes.js'
import { Button, Dropdown } from 'semantic-ui-react'

export default class LayerControls extends React.Component {
  get options() {
    return this.props.options
  }

  constructor(...args) {
    super(...args)
  }

  addLayer(type) {
    this.props.addLayer(type)
  }

  render() {
    const {
      activeLayer,
      highlightActiveLayerToggle,
      layers,
      lowerLayer,
      raiseLayer,
      removeLayer,
    } = this.props
    const items = [
      {
        onClick: this.addLayer.bind(this, LayerTypes.tile),
        text: 'Add New Tile Layer',
        value: 'Add New Tile Layer',
      },
      {
        onClick: this.addLayer.bind(this, LayerTypes.image),
        text: 'Add New Image Layer',
        value: 'Add New Image Layer',
      },
      {
        onClick: this.addLayer.bind(this, LayerTypes.object),
        text: 'Add New Object Layer',
        value: 'Add New Object Layer',
      },
    ]

    return (
      <div style={{ position: 'relative', top: '-10px' }}>
        <Button.Group size="mini" title="New Layer">
          <Dropdown button icon="add" className="icon">
            <Dropdown.Menu>
              {_.map(items, item => <Dropdown.Item key={item.value} {...item} />)}
            </Dropdown.Menu>
          </Dropdown>
          <Button
            icon="lightbulb"
            primary={this.options.highlightActiveLayer}
            onClick={highlightActiveLayerToggle}
            title="Highlight Active layer"
          />
        </Button.Group>{' '}
        <Button.Group size="mini">
          <Button
            icon="angle up"
            disabled={activeLayer >= layers.length - 1}
            onClick={raiseLayer}
            title="Raise Layer"
          />
          <Button icon="angle down" disabled={activeLayer <= 0} onClick={lowerLayer} title="Lower Layer" />
        </Button.Group>{' '}
        <Button.Group size="mini" title="Remove Active Layer" className="right floated">
          {layers.length > 1 && <Button icon="trash" onClick={removeLayer} />}
        </Button.Group>
      </div>
    )
  }
}
