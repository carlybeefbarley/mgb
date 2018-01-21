import _ from 'lodash'
import React from 'react'
import AbstractLayer from './AbstractLayer.js'
import TileHelper from './../Helpers/TileHelper.js'
import ObjectHelper from './../Helpers/ObjectHelper.js'

import LayerTypes from './../Tools/LayerTypes.js'
import EditModes from './../Tools/EditModes.js'

import HandleCollection from './../MapObjects/HandleCollection.js'
import Imitator from './../MapObjects/Imitator.js'
import MultiImitator from './../MapObjects/MultiImitator.js'

import SpecialGlobals from '/imports/SpecialGlobals'

const FLIPPED_HORIZONTALLY_FLAG = TileHelper.FLIPPED_HORIZONTALLY_FLAG
const FLIPPED_VERTICALLY_FLAG = TileHelper.FLIPPED_VERTICALLY_FLAG
const FLIPPED_DIAGONALLY_FLAG = TileHelper.FLIPPED_DIAGONALLY_FLAG
const TO_DEGREES = Math.PI / 180

export default class ObjectLayer extends AbstractLayer {
  constructor(...args) {
    super(...args)
    this.drawDebug = false
    this._pickedObject = -1
    this.info = null

    this.handles = new HandleCollection(0, 0, 0, 0)

    // store calculated shapeBoxes here
    this.shapeBoxes = {}
    // array with elements to be copied / ctrl C/V
    this.copy = []

    // reference to highlighted tile object
    this.highlightedObject = null

    this.selectionBox = {
      x: 0,
      y: 0,
      width: 0,
      height: 1,
    }

    this.selection = new MultiImitator(this)

    this.lineWidth = 3

    this.drawInterval = 10000
    this.nextDraw = Date.now() + this.drawInterval

    this.startPosX = 0
    this.startPosY = 0
  }

  get pickedObject() {
    if (this.shapeBoxes[this._pickedObject]) {
      return this.shapeBoxes[this._pickedObject]
    }
    return this.data.objects[this._pickedObject]
  }

  get highlightedObject() {
    if (!this._highlightedObject) return null

    const tmp = this.data.objects.find(a => a.id === this._highlightedObject.id)
    if (!tmp) {
      this.data.objects.push(this._highlightedObject)
      console.log('Added new tmp object: ', this.data.objects)
    } else this._highlightedObject = tmp

    return this._highlightedObject
  }

  set highlightedObject(val) {
    this._highlightedObject = val
  }

  getInfo = () => {
    let info
    if (this.info > -1) {
      const o = this.data.objects[this.info]
      info = o ? o.name || `(unnamed ${this.getObjectType(o)})` : ''
    }
    return (
      <div>
        <div>{this.data.name + ' Layer'}</div>
        <div>{info}</div>
      </div>
    )
  }

  getObjectType = o => {
    if (o.gid) {
      return 'tile'
    } else if (o.orig) {
      if (o.orig.polyline) {
        return 'polyline'
      } else {
        return 'polygon'
      }
    } else if (o.ellipse) {
      if (o.width == o.height) {
        return 'circle'
      }
      return 'ellipse'
    } else {
      return 'rectangle'
    }
  }

  setPickedObjectSlow = id => {
    this._pickedObject = id
    this.props.setPickedObject(id)
  }
  getPickedObject = () => {
    return this._pickedObject
  }
  updateClonedObject = () => {
    if (this.selection.length) {
      this.clonedObject = this.selection.toBox()
    } else if (this.pickedObject instanceof Imitator) {
      this.clonedObject = new Imitator(_.cloneDeep(this.pickedObject.orig))
    } else {
      this.clonedObject = Object.assign({}, this.pickedObject)
    }
  }
  // this gets called when layer is activated
  activate = () => {
    if (!this.activeMode) {
      this.props.setEditMode(EditModes.rectangle)
    }
    super.activate()
  }

