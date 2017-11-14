import React from 'react'

import TileHelper from './Helpers/TileHelper'
import ObjectHelper from './Helpers/ObjectHelper.js'

import DragNDropHelper from '../../../../helpers/DragNDropHelper'

import TileCollection from './Tools/TileCollection'
import EditModes from './Tools/EditModes'
import LayerTypes from './Tools/LayerTypes'
import GridLayer from './Layers/GridLayer'
import MaskLayer from './Layers/MaskLayer'

import Camera from './Camera'

import Plural from '/client/imports/helpers/Plural'

import { showToast } from '/client/imports/modules'

import SpecialGlobals from '/imports/SpecialGlobals.js'

import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

const MOUSE_BUTTONS = {
  none: 0, //  No button or un-initialized
  left: 1, //  Left button
  right: 2, //  Right button
  middle: 4, //  Wheel button or middle button
  back: 8, //  4th button (typically the "Browser Back" button)
  forward: 16, //  5th button (typically the "Browser Forward" button)
}

import './EditMap.css'

const MAX_ZOOM = 10 // scale
const MIN_ZOOM = 0.2 // scale
const ZOOM_STEP = 0.1 // @golds - create an Array with possible zoom options - like in editGraphics?

const DEFAULT_PREVIEW_ANGLE_X = 5 // degrees on x axis in 3d preview
const DEFAULT_PREVIEW_ANGLE_Y = 15 // degrees on y axis in 3d preview
const MAX_ANGLE_Y_IN_3D_VIEW = 60 // max degrees on y axis in 3d preview
const DEFAULT_DISTANCE_BETWEEN_LAYERS = 20 // default distance between layers in 3d preview - can be adjusted with Alt + scroll at runtime
const DEFAULT_DISTANCE_FROM_CAMERA = 300 // distance from camera on z axis in 3d review

const THUMBNAIL_WIDTH = SpecialGlobals.thumbnail.width
const THUMBNAIL_HEIGHT = SpecialGlobals.thumbnail.height

export default class MapArea extends React.Component {
  constructor(props) {
    super(props)

    this.preview = {
      x: DEFAULT_PREVIEW_ANGLE_X, // angle on x axis
      y: DEFAULT_PREVIEW_ANGLE_Y, // angle on y axis
      sep: DEFAULT_DISTANCE_BETWEEN_LAYERS, // layer separation pixels
    }
    this.state = {
      isPlaying: false,
    }
    this.layers = []

    this.isMouseDown = false
    // store touches to reference later
    this.startTouches = []
    this.startDistance = 0
    // here will be kept selections from tilesets
    this.collection = new TileCollection()

    // any modifications will be limited to the selection if not empty
    this.selection = new TileCollection()
    this.tmpSelection = new TileCollection()

    this.camera = new Camera(this, this.props.updateCameraPos)
    this.initialZoom = this.camera.zoom

    this.globalMouseMove = (...args) => {
      this.handleMouseMove(...args)
    }

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.globalMouseUp = (...args) => {
      this.isMouseDown = false
      this.handleMouseUp(...args)
    }

    this.globalResize = () => {
      this.adjustPreview()
    }
    this.globalKeyUp = (...args) => {
      this.handleKeyUp(...args)
    }
    this.globalKeyDown = (...args) => {
      this.handleKeyDown(...args)
    }
    // prevent IE scrolling thingy
    this.globalIEScroll = e => {
      if (e.buttons == MOUSE_BUTTONS.middle) {
        e.preventScrolling && e.preventScrolling()
        // e.stopPropagation() - this will eat up all events
        e.preventDefault()
        return false
      }
    }

    this.gloabalCSSAnimation = () => {
      this.adjustPreview()
    }
  }

  get options() {
    return this.props.options
  }

  get palette() {
    return this.props.cache.tiles
  }

  get activeLayer() {
    return this.props.activeLayer
  }

  // abstract
  set data(val) {
    console.error('Setting read only data')
  }
  // abstract
  get data() {
    return this.props.data
  }

  componentDidMount() {
    this.startTime = Date.now()
    this.startEventListeners()
    this.redraw()
  }

