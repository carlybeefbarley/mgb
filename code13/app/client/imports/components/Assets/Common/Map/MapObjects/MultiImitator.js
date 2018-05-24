import ObjectHelper from '../Helpers/ObjectHelper.js'
// This object imitates Multiple Objects as one big rectangle
export default class MultiImitator {
  constructor(layer) {
    // we need layer - as layer contains transformations
    this.layer = layer
    this._x = 0
    this._y = 0
    this._width = 0
    this._height = 0

    this.selection = []
  }

  get x() {
    return this._x
  }
  set x(v) {
    const diff = v - this._x
    if (!diff) {
      return
    }
    this.forEach(o => {
      let dx = diff
      let dy = 0
      /*if(o.rotation) {
        const angle = o.rotation * ObjectHelper.TO_RADIANS
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)

        dx = -ObjectHelper.rpx(sin, cos, diff, 0, 0, 0)
        dy = -ObjectHelper.rpy(sin, cos, diff, 0, 0, 0)
      }*/
      o.x += dx
      o.y += dy
    })
    this.update()
  }

  get y() {
    return this._y
  }
  set y(v) {
    const diff = v - this._y
    if (!diff) {
      return
    }
    this.forEach(o => {
      let dx = 0
      let dy = diff
      /*if(o.rotation) {
        const angle = o.rotation * ObjectHelper.TO_RADIANS
        const sin = Math.sin(angle)
        const cos = Math.cos(angle)

        dx = -ObjectHelper.rpx(sin, cos, 0, diff, 0, 0)
        dy = -ObjectHelper.rpy(sin, cos, 0, diff, 0, 0)
      }*/
      o.x += dx
      o.y += dy
    })
    this.update()
  }

  get width() {
    return this._width
  }
  set width(v) {
    // disable for now at it needs to be redone
    //
    // const diff = v - this._width
    // if (!diff) {
    //   return
    // }
    // this.forEach(o => {
    //   o.width += diff * 2
    //   o.height += diff * 2
    //   // o.x += diff
    //   // o.y += diff
    //   // below are sort of nicer resize - but it needs extra work for rotated objects - e.g. for objects upside down
    //   let dx = diff
    //   let dy = 0
    //   if (o.rotation) {
    //     const angle = o.rotation * ObjectHelper.TO_RADIANS
    //     const sin = Math.sin(angle)
    //     const cos = Math.cos(angle)
    //
    //     dx = ObjectHelper.rpx(sin, cos, diff, diff, 0, 0)
    //     dy = ObjectHelper.rpy(sin, cos, diff, diff, 0, 0)
    //   }
    //   if (dx != diff) {
    //     console.log('DX:', dx, diff)
    //   }
    //   o.x += 2 * dx
    //   o.y += 2 * dx
    // })
    // this._width = v
    // this.update()
    // this._height += diff
  }

  get height() {
    return this._height
  }
  set height(v) {
    // disable for now at it needs to be redone
    //
    // const diff = v - this._height
    // if (!diff) {
    //   return
    // }
    // this.forEach(o => {
    //   o.width += diff * 2
    //   o.height += diff * 2
    //   o.x -= diff
    //   o.y -= diff
    //   /*
    // let dx = 0
    // let dy = diff
    // if(o.rotation) {
    //   const angle = -o.rotation * ObjectHelper.TO_RADIANS
    //   const sin = Math.sin(angle)
    //   const cos = Math.cos(angle)
    //
    //   dx = ObjectHelper.rpx(sin, cos, 0, diff, 0, 0)
    //   dy = ObjectHelper.rpy(sin, cos, 0, diff, 0, 0)
    // }
    // o.width += dx
    // o.height += dy
    // */
    // })
    // this._height = v
    // this.update()
  }

  get length() {
    return this.selection.length
  }

  forEach(cb) {
    this.selection.forEach(cb)
  }
  add(o) {
    if (this.selection.indexOf(o) == -1) {
      this.selection.push(o)
    }
    this.update()
  }
  remove(o) {
    const index = this.selection.indexOf(o)
    if (index > -1) {
      this.selection.splice(index, 1)
    }
    this.update()
  }
  first() {
    if (this.selection.length) {
      return this.selection[0]
    }
  }

  clear() {
    this.selection.length = 0
    this.update()
  }

  update() {
    const obj = this.selection
    if (!obj.length) {
      this._x = this._y = this._width = this._height = 0
      return
    }
    let minx = Infinity,
      maxx = -Infinity,
      miny = Infinity,
      maxy = -Infinity

    let o

    for (let i = 0; i < obj.length; i++) {
      this.layer.updateHandles(obj[i])
      o = this.layer.handles

      if (o.x < minx) {
        minx = o.x
      }
      if (o.y < miny) {
        miny = o.y
      }
      if (o.x + o.width > maxx) {
        maxx = o.x + o.width
      }
      if (o.y + o.height > maxy) {
        maxy = o.y + o.height
      }
    }

    this._x = minx
    this._y = miny
    this._width = maxx - minx
    this._height = maxy - miny
  }

  get rotation() {
    return 0
  }
  set rotation(val) {}

  toBox() {
    this.update()
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      rotation: 0,
    }
  }

  empty() {
    return !this.selection.length
  }
}