  getMaxId = () => {
    let d
    let maxId = 1
    for (let i = 0; i < this.data.objects.length; i++) {
      d = this.data.objects[i]
      if (d.id > maxId) {
        maxId = d.id + 1
      } else {
        maxId++
      }
    }
    return maxId
  }
  pickObject = e => {
    const ret = this.queryObject(e)
    this.setPickedObjectSlow(ret)
    return ret
  }

  queryObject = e => {
    let obj
    const x = TileHelper.getOffsetX(e) / this.camera.zoom - this.camera.x
    const y = TileHelper.getOffsetY(e) / this.camera.zoom - this.camera.y

    let ret = -1
    // reverse order last drawn - first pick
    for (let i = this.data.objects.length - 1; i > -1; i--) {
      obj = this.data.objects[i]
      if (obj.gid) {
        if (ObjectHelper.PointvsTile(obj, x, y)) {
          ret = i
          break
        }
      } else if (obj.polyline || obj.polygon) {
        this.shapeBoxes[i] = new Imitator(obj)
        const imit = this.shapeBoxes[i]

        if (ObjectHelper.PointvsAABB(imit, x, y, false, imit.orig.x, imit.orig.y)) {
          ret = i
          break
        }
      } else {
        if (ObjectHelper.PointvsAABB(obj, x, y)) {
          ret = i
          break
        }
      }
    }
    return ret
  }

  selectObject = obj => {
    this.setPickedObjectSlow(this.data.objects.indexOf(obj))
  }
  selectObjects = box => {
    let ret = 0
    this.selection.clear()
    for (let i = 0; i < this.data.objects.length; i++) {
      let o = this.data.objects[i]
      if (o.polygon || o.polyline) {
        if (!this.shapeBoxes[i]) {
          this.shapeBoxes[i] = new Imitator(o)
        }
        o = this.shapeBoxes[i]
      }
      this.updateHandles(o)
      if (!ObjectHelper.AABBvsAABB(box, this.handles)) {
        continue
      }
      this.selection.add(o)
      ret++
    }
    // show single selected object - most use cases will be here
    if (this.selection.length == 1) {
      // TODO(stauzs): figure out a way to get rid of these checks
      // maybe use Imitator like object for all shapes?
      let f = this.selection.first()
      if (f instanceof Imitator) {
        f = f.orig
      }
      this.setPickedObjectSlow(this.data.objects.indexOf(f))
      this.selection.clear()
    }
    return ret
  }