  startEventListeners() {
    window.addEventListener('mousemove', this.globalMouseMove, false)
    window.addEventListener('touchmove', this.globalMouseMove, false)

    window.addEventListener('mouseup', this.globalMouseUp, false)
    window.addEventListener('touchend', this.globalMouseUp, false)

    window.addEventListener('resize', this.globalResize, false)
    window.addEventListener('keyup', this.globalKeyUp, false)
    window.addEventListener('keydown', this.globalKeyDown, false)

    this.touchMovePrevent = function(e) {
      e.preventDefault()
    }

    // clean up - just in case we failed to get ref in the last unmount ( user was playing map - and selected other asset )
    this.refs.mapElement.removeEventListener('touchmove', this.touchMovePrevent)
    // this is here to prevent scrolling with touch device - react event does not prevent scrolling on chrome
    this.refs.mapElement.addEventListener('touchmove', this.touchMovePrevent)

    document.body.addEventListener('mousedown', this.globalIEScroll)

    this._raf = () => {
      this.drawLayers()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }
  stopEventListeners() {
    window.removeEventListener('pointermove', this.globalMouseMove)
    //window.removeEventListener('touchmove', this.globalMouseMove)
    window.removeEventListener('pointerup', this.globalMouseUp)
    window.removeEventListener('resize', this.globalResize)
    window.removeEventListener('keyup', this.globalKeyUp)
    window.removeEventListener('keydown', this.globalKeyDown)

    this.refs.mapElement && this.refs.mapElement.removeEventListener('touchmove', this.touchMovePrevent)
    document.body.removeEventListener('mousedown', this.globalIEScroll)

    // next tick will stop raf loop
    this._raf = () => {}
  }

  redrawOnAnimationEnd() {
    const onEnd = () => {
      this.redraw()
      this.refs.mapElement.removeEventListener('transitionend', onEnd)
    }
    this.refs.mapElement.addEventListener('transitionend', onEnd)
  }
  componentWillReceiveProps(newprops) {
    if (this.props.activeLayer !== newprops.activeLayer) {
      this.activateLayer(newprops.activeLayer)
    }
    if (this.props.options.preview !== newprops.options.preview) {
      this.adjustPreview()
    }
  }

  componentDidUpdate() {
    this.redraw()
    this.adjustPreview()
  }

  componentWillUnmount() {
    this.stopEventListeners()
  }

  /* import and conversion */
  xmlToJson(xml) {
    // window.xml = xml
  }
  handleFileByExt_tmx(name, buffer) {
    // https://github.com/inexorabletash/text-encoding
    const xmlString = new TextDecoder().decode(new Uint8Array(buffer))
    //
    const parser = new DOMParser()
    const xml = parser.parseFromString(xmlString, 'text/xml')
    showToast.error('Sorry: TMX import is not implemented... yet\nTry JSON')

    this.data = this.xmlToJson(xml)
  }
  handleFileByExt_json(name, buffer) {
    const jsonString = new TextDecoder().decode(new Uint8Array(buffer))
    const newData = JSON.parse(jsonString)
    this.props.updateMapData(newData)
    //this.updateImages()
  }
  // TODO: move api links to external resource?
  handleFileByExt_png(nameWithExt, buffer) {
    const blob = new Blob([buffer], { type: 'image/png' })
    this.createGraphicsAsset(nameWithExt, URL.createObjectURL(blob))
  }
  createGraphicsAsset(nameWithExt, src) {
    const name = nameWithExt.substr(0, nameWithExt.lastIndexOf('.')) || nameWithExt
    const img = new Image()
    img.onload = () => {
      // TODO: this is hackish hack - find out less hackish way!!!
      // we should be able to create dataUrl from buffer or blob directly
      const c = document.createElement('canvas')
      c.ctx = c.getContext('2d')
      c.width = img.width
      c.height = img.height
      c.ctx.drawImage(img, 0, 0)

      ObjectHelper.createGraphic(name, c.toDataURL(), newAsset => {
        this.props.addImage(`/api/asset/png/${newAsset._id}`)

        /*const gim = new Image()
        gim.onload = () => {
          this.images.set(nameWithExt, gim)
        }
        gim.src = */
      })
    }
    img.src = src
  }
  /* endof import and conversion */

  lowerOrRaiseObject(lower) {
    const l = this.getActiveLayer()
    if (l.type != LayerTypes.object) {
      return
    }
    const o = l.getPickedObject()

    const layerData = l.data
    if (o == -1) {
      return
    }
    const rec = layerData.objects.splice(o, 1)
    l.clearCache()

    let newSelection
    if (lower) {
      newSelection = o - 1
      layerData.objects.splice(newSelection, 0, rec[0])
    } else {
      newSelection = o + 1
      layerData.objects.splice(newSelection, 0, rec[0])
    }
    l.setPickedObjectSlow(newSelection)

    this.props.setPickedObject(newSelection)
  }
  // TODO(stauzs): add 'insert/remove row/column' functionality
  resize(newSize = this.data) {
    this.data.width = newSize.width
    this.data.height = newSize.height
    // Disabled until fixed
    // this.props.saveForUndo("Resize map")
    this.data.layers.forEach(l => {
      if (!LayerTypes.isTilemapLayer(l.type)) {
        return
      }
      // insert extra tile at the end of the row
      if (l.width < this.data.width) {
        // from last row to first
        for (let i = l.height; i > 0; i--) {
          for (let j = 0; j < this.data.width - l.width; j++) l.data.splice(i * l.width + j, 0, 0)
        }
      } else if (l.width > this.data.width) {
        // remove extra tile from the end
        for (let i = l.height; i > 0; i--) {
          for (let j = 0; j < l.width - this.data.width; j++) {
            const toSplice = i * l.width - j - 1
            l.data.splice(toSplice, 1)
          }
        }
      }
      l.width = this.data.width

      // insert extra tiles
      for (let i = l.data.length; i < this.data.height * this.data.width; i++) l.data[i] = 0
      // remove overflow
      l.data.length = this.data.height * this.data.width
      l.height = this.data.height
    })

    this.redraw()
  }

  setActiveLayer(id) {
    let l = this.getActiveLayer()
    l && l.deactivate()

    l = this.getActiveLayer(id)
    l && l.activate()
  }
  setActiveLayerByName(name) {
    for (let i = 0; i < this.data.layers.length; i++) {
      if (this.data.layers[i].name === name) {
        this.setActiveLayer(i)
        return
      }
    }
  }

  /* selection methods - these are used only by tilemap layers */
  addToActiveSelection(gid) {
    const index = this.collection.indexOf(gid)
    if (index == -1) this.collection.push(gid)
  }
  removeFromActiveSelection(gid) {
    const index = this.collection.indexOf(gid)
    if (index > -1) this.collection.splice(index, 1)
  }
  clearActiveSelection() {
    this.collection.length = 0
  }
  swapOutSelection() {
    for (let i = 0; i < this.tmpSelection.length; i++) this.selection.pushUniquePos(this.tmpSelection[i])
    this.tmpSelection.clear()
  }
  removeFromSelection() {
    for (let i = 0; i < this.tmpSelection.length; i++) this.selection.removeByPos(this.tmpSelection[i])
    this.tmpSelection.clear()
  }
  // keep only matching form both selections
  keepDiffInSelection() {
    const tmp = new TileCollection()

    for (let i = 0; i < this.tmpSelection.length; i++) {
      for (let j = 0; j < this.selection.length; j++) {
        if (this.tmpSelection[i].isEqual(this.selection[j])) tmp.pushUniquePos(this.selection[j])
      }
    }
    this.selection = tmp
    this.tmpSelection.clear()
  }
  selectionToTmp() {
    this.tmpSelection.clear()
    for (let i = 0; i < this.selection.length; i++) this.tmpSelection.push(this.selection[i])
  }
  selectionToCollection() {
    this.collection.clear()
    for (let i = 0; i < this.selection.length; i++) this.collection.push(this.selection[i])
  }
  clearSelection() {
    this.tmpSelection.clear()
    this.selection.clear()
    this.collection.clear()

    const l = this.getActiveLayer()
    if (!l || !l.clearSelection) {
      return
    }
    l.clearSelection(true)
  }
  /* end of selection */

  /* camera stuff */
  resetCamera() {
    this.lastEvent = null
    this.camera.reset()

    if (this.options.preview) this.resetPreview()
  }

  fitMap(direction = Camera.AUTO) {
    this.lastEvent = null
    const md = this.data

    this.camera.fitMap(md.width * md.tilewidth, md.height * md.tileheight, direction)

    if (this.options.preview) this.resetPreview()
  }

  resetPreview() {
    this.preview.x = DEFAULT_PREVIEW_ANGLE_X
    this.preview.y = DEFAULT_PREVIEW_ANGLE_Y

    this.adjustPreview()
  }

  moveCamera(e) {
    // special zoom case
    if (e.touches && e.touches.length > 1) {
      // TODO: probably better would be interpolate between moving points and set distance according moving finger???
      // for now zoom between fingers
      const midx = (TileHelper.getOffsetX(e.touches[0]) + TileHelper.getOffsetX(e.touches[1])) * 0.5
      const midy = (TileHelper.getOffsetY(e.touches[0]) + TileHelper.getOffsetY(e.touches[1])) * 0.5

      // distance between changed points
      const dist = this.getDistanceBetweenPoints(e.touches[0], e.touches[1])

      // TODO (low pri): figure out how to zoom precise pixel per pixel :)
      this.doCameraZoom(this.initialZoom - (this.startDistance - dist) / this.startDistance, midx, midy)
      return
    }
    const px = e.pageX === void 0 ? e.touches[0].pageX : e.pageX
    const py = e.pageY === void 0 ? e.touches[0].pageY : e.pageY

    if (!this.lastEvent) {
      this.lastEvent = {
        pageX: px,
        pageY: py,
      }
      return
    }

    this.camera.x -= (this.lastEvent.pageX - px) / this.camera.zoom
    this.camera.y -= (this.lastEvent.pageY - py) / this.camera.zoom
    /*
    if(e.ctrlKey){
      this.camera.x = Math.round(this.camera.x / this.data.tilewidth) * this.data.tilewidth
      this.camera.y = Math.round(this.camera.y / this.data.tileheight) * this.data.tileheight
    }*/
    this.lastEvent.pageX = px
    this.lastEvent.pageY = py

    this.redraw()
  }

  zoomCamera(newZoom, e) {
    let px = 0,
      py = 0

    if (e) {
      px = TileHelper.getOffsetX(e)
      py = TileHelper.getOffsetY(e)
    }

    this.doCameraZoom(newZoom, px, py)
  }

  zoomIn() {
    this.doCameraZoom(this.camera.zoom + ZOOM_STEP, this.camera.width * 0.5, this.camera.height * 0.5) // or 0,0 would be better?
  }
  zoomOut() {
    this.doCameraZoom(this.camera.zoom - ZOOM_STEP, this.camera.width * 0.5, this.camera.height * 0.5) // or 0,0 would be better?
  }
  doCameraZoom(newZoom, pivotX, pivotY) {
    const zoom = Math.max(Math.min(newZoom, MAX_ZOOM), MIN_ZOOM)

    if (pivotX || pivotY) {
      const bounds = this.refs.mapElement // .getBoundingClientRect(); returns width with transformations - that is not what is needed in this case

      const ox = pivotX / bounds.offsetWidth
      const oy = pivotY / bounds.offsetHeight

      const width = bounds.offsetWidth / this.camera.zoom
      const newWidth = bounds.offsetWidth / zoom

      const height = bounds.offsetHeight / this.camera.zoom
      const newHeight = bounds.offsetHeight / zoom

      this.camera.x -= (width - newWidth) * ox
      this.camera.y -= (height - newHeight) * oy
    }

    this.camera.zoom = zoom
    this.redraw()
  }

  movePreview(e) {
    if (!this.lastEvent) {
      this.lastEvent = {
        pageX: e.pageX,
        pageY: e.pageY,
      }
      this.refs.mapElement.style.transition = '0s'
      return
    }

    this.preview.y += this.lastEvent.pageX - e.pageX
    this.preview.x -= this.lastEvent.pageY - e.pageY

    this.lastEvent.pageX = e.pageX
    this.lastEvent.pageY = e.pageY

    this.adjustPreview()
  }

  adjustPreview() {
    if (this.props.isPlaying) return

    if (!this.data.layers) this.data.layers = []

    let z = 0
    let tot = 0
    this.data.layers.forEach((lay, i) => {
      if (lay.visible) tot++
    })
    this.data.layers.forEach((lay, i) => {
      if (!lay.visible) return
      const l = this.getLayer(lay)
      if (!l || !l.isVisible) return
      if (!this.options.preview) {
        l.refs.layer.style.transform = ''
        return
      }

      // 360 - full circle
      // 90 - right angle
      // 180 - straight angle
      // 270 - opposite right angle

      const tr = this.preview
      tr.x = tr.x % 360
      tr.y = tr.y % 360

      l.refs.layer.style.transform =
        'perspective(2000px) rotateX(' +
        this.preview.x +
        'deg) ' +
        'rotateY(' +
        this.preview.y +
        'deg) rotateZ(0deg) ' +
        'translateZ(-' +
        ((tot - z) * tr.sep + DEFAULT_DISTANCE_FROM_CAMERA) +
        'px)'
      const ay = Math.abs(tr.y)
      const ax = Math.abs(tr.x)

      // adjust z index based on angles vs screen
      if (ay > 90 && ay < 270 && ax > 90 && ax < 270) l.refs.layer.style.zIndex = -i
      else if ((ay > 90 && ay < 270) || (ax > 90 && ax < 270))
        l.refs.layer.style.zIndex = -(this.layers.length - i)
      else l.refs.layer.style.zIndex = i
      z++
    })

    const baseWidth = this.refs.mapElement.parentElement.offsetWidth
    const maxAngle = MAX_ANGLE_Y_IN_3D_VIEW // 90 will make map 2x width
    // resize map to show content which is further - depending on angle
    if (this.preview.y > 0 && this.options.preview) {
      const inc = this.preview.y > maxAngle ? maxAngle : this.preview.y
      const w = baseWidth / Math.cos(inc * Math.PI / 180) // TODO: fix this formula
      this.refs.mapElement.style.width = w + 'px'
    } else {
      this.refs.mapElement.style.width = baseWidth + 'px'
    }

    this.refs.grid && this.refs.grid.alignToLayer()
    this.redraw()

    // we will need to redraw once more - after animations completes
    this.redrawOnAnimationEnd()
  }

  getDistanceBetweenPoints(p1, p2) {
    return Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2))
  }
  /* endof camera stuff */

  /* events */
  handleMouseMove(e) {
    if (this.props.isPlaying || this.props.isLoading) {
      return
    }

    this.refs.positionInfo && this.refs.positionInfo.forceUpdate()
    if (!this.isMouseDown) return

    // IE always reports button === 0
    // and yet: If the user presses a mouse button, use the button property to determine which button was pressed.
    // https://msdn.microsoft.com/en-us/library/ms536947(v=vs.85).aspx

    // it seems that IE and chrome reports "buttons" correctly
    // 1 - left; 2 - right; 4 - middle + combinations
    // we will handle this => no buttons == touchmove event
    const editMode = this.props.getMode()
    if ((e.buttons === void 0 && editMode === EditModes.view) || (e.touches && e.touches.length > 1)) {
      this.moveCamera(e)
    } else if (this.options.preview && e.buttons === MOUSE_BUTTONS.middle) this.movePreview(e)
    else if (
      e.buttons === MOUSE_BUTTONS.right ||
      e.buttons === MOUSE_BUTTONS.middle ||
      e.buttons === MOUSE_BUTTONS.right + MOUSE_BUTTONS.middle ||
      (e.buttons === MOUSE_BUTTONS.left && editMode === EditModes.view)
    ) {
      this.moveCamera(e)
    }
  }

  handleMouseUp(e) {
    if (this.props.isPlaying) return
    this.lastEvent = null
    if (this.refs.mapElement) {
      this.refs.mapElement.style.transition = '0.3s'
      this.refs.positionInfo.forceUpdate()

      // Joyride completion tags
      const editMode = this.props.getMode()
      if (editMode === EditModes.stamp) {
        joyrideCompleteTag(`mgbjr-CT-MapTools-stamp`)
      } else if (editMode === EditModes.eraser) {
        joyrideCompleteTag(`mgbjr-CT-MapTools-eraser`)
      } else if (editMode === EditModes.fill) {
        joyrideCompleteTag(`mgbjr-CT-MapTools-fill`)
      }
    }
  }
  handleMouseDown(e) {
    // prevent putting extra tiles on the map
    if (e.touches) {
      this.startTouches.length = 0
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i]
        this.startTouches.push({ clientX: t.clientX, clientY: t.clientY })
      }
      if (e.touches.length > 1) {
        this.startDistance = this.getDistanceBetweenPoints(this.startTouches[0], this.startTouches[1])
        this.initialZoom = this.camera.zoom
        this.props.setMode(EditModes.view)
      }
    }
    this.isMouseDown = true
  }
  removeObject() {
    const l = this.getActiveLayer()
    l && l.removeObject && l.removeObject()
  }

  handleOnWheel(e) {
    if (this.props.isPlaying) return

    if (!e.shiftKey) {
      return
    }
    e.preventDefault()
    if (e.altKey) {
      this.preview.sep += e.deltaY < 0 ? 1 : -1
      if (this.preview.sep < 0) {
        this.preview.sep = 0
      }
      this.adjustPreview()
      return
    }

    if (e.deltaY < 0) this.zoomCamera(this.camera.zoom + ZOOM_STEP, e)
    else if (e.deltaY > 0) {
      if (this.camera.zoom > ZOOM_STEP * 2) this.zoomCamera(this.camera.zoom - ZOOM_STEP, e)
    }

    // simlpy force update
    this.props.updateScale(this.camera.zoom)
  }

  handleKeyDown(e) {
    if (this.props.isPlaying) return

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    let needUpdate = false
    switch (e.which) {
      case 37: // left
        this.camera.x += this.data.tilewidth * this.camera.zoom
        needUpdate = true
        e.stopPropagation()
        e.preventDefault()
        break
      case 38: // top
        this.camera.y += this.data.tileheight * this.camera.zoom
        needUpdate = true
        e.stopPropagation()
        e.preventDefault()
        break
      case 39: // right
        this.camera.x -= this.data.tilewidth * this.camera.zoom
        needUpdate = true
        e.stopPropagation()
        e.preventDefault()
        break
      case 40: // down
        this.camera.y -= this.data.tileheight * this.camera.zoom
        needUpdate = true
        e.stopPropagation()
        e.preventDefault()
        break
    }

    if (needUpdate) this.redraw()
  }
  handleKeyUp(e) {
    if (this.props.isPlaying) return

    let update = false
    // don't steal events from inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    // leave switch - as we may add more keys later
    switch (e.which) {
      case 13: // enter
        this.selectionToCollection()
        this.selection.clear()
        this.props.setMode(EditModes.stamp)
        break
    }
    if (e.ctrlKey) console.log(e.which)
    if (update) this.redraw()
  }

  prepareForDrag(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
    // IE crashes
    // e.dataTransfer.dropEffect = 'copy'
  }

  onImageLayerDrop(e, layer_data) {
    const data = DragNDropHelper.getDataFromEvent(e)
    if (!data || !data.asset || data.asset.kind !== 'graphic') return false

    layer_data.image = data.link
    this.props.handleSave('Added Image: ' + data.asset.name)
    return true
  }
  /* endof events */

  /* update stuff */

  /* update all except images */
  update(cb = () => {}) {
    this.redraw()
    cb()
  }

  redraw() {
    this.redrawLayers()
    this.redrawGrid()
    this.redrawMask()
  }

  redrawGrid() {
    this.refs.grid && this.refs.grid.draw()
  }

  redrawLayers() {
    this.layers.forEach(layer => {
      layer.adjustCanvas()
      layer.draw()
    })
  }

  redrawMask() {
    this.refs.mask && this.refs.mask.draw()
  }

  // RAF calls this function
  drawLayers(forceRedraw) {
    const now = Date.now()
    for (let i = 0; i < this.layers.length; i++) this.layers[i]._draw(now, forceRedraw)
  }
  /* endof update stuff */

  // added id - as sometimes we fail to get active layer - e.g. in cases when map has been updated, but layer data haven't
  getLayer(ld, id = 0) {
    const l = this.layers[id]
    // in most cases this will be valid
    if (l && l.options == ld) return l
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].options == ld) return this.layers[i]
    }
    return l
  }

  getActiveLayer(id = this.props.activeLayer) {
    if (!this.data.layers) return null

    return this.getLayer(this.data.layers[id], id)
  }

  togglePreviewState() {
    // this is not a synchronous function !!!
    this.options.preview = !this.options.preview
    this.adjustPreview()
  }

  activateLayer(id) {
    let l = this.getActiveLayer()
    l && l.deactivate()

    l = this.getActiveLayer(id)
    l && l.activate()

    this.update()
  }
  generatePreviewAndSaveIt(data, reason) {
    window.requestAnimationFrame(() => {
      const thumbnail = this.generatePreview()
      this.props.saveThumbnail(data, reason, thumbnail)
    })
  }
  // find out correct thumbnail size
  generatePreview() {
    for (let i = 0; i < this.data.layers.length; i++) {
      const ld = this.data.layers[i]
      if (!ld.visible) continue

      const layer = this.getLayer(ld)
      if (!layer) continue

      const c = layer.refs.canvas
      c.width = THUMBNAIL_WIDTH
      c.height = THUMBNAIL_HEIGHT
    }

    // store camera state
    this.camera.stash()
    this.camera._width = THUMBNAIL_WIDTH
    this.camera._height = THUMBNAIL_HEIGHT
    // adjust camera
    this.fitMap()
    // draw adjusted camera by force
    this.drawLayers(true)

    const canvas = document.createElement('canvas')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < this.data.layers.length; i++) {
      const ld = this.data.layers[i]
      if (!ld.visible) continue

      const layer = this.getLayer(ld)
      if (!layer) continue

      const c = layer.refs.canvas

      // this has been copied directly from editGraphics - DRY
      const wRatio = canvas.width / c.width
      const hRatio = canvas.height / c.height
      let ratio = wRatio < hRatio ? wRatio : hRatio
      if (wRatio >= 1 && hRatio >= 1) ratio = 1
      const width = c.width * ratio
      const height = c.height * ratio
      const x = (canvas.width - width) / 2
      const y = (canvas.height - height) / 2

      ctx.drawImage(c, x, y, width, height)
    }
    // restore camera state
    this.camera.pop()

    return canvas.toDataURL()
  }

  getLayers() {
    return this.layers
  }

  // render related methods
  getInfo() {
    const layer = this.getActiveLayer()
    return layer ? layer.getInfo() : null
  }

  getNotification() {
    return this.data.width * this.data.height > 100000 ? (
      <div>This map is larger than our recommended size - so editing may be slower than normal!</div>
    ) : null
  }

  addLayerRef(id, layer) {
    if (layer) {
      this.layers[id] = layer
    }
  }

  renderMap() {
    const data = this.data

    if (!data || !data.layers) return <div className="map-empty" ref="mapElement" />

    const layers = []

    for (let i = 0; i < data.layers.length; i++) {
      const LayerComponent = LayerTypes.toComponent(data.layers[i].type)
      if (LayerComponent) {
        layers.push(
          <LayerComponent
            {...this.props}
            data={data.layers[i]}
            mapData={data}
            options={this.props.options}
            getLayers={this.getLayers.bind(this)}
            palette={this.palette}
            isActive={this.props.activeLayer === i}
            camera={this.camera}
            startTime={this.startTime}
            getEditMode={() => this.props.getMode()}
            setEditMode={mode => {
              this.props.setMode(mode)
            }}
            getSelection={() => {
              return this.selection
            }}
            getTmpSelection={() => {
              return this.tmpSelection
            }}
            getCollection={() => {
              return this.collection
            }}
            clearTmpSelection={() => {
              this.tmpSelection.clear()
            }}
            clearSelection={() => {
              this.selection.clear()
            }}
            addFirstToSelection={tile => {
              if (!this.tmpSelection.length) {
                this.tmpSelection.pushUniquePos(tile)
              }
            }}
            pushUniquePos={tile => {
              this.tmpSelection.pushUniquePos(tile)
            }}
            swapOutSelection={() => {
              this.swapOutSelection()
            }}
            selectionToCollection={() => {
              this.selectionToCollection()
            }}
            keepDiffInSelection={() => this.keepDiffInSelection()}
            removeFromSelection={() => this.removeFromSelection()}
            onImageLayerDrop={(e, options) => this.onImageLayerDrop(e, options)}
            getImage={src => this.props.cache.images[src]}
            // object layer draws selection shapes on the grid - as it's always on top
            getOverlay={() => this.refs.grid}
            key={i}
            index={i}
            ref={this.addLayerRef.bind(this, i)}
          />,
        )
      }
    }
    layers.push(
      <GridLayer
        map={this}
        key={data.layers.length}
        layer={this.layers[this.props.activeLayer]}
        ref="grid"
      />,
    )
    // TODO: adjust canvas height
    return (
      <div
        ref="mapElement"
        id="mgb_map_area"
        onContextMenu={e => {
          e.preventDefault()
          return false
        }}
        onMouseDown={this.handleMouseDown}
        onTouchStart={this.handleMouseDown}
        style={{ height: '680px', position: 'relative', margin: '10px 0' }}
      >
        {layers}
        <MaskLayer
          map={this}
          layer={this.layers[this.props.activeLayer]}
          ref="mask"
          style={{ opacity: 0.9 }}
        />
      </div>
    )
  }
}
