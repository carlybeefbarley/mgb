'use strict'
import _ from 'lodash'
import React from 'react'
import AbstractLayer from './AbstractLayer.js'
import LayerTypes from './../Tools/LayerTypes.js'

export default class ImageLayer extends AbstractLayer {
  draw () {
    if (!this.options.image) {
      return
    }
    const img = this.props.getImage(this.options.image)
    if (!img) {
      return
    }
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    // TODO: cut invisible parts
    this.ctx.drawImage(img,
      0, 0, img.width, img.height,
      (this.options.x + this.camera.x) * this.camera.zoom,
      (this.options.y + this.camera.y) * this.camera.zoom,
      img.width * this.camera.zoom, img.height * this.camera.zoom)
  }

  getInfo(){
    return this.options.image ? this.options.image : null
  }
  handleMouseMove () {}
  handleMouseDown () {}
  onMouseLeave () {}
  onDrop (e) {
    return this.props.onImageLayerDrop(e, this.options)
  }

  render () {
    // TODO - probably we can leave only canvas element here
    return (<div ref='layer' className={this.props.isActive ? 'tilemap-layer' : 'tilemap-layer no-events'} data-name={this.props.data.name}>
              <canvas
                ref='canvas'
                //onMouseMove={this.handleMouseMove.bind(this)}
                //onMouseDown={this.handleMouseDown.bind(this)}
                //onMouseLeave={this.onMouseLeave.bind(this)}
                onDrop={this.onDrop.bind(this)}
                style={{ /* width: "100%", height: "100%", display: 'block' */}}>
              </canvas>
            </div>)
  }
}