  removeObject = () => {
    this.props.saveForUndo('Delete Object')
    if (this.pickedObject) {
      this.deleteObject(this.pickedObject.orig ? this.pickedObject.orig : this.pickedObject)
    }
    this.selection.forEach(o => {
      let x = o
      if (o instanceof Imitator) {
        x = o.orig
      }
      this.deleteObject(x)
    })

    this.clearSelection(true)

    // removed selected objects
    this.props.handleSave('Deleted Some Objects')
    this.draw()
  }
  /* Events */
  handleMouseMove = ep => {
    const e = ep.nativeEvent ? ep.nativeEvent : ep
    super.handleMouseMove(e)

    if (e.target !== this.refs.canvas) {
      return
    }

    this.info = this.queryObject(e)
    if (!this.mouseDown) {
      this.handles.setActive(
        this.mouseX / this.camera.zoom - this.camera.x,
        this.mouseY / this.camera.zoom - this.camera.y,
      )
    }

    const mode = this.props.getEditMode()
    if (edit[mode]) {
      edit[mode].call(this, e)
      this.draw()
    }
  }
  handleMouseDown = ep => {
    const e = ep.nativeEvent ? ep.nativeEvent : ep

    // TODO (stauzs): fix - move camera and object at the same time
    super.handleMouseDown(e)
    const prevHandle = this.handles.activeHandle
    this.handles.setActive(this.pointerPosX, this.pointerPosY)
    // is same handle?
    if (prevHandle && prevHandle == this.handles.activeHandle) {
      this.handles.lock()
      // we need to store values somewhere instead of applying these directly
      // for align to grid etc features
      // this.objects[this._pickedObject] - as we don't need imitator itself here
      this.updateClonedObject()
      this.handleMouseMove(e)
      // we will move handle on next move
      return
    }
    this.handles.unlock()

    const mode = this.props.getEditMode()
    if (edit[mode]) {
      edit[mode].call(this, e)
      this.draw()
    }

    // 0 - mouse; undefined - touch
    if (e.button) {
      this.mouseDown = false
    }
  }
  handleMouseUp = ep => {
    if (ep.target != this.refs.canvas) {
      return
    }
    const e = ep.nativeEvent ? ep.nativeEvent : ep
    super.handleMouseUp(e)
    this.handles.unlock()

    this.mouseDown = false
    const mode = this.props.getEditMode()
    if (edit[mode]) {
      edit[mode].call(this, e)
      // force re-draw
      this.draw()
    }
  }
  onMouseLeave = () => {
    if (this.highlightedObject) {
      this.deleteObject(this.highlightedObject)
      this.highlightedObject = null
    }
  }
  onKeyUp = e => {
    // don't steal events from input fields
    // TODO: this repeats at least in 2 places.. Create Helper - DRY!!!! :)
    if (['INPUT', 'SELECT', 'TEXTAREA'].indexOf(e.target.tagName) > -1) {
      return
    }

    const remove = () => {
      this.removeObject()
    }

    const paste = () => {
      this.props.saveForUndo('Paste')
      let minx = Infinity
      let miny = Infinity
      this.copy.forEach(data => {
        minx = Math.min(data.x, minx)
        miny = Math.min(data.y, miny)
      })
      this.copy.forEach(data => {
        const n = _.cloneDeep(data.obj)
        n.id = this.getMaxId()
        n.x = data.x + this.mouseInWorldX - minx
        n.y = data.y + this.mouseInWorldY - miny

        this.clearCache()
        this.data.objects.push(n)
        this.selectObject(n)

        this.clearCache()
      })
      this.draw()
    }

    const copy = () => {
      this.copy.length = 0
      const saveCopy = obj => {
        const toSave = obj.orig ? obj.orig : obj
        this.copy.push({
          obj: toSave,
          x: toSave.x - this.mouseInWorldX,
          y: toSave.y - this.mouseInWorldY,
        })
      }
      if (this.pickedObject) {
        saveCopy(this.pickedObject)
      }
      this.selection.forEach(saveCopy)
    }

    // delete key
    if (e.which == 46) {
      remove()
    }

    // copy
    if (e.ctrlKey) {
      if (e.which == 'V'.charCodeAt(0)) {
        paste()
      }
      if (e.which == 'C'.charCodeAt(0)) {
        copy()
      }
      if (e.which == 'X'.charCodeAt(0)) {
        copy()
        remove()
      }
    }

    if (e.which == 'B'.charCodeAt(0)) {
      this.drawDebug = !this.drawDebug
      this.draw()
    }
  }
  /* End of Events */

  updateHandles = obj => {
    // tile
    if (obj.gid) {
      this.handles.update(obj.x, obj.y - obj.height, obj.width, obj.height, obj.rotation, obj.x, obj.y)
    } else if (obj instanceof Imitator) {
      this.handles.update(obj.x, obj.y, obj.width, obj.height, obj.rotation, obj.orig.x, obj.orig.y)
    } else {
      /// ???
      this.handles.update(obj.x, obj.y, obj.width, obj.height, obj.rotation, obj.x, obj.y)
    }
  }
  clearSelection = (alsoSelectedObjects = false) => {
    this.handles.clearActive()
    if (alsoSelectedObjects) {
      this.selection.clear()
    }
    this.setPickedObjectSlow(-1)
    edit.clear.call(this)
    this.draw()
  }

