import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

export default class CanvasGrid extends React.Component {

  componentDidMount() {
    this.gridCanvas =  ReactDOM.findDOMNode(this.refs.gridCanvas)
    this.gridCtx = this.gridCanvas.getContext('2d')
  }

  drawGrid () {
    if(!this.gridCtx) return
    this.gridCtx.clearRect(0, 0, this.props.scale, this.props.scale)
    this.gridCtx.strokeStyle = "#888"
    this.gridCtx.beginPath()
    this.gridCtx.moveTo(this.props.scale, this.props.scale)
    this.gridCtx.lineTo(this.props.scale, 0)
    this.gridCtx.moveTo(this.props.scale, this.props.scale)
    this.gridCtx.lineTo(0, this.props.scale)
    this.gridCtx.stroke()

    const img = new Image()
    img.width = this.props.scale
    img.height = this.props.scale
    img.src = this.gridCanvas.toDataURL('image/png')
    this.props.setGrid(img)
  }

  render () {
    setTimeout( () => this.drawGrid(), 0)

    return (
      <canvas 
        ref="gridCanvas" 
        style={{display:"none"}}
        width={this.props.scale} 
        height={this.props.scale}>
      </canvas>
    )
  }

}