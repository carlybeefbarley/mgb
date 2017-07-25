import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import LayerTypes from '../Tools/LayerTypes.js'

export default class MaskLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args) {
    super(...args)
    this.ctx = null
  }
  componentDidMount() {
    const mask = this.refs.mask
    this.ctx = mask.getContext('2d')
    this.adjustCanvas()
    this.drawMask()
    this.alignToLayer()
  }

  // align grid to active layer in preview mode
  shouldComponentUpdate() {
    const map = this.props.map
    if (!map.options.preview) {
      this.refs.layer.style['transform'] = ''
      return false
    }
    if (!map.layers.length) {
      return false
    }
    this.alignToLayer()
    return false
  }

  componentWillUnmount() {
    const index = this.props.map.layers.indexOf(this)
    if (index > -1) {
      this.props.map.layers.splice(index, 1)
    }
    document.body.removeEventListener('mouseup', this._mup)
  }

  /* endof lifecycle functions */
  adjustCanvas() {
    const mask = this.refs.mask

    const w = mask.parentElement.offsetWidth
    const h = mask.parentElement.offsetHeight

    mask.width = w
    mask.height = h
    this.alignToLayer()
  }

  alignToLayer() {
    if (this.props.layer && this.props.layer.refs.layer) {
      this.refs.layer.style['transform'] = this.props.layer.refs.layer.style['transform']

      // keep bounds behind map
      if (this.props.layer.data.type === LayerTypes.object) {
        const zIndex = parseInt(this.props.layer.refs.layer.style['z-index'], 10)
        if (isNaN(zIndex)) {
          this.props.layer.refs.layer.style['z-index'] = 1
        } else {
          this.refs.layer.style['z-index'] = zIndex - 1
        }
      } else {
        this.refs.layer.style['z-index'] = this.props.layer.refs.layer.style['z-index']
      }
    }
  }

  draw() {
    this.adjustCanvas()
    this.drawMask()
  }

  // Draw darker mask outside of active map area that covers the grid
  drawMask() {
    const camera = this.props.map.camera
    const data = this.props.map.data

    let tilelayer = null,
      tw,
      th
    if (this.props.layer && LayerTypes.isTilemapLayer(this.props.layer.type)) {
      tilelayer = this.props.layer.data
      tw = tilelayer.width
      th = tilelayer.height
    } else {
      tw = data.width
      th = data.height
      tilelayer = { x: 0, y: 0 }
    }

    const startx = 0.5 + (camera.x + tilelayer.x) * camera.zoom
    const starty = 0.5 + (camera.y + tilelayer.y) * camera.zoom

    this.ctx.fillStyle = '#E0E1E2'
    //this.ctx.globalAlpha = '0.75'
    this.ctx.fillRect(0, 0, this.refs.mask.width, this.refs.mask.height)

    // Clear mask in active map area
    this.ctx.clearRect(startx, starty, tw * data.tilewidth * camera.zoom, th * data.tilewidth * camera.zoom)

    // Outline of active map should persist when grid is off
    this.ctx.beginPath()

    const endx = 0.5 + (camera.x + tilelayer.x + tw * data.tilewidth) * camera.zoom
    const endy = 0.5 + (camera.y + tilelayer.y + th * data.tileheight) * camera.zoom

    this.ctx.moveTo(startx, Math.min(starty, camera.y * camera.zoom))
    this.ctx.lineTo(startx, Math.min(this.ctx.canvas.height, endy))
    this.ctx.moveTo(endx, Math.min(starty, camera.y * camera.zoom))
    this.ctx.lineTo(endx, Math.min(this.ctx.canvas.height, endy))

    this.ctx.moveTo(Math.min(startx, camera.x * camera.zoom), starty)
    this.ctx.lineTo(Math.min(endx, this.ctx.canvas.width), starty)
    this.ctx.moveTo(Math.min(startx, camera.x * camera.zoom), endy)
    this.ctx.lineTo(Math.min(endx, this.ctx.canvas.width), endy)

    if (this.ctx.setLineDash) {
      this.ctx.setLineDash([])
    }
    this.ctx.strokeStyle = 'black'
    this.ctx.lineWidth = 2
    this.ctx.stroke()
  }

  render() {
    const style = Object.assign({}, this.props.style)
    style.zIndex = 2
    return (
      <div className="tilemap-layer no-events grid-layer" data-name="Mask" ref="layer" style={style}>
        <canvas ref="mask" />
      </div>
    )
  }
}