  deleteObject = obj => {
    const index = this.data.objects.indexOf(obj)
    if (index > -1) {
      delete this.shapeBoxes[index]
      this.data.objects.splice(index, 1)
      this.clearCache()
    }
  }
  rotateObject = (rotation, object = this.pickedObject) => {
    const angle = rotation * Math.PI / 180
    ObjectHelper.rotateObject(object, angle)
    this.draw()
  }
  toggleFill = () => {
    this.props.saveForUndo('Toggle shape fill')

    //selection.selection
    for (let i = 0; i < this.selection.selection.length; i++) {
      this._toggleFill(this.selection.selection[i])
    }

    if (this.pickedObject) {
      this._toggleFill(this.pickedObject)
    }

    this.props.handleSave('Toggle shape fill')
    this.draw()
  }
  _toggleFill = obj => {
    if (obj && obj.orig) {
      if (obj.orig.polyline) {
        obj.orig.polygon = obj.orig.polyline
        delete obj.orig.polyline
      } else if (obj.orig.polygon) {
        obj.orig.polyline = obj.orig.polygon
        delete obj.orig.polygon
      }
    }
  }
  setPickedObject = (obj, index) => {
    this.setPickedObjectSlow(index)
    // TODO: make this more automatic
    if (obj.polygon || obj.polyline) {
      if (this.shapeBoxes[index]) {
        this.shapeBoxes[index].update(obj)
      } else {
        this.shapeBoxes[index] = new Imitator(obj)
      }
    }

    this.draw()
    this.highlightSelected()
  }
  clearCache = () => {
    Object.keys(this.shapeBoxes).forEach(k => {
      delete this.shapeBoxes[k]
    })
    this.draw()
  }

  /* DRAWING methods */
  _draw = (now, force = false) => {
    this.now = now
    if (!force && this.nextDraw > now) {
      return
    }

    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height)
    if (!this.isVisible) {
      return
    }
    // force refresh after a while
    this.queueDraw(this.drawInterval)

    this.ctx.clearRect(0, 0, this.camera.width, this.camera.height)
    // TODO(stauzs): Don't loop through all objects.. use quadtree here some day
    // when we will support unlimited size streaming maps
    for (let i = 0; i < this.data.objects.length; i++) {
      let o = this.data.objects[i]
      if (!o.visible) {
        continue
      }
      if (o.polygon || o.polyline) {
        if (!this.shapeBoxes[i]) {
          this.shapeBoxes[i] = new Imitator(o)
        }
        o = this.shapeBoxes[i]
      }
      // skip objects invisible to camera
      if (!ObjectHelper.CameravsAABB(this.camera, o)) {
        continue
      }
      // draw tile
      if (o.gid) {
        this.drawTile(o)
      } else if (o.orig) {
        if (o.orig.polyline) {
          this.drawPolyline(o.orig)
        } else {
          this.drawPolyline(o.orig, true)
        }
      } else if (o.ellipse) {
        this.drawEllipse(o)
      } else {
        this.drawRectangle(o)
      }
    }

