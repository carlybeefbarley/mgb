import React from 'react'
import TileMapLayer from './Layers/TileMapLayer'
import ActorLayer from './Layers/ActorLayer'
import EventLayer from './Layers/EventLayer'
import ImageLayer from './Layers/ImageLayer'
import ObjectLayer from './Layers/ObjectLayer'
import GridLayer from './Layers/GridLayer'

import Actor from './Tools/Actor'
import Layers from './Tools/Layers'
import Properties from './Tools/Properties'

import MapToolbar from './Tools/MapToolbar'
import TileHelper from './Helpers/TileHelper'
import ActorHelper from './Helpers/ActorHelper'

import TileCollection from './Tools/TileCollection'
import EditModes from './Tools/EditModes'
import LayerTypes from './Tools/LayerTypes'
import PositionInfo from './Tools/PositionInfo'
import Camera from './Camera'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import Plural from '/client/imports/helpers/Plural'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'

import DropArea from '../../Controls/DropArea'
import SmallDD from '../../Controls/SmallDD'

import Mage from '/client/imports/components/MapActorGameEngine/Mage'

import './EditMap.css'

export default class MapArea extends React.Component {

  constructor (props) {
    super(props)
    let images = {}
    this.startTime = Date.now()
    // expose map for debugging purposes - access in console
    window.mgb_map = this
    this.state = {}

    this.images = {
      set: (property, value) => {
        property = this.removeDots(property)
        images[property] = value
        if (!this.data.images)
          this.data.images = {}
        this.data.images[property] = TileHelper.normalizePath(value.src)
        return true
      },
      get: (property) => {
        property = this.removeDots(property)
        return images[property]
      },
      clear: (property) => {
        property = this.removeDots(property)
        delete images[property]
      },
      clearAll: () => {
        images = {}
      }
    }

    // here will be kept selections from tilesets
    this.collection = new TileCollection()

    // any modifications will be limited to the selection if not empty
    this.selection = new TileCollection()
    this.tmpSelection = new TileCollection()

    this.errors = []
    this.missingImages = []
    this.loadingImages = []
    this.gidCache = {}

    this.activeLayer = 0
    this.activeTileset = 0
    // x/y are angles not pixels
    this.preview = {
      x: 5,
      y: 15,
      sep: 20
    }

    this.layers = []
    this.tilesets = []
    // this.margin = 0
    this.spacing = 0
    // current update timestamp
    this.now = Date.now()

    this._camera = null
    this.ignoreUndo = 0
    this.undoSteps = []
    this.redoSteps = []

    this.globalMouseMove = (...args) => {
      this.handleMouseMove(...args)
    }
    this.globalMouseUp = (...args) => {
      this.handleMouseUp(...args)
    }
    this.globalResize = () => {
      this.redraw()
    }
    this.globalKeyUp = (...args) => {
      this.handleKeyUp(...args)
    }

    // prevent IE scrolling thingy
    this.globalIEScroll = (e) => {
      if (e.buttons == 4) {
        e.preventScrolling && e.preventScrolling()
        e.stopPropagation()
        e.preventDefault()
        return false
      }
    }
    this.activeAsset = this.props.asset
  }

