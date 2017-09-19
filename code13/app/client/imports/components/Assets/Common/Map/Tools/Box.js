'use strict'
// this is my cheat sheet :)
// not used in code - just for reference on Math transformations
// took out from dirty rectangles engine
const Box = function(xi, yi, xa, ya) {
  this.xmin = xi || 0
  this.ymin = yi || 0

  this.xmax = xa || 0
  this.ymax = ya || 0
}
Box.prototype = {
  get width() {
    return this.xmax - this.xmin
  },
  set width(val) {
    this.xmax = this.xmin + val
  },
  get height() {
    return this.ymax - this.ymin
  },
  set height(val) {
    this.ymax = this.ymin + val
  },
  get centerX() {
    return (this.xmax + this.xmin) * 0.5
  },

  get centerY() {
    return (this.ymax + this.ymin) * 0.5
  },

  get x() {
    return this.xmin
  },
  get y() {
    return this.ymin
  },

  set y(val) {
    this.move(this.x, val)
  },
  set x(val) {
    this.move(val, this.y)
  },

  vsBox(box) {
    return !(this.xmax < box.xmin || this.ymax < box.ymin || this.xmin > box.xmax || this.ymin > box.ymax)
  },
  vsBoxBorder(box) {
    return !(this.xmax <= box.xmin || this.ymax <= box.ymin || this.xmin >= box.xmax || this.ymin >= box.ymax)
  },
  vsPoint(x, y) {
    return !(this.xmax < x || this.ymax < y || this.xmin > x || this.ymin > y)
  },

  isValid() {
    return this.xmax > this.xmin && this.ymax > this.ymin
  },

  add(xi, yi, xa, ya) {
    if (this.xmin > xi) {
      this.xmin = xi
    }
    if (this.ymin > yi) {
      this.ymin = yi
    }

    if (this.xmax < xa) {
      this.xmax = xa
    }

    if (this.ymax < ya) {
      this.ymax = ya
    }
  },

  substract(xi, yi, xa, ya) {
    this.xmin -= xi
    this.ymin -= yi

    this.xmax -= xa
    this.ymax -= ya
  },

  merge(box, mergeBox) {
    mergeBox.xmin = this.xmin < box.xmin ? this.xmin : box.xmin
    mergeBox.ymin = this.ymin < box.ymin ? this.ymin : box.ymin
    mergeBox.xmax = this.xmax > box.xmax ? this.xmax : box.xmax
    mergeBox.ymax = this.ymax > box.ymax ? this.ymax : box.ymax

    return mergeBox
  },

  move(x, y) {
    var w = this.width
    var h = this.height

    this.xmin = x
    this.xmax = x + w

    this.ymin = y
    this.ymax = y + h
  },

  clone() {
    return new Box(this.xmin, this.ymin, this.xmax, this.ymax)
  },

  isInsideBox(box) {
    return !(this.xmin < box.xmin || this.ymin < box.ymin || this.xmax > box.xmax || this.ymax > box.ymax)
  },

  update(xi, yi, xa, ya) {
    this.xmin = xi
    this.ymin = yi

    this.xmax = xa
    this.ymax = ya
    return this
  },

  diff(box, dest) {
    var xmin = this.xmin > box.xmin ? this.xmin : box.xmin
    var ymin = this.ymin > box.ymin ? this.ymin : box.ymin

    var xmax = this.xmax < box.xmax ? this.xmax : box.xmax
    var ymax = this.ymax < box.ymax ? this.ymax : box.ymax

    return dest.update(xmin, ymin, xmax, ymax)
  },

  debug(ctx, cam) {
    this.fill(ctx, cam)
    ctx.strokeRect(
      this.xmin + 1 - cam.x,
      this.ymin + 1 - cam.y,
      this.xmax - this.xmin - 2,
      this.ymax - this.ymin - 2,
    )
  },

  reset() {
    this.xmin = 0
    this.ymin = 0

    this.xmax = 0
    this.ymax = 0
  },

  stroke(ctx) {
    ctx.strokeRect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin)
  },

  fill(ctx, cam) {
    ctx.beginPath()
    ctx.moveTo(this.xmin - cam.x, this.ymin - cam.y)
    ctx.lineTo(this.xmax - cam.x, this.ymin - cam.y)
    ctx.lineTo(this.xmax - cam.x, this.ymax - cam.y)
    ctx.lineTo(this.xmin - cam.x, this.ymax - cam.y)
    ctx.lineTo(this.xmin - cam.x, this.ymin - cam.y)
    ctx.fill()

    // ctx.fillRect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin)
  },

  rpx(sin, cos, x, y, cx, cy) {
    return (x - cx) * cos - (y - cy) * sin + cx
  },

  rpy(sin, cos, x, y, cx, cy) {
    return (y - cy) * cos + (x - cx) * sin + cy
  },

  rotate(angle, cx, cy) {
    if (cx == void 0) {
      cx = this.xmin + this.width * 0.5
      cy = this.ymin + this.height * 0.5
    }

    var cos = Math.cos(angle)
    var sin = Math.sin(angle)

    var x1 = this.rpx(sin, cos, this.xmin, this.ymin, cx, cy)
    var x2 = this.rpx(sin, cos, this.xmax, this.ymin, cx, cy)
    var x3 = this.rpx(sin, cos, this.xmax, this.ymax, cx, cy)
    var x4 = this.rpx(sin, cos, this.xmin, this.ymax, cx, cy)

    var y1 = this.rpy(sin, cos, this.xmin, this.ymin, cx, cy)
    var y2 = this.rpy(sin, cos, this.xmax, this.ymin, cx, cy)
    var y3 = this.rpy(sin, cos, this.xmax, this.ymax, cx, cy)
    var y4 = this.rpy(sin, cos, this.xmin, this.ymax, cx, cy)

    this.xmin = Math.floor(Math.min(x1, x2, x3, x4))
    this.xmax = Math.ceil(Math.max(x1, x2, x3, x4))

    this.ymin = Math.floor(Math.min(y1, y2, y3, y4))
    this.ymax = Math.ceil(Math.max(y1, y2, y3, y4))
  },

  scale(scale) {
    var w = this.width
    var h = this.height

    this.xmin = Math.floor(this.xmin + w * 0.5 - w * 0.5 * scale)
    this.ymin = Math.floor(this.ymin + h * 0.5 - h * 0.5 * scale)

    this.resize(w * scale, h * scale)
  },

  resize(width, height) {
    this.xmax = this.xmin + width
    this.ymax = this.ymin + height
  },

  toSquareMax() {
    if (this.xmax - this.xmin < this.ymax - this.ymin) {
      this.resize(this.ymax - this.ymin, this.ymax - this.ymin)
    } else {
      this.resize(this.xmax - this.xmin, this.xmax - this.xmin)
    }
  },

  inherit(box) {
    this.xmin = box.xmin
    this.ymin = box.ymin
    this.xmax = box.xmax
    this.ymax = box.ymax
  },

  round() {
    this.xmin = Math.round(this.xmin)
    this.ymin = Math.round(this.ymin)
    this.xmax = Math.round(this.xmax)
    this.ymax = Math.round(this.ymax)
  },

  ceil() {
    this.xmin = Math.floor(this.xmin)
    this.ymin = Math.floor(this.ymin)
    this.xmax = Math.ceil(this.xmax)
    this.ymax = Math.ceil(this.ymax)
  },
}
