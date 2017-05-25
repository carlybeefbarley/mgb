import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Icon, Button } from 'semantic-ui-react'

import sty from  '../editGraphic.css';

export default class MiniMap extends React.Component {

	constructor(props) {
    super(props)

    this.state = {
      isTessellated: false
    }

    this.screenX = 0
    this.screenY = 0 // px from bottom

    this.backup = {
      w: null,
      h: null,
      editCanvas: null
    }
	}

  componentDidMount () {
    this.canvas =  ReactDOM.findDOMNode(this.refs.canvas)
    this.ctx =  this.canvas.getContext('2d')
    const wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
    this.screenX = wrapper.parentNode.offsetWidth
    this.forceUpdate()
  }

  componentDidUpdate (prevProps, prevState) {
    if(this.state.isTessellated != prevState.isTessellated)
      this.redraw()
  }

  redraw (editCanvas, w, h) {
    if(editCanvas){
      this.backup = {
        w: w,
        h: h,
        editCanvas: editCanvas
      }
    }
    else {
      if(!this.backup.editCanvas){
        return null
      }
      editCanvas = this.backup.editCanvas
      w = this.backup.w
      h = this.backup.h
    }
    const c2 = this.props.content2
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const cols = this.state.isTessellated ? 3 : 1 
    const rows = this.state.isTessellated ? 3 : 1 
    for(let row=0; row<rows; row++){
      for(let col=0; col<cols; col++){
        this.ctx.drawImage(editCanvas, w*col, h*row, w, h)
      }
    }
  }

  handleCloseClick = () => {
    this.props.toggleMiniMap()
  }

  onDragStart = (e) => {
    // empty image so you don't see canvas element drag. Need to see only what is dragged inside canvas
    // don't do this on mobile devices
    // e.preventDefault()
    if (e.dataTransfer) {
      let ghost = e.target.cloneNode(true)
      ghost.style.display = "none"
      e.dataTransfer.setDragImage(ghost, 0, 0)
    }
    if (e.touches && e.touches[0])
      e = e.touches[0]
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
  }  

  onDrag = (e) => {
    e.preventDefault()
    if (e.touches && e.touches[0])
      e = e.touches[0]

    if (e.clientX === 0 && e.clientY === 0)
      return   // avoiding weird glitch when at the end of drag 0,0 coords returned

    this.screenX -= (this.dragStartX - e.clientX)
    this.screenY += this.dragStartY - e.clientY
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.forceUpdate()
  }  

  toggleTessalated = () => {
    this.setState({ isTessellated: !this.state.isTessellated })
  }

  render () {
    const multiplier = this.state.isTessellated ? 3 : 1
    const width = this.props.width * multiplier
    const height = this.props.height * multiplier

    const wrapStyle = {
      display: "block",
      overflow: "auto",
      minWidth: "130px",
      width: (this.props.width*multiplier)+"px",
      padding: "0px",
      position:  'relative',
      left: (this.screenX-200) + 'px',
      bottom: this.screenY + 'px'
    }

    return (
      <div ref="wrapper" style={wrapStyle}>
        <div>
          <Button
            title='Close'
            icon='close'
            size='mini'
            floated='right'
            onClick={this.handleCloseClick} 
            />

          <Button
            title="Drag Window"
            icon="move"
            className="ui mini right floated icon button"
            draggable={true}
            onDragStart={this.onDragStart}
            onDrag={this.onDrag}
            onTouchStart={this.onDragStart}
            onTouchMove={this.onDrag} 
            />

          <Button
            title="Tessellated View"
            icon="grid layout"
            primary={this.state.isTessellated}
            className="ui mini right floated icon button"
            onClick={this.toggleTessalated}
            />
        </div>

        <canvas 
          ref={"canvas"}
          width={width}
          height={height}
          >
        </canvas>

      </div>
    )  
  }
}