    this.highlightSelected()
  }

  drawTile = obj => {
    const gid = obj.gid & ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG)

    const flipX = obj.gid & FLIPPED_HORIZONTALLY_FLAG ? -1 : 1
    const flipY = obj.gid & FLIPPED_VERTICALLY_FLAG ? -1 : 1
    let pal = this.props.palette[gid]
    // images might be not loaded
    if (!pal || !pal.image) {
      return
    }

    const anInfo = TileHelper.getAnimationTileInfo(pal, this.props.palette, this.now)
    if (anInfo) {
      pal = anInfo.pal
      this.queueDraw(anInfo.nextUpdate)
    }

    const cam = this.camera
    let x = (cam.x + obj.x) * cam.zoom
    let y = (cam.y + obj.y) * cam.zoom
    let w = obj.width * cam.zoom
    let h = obj.height * cam.zoom

    if (this.options.mgb_tiledrawdirection && this.options.mgb_tiledrawdirection !== 'rightup') {
      if (this.options.mgb_tiledrawdirection == 'leftdown') {
        x -= w
      } else if (this.options.mgb_tiledrawdirection == 'leftup') {
        x -= w
        y -= h
      }
    } else {
      y -= h
    }

    this.ctx.save()

    this.ctx.translate(x, y + h)
    if (obj.rotation) {
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES)
    }

    // translate to canvas drawing pos
    this.ctx.translate(0, -h)
    if (this.drawDebug && obj.name) {
      this.ctx.fillText(obj.name + '(' + obj.x.toFixed(2) + ',' + obj.y.toFixed(2) + ')', 0, 0)
    }

    if (flipX < 0 || flipY < 0) {
      // translate to middle point of drawing
      this.ctx.translate(w * 0.5, h * 0.5)
      // flip
      this.ctx.scale(flipX, flipY)
      // translate back
      this.ctx.translate(-w * 0.5, -h * 0.5)
    }
    this.ctx.drawImage(pal.image, pal.x, pal.y, pal.w, pal.h, 0, 0, w, h)
    if (obj == this.highlightedObject) {
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'
      this.ctx.fillRect(0, 0, w, h)
    }
    this.ctx.restore()
  }
  drawRectangle = obj => {
    const cam = this.camera
    let x = (cam.x + obj.x) * cam.zoom
    let y = (cam.y + obj.y) * cam.zoom
    let w = obj.width * cam.zoom
    let h = obj.height * cam.zoom

    this.ctx.save()

    // translate to TILED drawing pos
    this.ctx.translate(x, y)
    if (obj.rotation) {
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES)
    }
    if (this.drawDebug && obj.name) {
      this.ctx.fillText(obj.name, 0, 0)
    }
    this.ctx.lineWidth = this.lineWidth
    this.ctx.strokeRect(0.5, 0.5, w, h)
    this.ctx.restore()
  }
  drawEllipse = obj => {
    const cam = this.camera
    let x = (cam.x + obj.x) * cam.zoom
    let y = (cam.y + obj.y) * cam.zoom
    let w = obj.width * cam.zoom
    let h = obj.height * cam.zoom

    this.ctx.save()

    // translate to TILED drawing pos
    this.ctx.translate(x, y)
    if (obj.rotation) {
      // rotate
      this.ctx.rotate(obj.rotation * TO_DEGREES)
    }
    if (this.drawDebug && obj.name) {
      this.ctx.fillText(obj.name, 0, 0)
    }
    this.ctx.lineWidth = this.lineWidth
    ObjectHelper.drawEllipse(this.ctx, 0.5, 0.5, w, h)
    // this.ctx.strokeRect(0.5, 0.5, w, h)
    this.ctx.restore()
  }
  drawPolyline = o => {
    const cam = this.camera
    let x = (cam.x + o.x) * cam.zoom
    let y = (cam.y + o.y) * cam.zoom

    this.ctx.save()
    // translate to TILED drawing pos
    this.ctx.translate(x, y)
    if (o.rotation) {
      // rotate
      this.ctx.rotate(o.rotation * TO_DEGREES)
    }
    if (this.drawDebug && o.name) {
      this.ctx.fillText(o.name, 0, 0)
    }

    const lines = o.polyline ? o.polyline : o.polygon

    this.ctx.beginPath()
    this.ctx.moveTo(lines[0].x, lines[0].y)
    for (let i = 1; i < lines.length; i++) {
      this.ctx.lineTo(lines[i].x * this.camera.zoom, lines[i].y * this.camera.zoom)
    }

    if (o.polygon) {
      this.ctx.lineTo(lines[0].x * this.camera.zoom, lines[0].y * this.camera.zoom)
      this.ctx.fillStyle = 'rgba(70, 70, 70, 1)'
      this.ctx.fill()
    }

    this.ctx.lineWidth = this.lineWidth
    this.ctx.stroke()
    this.ctx.restore()
  }
  // this one is drawing on the grid layer - as overlay
  highlightSelected = () => {
    const grid = this.props.getOverlay()
    if (grid) {
      grid.draw()
      let obj = this.pickedObject

      const cam = this.camera
      const ctx = grid.ctx
      if (this.selectionBox.width > 0 && this.selectionBox.height > 0) {
        ctx.strokeRect(
          (this.selectionBox.x + cam.x) * cam.zoom,
          (this.selectionBox.y + cam.y) * cam.zoom,
          this.selectionBox.width * cam.zoom,
          this.selectionBox.height * cam.zoom,
        )
      }

      if (!this.selection.empty()) {
        obj = this.selection
      }

      if (obj && this.props.isActive) {
        this.updateHandles(obj)
        // draw on grid which is always on the top
        this.handles.draw(ctx, cam)
      }
    }
  }

  /* END of DRAWING methods */
}

