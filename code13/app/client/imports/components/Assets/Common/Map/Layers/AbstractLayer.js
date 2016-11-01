'use strict'
import _ from 'lodash'
import React from 'react'
import TileHelper from '../Helpers/TileHelper.js'
import SelectedTile from '../Tools/SelectedTile.js'
import EditModes from '../Tools/EditModes.js'
import TileCollection from '../Tools/TileCollection.js'
import LayerTypes from '../Tools/LayerTypes.js'

import Camera from '../Camera.js'

export default class AbstractLayer extends React.Component {
  static propTypes = {
    isActive: React.PropTypes.bool.isRequired,  // is this an active layer?
    data: React.PropTypes.object.isRequired,    // layer data

    camera: React.PropTypes.instanceOf(Camera).isRequired,

    getEditMode: React.PropTypes.func.isRequired, // gets editing mode
    setEditMode: React.PropTypes.func.isRequired, // sets editing mode
  }

  /* lifecycle functions */
  constructor (...args) {
    super(...args)

    this.ctx = null
    this.mouseDown = false

    this.isVisible = false
    this._mup = (e) => {
      if (this.props.isActive) {
        this.handleMouseUp(e)
      }
    }
    this._mov = (e) => {
      if (this.props.isActive) {
        this.handleMouseMove(e)
      }
    }
    this._kup = (e) => {
      if (this.props.isActive) {
        this._onKeyUp(e)
      }
    }
  }

  componentDidMount () {
    this.adjustCanvas()
    const canvas = this.refs.canvas
    this.ctx = canvas.getContext('2d')
    this.isVisible = true

    window.addEventListener('mouseup', this._mup)
    window.addEventListener('keyup', this._kup)
    window.addEventListener('mousemove', this._mov)
  }

  componentWillUnmount () {
    this.isVisible = false

    window.removeEventListener('mouseup', this._mup)
    window.removeEventListener('keyup', this._kup)
    window.removeEventListener('mousemove', this._mov)
  }
  // this layer has been selected
  activate () {
    if (this.activeMode) {
      this.props.setEditMode(this.activeMode)
    }
  }

  // this layer has been deselected - called before another layer activate
  deactivate () {
    //this.activeMode = this.props.getEditMode()
  }
  /* endof lifecycle functions */

  get options () {
    return this.props.data
  }
  get data () {
    return this.props.data
  }

  // this might get pretty slow and at some point there will be requirement for camera events
  get camera () {
    return this.props.camera


    if (!this._camera) {
      this._camera = Object.create(this.props.camera)
    }
    this._camera.x = this.props.camera.x + this.options.x
    this._camera.y = this.props.camera.y + this.options.y
    this._camera.zoom = this.props.camera.zoom
    return this._camera
  }
  getInfo () {
    return 'Please set info! Override getInfo method@'+this.constructor.name;
  }

  adjustCanvas () {
    const canvas = this.refs.canvas
    const b = this.props.camera
    if (canvas.width != b.width) {
      canvas.width = b.width
    }
    if (canvas.height != b.height) {
      canvas.height = b.height
    }
  }

  draw () {
    this.isDirty = true
  }
  // abstract
  _draw (delta) {}

  /* events */
  handleMouseUp (e) {
    this.mouseDown = false

    this.movementX = 0
    this.movementY = 0

    this.mouseX = e.offsetX
    this.mouseY = e.offsetY

    this.pointerPosX = this.mouseInWorldX
    this.pointerPosY = this.mouseInWorldY
  }
  handleMouseDown (e) {
    this.mouseDown = true

    this.movementX = 0
    this.movementY = 0

    this.mouseX = e.offsetX
    this.mouseY = e.offsetY

    this.pointerPosX = this.mouseInWorldX
    this.pointerPosY = this.mouseInWorldY

    if (e.buttons == 4) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }
  handleMouseMove (e) {
    this.mouseY = e.offsetY
    this.mouseX = e.offsetX
    this.mouseInWorldX = (this.mouseX / this.camera.zoom - this.camera.x)
    this.mouseInWorldY = (this.mouseY / this.camera.zoom - this.camera.y)
    if (this.mouseDown) {
      this.movementX += (e.movementX / this.camera.zoom)
      this.movementY += (e.movementY / this.camera.zoom)
    }
  }
  _onKeyUp (e) {
    if (this.props.isActive) {
      this.onKeyUp && this.onKeyUp(e)
    }
  }

  render () {
    return (<div ref='layer' className={this.props.isActive ? 'tilemap-layer' : 'tilemap-layer no-events'} data-name={this.props.data.name}>
              <canvas
                ref='canvas'
                onMouseDown={this.handleMouseDown.bind(this)}
                onMouseLeave={this.onMouseLeave.bind(this)}
                style={{ display: 'block' }}>
              </canvas>
            </div>)
  }

}
