import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import LayerTypes from '../Tools/LayerTypes.js'

export default class GridLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args) {
    super(...args)
    this.ctx = null
  }
  componentDidMount() {
    const canvas = this.refs.canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = false
    this.adjustCanvas()
    this.drawGrid()
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
  adjustCanvas = () => {
    const canvas = this.refs.canvas
    //const $el = $(canvas.parentElement)

    const w = canvas.parentElement.offsetWidth
    const h = canvas.parentElement.offsetHeight

    canvas.width = w
    canvas.height = h
    //this.ctx.clearRect(0,0,this.refs.canvas.width, this.refs.canvas.height)
    this.alignToLayer()
  }

  alignToLayer = () => {
    if (this.props.layer && this.props.layer.refs.layer) {
      this.refs.layer.style['transform'] = this.props.layer.refs.layer.style['transform']
      this.refs.layer.style['z-index'] = this.props.layer.refs.layer.style['z-index']
    }
  }

  draw = () => {
    this.adjustCanvas()
    if (this.props.map.options.showGrid) {
      this.drawGrid()
    }
  }

  drawGrid = () => {
    // this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
    const camera = this.props.map.camera
    if (this.ctx.setLineDash) {
      this.ctx.setLineDash([5, 3])
    }
    const data = this.props.map.data
    this.ctx.beginPath()

    const offsetX = (camera.x % data.tilewidth) * camera.zoom
    const offsetY = (camera.y % data.tileheight) * camera.zoom

    // vertical lines
    let i = 0
    const width = Math.ceil(this.ctx.canvas.width / data.tilewidth)
    let tmp = 0
    let tot = Math.ceil(width / camera.zoom)

    for (; i <= tot; i++) {
      tmp = i * data.tilewidth * camera.zoom + 0.5 + offsetX
      this.ctx.moveTo(tmp, -data.tileheight + offsetY)
      this.ctx.lineTo(tmp, this.ctx.canvas.height)
    }
    // this.ctx.moveTo(i * data.tilewidth * camera.zoom - 0.5 + offsetX, -data.tileheight + offsetY)
    // this.ctx.lineTo(i * data.tilewidth * camera.zoom - 0.5 + offsetX, this.ctx.canvas.height)

    // horizontal lines
    i = 0
    const height = Math.ceil(this.ctx.canvas.height / data.tileheight)
    tot = Math.ceil(height / camera.zoom)
    for (; i <= tot; i++) {
      tmp = i * data.tileheight * camera.zoom + 0.5 + offsetY
      this.ctx.moveTo(-data.tilewidth + offsetX, tmp)
      this.ctx.lineTo(this.ctx.canvas.width, tmp)
    }
    // this.ctx.moveTo(-data.tilewidth + offsetX, i * data.tileheight * camera.zoom - 0.5 + offsetY)
    // this.ctx.lineTo(this.ctx.canvas.width, i * data.tileheight * camera.zoom - 0.5 + offsetY)

    this.ctx.strokeStyle = 'black'
    this.ctx.stroke()
  }

  render() {
    return (
      <div className="tilemap-layer no-events grid-layer" data-name="Grid" ref="layer" style={{ zIndex: 2 }}>
        <canvas ref="canvas" style={{ display: 'block' }} />
      </div>
    )
  }
}
