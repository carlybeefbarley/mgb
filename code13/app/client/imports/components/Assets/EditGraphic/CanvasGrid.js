import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

// This actually just draws ONE cell of a grid using the size
// specified (e.g. 8px*8px if the provided scale (zoom) is 8)
//
// This then gets drawn into the preview Image edit area in
// multiple ways.
//
// There is probably a better way to do this but this actually
// worked on the various browsers and devices

export default class CanvasGrid extends React.Component {
  componentDidMount() {
    this.gridCanvas = ReactDOM.findDOMNode(this.refs.gridCanvas)
    this.gridCtx = this.gridCanvas.getContext('2d')
  }

  // Note that is is called a frame after render(). Not pretty
  drawGrid = () => {
    if (!this.gridCtx) return

    const { scale } = this.props

    this.gridCtx.clearRect(0, 0, scale, scale)
    this.gridCtx.strokeStyle = '#888'
    this.gridCtx.beginPath()
    this.gridCtx.moveTo(scale, scale)
    this.gridCtx.lineTo(scale, 0)
    this.gridCtx.moveTo(scale, scale)
    this.gridCtx.lineTo(0, scale)
    this.gridCtx.stroke()

    const img = new Image()
    img.width = scale
    img.height = scale
    img.src = this.gridCanvas.toDataURL('image/png')
    this.props.setGrid(img)
  }

  render() {
    setTimeout(this.drawGrid, 0)
    const { scale } = this.props

    return <canvas ref="gridCanvas" style={{ display: 'none' }} width={scale} height={scale} />
  }
}
