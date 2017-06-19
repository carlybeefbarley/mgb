import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { Button, Segment } from 'semantic-ui-react'

import sty from  '../editGraphic.css'

// TODO - for drawing visible area rectangle
// check editCanvas height
// compare to editCanvasMaxHeight so we know if we need to draw visible rectangle
// compare editCanvas width to div width - if we need to draw visible rectangle
// check if we can detect scrollbar offset
// drag'n'drop visible area rect

export default class MiniMap extends React.Component {

  static propTypes = {
    toggleMiniMap:  PropTypes.func.isRequired,
    width:          PropTypes.number.isRequired,
    height:         PropTypes.number.isRequired,
    editCanvasMaxHeight:  PropTypes.number.isRequired,
    editCanvasHeight: PropTypes.number
  }
  constructor(props) {
    super(props)

    this.state = {
      isTessellated: false
    }

    this.screenX = 12 // px from right
    this.screenY = 90 // px from top

    this.scale = 1

    this.backup = {
      w: null,
      h: null,
      editCanvas: null
    }
  }

  componentDidMount () {
    this.canvas =  ReactDOM.findDOMNode(this.refs.canvas)
    this.ctx =  this.canvas.getContext('2d')
    // const wrapper = ReactDOM.findDOMNode(this.refs.wrapper)
    // this.screenX = wrapper.parentNode.offsetWidth
    if (this.props.height > this.props.editCanvasMaxHeight)
      this.scale = this.props.editCanvasMaxHeight / this.props.height

    this.forceUpdate()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isTessellated !== prevState.isTessellated)
      this.redraw()
  }

  /** Beware of react-anti-pattern. The parent is calling into this function!!! */
  redraw (editCanvas, w, h) {
    if (editCanvas) {
      this.backup = {
        w: w,
        h: h,
        editCanvas: editCanvas
      }
    }
    else {
      if (!this.backup.editCanvas)
        return null

      editCanvas = this.backup.editCanvas
      w = this.backup.w
      h = this.backup.h
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    const cols = this.state.isTessellated ? 3 : 1
    const rows = this.state.isTessellated ? 3 : 1
    for (let row=0; row<rows; row++)
      for (let col=0; col<cols; col++)
        this.ctx.drawImage(editCanvas, w*col, h*row, w*this.scale, h*this.scale)
  }

  handleCloseClick = () => {
    this.props.toggleMiniMap()
  }

  scroll = (offsetTop, offsetLeft) => {
    console.log(offsetTop, offsetLeft)
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

    // this.screenX -= (this.dragStartX - e.clientX)
    this.screenX += this.dragStartX - e.clientX
    this.screenY -= this.dragStartY - e.clientY
    this.dragStartX = e.clientX
    this.dragStartY = e.clientY
    this.throttledForceUpdate()
  }

  throttledForceUpdate = _.throttle(() => this.forceUpdate(), 100)

  toggleTessellated = () => {
    this.setState({ isTessellated: !this.state.isTessellated })
  }

  drawVisibleRect () {
    // check if editCanvas is mounted (height is passed)
    if(this.props.editCanvasHeight){
      if(this.props.editCanvasHeight > this.props.editCanvasMaxHeight){
        console.log(this.props.editCanvasHeight)
      }
    }
  }

  render () {
    const multiplier = this.state.isTessellated ? 3 : 1
    const width = this.props.width * multiplier * this.scale
    const height = this.props.height * multiplier * this.scale

    this.drawVisibleRect()

    const wrapStyle = {
      display: "block",
      overflow: "hidden",
      minWidth: "130px",
      width: (this.props.width*multiplier+2)+"px",
      padding: "0px",
      position:  'absolute',
      // left: (this.screenX-200) + 'px',
      right: this.screenX+"px",
      top: this.screenY + 'px',
      float: "right"
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
            title='Drag Window'
            icon='move'
            size='mini'
            floated='right'
            draggable={true}
            onDragStart={this.onDragStart}
            onDrag={this.onDrag}
            onTouchStart={this.onDragStart}
            onTouchMove={this.onDrag}
            />

          <Button
            title='Tessellated View'
            icon='grid layout'
            primary={this.state.isTessellated}
            size='mini'
            floated='right'
            onClick={this.toggleTessellated}
            />
        </div>
        <Segment style={{ float: 'right', clear: 'both', margin: 0, padding: 0, width:width, height:height}}>
          <canvas
            ref='canvas'
            width={width}
            height={height}
            onDragStart={this.onDragStart}
            onDrag={this.onDrag}
            onTouchStart={this.onDragStart}
            onTouchMove={this.onDrag}
            >
          </canvas>
        </Segment>

      </div>
    )
  }
}