import ObjectHelper from '../Helpers/ObjectHelper.js'
/*
  we wil have 8 handles with 2 actions (resize / rotate)
  + 1 extra handle for a pivot point
 */
const PI2 = Math.PI * 2
const FROM_DEGREES = Math.PI / 180
const FROM_RADIANS = 1 / FROM_DEGREES
class Handle {
  constructor(x, y) {
    this.radius = 3
    this.update(x, y)
  }
  update(x, y) {
    this.x = x
    this.y = y
  }
  draw(ctx, camera, active = false) {
    ctx.beginPath()

    if (active) {
      ctx.fillStyle = 'rgba(255,0,0,1)'
      ctx.arc((this.x + camera.x) * camera.zoom, (this.y + camera.y) * camera.zoom, this.radius * 2, 0, PI2)
      ctx.fill()
    } else {
      ctx.fillStyle = 'rgba(255,0,0,0.5)'
      ctx.arc((this.x + camera.x) * camera.zoom, (this.y + camera.y) * camera.zoom, this.radius, 0, PI2)
      ctx.stroke()
    }
  }
  rotate(angle, pivotX, pivotY) {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = ObjectHelper.rpx(sin, cos, this.x, this.y, pivotX, pivotY)
    const y = ObjectHelper.rpy(sin, cos, this.x, this.y, pivotX, pivotY)
    this.x = x
    this.y = y
  }
  vsPoint(x, y) {
    return Math.abs(this.x - x) < this.radius && Math.abs(this.y - y) < this.radius
  }
}
// maybe we need to expose these...
const TOP = 0
const TOP_RIGHT = 1
const RIGHT = 2
const BOTTOM_RIGHT = 3
const BOTTOM = 4
const BOTTOM_LEFT = 5
const LEFT = 6
const TOP_LEFT = 7
const CENTER = 8
const ROTATE = 9
// same as center ???
const PIVOT = 10

// this will update for every object...
export default class HandleCollection {
  constructor(x, y, width, height) {
    this.handles = []
    this.action = 'resize'
    this.activeHandle = null
    this.activeHandleType = -1

    for (let i = 0; i < 11; i++) {
      this.handles.push(new Handle(0, 0))
    }
    this.update(x, y, width, height)
  }

  // make box compatible
  get x() {
    let min = Infinity
    for (let i = 0; i < CENTER; i++) {
      if (this.handles[i].x < min) {
        min = this.handles[i].x
      }
    }
    return min
  }
  get y() {
    let min = Infinity
    for (let i = 0; i < CENTER; i++) {
      if (this.handles[i].y < min) {
        min = this.handles[i].y
      }
    }
    return min
  }

  get width() {
    let max = -Infinity
    let min = Infinity
    for (let i = 0; i < CENTER; i++) {
      if (this.handles[i].x > max) {
        max = this.handles[i].x
      }
      if (this.handles[i].x < min) {
        min = this.handles[i].x
      }
    }
    return max - min
  }

  get height() {
    let max = -Infinity
    let min = Infinity
    for (let i = 0; i < CENTER; i++) {
      if (this.handles[i].y > max) {
        max = this.handles[i].y
      }
      if (this.handles[i].y < min) {
        min = this.handles[i].y
      }
    }
    return max - min
  }

  debug() {
    // console.log(this.x, this.y, this.width, this.height)
  }
  lock() {
    this.isLocked = true
  }
  unlock() {
    this.isLocked = false
  }
  update(x, y, width, height, angleDegrees, px, py) {
    const angle = angleDegrees * FROM_DEGREES
    const h = this.handles

    h[TOP_LEFT].update(x, y)
    h[TOP].update(x + width * 0.5, y)
    h[TOP_RIGHT].update(x + width, y)

    h[LEFT].update(x, y + height * 0.5)
    h[CENTER].update(x + width * 0.5, y + height * 0.5)

    if (!this.isLocked) {
      h[ROTATE].update(x + width * 0.5, y - height * 0.5)
    }

    h[RIGHT].update(x + width, y + height * 0.5)

    h[BOTTOM_LEFT].update(x, y + height)
    h[BOTTOM].update(x + width * 0.5, y + height)
    h[BOTTOM_RIGHT].update(x + width, y + height)

    h[PIVOT].update(px, py)
    if (angle) {
      // let p = pivot
      /*if(!isTileObject){
        p = h[TOP_LEFT]
      }*/
      h[TOP].rotate(angle, px, py)
      h[TOP_LEFT].rotate(angle, px, py)
      h[TOP_RIGHT].rotate(angle, px, py)

      h[LEFT].rotate(angle, px, py)
      h[CENTER].rotate(angle, px, py)

      if (!this.isLocked) {
        h[ROTATE].rotate(angle, px, py)
      }

      h[RIGHT].rotate(angle, px, py)

      h[BOTTOM_LEFT].rotate(angle, px, py)
      h[BOTTOM].rotate(angle, px, py)
      h[BOTTOM_RIGHT].rotate(angle, px, py)
    }
  }