// TODO: move these to separate file
let obj,
  endPoint,
  pointCache = { x: 0, y: 0 }
const edit = {}
edit.clear = function() {
  // this is for touch input - finalize shape drawing
  if (obj && obj.polyline) {
    //obj.polyline.pop()
    this.setPickedObject(obj, this.data.objects.length - 1)
    this.props.handleSave('Drawing lines')
    obj = null
    endPoint = null
  }
}
edit[EditModes.drawRectangle] = function(e) {
  if (e.type == 'mousedown' || e.type == 'touchstart') {
    if ((e.buttons & 0x2) == 0x2) {
      return
    }
    obj = ObjectHelper.createRectangle(this.getMaxId(), this.pointerPosX, this.pointerPosY)

    this.clearCache()
    this.props.saveForUndo('Draw Rectangle')
    this.data.objects.push(obj)
    return
  }
  if (!obj) {
    return
  }
  if (e.type == 'mouseup' || e.type == 'touchend') {
    this.setPickedObject(obj, this.data.objects.length - 1)
    this.props.handleSave('Added rectangle')
    obj = null
    return
  }

  const x1 = this.pointerPosX
  const x2 = this.pointerPosX + this.movementX
  const y1 = this.pointerPosY
  const y2 = this.pointerPosY + this.movementY

  obj.x = Math.min(x1, x2)
  obj.width = Math.abs(this.movementX)

  obj.y = Math.min(y1, y2)
  obj.height = Math.abs(this.movementY)

  const tw = this.props.mapData.tilewidth
  const th = this.props.mapData.tileheight

  if (this.isCtrlKey(e)) {
    obj.x = Math.round(obj.x / tw) * tw
    obj.y = Math.round(obj.y / th) * th
    obj.width = Math.round(obj.width / tw) * tw
    obj.height = Math.round(obj.height / th) * th
  }
}
edit[EditModes.drawEllipse] = function(e) {
  if (e.type == 'mousedown' || e.type == 'touchstart') {
    if ((e.buttons & 0x2) == 0x2) {
      return
    }
    obj = ObjectHelper.createEllipse(this.getMaxId(), this.pointerPosX, this.pointerPosY)
    this.clearCache()
    this.props.saveForUndo('Draw Ellipse')
    this.data.objects.push(obj)
    return
  }
  if (!obj) {
    return
  }
  if (e.type == 'mouseup' || e.type == 'touchend') {
    this.setPickedObject(obj, this.data.objects.length - 1)
    obj = null
    this.props.handleSave('Added ellipse')
    return
  }

  const x1 = this.pointerPosX
  const x2 = this.pointerPosX + this.movementX
  const y1 = this.pointerPosY
  const y2 = this.pointerPosY + this.movementY

  obj.x = Math.min(x1, x2)
  obj.width = Math.abs(this.movementX)

  obj.y = Math.min(y1, y2)
  obj.height = Math.abs(this.movementY)

  const tw = this.props.mapData.tilewidth
  const th = this.props.mapData.tileheight

  if (this.isCtrlKey(e)) {
    obj.x = Math.round(obj.x / tw) * tw
    obj.y = Math.round(obj.y / th) * th
    obj.width = Math.round(obj.width / tw) * tw || tw
    obj.height = Math.round(obj.height / th) * th || th
  }
}
edit[EditModes.drawShape] = function(e) {
  if (e.type == 'mousedown' || e.type == 'touchstart') {
    if (!obj) {
      if ((e.buttons & 0x2) == 0x2) {
        return
      }
      obj = ObjectHelper.createPolyline(this.getMaxId(), this.pointerPosX, this.pointerPosY)
      if (this.isCtrlKey(e)) {
        const tw = this.props.mapData.tilewidth
        const th = this.props.mapData.tileheight
        obj.x = Math.round(obj.x / tw) * tw
        obj.y = Math.round(obj.y / th) * th
      }
      this.clearCache()
      this.props.saveForUndo('Draw Shape')
      this.data.objects.push(obj)
      // first point is always at 0,0
      endPoint = { x: 0, y: 0 }
      pointCache.x = 0
      pointCache.y = 0
      obj.polyline.push(endPoint)
      return
    } else {
      // are buttons FLAGS?
      if ((e.buttons & 0x2) == 0x2) {
        edit.clear.call(this)
        return
      } else {
        endPoint = { x: endPoint.x, y: endPoint.y }
        obj.polyline.push(endPoint)
      }
    }
    return
  }

  if (!obj) {
    return
  }
  const tw = this.props.mapData.tilewidth
  const th = this.props.mapData.tileheight

  endPoint.x += this.pointerMovementX / this.camera.zoom
  endPoint.y += this.pointerMovementY / this.camera.zoom
  pointCache.x += this.pointerMovementX / this.camera.zoom
  pointCache.y += this.pointerMovementY / this.camera.zoom

  if (this.isCtrlKey(e)) {
    endPoint.x = Math.round(pointCache.x / tw) * tw
    endPoint.y = Math.round(pointCache.y / th) * th
  }
}

