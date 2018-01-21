import _ from 'lodash'
import React from 'react'
import AbstractLayer from './AbstractLayer.js'
import LayerTypes from './../Tools/LayerTypes.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'

export default class ImageLayer extends AbstractLayer {
  draw = () => {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    if (!this.options.visible) {
      return
    }
    if (!this.options.image) {
      return
    }
    const img = this.props.getImage(this.options.image)

    if (!img) {
      return
    }

    // TODO: cut invisible parts
    this.ctx.drawImage(
      img,
      0,
      0,
      img.width,
      img.height,
      (this.options.x + this.camera.x) * this.camera.zoom,
      (this.options.y + this.camera.y) * this.camera.zoom,
      img.width * this.camera.zoom,
      img.height * this.camera.zoom,
    )
  }

  getInfo = () => {
    return this.options.image ? this.options.image : null
  }
  handleMouseMove = () => {}
  handleMouseDown = () => {}
  onMouseLeave = () => {}
  onDrop = e => {
    return this.props.onImageLayerDrop(e, this.options)
  }

  render() {
    return (
      <div
        ref="layer"
        className={this.props.isActive ? 'tilemap-layer' : 'tilemap-layer no-events'}
        data-name={this.props.data.name}
      >
        <canvas ref="canvas" onDrop={this.onDrop.bind(this)} onDragOver={DragNDropHelper.preventDefault} />
      </div>
    )
  }
}
