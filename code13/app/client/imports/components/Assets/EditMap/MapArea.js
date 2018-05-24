import React from 'react'
import { Segment } from 'semantic-ui-react'
import BaseMapArea from '../Common/Map/BaseMapArea.js'
import LayerTypes from '../Common/Map/Tools/LayerTypes.js'
import PositionInfo from '../Common/Map/Tools/PositionInfo.js'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'

export default class MapArea extends BaseMapArea {
  get data() {
    return this.props.data
  }

  /* events */
  importFromDrop(e) {
    const layer = this.getActiveLayer()
    if (layer && layer.onDrop) {
      // layer by it's own can handle drop
      // e.g. image layer adds image
      // true - layer did something with dropped stuff
      if (layer.onDrop(e)) {
        return
      }
    }
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (asset) {
      // TODO: use enums for asset types
      if (asset.kind === 'graphic') {
        if (this.props.addLayer) {
          const layer_data = this.props.addLayer(LayerTypes.image)
          this.onImageLayerDrop(e, layer_data)
        }
      }
      return
    }

    // FileList object.
    const files = e.dataTransfer.files
    // file has been dropped
    if (files.length) {
      Array.prototype.forEach.call(files, (file, i) => {
        const reader = new FileReader()
        reader.onload = e => {
          const ext = file.name
            .split('.')
            .pop()
            .toLowerCase()
          const method = 'handleFileByExt_' + ext
          if (this[method]) {
            this[method](file.name, e.target.result)
          }
        }
        reader.readAsArrayBuffer(file)
      })
    }
  }

  render() {
    return (
      <div
        className={
          this.props.highlightActiveLayer ? 'tilemap-wrapper highlight-active-layer' : 'tilemap-wrapper'
        }
        onDragOver={this.prepareForDrag.bind(this)}
        onDrop={this.importFromDrop.bind(this)}
        onWheel={this.handleOnWheel.bind(this)}
        onMouseMove={() => {
          this.refs.positionInfo && this.refs.positionInfo.forceUpdate()
        }}
      >
        {this.getNotification()}
        {this.renderMap()}
        <Segment
          style={{
            zIndex: 1,
            position: 'fixed',
            bottom: 0,
            pointerEvents: 'none',
            backgroundColor: 'rgba(255,255,255, 0.85)',
          }}
        >
          <PositionInfo getInfo={this.getInfo.bind(this)} ref="positionInfo" />
        </Segment>
      </div>
    )
  }
}
