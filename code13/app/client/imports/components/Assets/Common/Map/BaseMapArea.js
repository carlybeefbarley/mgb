import React from 'react'

import TileHelper     from './Helpers/TileHelper'
import DragNDropHelper from '../../../../helpers/DragNDropHelper'

import TileCollection from './Tools/TileCollection'
import EditModes      from './Tools/EditModes'
import LayerTypes     from './Tools/LayerTypes'
import GridLayer      from './Layers/GridLayer'

import Camera         from './Camera'

import Plural         from '/client/imports/helpers/Plural'

import './EditMap.css'

export default class MapArea extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      // x/y are angles in degrees not pixels
      preview: {
        x: 5,
        y: 15,
        sep: 20
      }
    }

    this.layers = []

    // here will be kept selections from tilesets
    this.collection = new TileCollection()

    // any modifications will be limited to the selection if not empty
    this.selection = new TileCollection()
    this.tmpSelection = new TileCollection()

    this.camera = new Camera(this)

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
  }

  get options(){
    return this.props.data.meta.options
  }

  get palette() {
    return this.props.cache.tiles
  }

  get activeLayer(){
    return this.props.activeLayer
  }

  // abstract
  set data(val) {
    console.error("Setting read only data")
  }
  // abstract
  get data () {
    return this.props.data
  }

  componentDidMount() {
    this.startTime = Date.now()
    this.startEventListeners()
  }

  startEventListeners(){
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
  stopEventListeners(){
    window.removeEventListener('mousemove', this.globalMouseMove)
    window.removeEventListener('mouseup', this.globalMouseUp)
    window.removeEventListener('resize', this.globalResize)
    window.removeEventListener('keyup', this.globalKeyUp)

    document.body.removeEventListener('mousedown', this.globalIEScroll)
    // next tick will stop raf loop
    this._raf = () => {}
  }

  componentWillReceiveProps (newprops) {
    if(this.props.activeLayer != newprops.activeLayer){
      this.activateLayer(newprops.activeLayer)
    }
    if(this.props.data.meta.options.preview != newprops.data.meta.options.preview){
      this.adjustPreview()
    }
  }

  componentDidUpdate () {
    this.redraw()
    this.adjustPreview()
  }

  componentWillUnmount () {
    this.stopEventListeners()
  }

  /* import and conversion */
  xmlToJson (xml) {
    window.xml = xml
  }
  handleFileByExt_tmx (name, buffer) {
    // https://github.com/inexorabletash/text-encoding
    const xmlString = (new TextDecoder).decode(new Uint8Array(buffer))
    //
    const parser = new DOMParser()
    const xml = parser.parseFromString(xmlString, 'text/xml')
    alert('Sorry: TMX import is not implemented... yet\nTry JSON')

    this.data = this.xmlToJson(xml)
  }
  handleFileByExt_json (name, buffer) {
    const jsonString = (new TextDecoder).decode(new Uint8Array(buffer))
    this.data = JSON.parse(jsonString)
    //this.updateImages()
  }
  // TODO: move api links to external resource?
  handleFileByExt_png (nameWithExt, buffer) {
    const blob = new Blob([buffer], {type: 'application/octet-binary'})
    this.createGraphicsAsset(nameWithExt, blob)
  }
  createGraphicsAsset (nameWithExt, src) {
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

      ObjectHelper.createGraphic(name, c.toDataURL(), (newAsset) => {
        const gim = new Image()
        gim.onload = () => {
          this.images.set(nameWithExt, gim)
        }
        gim.src = `/api/asset/png/${newAsset._id}`
      })
    }
    img.src = src
  }
  /* endof import and conversion */


  // TODO(stauzs): add 'insert/remove row/column' functionality
  resize (newSize = this.data) {
    this.data.width = newSize.width
    this.data.height = newSize.height
    this.props.saveForUndo("Resize map")
    this.data.layers.forEach((l) => {
      if(l.type != LayerTypes.tile && l.type != LayerTypes.actor){
        return;
      }
      // insert extra tile at the end of the row
      if (l.width < this.data.width) {
        // from last row to first
        for (let i = l.height; i > 0; i--) {
          for (let j=0; j<this.data.width-l.width; j++)
            l.data.splice(i * l.width + j, 0, 0)
        }
      }
      // remove extra tile from the end
      else if (l.width > this.data.width) {
        for (let i = l.height; i > 0; i--) {
          for (let j=0; j<l.width - this.data.width; j++) {
            const toSplice = i * l.data.width - j - 1
            l.data.splice(toSplice, 1)
          }
        }
      }
      l.width = this.data.width

      // insert extra tiles
      for (let i=l.data.length; i<this.data.height * this.data.width; i++)
        l.data[i] = 0
      // remove overflow
      l.data.length = this.data.height * this.data.width
      l.height = this.data.height
    })
  }

  setActiveLayer(id) {
    console.log("Setting active layer..")
    let l = this.getActiveLayer()
    l && l.deactivate()

    l = this.getActiveLayer(id)
    l && l.activate()
  }
  setActiveLayerByName(name){
    for(let i=0; i<this.data.layers.length; i++){
      if(this.data.layers[i].name === name){
        this.setActiveLayer(i)
        return
      }
    }
  }

  /* selection methods - these are used only by tilemap layers */
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
  clearSelection(){
    this.tmpSelection.clear()
    this.selection.clear()
    this.collection.clear()

    const l = this.getActiveLayer()
    if (!l || !l.clearSelection) {
      return;
    }
    l.clearSelection(true)
  }
  /* end of selection */


  /* camera stuff */
  resetCamera() {
    this.lastEvent = null
    this.camera.reset()

    if (this.options.preview)
      this.resetPreview()
  }

  resetPreview() {

    this.state.preview.x = 5
    this.state.preview.y = 15
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

    this.state.preview.y += this.lastEvent.pageX - e.pageX
    this.state.preview.x -= this.lastEvent.pageY - e.pageY

    this.lastEvent.pageX = e.pageX
    this.lastEvent.pageY = e.pageY

    this.adjustPreview()
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

      const tr = this.state.preview
      tr.x = tr.x % 360
      tr.y = tr.y % 360

      l.refs.layer.style.transform = 'perspective(2000px) rotateX(' + this.state.preview.x + 'deg) ' +
        'rotateY(' + this.state.preview.y + 'deg) rotateZ(0deg) ' +
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
    this.refs.grid && this.refs.grid.alignToLayer()
  }
  /* endof camera stuff */

  /* events */
  handleMouseMove (e) {
    if (this.props.isPlaying || this.props.isLoading)
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
    this.refs.positionInfo && this.refs.positionInfo.forceUpdate()
  }

  handleMouseUp (e) {
    if (this.props.isPlaying)
      return
    this.lastEvent = null
    this.refs.mapElement.style.transition = '0.3s'
    this.refs.positionInfo.forceUpdate()
  }

  handleOnWheel (e) {
    if (this.props.isPlaying)
      return

    e.preventDefault()
    if (e.altKey) {
      this.state.preview.sep += e.deltaY < 0 ? 1 : -1
      if(this.state.preview.sep < 0){
        this.state.preview.sep = 0
      }
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
    if (this.props.isPlaying)
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
        this.props.setMode(EditModes.stamp)
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

  prepareForDrag (e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.effectAllowed = 'copy'
    // IE crashes
    // e.dataTransfer.dropEffect = 'copy'
  }

  onImageLayerDrop (e, layer_data) {
    const data = DragNDropHelper.getDataFromEvent(e)
    if (!data || !data.asset || data.asset.kind !== 'graphic')
      return false

    layer_data.image = data.link
    this.props.handleSave("Added Image: " + data.asset.name )
    return true
  }
  /* endof events */

  /* update stuff */

  /* update all except images */
  update (cb = () => {}) {
    this.redraw()
    cb()
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
    const now = Date.now()
    for (let i = 0; i < this.layers.length; i++)
      this.layers[i]._draw(now)
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

  getActiveLayer (id = this.props.activeLayer) {
    if (!this.data.layers)
      return null

    return this.getLayer(this.data.layers[id], id)
  }

  togglePreviewState () {
    // this is not a synchronous function !!!
    this.options.preview = !this.options.preview
    this.adjustPreview()
  }

  activateLayer (id) {
    let l = this.getActiveLayer()
    l && l.deactivate()

    l = this.getActiveLayer(id)
    l && l.activate()

    this.update()
  }

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


  getLayers(){
    return this.layers
  }

  // render related methods
  getInfo() {
    const layer = this.getActiveLayer()
    let st = ''
    this.collection.forEach((t) => {
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

  getNotification(){
    return this.data.width * this.data.height > 100000 ? <div>
      This map is larger than our recommended size - so editing may be slower than normal!
    </div> : null
  }

  addLayerRef(id, layer){
    if(layer){
      this.layers[id] = layer
    }
  }

  renderMap() {
    const data = this.data

    if (!data || !data.layers)
      return (<div className='map-empty' ref='mapElement' />)

    const layers = []

    for (let i = 0; i < data.layers.length; i++) {
      const LayerComponent = LayerTypes.toComponent(data.layers[i].type)
      if(LayerComponent) {
        layers.push(
          <LayerComponent
            data={data.layers[i]}
            mapData={data}
            options={this.props.options}
            getLayers={this.getLayers.bind(this)}

            palette={this.palette}
            isActive={this.props.activeLayer == i}
            camera={this.camera}
            startTime={this.startTime}

            getEditMode={() => this.props.getMode()}
            setEditMode={(mode) => {this.props.setMode(mode)}}


            getSelection={() => {return this.selection}}
            getTmpSelection={() => {return this.tmpSelection}}
            getCollection={() => {return this.collection}}

            clearTmpSelection={() => {this.tmpSelection.clear()}}
            clearSelection={() => {this.selection.clear()}}
            addFirstToSelection={(tile) => { if(!this.tmpSelection.length){this.tmpSelection.pushUniquePos(tile)}}}
            pushUniquePos={(tile) => {this.tmpSelection.pushUniquePos(tile)}}
            swapOutSelection={() => {this.swapOutSelection()}}
            selectionToCollection={() => {this.selectionToCollection()}}
            keepDiffInSelection={() => this.keepDiffInSelection()}
            removeFromSelection={() => this.removeFromSelection()}
            onImageLayerDrop={(e, options) => this.onImageLayerDrop(e, options)}
            getImage={src => this.props.cache.images[src]}

            // object layer draws selection shapes on the grid - as it's always on top
            getOverlay={() => this.refs.grid}

            handleSave={this.props.handleSave}
            saveForUndo={this.props.saveForUndo}

            showModal={this.props.showModal}

            key={i}
            ref={ this.addLayerRef.bind(this, i) }
            />)
      }
    }
    layers.push(
      <GridLayer map={this} key={data.layers.length} layer={this.layers[this.props.activeLayer]} ref='grid' />
    )
    // TODO: adjust canvas size
    return (
      <div
        ref='mapElement'
        onContextMenu={e => { e.preventDefault(); return false;}}
        style={{ height: 640 + 'px', position: 'relative', margin: '10px 0' }}>
        {layers}
      </div>
    )
  }
}
