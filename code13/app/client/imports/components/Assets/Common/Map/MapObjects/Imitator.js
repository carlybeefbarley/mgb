// This object imitates rectangle from shapes
import ObjectHelper from '../Helpers/ObjectHelper.js'

export default class Imitator {
  constructor(obj) {
    this.update(obj)
  }

  get x() {
    return this.orig.x + this.minx
  }
  set x(v) {
    this.orig.x = v - this.minx
  }

  get y() {
    return this.orig.y + this.miny
  }
  set y(v) {
    this.orig.y = v - this.miny
  }

  set visible(v) {
    this.orig.visible = v
  }

  get visible() {
    return this.orig.visible
  }
  set name(v) {
    this.orig.name = v
  }
  get name() {
    return this.orig.name
  }

  set type(v) {
    this.orig.type = v
  }
  get type() {
    return this.orig.type
  }

  get width() {
    return this.maxx - this.minx
  }
  set width(v) {
    const prop = v / this.width
    for (let i = 0; i < this.lines.length; i++) {
      const l = this.lines[i]
      const x = l.x - this.minx
      l.x = x * prop + this.minx
    }

    // move starting point back to 0,0
    const red = this.lines[0].x
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].x -= red
    }

    const sin = Math.sin(this.angle)
    const cos = Math.cos(this.angle)

    const x = ObjectHelper.rpx(sin, cos, red, 0, 0, 0)
    const y = ObjectHelper.rpy(sin, cos, red, 0, 0, 0)

    this.orig.x += x
    this.orig.y += y

    this.update()
  }

  get height() {
    return this.maxy - this.miny
  }
  set height(v) {
    const prop = v / this.height
    for (let i = 0; i < this.lines.length; i++) {
      const l = this.lines[i]
      const y = l.y - this.miny
      l.y = y * prop + this.miny
    }

    // move starting point back to 0,0
    const red = this.lines[0].y
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].y -= red
    }

    const sin = Math.sin(this.angle)
    const cos = Math.cos(this.angle)

    const x = ObjectHelper.rpx(sin, cos, 0, red, 0, 0)
    const y = ObjectHelper.rpy(sin, cos, 0, red, 0, 0)

    this.orig.x += x
    this.orig.y += y
    this.update()
  }

  update(obj = this.orig) {
    const lines = obj.polyline || obj.polygon

    let minx = lines[0].x,
      maxx = lines[0].x,
      miny = lines[0].y,
      maxy = lines[0].y

    for (let j = 0; j < lines.length; j++) {
      minx = Math.min(lines[j].x, minx)
      miny = Math.min(lines[j].y, miny)
      maxx = Math.max(lines[j].x, maxx)
      maxy = Math.max(lines[j].y, maxy)
    }

    this.minx = minx
    this.miny = miny
    this.maxx = maxx
    this.maxy = maxy
    this.lines = lines

    this.orig = obj
  }

  get rotation() {
    return this.orig.rotation
  }
  set rotation(val) {
    this.orig.rotation = val
  }

  get angle() {
    return this.orig.rotation * Math.PI / 180
  }
}