  componentDidMount() {
    this.buildMap()

    if (!this.data)
      this.data = TileHelper.genNewMap()
    
    $(this.refs.mapElement).addClass('map-filled')

    window.addEventListener('mousemove', this.globalMouseMove, false)
    window.addEventListener('mouseup', this.globalMouseUp, false)
    window.addEventListener('resize', this.globalResize, false)
    window.addEventListener('keyup', this.globalKeyUp, false)

    document.body.addEventListener('mousedown', this.globalIEScroll)

    this._raf = () => {
      this.drawLayers()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }

  buildMap() {
    const names = {
      map: this.props.asset.name,
      user: this.props.asset.dn_ownerName
    }
    ActorHelper.v1_to_v2(this.data, names, (md) => {
      this.data = md
      this.fullUpdate()
    })
  }

  resetMap() {
    const names = {
      map: this.props.asset.name,
      user: this.props.asset.dn_ownerName
    }
    this.data = ActorHelper.createEmptyMap()
    this.fullUpdate()
  }

  componentWillUpdate () {
    // allow to roll back updated changes
    // this.saveForUndo()
    // console.error("will update")
  }

  componentDidUpdate () {
    this.redraw()
    this.adjustPreview()
  }

  componentWillUnmount () {
    window.removeEventListener('mousemove', this.globalMouseMove)
    window.removeEventListener('mouseup', this.globalMouseUp)
    window.removeEventListener('resize', this.globalResize)
    window.removeEventListener('keyup', this.globalKeyUp)

    this._raf = null
  }

  // TODO: handle here updates - atm disabled as updates move state in back in history
  componentWillReceiveProps (props) {
    // console.log("New map data", props)
    // it's safe to update read only
    if (!this.activeAsset || !this.props.parent.props.canEdit)
      this.activeAsset = props.asset
  }

  forceUpdate (...args) {
    // ignore undo for local updates
    this.ignoreUndo++
    super.forceUpdate(...args)
    this.ignoreUndo--
  }

  removeDots (url) {
    return TileHelper.normalizePath(url).replace(/\./gi, '*')
  }

  // TODO(stauzs): add 'insert/remove row/column' functionality
  resize() {
    this.saveForUndo("Resize")
    console.log("RESIZE:", this.data.width +"x"+ this.data.height)
    this.layers.forEach((l) => {
      // insert extra tile at the end of the row
      if (l.data.width < this.data.width) {
        // from last row to first
        for (let i = l.data.height; i > 0; i--) {
          for (let j=0; j<this.data.width-l.data.width; j++)
            l.data.data.splice(i * l.data.width + j, 0, 0)
        }
      }
      // remove extra tile from the end
      else if (l.data.width > this.data.width) {
        for (let i = l.data.height; i > 0; i--) {
          for (let j=0; j<l.data.width - this.data.width; j++) {
            const toSplice = i * l.data.width - j - 1
            l.data.data.splice(toSplice, 1)
          }
        }
      }
      l.data.width = this.data.width

      // insert extra tiles
      for (let i=l.data.length; i<this.data.height * this.data.width; i++)
        l.data[i] = 0
      // remove overflow
      l.data.length = this.data.height * this.data.width
      l.data.height = this.data.height
    })
  }

  set data(val) {
    console.log("SET Data:", val)
    // get layer first as later data won't match until full react sync
    const l = this.getActiveLayer()
    this.activeAsset.content2 = val
    l && l.clearCache && l.clearCache()
  }

  get data () {
    return this.activeAsset.content2
        // TODO - cleanup following code.
    if (this.activeAsset && !this.activeAsset.content2.width) 
      this.activeAsset.content2 = TileHelper.genNewMap()
    return this.activeAsset.content2
  }

  // store meta information about current map
  // don't forget to strip meta when exporting it
  get meta() {
    if (!this.data.meta) {
      this.data.meta = {
        options: {
          // empty maps aren't visible without grid
          showGrid: 1,
          camera: { _x: 0, _y: 0, _zoom: 1 },
          preview: false,
          mode: 'stamp',
          randomMode: false
        }
      }
    }
    return this.data.meta
  }

  get camera() {
    // prevent camera adjustments on asset update
    if (this._camera)
      return this._camera

    this._camera = new Camera(this)
    return this.meta.options.camera
  }

  get options() {
    return this.meta.options
  }

  // palette is just more intuitive name
  get palette() {
    return this.gidCache
  }

  // TMP - one undo step - just to prevent data loss
  saveForUndo(reason = '' , skipRedo = false) {
    if (this.ignoreUndo)
      return
    const toSave = { data: this.copyData(this.data), reason }
    // prevent double saving undo
    if (this.undoSteps.length && this.undoSteps[this.undoSteps.length - 1].data == toSave.data)
      return

    if (!skipRedo)
      this.redoSteps.length = 0

    this.undoSteps.push(toSave)
    this.refs.tools.forceUpdate()

    // next action will change map.. remove from stack.. and we should get good save state
    if (!skipRedo) {
      window.setTimeout(() => {
        this.save(reason)
      }, 0)
    }
  }

  doUndo () {
    if (this.undoSteps.length) {
      this.redoSteps.push(this.data)
      this.data = JSON.parse(this.undoSteps.pop().data)

      this.ignoreUndo++
      this.update(() => {
        this.ignoreUndo--
        this.save('Undo')
      })
    }
  }

  doRedo () {
    if (!this.redoSteps.length)
      return

    const pop = this.redoSteps.pop()
    this.saveForUndo(pop.reason, true)
    this.data = pop

    this.ignoreUndo++
    this.update(() => {
      this.ignoreUndo--
      this.save('Undo')
    })
  }

  save (reason = 'no reason' , force = false) {
    const newData = JSON.stringify(this.data)
    // skip equal map save
    if (!force && this.savedData == newData)
      return

    this.savedData = newData

    // make sure thumbnail is nice - all layers has been drawn
    window.requestAnimationFrame(() => {
      /*let wmax = this.data.width, hmax = this.data.height;
      this.data.layers.forEach(l => {
        wmax = Math.max(wmax, l.width)
        hmax = Math.max(hmax, l.height)
      })
      this.data.width = wmax;
      this.data.height = hmax;
      */
      this.props.parent.handleSave(ActorHelper.v2_to_v1(this.data) , reason, this.generatePreview())
    })
  }

  copyData (data) {
    return JSON.stringify(data)
  }

  generateImages (cb) {
    // image layer has separate field for image
    if (!this.data.images) {
      this.data.images = {}
    }
    const imgs = this.data.images

    for (let i = 0; i < this.data.layers.length; i++) {
      if (this.data.layers[i].image)
        this.data.images[this.data.layers[i].image] = this.data.layers[i].image
    }

    const keys = Object.keys(imgs)

    if (!keys.length) {
      if (typeof cb == 'function')
        cb()
      return false
    }

    let loaded = 0
    keys.forEach((i, index) => {
      const img = new Image
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => {
        loaded++
        this.images.set(i, img)
        if (loaded == keys.length) {
          this.updateImages(cb)
        }
      }
      img.onerror = () => { console.error('Failed to load an image:', i) }
      img.src = imgs[i]
    })
    return true
  }

  getImage(nameWithExt) {
    this.loadingImages.push(nameWithExt)
    const name = nameWithExt.substr(0, nameWithExt.lastIndexOf('.')) || nameWithExt
    const src = nameWithExt.indexOf("/") === 0 ? nameWithExt : `/api/asset/png/${this.props.parent.getUser()}/${name}`
    $.get(src)
      .done((id) => {
        const img = new Image()
        img.onload = () => {
          this.images.set(nameWithExt, img)
          this.loadingImages.splice(this.loadingImages.indexOf(nameWithExt), 1)
          this.updateImages()
        }
        img.src = `/api/asset/png/${id}`
      })
      .fail(() => {
        this.missingImages.push(nameWithExt)
        this.loadingImages.splice(this.loadingImages.indexOf(nameWithExt), 1)
        this.updateImages()
      })
  }

  updateImages(cb) {
    const map = this.data
    // map has not loaded
    if (!map || !map.tilesets)
      return

    this.errors.length = 0
    let index = 0
    for (let ts of map.tilesets) {
      const fgid = ts.firstgid
      if (!this.images.get(ts.image)) {
        if (this.loadingImages.indexOf(ts.image) > -1)
          continue
        else if (this.missingImages.indexOf(ts.image) > -1)
          this.errors.push("missing: '" + ts.image + "'")
        else
          this.getImage(ts.image)
        continue
      }
      const img = this.images.get(ts.image)
      // this should be imported from mgb1
      ts.imagewidth = img.width
      ts.imageheight = img.height
      
      if (!ts.tilewidth) {
        ts.tilewidth = img.width
        ts.tileheight = img.height
        ts.width = 1
        ts.height = 1
      }
      // update tileset to match new image / settings
      const extraPixels = ts.imagewidth % ts.tilewidth
      const columns = (ts.imagewidth - extraPixels) / ts.tilewidth
      let rows = (ts.imageheight - (ts.imageheight % ts.tileheight)) / ts.tileheight
      ts.tilecount = columns * rows
      ts.columns = columns

      let tot = ts.tilecount
      let pos = {x: 0, y: 0}
      for (let i = 0; i < tot; i++) {
        TileHelper.getTilePosWithOffsets(i, Math.floor((ts.imagewidth + ts.spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, ts.margin, ts.spacing, pos)
        this.gidCache[fgid + i] = {
          image: img,
          index,
          w: ts.tilewidth,
          h: ts.tileheight,
          x: pos.x,
          y: pos.y,
          ts: ts,
          gid: fgid + i
        }
      }
      index++
    }

    if (this.errors.length)
      this.addTool('error', 'Errors', this.errors)
    else
      this.removeTool('error')
  
    this.forceUpdate()
    this.updateTilesets()
    if (typeof cb === 'function') {
      // clean up map - make sure gidCache is valid.. otherwise we will break all map
      TileHelper.zeroOutUnreachableTiles(this.data, this.gidCache)
      cb()
    }
  }

  addLayerTool() {
    this.addTool('Layers', 'ActorMap Layers', { map: this }, Layers)
  }

  addTilesetTool() {
    this.addTool('Actor', 'Actors', {map: this}, Actor)
  }

  addPropertiesTool() {
    this.addTool('Properties', 'Properties', {map: this}, Properties, true)
  }

  setActiveLayer(id) {
    let l = this.getActiveLayer()
    l && l.deactivate()
    this.activeLayer = id
    l = this.getActiveLayer()
    l && l.activate()
    this.update()
  }

  /*
   * TODO: move tools to the EditMap.js. MapArea should not handle tools
   */
  addTool(id, title, content, type, collapsed = false) {
    let tools = this.props.parent.state.tools
    tools[id] = {
      title, 
      content, 
      type, 
      collapsed
    }
    this.props.parent.setState( { tools } )
  }

  removeTool (id) {
    let ptools = this.props.parent.state.tools
    delete ptools[id]
    this.props.parent.setState({
      tools: ptools
    })
  }

  updateTools () {
    this.props.parent.forceUpdate()
  }

  // tileset calls this method..
  /* TODO: selection should be matrix - new class?*/
  /* selection methods */
  addToActiveSelection (gid) {
    const index = this.collection.indexOf(gid)
    if (index == -1)
      this.collection.push(gid)
  }

  removeFromActiveSelection (gid) {
    const index = this.collection.indexOf(gid)
    if (index > -1)
      this.collection.splice(index, 1)
  }

  clearActiveSelection () {
    this.collection.length = 0
  }

  swapOutSelection () {
    for (let i = 0; i < this.tmpSelection.length; i++)
      this.selection.pushUniquePos(this.tmpSelection[i])
    this.tmpSelection.clear()
  }

  removeFromSelection () {
    for (let i = 0; i < this.tmpSelection.length; i++)
      this.selection.removeByPos(this.tmpSelection[i])
    this.tmpSelection.clear()
  }

  // keep only matching form both selections
  keepDiffInSelection () {
    const tmp = new TileCollection()

    for (let i = 0; i < this.tmpSelection.length; i++) {
      for (let j = 0; j < this.selection.length; j++) {
        if (this.tmpSelection[i].isEqual(this.selection[j]))
          tmp.pushUniquePos(this.selection[j])
      }
    }
    this.selection = tmp
    this.tmpSelection.clear()
  }
  selectionToTmp () {
    this.tmpSelection.clear()
    for (let i = 0; i < this.selection.length; i++)
      this.tmpSelection.push(this.selection[i])
  }

  selectionToCollection () {
    this.collection.clear()
    for (let i = 0; i < this.selection.length; i++)
      this.collection.push(this.selection[i])
  }
  /* end of selection */


  /* camera stuff */
  togglePreviewState () {
    /*this.refs.mapElement.style.transform = ""
     this.lastEvent = null

     // next state...
     if(!this.options.preview){
     $(this.refs.mapElement).addClass("preview")
     }
     else{
     $(this.refs.mapElement).removeClass("preview")
     }*/
    // this is not a synchronous function !!!
    this.options.preview = !this.options.preview
    this.adjustPreview()
    this.forceUpdate()
  }

  resetCamera() {
    this.lastEvent = null
    this.camera.reset()

    if (this.options.preview)
      this.resetPreview()
  }

  resetPreview() {
    this.preview.x = 5
    this.preview.y = 15
    // seems too far away
    // this.refs.mapElement.style.transform = "rotatey(" + this.preview.y + "deg) rotatex(" + this.preview.x + "deg) scale(0.9)"
    this.adjustPreview()
  }

  moveCamera (e) {
    if (!this.lastEvent) {
      this.lastEvent = {
        pageX: e.pageX,
        pageY: e.pageY
      }
      return
    }
    this.camera.x -= (this.lastEvent.pageX - e.pageX) / this.camera.zoom
    this.camera.y -= (this.lastEvent.pageY - e.pageY) / this.camera.zoom
    this.lastEvent.pageX = e.pageX
    this.lastEvent.pageY = e.pageY

    this.redraw()
  }

  zoomCamera (newZoom, e) {
    if (e) {
      // .getBoundingClientRect(); returns width with transformations - that is not what is needed in this case
      const bounds = this.refs.mapElement

      const ox = e.nativeEvent.offsetX / bounds.offsetWidth
      const oy = e.nativeEvent.offsetY / bounds.offsetHeight

      const width = bounds.offsetWidth / this.camera.zoom
      const newWidth = bounds.offsetWidth / newZoom

      const height = bounds.offsetHeight / this.camera.zoom
      const newHeight = bounds.offsetHeight / newZoom

      this.camera.x -= (width - newWidth) * ox
      this.camera.y -= (height - newHeight) * oy
    }

    this.camera.zoom = newZoom
    this.redraw()
  }

  movePreview (e) {
    if (!this.lastEvent) {
      this.lastEvent = {
        pageX: e.pageX,
        pageY: e.pageY
      }
      this.refs.mapElement.style.transition = '0s'
      return
    }

    this.preview.y += this.lastEvent.pageX - e.pageX
    this.preview.x -= this.lastEvent.pageY - e.pageY

    this.lastEvent.pageX = e.pageX
    this.lastEvent.pageY = e.pageY

    this.adjustPreview()
    // this.refs.mapElement.style.transform = "rotatey(" + this.preview.y + "deg) rotatex("+this.preview.x+"deg) scale(0.9)"
  }

  adjustPreview () {
    if (!this.data.layers)
      this.data.layers = []

    let z = 0
    let tot = 0
    this.data.layers.forEach((lay, i) => {
      if (lay.visible)
        tot++
    })
    this.data.layers.forEach((lay, i) => {
      if (!lay.visible)
        return
      const l = this.getLayer(lay)
      if (!l || !l.isVisible)
        return
      if (!this.options.preview) {
        l.refs.layer.style.transform = ''
        return
      }

      const tr = this.preview
      tr.x = tr.x % 360
      tr.y = tr.y % 360

      l.refs.layer.style.transform = 'perspective(2000px) rotateX(' + this.preview.x + 'deg) ' +
        'rotateY(' + this.preview.y + 'deg) rotateZ(0deg) ' +
        'translateZ(-' + ((tot - z) * tr.sep + 300) + 'px)'
      const ay = Math.abs(tr.y)
      const ax = Math.abs(tr.x)

      if (ay > 90 && ay < 270 && ax > 90 && ax < 270)
        l.refs.layer.style.zIndex = -i
      else if (ay > 90 && ay < 270 || ax > 90 && ax < 270)
        l.refs.layer.style.zIndex = -(this.layers.length - i)
      else
        l.refs.layer.style.zIndex = i
      z++
    })
    this.refs.grid && this.refs.grid.alignToActiveLayer()
  }
  /* endof camera stuff */

  /* events */
  handleMouseMove (e) {
    if (this.state.isPlaying)
      return
    
    // IE always reports button === 0
    // and yet: If the user presses a mouse button, use the button property to determine which button was pressed.
    // https://msdn.microsoft.com/en-us/library/ms536947(v=vs.85).aspx

    // it seems that IE and chrome reports "buttons" correctly
    // console.log(e.buttons)
    // 1 - left; 2 - right; 4 - middle + combinations
    if (this.options.preview && (e.buttons == 4)) 
      this.movePreview(e)
    else if (e.buttons == 2 || e.buttons == 4 || e.buttons == 2 + 4)
      this.moveCamera(e)
    this.refs.positionInfo.forceUpdate()
  }

  handleMouseUp (e) {
    if (this.state.isPlaying)
      return
    this.lastEvent = null
    this.refs.mapElement.style.transition = '0.3s'
    this.refs.positionInfo.forceUpdate()
  }

  handleOnWheel (e) {
    if (this.state.isPlaying)
      return

    e.preventDefault()
    if (e.altKey) {
      this.preview.sep += e.deltaY < 0 ? 1 : -1
      this.adjustPreview()
      return
    }

    const step = 0.1
    if (e.deltaY < 0)
      this.zoomCamera(this.camera.zoom + step, e)
    else if (e.deltaY > 0) {
      if (this.camera.zoom > step * 2)
        this.zoomCamera(this.camera.zoom - step, e)
    }
  }

  handleKeyUp (e) {
    if (this.state.isPlaying)
      return

    let update = false
    // don't steal events from inputs
    if (e.target.tagName == 'INPUT')
      return

    switch (e.which) {
    case 37: // left
      this.camera.x += this.data.tilewidth * this.camera.zoom
      update = true
      break
    case 38: // top
      this.camera.y += this.data.tileheight * this.camera.zoom
      update = true
      break
    case 39: // right
      this.camera.x -= this.data.tilewidth * this.camera.zoom
      update = true
      break
    case 40: // down
      this.camera.y -= this.data.tileheight * this.camera.zoom
      update = true
      break
    case 13: // enter
      this.selectionToCollection()
      this.selection.clear()
      this.refs.tools.enableMode(EditModes.stamp)
      break
    /*case 90: // ctrl + z
      if (e.ctrlKey) {
        if (e.shiftKey) {
          this.doRedo()
        }
        else {
          this.doUndo()
        }
      }*/
    }
    if (e.ctrlKey) 
      console.log(e.which)
    if (update)
      this.redraw()
  }

  setMode (mode) {
    this.refs.tools.enableMode(mode)
  }

  importFromDrop (e) {
    if (!this.props.parent.props.canEdit) {
      this.props.parent.props.editDeniedReminder()
      return
    }

    const layer = this.getActiveLayer()
    if (layer && layer.onDrop) {
      // layer by it's own can handle drop
      // e.g. image layer adds image
      // true - layer did something with dropped stuff
      if (layer.onDrop(e))
        return
    }
    
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (asset) {
      console.log('Ignoring drop of assets on actorMap')
      return
    }
  }

  prepareForDrag (e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
    // IE crashes
    // e.dataTransfer.dropEffect = 'copy'
  }
  /* endof events */

  /* update stuff */
  fullUpdate (cb = () => {}) {
    this.gidCache = {}
    this.images.clearAll()

    this.generateImages(() => {
      this.update(cb)
    })
  }

  /* update all except images */
  update (cb = () => {}) {
    this.addTools()
    this.redraw()
    this.redrawTilesets()
    cb()
  }

  addTools () {
    this.addLayerTool()
    this.addTilesetTool()
    this.addPropertiesTool()
  }

  redraw () {
    this.redrawLayers()
    this.redrawGrid()
  }

  redrawGrid () {
    this.refs.grid && this.refs.grid.draw()
  }

  redrawLayers () {
    this.layers.forEach((layer) => {
      layer.adjustCanvas()
      layer.draw()
    })
  }

  // RAF calls this function
  drawLayers () {
    this.now = Date.now()
    for (let i = 0; i < this.layers.length; i++)
      this.layers[i]._draw(this.now)
  }

  redrawTilesets () {
    this.tilesets.forEach((tileset) => { tileset.drawTiles() })
  }

  updateTilesets () {
    // do we have more than 1 tileset ?????
    // TODO: atm we are using only 1 tileset tool..
    this.tilesets.forEach((tileset) => { tileset.selectTileset(this.activeTileset) })
  }
  /* endof update stuff */

  // added id - as sometimes we fail to get active layer - e.g. in cases when map has been updated, but layer data haven't
  getLayer (ld, id = 0) {
    const l = this.layers[id]
    // in most cases this will be valid
    if (l && l.options == ld)
      return l
    for (let i = 0; i < this.layers.length; i++) {
      if (this.layers[i].options == ld)
        return this.layers[i]
    }
    return l
  }

  getActiveLayer () {
    if (!this.data.layers)
      return null

    return this.getLayer(this.data.layers[this.activeLayer], this.activeLayer)
  }

  addLayer (type) {
    const map = this
    const lss = map.data.layers
    // TODO: check for duplicate names..
    // TODO: get rid of strings
    let ls
    if (type == LayerTypes.tile)
      ls = TileHelper.genLayer(map.data.width, map.data.height, 'Tile Layer ' + (lss.length + 1))
    else if (type == LayerTypes.image)
      ls = TileHelper.genImageLayer('Image Layer ' + (lss.length + 1))
    else if (type == LayerTypes.object)
      ls = TileHelper.genObjectLayer('Object Layer ' + (lss.length + 1))
    else if (type == LayerTypes.object)
      ls = TileHelper.genObjectLayer('Object Layer ' + (lss.length + 1))

    lss.push(ls)
    map.forceUpdate()
    return ls
  }
  
  activateLayer (id) {
    let l = this.getActiveLayer()
    l && l.deactivate()

    this.activeLayer = id

    l = this.getActiveLayer()
    l && l.activate()

    this.update()
  }

  registerLayer (layer) {
    if (!this.getLayer(layer.data))
      this.layers.push(layer)
  }

  unregisterLayer (layer) {
    const index = this.layers.indexOf(layer)
    if (index > -1)
      this.layers.splice(index, 1)
  }

  // this is moved from Image layer - as React elements actually isn't created on <Element - probably only on first mount (?)
  // TODO: figure out rect like way not to make superobjects like this one
  onImageLayerDrop (e, layer_data) {
    e.preventDefault()
    e.stopPropagation()
    const dataStr = e.dataTransfer.getData('text')
    let asset, data
    if (!dataStr)
      return false

    data = JSON.parse(dataStr)
    if (!data || !data.asset)
      return false

    asset = data.asset

    if (asset && asset.kind != 'graphic')
      return false

    layer_data.image = data.link
    this.fullUpdate()
    return true
  }

  // TODO: keep aspect ratio
  // find out correct thumbnail size
  generatePreview() {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 150
    const ctx = canvas.getContext('2d')
    let ratio

    for (let i = 0; i < this.data.layers.length; i++) {
      const ld = this.data.layers[i]
      if (!ld.visible)
        return

      const layer = this.getLayer(ld)
      if (!layer) 
        continue
      const c = layer.refs.canvas
      ratio = canvas.width / c.width
      ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, canvas.width, c.height * ratio)
    }
    return canvas.toDataURL()
  }

  getInfo() {
    const layer = this.getActiveLayer()
    let st = ''
    const col = this.collection.forEach((t) => {
      st += ', ' + t.gid
    })
    st = st.substr(2)
    let info = layer ? layer.getInfo() : ''
    info = info ? ': ' + info : ''
    return (
      <div>
        <div>
          { layer ? layer.data.name + ' Layer'+ info : '' }
        </div>
        <div>
          {Plural.numStr2(this.collection.length, 'Selected Tile')}
          {st}
        </div>
      </div>
    )
  }

  renderMap() {
    const data = this.data
    const layers = []
    layers.length = 0
    if (!data || !data.layers) 
      return (<div className='map-empty' ref='mapElement' />)
    else {
      let i = 0
      for (; i < data.layers.length; i++) {
        if (!data.layers[i].visible)
          continue
        if (data.layers[i].type == LayerTypes.tile) {
          layers.push(<TileMapLayer
                        data={data.layers[i]}
                        key={i}
                        anotherUsableKey={i}
                        map={this}
                        active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.image) {
          layers.push(<ImageLayer
                        data={data.layers[i]}
                        key={i}
                        map={this}
                        anotherUsableKey={i}
                        active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.object) {
          layers.push(<ObjectLayer
                        data={data.layers[i]}
                        key={i}
                        map={this}
                        anotherUsableKey={i}
                        active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.actor) {
          layers.push(<ActorLayer
            data={data.layers[i]}
            key={i}
            map={this}
            anotherUsableKey={i}
            active={this.activeLayer == i} />)
        }
        else if (data.layers[i].type == LayerTypes.event) {
          layers.push(<EventLayer
            data={data.layers[i]}
            key={i}
            map={this}
            anotherUsableKey={i}
            active={this.activeLayer == i} />)
        }
      }
      layers.push(
        <GridLayer map={this} key={i} ref='grid' />
      )
      // TODO: adjust canvas size
      return (
        <div 
            ref='mapElement' 
            onContextMenu={e => { e.preventDefault(); return false;}} 
            style={{ /*width: (640)+"px",*/ height: (640) + 'px', position: 'relative', margin: '10px 0' }}>
          {layers}
        </div>
      )
    }
  }

  // this bubbles up
  showModal(action, cb) {
    this.props.parent.showModal(action, (val) => {
      cb(val)
      this.update()
    })
  }

  renderMage(){
    return (
      <div
        className='tilemap-wrapper'
        onWheel={this.handleOnWheel.bind(this)}>
        <MapToolbar map={this} ref='tools' />
        <div style={{margin: "10px 0px"}}>
          <Mage
            ownerName={this.props.asset.dn_ownerName}
            startMapName={this.props.asset.name}
            isPaused={false}
            hideButtons={true}
            fetchAssetByUri={ (uri) => {
                return new Promise( function (resolve, reject) {
                  var client = new XMLHttpRequest()
                  client.open('GET', uri)
                  client.send()
                  client.onload = function () {
                    if (this.status >= 200 && this.status < 300)
                      resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
                    else
                      reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
                  }
                  client.onerror = function () { reject(this.statusText) }
                })
              }}
            />
        </div>
      </div>
    )
  }

  render () {
    let notification = ''
    if (this.data.width * this.data.height > 100000) {
      notification = <div>
                       This map is larger than our recommended size - so editing may be slower than normal!
                     </div>
    }

    if(this.state.isPlaying){
      return this.renderMage()
    }

    return (
      <div
          className='tilemap-wrapper'
          onWheel={this.handleOnWheel.bind(this)}>
        <MapToolbar map={this} ref='tools' />
        { notification }
        { this.renderMap() }
        { this.state.isPlaying && <MapPlayer map={this} /> }
        <PositionInfo getInfo={this.getInfo.bind(this)} ref='positionInfo' />
      </div>
    )
  }
}
