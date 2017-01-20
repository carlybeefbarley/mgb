import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import LayerTypes from '../Tools/LayerTypes.js'


export default class MaskLayer extends React.Component {
  /* lifecycle functions */
  constructor (...args) {
    super(...args)
    this.ctx = null
  }
  componentDidMount () {
    const mask = this.refs.mask
    this.ctx = mask.getContext('2d')
    this.adjustCanvas()
    this.drawMask()
    this.alignToLayer()
  }

  // align grid to active layer in preview mode
  shouldComponentUpdate () {
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

  componentWillUnmount () {
    const index = this.props.map.layers.indexOf(this)
    if (index > -1) {
      this.props.map.layers.splice(index, 1)
    }
    document.body.removeEventListener('mouseup', this._mup)
  }

  /* endof lifecycle functions */
  adjustCanvas () {
    const mask = this.refs.mask

    const w = mask.parentElement.offsetWidth
    const h = mask.parentElement.offsetHeight

    mask.width = w
    mask.height = h
    this.alignToLayer()
  }

  alignToLayer () {
    if(this.props.layer && this.props.layer.refs.layer) {
      this.refs.layer.style['transform'] = this.props.layer.refs.layer.style['transform']
      this.refs.layer.style['z-index'] = this.props.layer.refs.layer.style['z-index']
    }
  }
  
  draw () {
    this.adjustCanvas()
    this.drawMask()
  }

  drawMask () {
    const camera = this.props.map.camera
    const data = this.props.map.data
  
    let tilelayer = null, tw, th
    if (this.props.layer && LayerTypes.isTilemapLayer(this.props.layer.type)) {
      tilelayer = this.props.layer.data
      tw = tilelayer.width; th = tilelayer.height
    }else {
      tw = data.width; th = data.height
      tilelayer = {x: 0, y: 0}
    }

    const startx = 0.5 + (camera.x + tilelayer.x) * camera.zoom
    const starty = 0.5 + (camera.y + tilelayer.y) * camera.zoom

    this.ctx.fillStyle = 'black'
    this.ctx.globalAlpha = '0.7'
    this.ctx.fillRect(0, 0, this.refs.mask.width, this.refs.mask.height)

    this.ctx.clearRect(startx, starty, tw * data.tilewidth * camera.zoom, th * data.tilewidth * camera.zoom)
  }

  render () {
    return (<div 
              className='tilemap-layer no-events grid-layer'
              data-name='Mask'
              ref='layer'
              style={{zIndex: 2}}>
              <canvas ref='mask'></canvas>
            </div>)
  }
}
