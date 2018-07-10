import _ from 'lodash'
const Camera = function(map, onChange) {
  this.map = map

  this.onChange = onChange
  // backwards compatibility with older maps.. should be safe to remove in the future
  if (!map.options.camera) {
    map.options.camera = { x: 0, y: 0, zoom: 1 }
  } else {
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
  this.stashedState = []

  // _width and _height are only used for thumbnail generation
  this._width = 0
  this._height = 0
}
Camera.AUTO = 0
Camera.HORIZONTAL = 1
Camera.VERTICAL = 2

Camera.prototype = {
  set x(val) {
    if (this._x === val) return

    this.map.options.camera.x = val
    this._lastx = this._x
    this._x = val
    this.onChange()
  },
  get x() {
    return this._x
  },
  set y(val) {
    if (this._y === val) return

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
    if (this._width) return this._width
    if (this.map.refs.mapElement) return this.map.refs.mapElement.offsetWidth
    return 100
  },
  get height() {
    if (this._height) return this._height
    if (this.map.refs.mapElement) return this.map.refs.mapElement.offsetHeight
    return 100
  },
  get dwidth() {
    if (this.map.refs.mapElement) return this.map.refs.mapElement.offsetWidth / this.zoom
    return 100
  },
  get dheight() {
    if (this.map.refs.mapElement) return this.map.refs.mapElement.offsetHeight / this.zoom
    return 100
  },
  get y() {
    return this._y
  },
  set zoom(val) {
    this.map.options.camera.zoom = val
    this._zoom = val
  },
  get zoom() {
    return this._zoom
  },

  reset() {
    this.x = 0
    this.y = 0
    this.zoom = 1
  },

  fitMap(width, height, direction = 0) {
    this.reset()
    if (direction === Camera.HORIZONTAL) {
      this.zoom = this.width / width
      this.y = 0.5 * (this.height - height * this.zoom) / this.zoom
    } else if (direction === Camera.VERTICAL) {
      this.zoom = this.height / height
      this.x = 0.5 * (this.width - width * this.zoom) / this.zoom
    } else if (direction === Camera.AUTO) {
      const nw = this.width / width
      const nh = this.height / height
      if (nw < nh) {
        this.zoom = nw
        this.y = 0.5 * (this.height - height * this.zoom) / this.zoom
      } else {
        this.zoom = nh
        this.x = 0.5 * (this.width - width * this.zoom) / this.zoom
      }
    }
  },

  stash() {
    // or simply assign / clone ???
    this.stashedState.push({
      x: this.x,
      y: this.y,
      zoom: this.zoom,
    })
  },

  pop() {
    const p = this.stashedState.pop()
    this.x = p.x
    this.y = p.y
    this._width = 0
    this._height = 0
    this.zoom = p.zoom
  },
}

export default Camera
