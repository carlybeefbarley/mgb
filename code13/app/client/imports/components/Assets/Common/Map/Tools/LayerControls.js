import React from 'react'
import { Button, Icon } from 'semantic-ui-react'

export default class LayerControls extends React.Component {
  get options() {
    return this.props.options
  }

  addLayer(type) {
    this.props.addLayer(type)
  }

  render() {
    return (
      <div style={{ position: 'relative', top: '-10px' }}>
        <Button
          size="mini"
          icon
          color="blue"
          inverted={this.options.highlightActiveLayer}
          onClick={this.props.highlightActiveLayerToggle}
          title="Highlight Active layer"
        >
          <Icon name="idea" /> Highlight active
        </Button>
      </div>
    )
  }
}