  draw(ctx, camera) {
    for (let i = 0; i < this.handles.length; i++) {
      // skip center handle - as it don't have any functionality atm
      if (i == CENTER) {
        continue
      }
      if (i == PIVOT) {
        const cst = ctx.strokeStyle
        ctx.strokeStyle = 'rgb(0, 255, 0)'
        this.handles[i].draw(ctx, camera, this.handles[i] == this.activeHandle)
        ctx.strokeStyle = cst
        continue
      }

      this.handles[i].draw(ctx, camera, this.handles[i] == this.activeHandle)
    }
  }
  // idea behind this is to move points around and then figure what has changed
  moveActiveHandle(udx, udy, obj, type = this.activeHandleType) {
    if (!udx && !udy) {
      return
    }
    switch (type) {
      case TOP_LEFT:
        this.moveActiveHandle(udx, udy, obj, TOP)
        this.moveActiveHandle(udx, udy, obj, LEFT)
        return
      case TOP_RIGHT:
        this.moveActiveHandle(udx, udy, obj, TOP)
        this.moveActiveHandle(udx, udy, obj, RIGHT)
        return
      case BOTTOM_LEFT:
        this.moveActiveHandle(udx, udy, obj, BOTTOM)
        this.moveActiveHandle(udx, udy, obj, LEFT)
        return
      case BOTTOM_RIGHT:
        this.moveActiveHandle(udx, udy, obj, BOTTOM)
        this.moveActiveHandle(udx, udy, obj, RIGHT)
        return
    }

    let dx = udx
    let dy = udy

    // if no rotation we can skip extra calculations
    if (obj.rotation) {
      const sin = Math.sin(-obj.rotation * FROM_DEGREES)
      const cos = Math.cos(-obj.rotation * FROM_DEGREES)
      dx = ObjectHelper.rpx(sin, cos, udx, udy, 0, 0)
      dy = ObjectHelper.rpy(sin, cos, udx, udy, 0, 0)
    }

    // TODO: add pivot point e.g. 50% of left & right would do 50% smaller changes to left and 50% smaller changes to right
    switch (type) {
      case ROTATE: {
        const h = this.handles[ROTATE]
        h.x += udx
        h.y += udy

        const center = this.handles[CENTER]
        const an = Math.atan2(h.y - center.y, h.x - center.x) + Math.PI * 0.5

        // this will rotate around base point - change only rotation
        // obj.rotation = an * FROM_RADIANS

        // this will rotate around middle point
        ObjectHelper.rotateObject(obj, an)
        break
      }
      case BOTTOM: {
        // this is same fro NON tile as for tile TOP
        if (!obj.gid) {
          obj.height += dy
          break
        }

        obj.x -= dy * Math.sin(obj.rotation * FROM_DEGREES)
        obj.y += dy * Math.cos(obj.rotation * FROM_DEGREES)
        obj.height += dy
        break
      }
      case TOP: {
        if (!obj.gid) {
          obj.x -= dy * Math.sin(obj.rotation * FROM_DEGREES)
          obj.y += dy * Math.cos(obj.rotation * FROM_DEGREES)
          obj.height -= dy
          break
        }

        obj.height -= dy
        break
      }
      case LEFT: {
        obj.x += dx * Math.cos(obj.rotation * FROM_DEGREES)
        obj.y += dx * Math.sin(obj.rotation * FROM_DEGREES)
        obj.width -= dx
        break
      }
      case RIGHT: {
        obj.width += dx
        break
      }
    }
  }

  /*oppositeHandle(obj, handle = this.activeHandleType){
    switch
  }*/

  setActive(x, y) {
    this.activeHandle = null
    this.activeHandleType = -1
    for (let i = 0; i < this.handles.length; i++) {
      if (this.handles[i].vsPoint(x, y)) {
        this.activeHandleType = i
        this.activeHandle = this.handles[i]
        return true
      }
    }
    return false
  }
  clearActive() {
    this.activeHandle = null
    this.activeHandleType = -1
  }
}
