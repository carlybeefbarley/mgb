import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import cx from 'classnames'

import Camera from '../Camera.js'

export default class AbstractLayer extends Component {
  static propTypes = {
    isActive: PropTypes.bool.isRequired, // is this an active layer?
    data: PropTypes.object.isRequired, // layer data

    camera: PropTypes.instanceOf(Camera).isRequired,

    getEditMode: PropTypes.func.isRequired, // gets editing mode
    setEditMode: PropTypes.func.isRequired, // sets editing mode
  }

  /* lifecycle functions */
  constructor(...args) {
    super(...args)

    this.ctx = null
    this.mouseDown = false
    this._isVisible = false
    this._mup = e => {
      if (this.props.isActive) {
        this.handleMouseUp(e)
      }
    }
    this._mov = e => {
      if (this.props.isActive) {
        this.handleMouseMove(e)
      }
    }
    this._kup = e => {
      if (this.props.isActive) {
        this._onKeyUp(e)
      }
    }
  }

  componentDidMount() {
    this.adjustCanvas()
    const canvas = this.refs.canvas
    this.ctx = canvas.getContext('2d')
    this.ctx.imageSmoothingEnabled = false

    window.addEventListener('mouseup', this._mup)
    window.addEventListener('touchend', this._mup)

    window.addEventListener('keyup', this._kup)

    window.addEventListener('mousemove', this._mov)
    window.addEventListener('touchmove', this._mov)

    this._isVisible = true
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this._mup)
    window.removeEventListener('touchstart', this._mup)

    window.removeEventListener('keyup', this._kup)
    window.removeEventListener('mousemove', this._mov)
    window.removeEventListener('touchmove', this._mov)

    this._isVisible = false
  }

  // this layer has been selected
  activate() {
    if (this.activeMode) {
      this.props.setEditMode(this.activeMode)
    }
  }

  // this layer has been deselected - called before another layer activate
  deactivate() {
    //this.activeMode = this.props.getEditMode()
  }

  /* endof lifecycle functions */

  get options() {
    return this.props.data
  }

  get data() {
    return this.props.data
  }

  get type() {
    return this.data.type
  }

  // same as type - in assets we are using kind - so it might be more intuitive for other ppl
  get kind() {
    return this.data.type
  }

  // camera sets correct offsets when rendering bounds etc
  get camera() {
    //return this.props.camera
    if (!this._camera) {
      this._camera = Object.create(this.props.camera)
    }
    this._camera.x = this.props.camera.x + this.options.x
    this._camera.y = this.props.camera.y + this.options.y
    this._camera.zoom = this.props.camera.zoom
    return this._camera
  }

  get isVisible() {
    return this._isVisible && this.options.visible
  }

  getInfo() {
    return 'Please set info! Override getInfo@' + this.constructor.name
  }

  adjustCanvas() {
    const canvas = this.refs.canvas
    if (!canvas) {
      return
    }
    const b = this.props.camera
    if (canvas.width !== b.width) {
      canvas.width = b.width
    }
    if (canvas.height !== b.height) {
      canvas.height = b.height
    }
  }

  queueDraw(timeout) {
    if (this.nextDraw <= this.now || this.nextDraw > this.now + timeout) {
      this.nextDraw = this.now + timeout
    }
    if (this.isDirtySelection) {
      this.nextDraw = 0
    }
  }

  draw() {
    this.nextDraw = 0
  }

  // abstract
  _draw(timestamp) {}

  /* events */
  handleMouseUp(e) {
    this.mouseDown = false

    this.movementX = 0
    this.movementY = 0

    this.mouseX = TileHelper.getOffsetX(e)
    this.mouseY = TileHelper.getOffsetY(e)

    this.mouseInWorldX = this.mouseX / this.camera.zoom - this.camera.x
    this.mouseInWorldY = this.mouseY / this.camera.zoom - this.camera.y

    this.pointerPosX = this.mouseInWorldX
    this.pointerPosY = this.mouseInWorldY

    this.pointerMovementX = 0
    this.pointerMovementY = 0
  }

  handleMouseDown(e) {
    this.mouseDown = true

    this.movementX = 0
    this.movementY = 0

    this.mouseX = TileHelper.getOffsetX(e)
    this.mouseY = TileHelper.getOffsetY(e)

    this.mouseInWorldX = this.mouseX / this.camera.zoom - this.camera.x
    this.mouseInWorldY = this.mouseY / this.camera.zoom - this.camera.y

    this.pointerPosX = this.mouseInWorldX
    this.pointerPosY = this.mouseInWorldY

    this.pointerMovementX = 0
    this.pointerMovementY = 0

    if (e.buttons == 4) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  handleMouseMove(e) {
    const ox = TileHelper.getOffsetX(e)
    const oy = TileHelper.getOffsetY(e)

    this.pointerMovementX = ox - this.mouseX
    this.pointerMovementY = oy - this.mouseY

    this.mouseX = ox
    this.mouseY = oy

    this.mouseInWorldX = this.mouseX / this.camera.zoom - this.camera.x
    this.mouseInWorldY = this.mouseY / this.camera.zoom - this.camera.y

    if (this.mouseDown) {
      this.movementX += this.pointerMovementX / this.camera.zoom
      this.movementY += this.pointerMovementY / this.camera.zoom
    }
  }

  _onKeyUp(e) {
    if (this.props.isActive) {
      this.onKeyUp && this.onKeyUp(e)
    }
  }

  isCtrlKey(e) {
    return this.props.getCtrlModifier() || (e && e.ctrlKey)
  }

  render() {
    const { data, index, isActive } = this.props
    const { type } = this.data

    const classes = cx('tilemap-layer', type, { 'no-events': !isActive })
    const style = { zIndex: index }

    return (
      <div ref="layer" className={classes} data-name={data.name} style={style}>
        <canvas
          ref="canvas"
          onMouseDown={this.handleMouseDown.bind(this)}
          onTouchStart={this.handleMouseDown.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          style={{ display: 'block' }}
        />
      </div>
    )
  }
}