edit[EditModes.stamp] = function(e) {
  const col = this.props.getCollection()
  if (!col.length || e.target !== this.refs.canvas) {
    return
  }
  const tile = col[0]
  const pal = this.props.palette[tile.gid]
  const tw = this.props.mapData.tilewidth
  const th = this.props.mapData.tileheight
  const cam = this.camera
  let x = e.offsetX / cam.zoom - cam.x
  let y = (e.offsetY + pal.h * cam.zoom) / cam.zoom - cam.y

  if (this.isCtrlKey(e)) {
    x = Math.floor(x / tw) * tw
    y = Math.floor(y / th) * th
  }

  if (!this.highlightedObject) {
    this.highlightedObject = ObjectHelper.createTileObject(pal, this.getMaxId(), x, y)
    this.highlightedObject.tmp = true
    this.clearCache()
  }

  if (e.type === 'mouseup' && e.which === 1) {
    // at first we need to remove object from map - so we can save previous map state
    this.deleteObject(this.highlightedObject)
    this.props.saveForUndo('Add Tile')

    // now add back and save new state
    this.data.objects.push(this._highlightedObject)
    delete this._highlightedObject.tmp
    this.props.handleSave('Added Tile Object')

    // next loop will create new highlighted object
    this.highlightedObject = null
    return
  }

  this.highlightedObject.x = x
  this.highlightedObject.y = y
}

