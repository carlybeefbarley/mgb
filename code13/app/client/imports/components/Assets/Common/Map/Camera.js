'use strict'

const Camera = function (map) {
  this.map = map
  // backwards compatibility with older maps.. should be safe to remove in the future
  if (!map.options.camera) {
    map.options.camera = {x: 0, y: 0, zoom: 1}
  }else {
    map.options.camera.x = map.options.camera.x || 0
    map.options.camera.y = map.options.camera.y || 0
  }
  if (!map.options.camera.zoom || isNaN(map.options.camera.zoom)) {
    map.options.camera.zoom = 1
  }
  this._x = map.options.camera.x
  this._y = map.options.camera.y
  this._zoom = map.options.camera.zoom
  this._lastx = 0
  this._lasty = 0
}

Camera.prototype = {
  set x(val) {
    this.map.options.camera.x = val
    this._lastx = this._x
    this._x = val
  },
  get x() {return this._x},
  set y(val) {
    this.map.options.camera.y = val
    this._lasty = this._y
    this._y = val
  },
  get movementX() {
    return this._lastx - this._x
  },
  get movementY() {
    return this._lasty - this._y
  },
  get width() {
    if (this.map.refs.mapElement)
      return this.map.refs.mapElement.offsetWidth
    return 100
  },
  get height() {
    if (this.map.refs.mapElement)
      return this.map.refs.mapElement.offsetHeight
    return 100
  },
  get dwidth() {
    if (this.map.refs.mapElement)
      return this.map.refs.mapElement.offsetWidth / this.zoom
    return 100
  },
  get dheight() {
    if (this.map.refs.mapElement)
      return this.map.refs.mapElement.offsetHeight / this.zoom
    return 100
  },
  get y() {return this._y},
  set zoom(val) {
    this.map.options.camera.zoom = val
    this._zoom = val
  },
  get zoom() {return this._zoom},

  reset() {
    this.x = 0
    this.y = 0
    this.zoom = 1
  }
}

export default Camera