// TODO(stauzs): rework this and clean up
let phase = 0 // 0 - selecting; 1 - moving
edit[EditModes.rectangle] = function(e) {
  if ((e.buttons & 0x2) === 0x2) {
    return
  }

  let dx = this.pointerMovementX / this.camera.zoom
  let dy = this.pointerMovementY / this.camera.zoom

  const nx = this.startPosX + this.movementX
  const ny = this.startPosY + this.movementY

  const tw = this.props.mapData.tilewidth
  const th = this.props.mapData.tileheight
  if (e.type === 'mouseup' || e.type === 'touchend') {
    if (obj && !this.handles.activeHandle) {
      let selCount = this.selectObjects(obj)
      if (selCount > 0) {
        phase = 1
      } else {
        phase = 0
      }

      if (selCount === 1 && this.pickedObject) {
        this.startPosX = this.pickedObject.x
        this.startPosY = this.pickedObject.y
      } else {
        this.clearSelection()
      }
      // invalidate
      this.selectionBox.width = 0
      this.selectionBox.height = 0
      obj = null
      return
    }

    phase && this.props.handleSave('Edit Object')

    this.updateClonedObject()
  }

  if (e.type == 'mousedown' || e.type == 'touchstart') {
    if (!this.handles.activeHandle) {
      this.draw()
      this.mouseDown = true
      if (this.pickObject(e) > -1) {
        this.props.saveForUndo('Edit Object')

        if (!this.selection.length) {
          this.startPosX = this.pickedObject.x
          this.startPosY = this.pickedObject.y
        } else {
          this.setPickedObjectSlow(-1)
          this.startPosX = this.selection.x
          this.startPosY = this.selection.y
        }
        phase = 1
        return
      }

      phase = 0
      this.selection.clear()
      obj = this.selectionBox
      obj.x = this.pointerPosX
      obj.y = this.pointerPosY
      return
    } else {
      phase && this.props.saveForUndo('Edit Object')
    }
  }

  if (this.mouseDown && phase == 1) {
    if (this.handles.activeHandle) {
      this.handles.moveActiveHandle(dx, dy, this.clonedObject)
      let selected = this.selection.length < 2 ? this.pickedObject : this.selection
      if (this.isCtrlKey(e)) {
        if (this.handles.activeHandleType != 9) {
          selected.height = Math.round(this.clonedObject.height / th) * th
          selected.width = Math.round(this.clonedObject.width / tw) * tw
          if (selected != this.selection) {
            selected.x = Math.round(this.clonedObject.x / tw) * tw
            selected.y = Math.round(this.clonedObject.y / th) * th
          }
        } else {
          if (selected != this.selection) {
            const newRotation =
              Math.round(this.clonedObject.rotation / SpecialGlobals.map.objectRotationStep) *
              SpecialGlobals.map.objectRotationStep
            this.rotateObject(newRotation, selected)
          }
        }
      } else {
        if (this.clonedObject) {
          if (this.handles.activeHandleType != 9) {
            selected.height = this.clonedObject.height
            selected.width = this.clonedObject.width

            // TODO(stauzs): multiple rotated objects will be bogous
            if (selected != this.selection) {
              selected.x = this.clonedObject.x
              selected.y = this.clonedObject.y
            }
          } else {
            if (selected != this.selection) {
              this.rotateObject(this.clonedObject.rotation, selected)
            }
          }
        }
      }
      return
    }

    // move multiple objects
    if (this.selection.length > 1) {
      this.selection.x = nx
      this.selection.y = ny

      if (this.isCtrlKey(e)) {
        this.selection.x = Math.round(this.selection.x / tw) * tw
        this.selection.y = Math.round(this.selection.y / th) * th
      }
      return
    }

    if (this.pickedObject) {
      this.pickedObject.x = nx
      this.pickedObject.y = ny

      if (this.isCtrlKey(e)) {
        dx = this.pickedObject.orig ? this.pickedObject.minx % tw : 0
        dy = this.pickedObject.orig ? this.pickedObject.miny % th : 0

        this.pickedObject.x = Math.round(this.pickedObject.x / tw) * tw + dx
        this.pickedObject.y = Math.round(this.pickedObject.y / th) * th + dy
      }
      return
    }
  }

  if (!obj) {
    return
  }

  const x1 = this.pointerPosX
  const x2 = this.pointerPosX + this.movementX
  const y1 = this.pointerPosY
  const y2 = this.pointerPosY + this.movementY

  obj.x = Math.min(x1, x2)
  obj.width = Math.abs(this.movementX)
  obj.y = Math.min(y1, y2)
  obj.height = Math.abs(this.movementY)

  let selCount = this.selectObjects(obj)
  if (selCount == 1 && this.pickedObject) {
    this.startPosX = this.pickedObject.x
    this.startPosY = this.pickedObject.y
  }
  if (selCount == 0) {
    this.clearSelection()
  }
}
