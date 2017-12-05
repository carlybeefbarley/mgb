import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Button, Divider, Grid, Icon, Modal, Popup } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import './editGraphic.css'
import { SketchPicker } from 'react-color'
import Tools from './GraphicTools'

import SpriteLayers from './Layers/SpriteLayers'
import GraphicImport from './GraphicImport/GraphicImport'
import CanvasGrid from './CanvasGrid'
import MiniMap from './MiniMap/MiniMap'

import { snapshotActivity } from '/imports/schemas/activitySnapshots'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import ResizeImagePopup from './ResizeImagePopup'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import SpecialGlobals from '/imports/SpecialGlobals'
import ArtTutorial from './ArtTutorials'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { makeExpireThumbnailLink } from '/client/imports/helpers/assetFetchers'

import { withStores } from '/client/imports/hocs'
import { videoStore } from '/client/imports/stores'
import VideoPopup from '/client/imports/components/Video/VideoPopup'

// Some constants we will use
const MAX_BITMAP_WIDTH = 2048
const MAX_BITMAP_HEIGHT = 2048
const MAX_GRAPHIC_FRAMES = 64 // TODO: Pass this into Importer, and also obey it generally
const DEFAULT_GRAPHIC_WIDTH = 32
const DEFAULT_GRAPHIC_HEIGHT = 32

const THUMBNAIL_WIDTH = SpecialGlobals.thumbnail.width
const THUMBNAIL_HEIGHT = SpecialGlobals.thumbnail.height

const MIN_ZOOM_FOR_GRIDLINES = 4

//TODO put these in a settings object
const settings_ignoreMouseLeave = true

// This is React, but some fast-changing items use Jquery or direct DOM manipulation,
// typically those that can change per mouse-move:
//   1. Drawing on preview+Editor canvas
//   2. Status bar has some very dynamic data like mouse position, current color, etc. See sb_* functions

// keeps data about selected color from previous graphic asset
let _selectedColors = {
  // as defined by http://casesandberg.github.io/react-color/#api-onChangeComplete
  // Note that the .hex value excludes the leading # so it is for example (white) 'ffffff'
  // fg:    { hex: "#000080", rgb: {r: 0, g: 0, b:128, a: 1} }    // Alpha = 0...1
}

let _memoState_showMiniMap = false
let _memoState_showDrawingStatus = true
let _memoState_isColorPickerPinned = false

const editCanvasMaxHeight = 600

const _maxPresetColors = 24
const _defaultColors = [
  '#000000',
  '#804000',
  '#fe0000',
  '#fe6a00',
  '#ffd800',
  '#00ff01',
  '#545454',
  '#401f00',
  '#800001',
  '#803400',
  '#806b00',
  '#017f01',
  '#a8a8a8',
  '#01ffff',
  '#0094fe',
  '#0026ff',
  '#b100fe',
  '#ff006e',
  '#000080',
  '#017f7e',
  '#00497e',
  '#001280',
  '#590080',
  '#7f0037',
]

class EditGraphic extends React.Component {
  // See AssetEdit.js for propTypes. That wrapper just passes them to us

  handleToggleCheckeredBg = () => this.setState({ showCheckeredBg: !this.state.showCheckeredBg })
  handleToggleDrawingStatus = () => {
    _memoState_showDrawingStatus = !this.state.showDrawingStatus
    this.setState({ showDrawingStatus: !this.state.showDrawingStatus })
  }
  handleToggleAnimFrames = () => this.setState({ showAnimFrames: !this.state.showAnimFrames })
  handleToggleGrid = () => this.setState({ showGrid: !this.state.showGrid })

  constructor(props, context) {
    super(props)
    registerDebugGlobal('editGraphic', this, __filename, 'Active Instance of Graphic editor')

    this.doSnapshotActivity = _.throttle(this.doSnapshotActivity, 5 * 1000)

    this.zoomLevels = [1, 2, 4, 6, 8, 10, 12, 14, 16]
    this.gridImg = null

    this._toolActive = false
    this.userSkills = context.skills

    this.prevToolIdx = null // for undo/redo to set back previous tool
    this.state = {
      // Changes in these values will get special handling in componentDidUpdate() since they will
      // require an immediate redraw of the editing area via this.updateEditCanvasFromSelectedFrameLayers()
      showGrid: true, // show/Hide the Grid
      selectedFrameIdx: 0, // DANGER DANGER (BUGBUG): Currently <SpriteLayers> uses this directly!
      editScale: this.getDefaultScale(), // current Zoom scale of the Edit Canvas

      // The following state changes are fully handled by the normal render() path, so have no additional handling
      showCheckeredBg: false,
      showMiniMap: _memoState_showMiniMap,
      showDrawingStatus: _memoState_showDrawingStatus,
      isColorPickerPinned: _memoState_isColorPickerPinned,
      selectedLayerIdx: 0, // DANGER DANGER (BUGBUG): Currently <SpriteLayers> uses this directly!
      showAnimFrames: false, // show minimized or maximized frames & layers & animation
      selectedColors: this.getInitialColor(),
      toolChosen: this.findToolByLabelString('Pen'),
      selectRect: null, // if asset area is selected then value {startX, startY, endX, endY}
      selectDimensions: { width: 0, height: 0 },
      pasteCanvas: null, // if object cut or copied then {x, y, width, height, imgData}
      scrollMode: 'Normal', // This is the behavior of scrollOpearations when pasting

      // The following items were moved out of react-state because they are only used by jquery operations
      // AND are triggered by non-render events (mouse/touch ops only)
      // toolActive: false, // Moved out of state by dgolds 6/11/2017 because it was causing re-renders but it has no impact to anything rendered
    }

    // Also, in order to optimize some draw and draw-while-save-is-pending scenarios, there is some special handling
    // of saves via this.handleSave()
    //   The normal flow of changes are..
    //          Step 1.   User changes graphic locally with tool. The tool should save to the preview and edit canvases
    //          Step 2.   We send the saved data to the Meteor server. Note that this may take a few hundred ms
    //          Step 3.   While the save-response is pending, we allow the user to continue editing
    //          Step 4.   The change to the Azzet collection comes back to us via the meteor DDP sync mechanism..
    //                       ** At this point we must decide what to do with the subsequent edits. We use a special
    //                       ** marker in the asset.content2 object:   content2.this.processedChangeMarker.. which we change randomly each
    //                       ** time we save data. If the this.processedChangeMarker coming back is one we just set, then we don't allow
    //                       ** this data from the server to replace the user's subsequent edits.
    //                       ** See the code using 'this.processedChangeMarker' variable for the actual implementation of this optimization.
    this.processedChangeMarker = null // See explanation above. Basically if we see an asset whose
    //   asset.content2.changeMarker === this.processedChangeMarker then
    //   don't nuke the stateful images that have the recent drawing changes

    // TODO check if this can be deleted completely
    // this.fixingOldAssets()

    this.onpaste = e => {
      var items = e.clipboardData.items
      if (items) {
        let isImagePasted = false
        //access data directly
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            //image
            isImagePasted = true
            var blob = items[i].getAsFile()
            var source = URL.createObjectURL(blob)
            this.pasteImage(source)
          }
        }
        if (isImagePasted) e.preventDefault()
      }
    }

    // animframe for updating selecting rectangle animation
    this._raf = () => {
      if (this.state.selectRect) this.drawSelectRect(this.state.selectRect)
      window.requestAnimationFrame(this._raf)
    }
    this._raf()

    // Get component name to get related video popup then get the data
    this.props.videoStore.getVideosForComponent(this.constructor.name)
  }

  getImageData() {
    const a = {}
    this.setThumbnail(a)
    return a.thumbnail
  }

  // Graphic asset - Data format:
  //
  // content2.width
  // content2.height
  // content2.fps    // default fps = 10
  // content2.layerParams[layerIndex]     // array of layer params {name, isHiddden, isLocked}
  // content2.frameNames[frameIndex]  // TODO get rid of frameNames. no practical use.
  // content2.frameData[frameIndex][layerIndex]   /// each is a dataURL
  // content2.spriteData[]    // dataUrl. Same frameData elements but with merged layers
  // content2.tileset         // all frames joined in one image
  // content2.animations[]    // { name, frames[], fps }

  // React Callback: componentDidMount()
  componentDidMount() {
    this.editCtx = this.refs.editCanvas.getContext('2d')
    this.editCtxImageData1x1 = this.editCtx.createImageData(1, 1)

    this.getPreviewCanvasReferences()
    this.loadAllPreviewsAsync()

    // Initialize Status bar
    this._statusBar = {
      outer: this.refs.statusBarDiv,
      mouseAtText: this.refs.statusBarMouseAtText,
      colorAtText: this.refs.statusBarColorAtText,
      colorAtIcon: this.refs.statusBarColorAtIcon,
    }
    this.setStatusBarInfo()

    this.handleColorChangeComplete('fg', this.getInitialColor().fg, 'defaultColor')

    // Touch and Mouse events for Edit Canvas
    this.refs.editCanvas.addEventListener('touchmove', this.handleTouchMove.bind(this))
    this.refs.editCanvas.addEventListener('touchstart', this.handleTouchStart.bind(this))
    this.refs.editCanvas.addEventListener('touchend', this.handleTouchEnd.bind(this))
    this.refs.editCanvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this))
    this.refs.editCanvas.addEventListener('wheel', this.handleMouseWheel.bind(this))
    this.refs.editCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
    this.refs.editCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.refs.editCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this))
    this.refs.editCanvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    this.refs.editCanvas.addEventListener('mouseenter', this.handleMouseEnter.bind(this))
    this.refs.editCanvas.addEventListener('contextmenu', this.handleContextMenu.bind(this))

    this.doSnapshotActivity()

    //TODO: add only to canvas?
    window.addEventListener('paste', this.onpaste, false)

    // TODO inspect. without this color picker hide doesn't work
    document.querySelector('#root').addEventListener('click', () => {})
  }

  componentWillUnmount() {
    window.removeEventListener('paste', this.onpaste)
  }

  // there are some missing params for old assets being added here
  fixingOldAssets() {
    let autoFix = false
    let c2 = this.props.asset.content2

    if (!c2.layerParams && c2.layerNames) {
      c2.layerParams = []
      for (let i = 0; i < c2.layerNames.length; i++)
        c2.layerParams[i] = { name: c2.layerNames[i], isHidden: false, isLocked: false }
      autoFix = true
    }
    if (!c2.spriteData) {
      c2.spriteData = []
      autoFix = true
    }
    if (!c2.fps) {
      c2.fps = 10
      autoFix = true
    }
    if (!c2.animations) {
      c2.animations = []
      autoFix = true
    }
    // if(!c2.tileset){
    // c2.tileset = this.createTileset();
    // autoFix = true;
    // }

    if (autoFix) this.handleSave('Automatic fixing old assets')
  }

  getInitialColor() {
    const c2 = this.props.asset.content2
    if (c2.presetColors && c2.presetColors.length > 0) {
      const hex = c2.presetColors[0]
      const rgb = {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
        a: 1,
      }
      // console.log(hex, rgb)
      return { fg: { hex, rgb } }
    } else {
      // returns offset in minutes to UTC
      // value can be positive or negative
      const offset = new Date().getTimezoneOffset()
      let colorIdx = Math.round(offset / 60) + 13 // from 1 to 24
      // normalization if colorIds some weird number
      if (colorIdx > 24 || colorIdx < 1) colorIdx = Math.round(Math.random() * 23) + 1

      const hex = _defaultColors[colorIdx - 1]
      const rgb = {
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
        a: 1,
      }
      return { fg: { hex, rgb } }
    }
  }

  // TODO: DGOLDS to clean this up -- combine with mgb1ImportTiles etc
  initDefaultContent2() {
    let asset = this.props.asset
    if (!asset.hasOwnProperty('content2') || !asset.content2.hasOwnProperty('width')) {
      // console.log("initDefaultContent2 - doing stuff")
      asset.content2 = {
        width: DEFAULT_GRAPHIC_WIDTH,
        height: DEFAULT_GRAPHIC_HEIGHT,
        fps: 10,
        layerParams: [{ name: 'Layer 1', isHidden: false, isLocked: false }],
        frameNames: ['Frame 1'],
        frameData: [[]],
        spriteData: [],
        animations: [],
      }

      this.processedChangeMarker = '_graphic_init_' + Random.id() // http://docs.meteor.com/packages/random.html
      asset.content2.changeMarker = this.processedChangeMarker
      // console.log("initDefaultContent2... setting local and c2 Backwash this.processedChangeMarker = " + this.processedChangeMarker)
    }
  }

  getDefaultScale() {
    if (this.props.asset.skillPath && _.startsWith(this.props.asset.skillPath, 'art')) return 12

    const c2 = this.props.asset.content2
    const width = c2.width || DEFAULT_GRAPHIC_WIDTH
    const height = c2.height || DEFAULT_GRAPHIC_HEIGHT
    const wRatio = screen.width * 0.9 / width
    const hRatio = screen.height * 0.5 / height
    let scale = wRatio < hRatio ? Math.floor(wRatio) : Math.floor(hRatio)

    // normalize scale to zoomLevels
    if (scale > 4) scale = 4
    else if (scale < 1) scale = 1
    else if (scale == 3) scale = 2

    // add +1 to zoomLevel (based on hotjar screen recordings and heatmaps)
    let i = this.zoomLevels.indexOf(scale)
    if (i < this.zoomLevels.length - 1) scale = this.zoomLevels[i + 1]

    return scale
  }

  // React Callback: componentDidUpdate()
  componentDidUpdate(prevProps, prevState) {
    const c2 = this.props.asset.content2

    //console.log(`EG/componentDidUpdate... c2.changeMarker=${c2.changeMarker}  this.processedChangeMarker=${this.processedChangeMarker}`)

    this.getPreviewCanvasReferences() // Since they could have changed during the update due to frame add/remove

    if (this.processedChangeMarker === null || c2.changeMarker !== this.processedChangeMarker) {
      // Locally-generated changes that could impact more than the current EditCanvas
      // should use handleSave(*,*, true) so that this.processedChangeMarker === null
      this.loadAllPreviewsAsync()
      this.processedChangeMarker = c2.changeMarker
    } else {
      // We optimize for the special case that the selectedFrame changed.
      // We want this to nbe fast because of animation previews for example
      if (
        prevState.selectedFrameIdx !== this.state.selectedFrameIdx ||
        prevState.showGrid !== this.state.showGrid ||
        prevState.editScale !== this.state.editScale
      ) {
        this.updateEditCanvasFromSelectedFrameLayers()
      }
    }

    this.setStatusBarInfo()
  }

  /**
   * Stash references to the preview canvases after initial render and subsequent renders
   */
  getPreviewCanvasReferences() {
    let asset = this.props.asset
    let c2 = asset.content2

    // TODO rename to layerCanvas and cts arrays instead of preview

    this.previewCanvasArray = [] // Preview canvas for this animation frame
    this.previewCtxArray = [] // 2d drawing context for the animation frame
    this.previewCtxImageData1x1Array = [] // Used for painting quickly to each preview frame

    this.previewCanvasArray = document.querySelectorAll('.spriteLayersTable td canvas')
    for (let i = 0; i < c2.layerParams.length; i++) {
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d')
      this.previewCtxImageData1x1Array[i] = this.previewCtxArray[i].createImageData(1, 1)
    }

    this.frameCanvasArray = [] // frame canvases where layers are merged
    this.frameCtxArray = []
    this.frameCtxImageData1x1Array = []

    this.frameCanvasArray = document.querySelectorAll('.spriteLayersTable th canvas')
    for (let i = 0; i < c2.frameNames.length; i++) {
      this.frameCtxArray[i] = this.frameCanvasArray[i].getContext('2d')
      this.frameCtxImageData1x1Array[i] = this.frameCtxArray[i].createImageData(1, 1)
    }
  }

  loadAllPreviewsAsync(frameID = 0) {
    let c2 = this.props.asset.content2
    let frameCount = c2.frameNames.length

    // no more loops. Recursion to be sure for all weird edge cases that all images are loaded
    if (frameID < frameCount - 1) {
      this.loadLayersAssetAsync(frameID, () => this.loadAllPreviewsAsync(frameID + 1))
    } else {
      this.loadLayersAssetAsync(frameID, () => this.updateEditCanvasFromSelectedPreviewCanvas())
    }
  }

  updateEditCanvasFromSelectedFrameLayers() {
    this.loadLayersAssetAsync(this.state.selectedFrameIdx, () => {
      this.updateEditCanvasFromSelectedPreviewCanvas()
    })
  }

  loadLayersAssetAsync(frameID, callback) {
    let c2 = this.props.asset.content2
    let frameData = c2.frameData[frameID]
    let loadedCount = 0

    if (frameData.length == 0) callback()

    for (let i = frameData.length - 1; i >= 0; i--) {
      let layerID = i

      if (!c2.frameData[frameID] || !c2.frameData[frameID][layerID]) {
        // manage empty frameData cases
        if (frameID === this.state.selectedFrameIdx)
          this.previewCtxArray[layerID].clearRect(0, 0, c2.width, c2.height)
        loadedCount++
        if (loadedCount >= frameData.length) callback()
        continue
      }
      let dataURI = c2.frameData[frameID][layerID]
      // if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
      if (dataURI !== undefined && dataURI.startsWith('data:image/')) {
        var _img = new Image()
        _img.frameID = frameID // hack so in onload() we know which frame is loaded
        _img.layerID = layerID // hack so in onload() we know which layer is loaded
        let self = this
        _img.onload = function(e) {
          let loadedImage = e.target
          if (!c2.layerParams[loadedImage.layerID].isHidden) {
            let frame = self.frameCtxArray[loadedImage.frameID]
            if (frame) {
              // clear frame whenever we start drawing from most bottom of layer
              if (c2.frameData[loadedImage.frameID].length - 1 == loadedImage.layerID) {
                self.frameCtxArray[loadedImage.frameID].clearRect(0, 0, c2.width, c2.height)
              }
              frame.drawImage(loadedImage, 0, 0) // There seems to be a race condition that means frame is sometime null.
            }
          }

          if (loadedImage.frameID === self.state.selectedFrameIdx) {
            self.previewCtxArray[loadedImage.layerID].clearRect(0, 0, c2.width, c2.height)
            self.previewCtxArray[loadedImage.layerID].drawImage(loadedImage, 0, 0)
          }

          loadedCount++
          if (loadedCount >= frameData.length) callback()
        }
        _img.src = dataURI
      } else {
        // TODO: May need some error indication here
        console.trace('Unrecognized dataURI for Asset#', this.props.asset._id)
        this.updateEditCanvasFromSelectedPreviewCanvas()
      }
    }
  }

  updateEditCanvasFromSelectedPreviewCanvas() {
    let w = this.previewCanvasArray[0].width
    let h = this.previewCanvasArray[0].height
    let s = this.state.editScale
    let c2 = this.props.asset.content2
    this.editCtx.imageSmoothingEnabled = false
    this.editCtx.mozImageSmoothingEnabled = false
    this.editCtx.webkitImageSmoothingEnabled = false // Needed for Safari, even though Chrome complains about it
    this.editCtx.msImageSmoothingEnabled = false
    this.editCtx.clearRect(0, 0, this.refs.editCanvas.width, this.refs.editCanvas.height)
    this.frameCtxArray[this.state.selectedFrameIdx].clearRect(0, 0, c2.width, c2.height)

    // draws all layers on edit canvas and layer canvas
    for (let i = this.previewCanvasArray.length - 1; i >= 0; i--) {
      if (this.props.asset.content2.layerParams[i] && !this.props.asset.content2.layerParams[i].isHidden) {
        this.editCtx.drawImage(this.previewCanvasArray[i], 0, 0, w, h, 0, 0, w * s, h * s)
        this.frameCtxArray[this.state.selectedFrameIdx].drawImage(
          this.previewCanvasArray[i],
          0,
          0,
          w,
          h,
          0,
          0,
          w,
          h,
        )
      }
    }

    // draw minimap
    if (this.state.showMiniMap && this.refs.miniMap) this.refs.miniMap.redraw(this.refs.editCanvas, w, h)

    this.drawGrid()
  } // TODO(DGOLDS?): Do we still need the vendor-prefix smoothing flags?

  handleRefMiniMap = comp => {
    if (comp) {
      // mounted
      this.refs.miniMap = comp
      const pc = this.previewCanvasArray[this.state.selectedLayerIdx]
      this.refs.miniMap.redraw(this.refs.editCanvas, pc.width, pc.height)
    } else {
      this.refs.miniMap = null
    }
  }

  forceUpdateForLayers = () => {
    // This is used by <Layers>. It kind of sucks that a component wants to refresh it's parent.
    this.forceUpdate()
  }

  forceDraw = () => {
    let c2 = this.props.asset.content2
    if (!c2.frameData || !c2.frameData[0]) return

    this.frameCtxArray[0].clearRect(0, 0, c2.width, c2.height)
    for (let i = c2.frameData[0].length - 1; i >= 0; i--) {
      let lData = c2.frameData[0][i]
      let img = new Image()
      img.width = c2.width
      img.height = c2.height
      img.src = lData
      this.previewCtxArray[i].clearRect(0, 0, c2.width, c2.height)
      this.previewCtxArray[i].drawImage(img, 0, 0)
      this.frameCtxArray[0].drawImage(img, 0, 0)
    }
    this.editCtx.drawImage(this.frameCanvasArray[0], 0, 0)
  }

  drawSelectRect(selectRect) {
    var self = this

    // normalize rect with scale and set always x1,y1 as top left corner
    // 0.5 hack to draw 1 px line
    let scaleRect = {
      x1:
        (selectRect.startX < selectRect.endX ? selectRect.startX : selectRect.endX) * self.state.editScale -
        0.5,
      x2:
        (selectRect.startX > selectRect.endX ? selectRect.startX : selectRect.endX) * self.state.editScale +
        0.5,
      y1:
        (selectRect.startY < selectRect.endY ? selectRect.startY : selectRect.endY) * self.state.editScale -
        0.5,
      y2:
        (selectRect.startY > selectRect.endY ? selectRect.startY : selectRect.endY) * self.state.editScale +
        0.5,
    }

    this.editCtx.lineWidth = 1
    this.editCtx.strokeStyle = '#000000'
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x2, scaleRect.y1)
    drawLine(scaleRect.x2, scaleRect.y1, scaleRect.x2, scaleRect.y2)
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x1, scaleRect.y2)
    drawLine(scaleRect.x1, scaleRect.y2, scaleRect.x2, scaleRect.y2)

    let time = new Date().getMilliseconds()
    time = Math.round(time / 100)
    let timeOffset = (time % 10) * 2

    this.editCtx.strokeStyle = '#ffffff'
    let width = Math.abs(scaleRect.x1 - scaleRect.x2)
    let height = Math.abs(scaleRect.y1 - scaleRect.y2)
    let dashSize = 10
    let dashCount = Math.ceil((width + dashSize - timeOffset) / (dashSize * 2))
    // draw horizontal dashes
    for (let i = 0; i < dashCount; i++) {
      let x = scaleRect.x1 - dashSize + timeOffset + i * dashSize * 2
      let x2 = x + dashSize
      if (x < scaleRect.x1) x = scaleRect.x1
      if (x2 > scaleRect.x2) x2 = scaleRect.x2
      drawLine(x, scaleRect.y1, x2, scaleRect.y1)
      drawLine(x, scaleRect.y2, x2, scaleRect.y2)
    }

    dashCount = Math.ceil((height + dashSize - timeOffset) / (dashSize * 2))
    // draw vertical dashes
    for (let i = 0; i < dashCount; i++) {
      let y = scaleRect.y1 - dashSize + timeOffset + i * dashSize * 2
      let y2 = y + dashSize
      if (y < scaleRect.y1) y = scaleRect.y1
      if (y2 > scaleRect.y2) y2 = scaleRect.y2
      drawLine(scaleRect.x1, y, scaleRect.x1, y2)
      drawLine(scaleRect.x2, y, scaleRect.x2, y2)
    }

    function drawLine(x1, y1, x2, y2) {
      self.editCtx.beginPath()
      self.editCtx.moveTo(x1, y1)
      self.editCtx.lineTo(x2, y2)
      self.editCtx.stroke()
    }
  }

  // A plugin-api for the graphic editing Tools in Tools.js

  _setImageData4BytesFromRGBA(d, c) {
    d[0] = c.r
    d[1] = c.g
    d[2] = c.b
    d[3] = c.a * 255
  }

  collateDrawingToolEnv(event) {
    let asset = this.props.asset
    let c2 = asset.content2
    let pCtx = this.previewCtxArray[this.state.selectedLayerIdx]

    let pCtxImageData1x1 = this.previewCtxImageData1x1Array[this.state.selectedLayerIdx]
    var self = this

    let retval = {
      x: Math.floor(event.offsetX / this.state.editScale),
      y: Math.floor(event.offsetY / this.state.editScale),

      width: c2.width,
      height: c2.height,
      scale: this.state.editScale,
      event,

      chosenColor: this.state.selectedColors['fg'],

      previewCtx: pCtx,
      previewCtxImageData1x1: pCtxImageData1x1,
      editCtx: this.editCtx,
      editCtxImageData1x1: this.editCtxImageData1x1,

      // setPreviewPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   It SETS rather than draws-with-alpha-blending
      setPreviewPixelsAt(x, y, w = 1, h = 1) {
        // Set Pixels on the Preview context ONLY
        self._setImageData4BytesFromRGBA(retval.previewCtxImageData1x1.data, retval.chosenColor.rgb)
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < h; j++)
            retval.previewCtx.putImageData(
              retval.previewCtxImageData1x1,
              Math.round(x + i),
              Math.round(y + j),
            )
        }
      },

      // setPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   (a) It SETS rather than draws-with-alpha-blending
      //   (b) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is faster than a ClearRect+FillRect in many cases.
      setPixelsAt(x, y, w = 1, h = 1) {
        // First, set Pixels on the Preview context
        retval.setPreviewPixelsAt(x, y, w, h)

        // Next, set Pixels (zoomed) to the Edit context
        self._setImageData4BytesFromRGBA(retval.editCtxImageData1x1.data, retval.chosenColor.rgb)
        for (let i = 0; i < w * retval.scale; i++) {
          for (let j = 0; j < h * retval.scale; j++)
            retval.editCtx.putImageData(
              retval.editCtxImageData1x1,
              x * retval.scale + i,
              y * retval.scale + j,
            )
        }
      },

      saveSelectRect(startX, startY, endX, endY) {
        if (startX > endX) {
          const tmp = startX
          startX = endX
          endX = tmp
        }
        if (startY > endY) {
          const tmp = startY
          startY = endY
          endY = tmp
        }
        self.setState({
          selectRect: {
            startX,
            startY,
            endX,
            endY,
          },
        })
      },

      getPasteCanvas() {
        return self.state.pasteCanvas
      },

      unselect() {
        self.setState({ selectRect: null })
        self.updateEditCanvasFromSelectedPreviewCanvas()
      },

      showDimensions(width, height) {
        self.setState({ selectDimensions: { width, height } })
      },

      setPrevTool() {
        if (self.prevToolIdx !== null) self.setState({ toolChosen: Tools[self.prevToolIdx] })
      },

      // clearPixelsAt() Like CanvasRenderingContext2D.clearRect, but
      //   (a) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is more convenient than a ClearRect+FillRect in many cases.
      clearPixelsAt(x, y, w = 1, h = 1) {
        let s = retval.scale
        retval.previewCtx.clearRect(x, y, w, h)
        retval.editCtx.clearRect(x * s, y * s, w * s, h * s)
      },

      setColorRGBA(r, g, b, aByte) {
        self.handleColorChangeComplete('fg', { rgb: { r, g, b, a: aByte / 256 } })
      },

      updateEditCanvasFromSelectedPreviewCanvas: self.updateEditCanvasFromSelectedPreviewCanvas.bind(self),
    }

    return retval
  } // used to gather current useful state for the Tools and passed to them in most callbacks

  //
  // CUT/COPY/PASTE    -  Note that there is also some special support in collateDrawingToolEnv()
  //

  toolCutSelected() {
    if (!this.state.selectRect) return

    this.toolCopySelected()
    let ctx = this.previewCtxArray[this.state.selectedLayerIdx]
    let r = this.state.selectRect
    let width = Math.abs(r.startX - r.endX)
    let height = Math.abs(r.startY - r.endY)
    ctx.clearRect(r.startX, r.startY, width, height)
    this.handleSave('Cut selected area')
  }

  toolCopySelected() {
    if (!this.state.selectRect) return

    let x = this.state.selectRect.startX
    let y = this.state.selectRect.startY
    let width = Math.abs(this.state.selectRect.startX - this.state.selectRect.endX)
    let height = Math.abs(this.state.selectRect.startY - this.state.selectRect.endY)
    let ctx = this.previewCtxArray[this.state.selectedLayerIdx]
    let imgData = ctx.getImageData(x, y, width, height)

    let pasteCanvas = document.createElement('canvas') // TODO: Check this gets deallocated somehow
    pasteCanvas.width = width
    pasteCanvas.height = height
    let pasteCtx = pasteCanvas.getContext('2d')
    pasteCtx.putImageData(imgData, 0, 0)
    this.setState({ pasteCanvas })
  }

  findToolByLabelString(labelString) {
    let tool = null

    // manually select paste tool
    for (let key in Tools) {
      if (Tools.hasOwnProperty(key)) {
        if (Tools[key].label === labelString) {
          tool = Tools[key]
          break
        }
      }
    }
    return tool
  }

  zoomIn = () => {
    const i = this.zoomLevels.indexOf(this.state.editScale)
    if (i < this.zoomLevels.length - 1) {
      // console.log("zoomIn: setting this.processedChangeMarker = null")
      // this.processedChangeMarker = null       // Since we now want to reload data for our new EditCanvas
      this.setState({ editScale: this.zoomLevels[i + 1] })
    }
  }

  zoomOut = () => {
    const i = this.zoomLevels.indexOf(this.state.editScale)
    if (i > 0) {
      // this.processedChangeMarker = null       // Since we now want to reload data for our new EditCanvas
      // console.log("zoomIn: setting this.processedChangeMarker = null")
      this.setState({ editScale: this.zoomLevels[i - 1] })
    }
  }

  resetZoom = () => {
    this.setState({ editScale: 1 })
  }

  //
  // TOUCH EVENTS (on Edit Canvas). We create equivalent MouseEvents then re-dispatch them
  // See https://w3c.github.io/touch-events/#toc,
  //     https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
  //     https://bencentra.com/code/2014/12/05/html5-canvas-touch-events.html
  //
  _redispatchEditCanvasMouseEventFromTouchEvent(mouseEventName, touchEvent, touch) {
    //console.log(touchEvent.type, touchEvent)
    const mouseEvent = new MouseEvent(
      mouseEventName,
      !touch
        ? {}
        : {
            clientX: touch.clientX, // Can be undefined for touchend/touchcancel
            clientY: touch.clientY, // Can be undefined for touchend/touchcancel
            altKey: touch.altKey,
            metaKey: touch.metaKey,
            ctrlKey: touch.ctrlKey,
            shiftKey: touch.shiftKey,
          },
    )
    this.refs.editCanvas.dispatchEvent(mouseEvent)
    touchEvent.preventDefault()
  }

  handleTouchStart(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent('mousedown', touchEvent, event.touches[0])
  }

  handleTouchMove(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent('mousemove', touchEvent, event.touches[0])
  }

  handleTouchEnd(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent('mouseup', touchEvent, event.changedTouches[0])
  }

  handleTouchCancel(touchEvent) {
    this.handleTouchEnd(touchEvent) // Idk if we would do something different in future
  }

  //
  // MOUSE EVENTS (on Edit Canvas)
  //

  handleGotoNextLayer = () => {
    const layerCount = this.previewCanvasArray.length
    const layerIdx = this.state.selectedLayerIdx
    this.handleSelectLayer((layerIdx + 1) % layerCount)
  }

  handleGotoNextFrame = () => {
    this.handleSelectFrame((this.state.selectedFrameIdx + 1) % this.frameCanvasArray.length)
  }

  // handleMouseWheel is an alias for zoom
  handleMouseWheel(event) {
    // We only handle alt/shift/ctrl-key. Anything else is system behavior (scrolling etc)
    // if (event.altKey === false && event.shiftKey === false && event.ctrlKey === false && this.state.scrollMode == "Normal")
    //   return

    event.preventDefault() // No default scroll behavior in these cases

    let wd = event.deltaY // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    if (Math.abs(wd) >= 1) {
      // if paste tool then use ctrl/alt/shift for resizing, rotating, flipping
      if (this.state.toolChosen !== null && this.state.toolChosen.label === 'Paste')
        this.state.toolChosen.handleMouseWheel(this.collateDrawingToolEnv(event), wd, this.state.scrollMode)
      else {
        if (event.altKey || event.ctrlKey) {
          // ???+Wheel is NextFrame/PrevFrame
          let f = this.state.selectedFrameIdx
          if (wd < 0 && f > 0) this.handleSelectFrame(f - 1)
          else if (
            wd > 0 &&
            f + 1 < this.frameCanvasArray.length // aka c2.frameNames.length
          )
            this.handleSelectFrame(f + 1)
        } else {
          // zoom with mouse wheel
          // no Shift button as it was before
          // because users are clicking zoom button way too often (from hotjar heatmaps)
          if (wd > 0) this.zoomOut()
          else if (wd < 0) this.zoomIn()
        }
      }
    }
  }

  handleMouseDown(event) {
    let layerParam = this.props.asset.content2.layerParams[this.state.selectedLayerIdx]
    if (layerParam.isLocked || layerParam.isHidden) {
      this.setStatusBarWarning("You can't draw on locked or hidden layers")
      return
    }

    if (this.state.toolChosen === null) {
      this.setStatusBarWarning('Choose a tool such as Pen or Select')
      return
    }

    if (this.state.toolChosen.changesImage && !this.props.canEdit) {
      this.setStatusBarWarning('You do not have permission to edit this graphic')
      this.props.editDeniedReminder()
      return
    }

    if (event.which && event.which == 3) {
      const moveTool = this.findToolByLabelString('Move')
      this.setState({ toolChosen: moveTool })
      event.preventDefault()
    }

    if (this.state.toolChosen.changesImage) this.doSaveStateForUndo(this.state.toolChosen.label) // So that tools like eyedropper don't save and need undo

    if (this.state.toolChosen.supportsDrag === true) this._toolActive = true

    this.state.toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))

    if (this.state.toolChosen.supportsDrag === false && this.state.toolChosen.changesImage === true)
      this.handleSave(`Drawing`, false, false) // This is a one-shot tool, so save its results now
  }

  handleContextMenu(event) {
    event.preventDefault()
  }

  // Might be better to have two event handlers, each with a clearer role?
  // This does two things: (1) Update SB, and (2) Call on to Tool handler
  handleMouseMove(event) {
    const { editScale, selectedLayerIdx, toolChosen } = this.state
    const c2 = this.props.asset.content2

    // 1. Update statusBar
    const x = _.clamp(Math.floor(event.offsetX / editScale), 0, c2.width)
    const y = _.clamp(Math.floor(event.offsetY / editScale), 0, c2.height)
    const pCtx = this.previewCtxArray[selectedLayerIdx]
    const imageDataAtMouse = pCtx.getImageData(x, y, 1, 1)
    const d = imageDataAtMouse.data
    const toolName = toolChosen ? `<small>${toolChosen.label} tool</small>` : ''

    const colorCSSstring = `#${this.RGBToHex(...d)}`
    this.setStatusBarInfo(
      `(${x},${y})  ${toolName}`,
      `${colorCSSstring}&nbsp;<em>α</em>${('000' + d[3]).slice(-3)}`,
      colorCSSstring,
    )

    // 2. Tool api handoff
    if (toolChosen !== null && (this._toolActive === true || toolChosen.hasHover === true))
      toolChosen.handleMouseMove(this.collateDrawingToolEnv(event))
  }

  handleMouseUp(event) {
    const { toolChosen } = this.state

    if (toolChosen !== null && this._toolActive === true) {
      toolChosen.handleMouseUp(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true) this.handleSave(`Drawing`, false, false)
      this._toolActive = false
    }
  }

  handleMouseLeave(event) {
    const { toolChosen } = this.state

    this.setStatusBarInfo()
    if (toolChosen !== null && this._toolActive === true && !settings_ignoreMouseLeave) {
      toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true) this.handleSave(`Drawing`, false, false)
      this._toolActive = false
    }
  }

  handleMouseEnter(event) {
    const { toolChosen } = this.state
    this.setStatusBarInfo()
    if (
      toolChosen !== null &&
      this._toolActive === true &&
      settings_ignoreMouseLeave &&
      (event.buttons & 1) === 0
    ) {
      toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true) this.handleSave(`Drawing`, false, false)
      this._toolActive = false
    }
  }

  //
  // CHANGE TILE WIDTH/HEIGHT
  //

  handleImageResize = (newWidth, newHeight, scalingMode = 'None') => {
    if (!this.hasPermission()) return

    const c2 = this.props.asset.content2
    this.doSaveStateForUndo(
      `Resize from ${c2.width}x${c2.height} to ${newWidth}x${newHeight} using scaling mode '${scalingMode}`,
    )
    c2.width = newWidth
    c2.height = newHeight
    this.handleSave('Change canvas size', false, true)
  }

  hasPermission = () => {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return false
    }
    return true
  }

  setStatusBarWarning(warningText = '') {
    const sb = this._statusBar

    sb.colorAtText.innerHTML = ''
    sb.colorAtIcon.style.color = 'rgba(0,0,0,0)'
    sb.mouseAtText.innerText = warningText
  }

  setStatusBarInfo(mouseAtText = '', colorAtText = '', colorCSSstring = 'rgba(0,0,0,0)') {
    const sb = this._statusBar

    const layerIdx = this.state.selectedLayerIdx
    const layerParam = this.props.asset.content2.layerParams[layerIdx]
    const layerMsg = !layerParam
      ? ''
      : (layerParam.isLocked
          ? '&emsp;<small class="ui small circular blue label" data-tooltip="Current layer is locked">&nbsp;<i class="ui lock icon"/><span>locked</span>&nbsp;</small>'
          : '') +
        (layerParam.isHidden
          ? '&emsp;<small class="ui small circular red label" data-tooltip="Current layer is hidden">&nbsp;<i class="ui hide icon"/><span>hidden</span>&nbsp;</small>'
          : '')
    sb.colorAtIcon.style.color = colorCSSstring
    sb.mouseAtText.innerHTML = layerMsg
    sb.colorAtText.innerHTML = mouseAtText ? `<code>${colorAtText}&emsp;at&emsp;${mouseAtText}</code>` : ''
  }

  RGBToHex(r, g, b) {
    var bin = (r << 16) | (g << 8) | b
    return (function(h) {
      return new Array(7 - h.length).join('0') + h
    })(bin.toString(16).toLowerCase())
  }

  // Tool selection action
  handleToolSelected(tool) {
    // if not selectable tool then trigger action here
    if (tool.simpleTool) {
      this.setState({ toolChosen: null })
      this.setStatusBarWarning('')
      this[tool.name]()
      return
    }

    // special case for select tool - toggleable button which also clears selected area
    if (tool.label === 'Select' && this.state.selectRect) {
      this.setState({ toolChosen: null, selectRect: null })
      this.updateEditCanvasFromSelectedPreviewCanvas()
      return
    }

    this.setState({ toolChosen: tool })
    this.setStatusBarWarning(`${tool.label} tool selected`)
  }

  // Color picker handling. This doesn't go through the normal tool api for now since
  // it isn't a drawing tool (and that's what the plugin api is focused on)
  // Also, there is some funny handling for invalid colors from react-color

  handleColorChangeComplete(colortype, chosenColor, defaultColor) {
    if (!chosenColor.hex)
      chosenColor.hex = `#${this.RGBToHex(chosenColor.rgb.r, chosenColor.rgb.g, chosenColor.rgb.b)}`

    if (chosenColor.hex.indexOf('NaN') === -1) {
      // It is a valid color. Remember it - this is because react-color Color Picker returns screwy colors if it's container is hidden
      this._recentValidColor = _.clone(chosenColor)
    } else {
      // It is an invalid color. Ignore this result and use the last good color we had. or red if no last good color
      chosenColor = this._recentValidColor || { hex: '#800000', rgb: { r: 128, g: 0, b: 0, a: 1 } }
    }
    // See http://casesandberg.github.io/react-color/#api-onChangeComplete
    this.setState({
      selectedColors: {
        ...this.state.selectedColors,
        [colortype]: chosenColor,
      },
    })

    _selectedColors[colortype] = _.cloneDeep(chosenColor)

    if (!defaultColor || defaultColor != 'defaultColor') this.handleColorPreset(chosenColor)
  }

  handleColorPreset(newColor) {
    const c2 = this.props.asset.content2
    c2.presetColors = _.union(c2.presetColors || [], [newColor.hex]).slice(-_maxPresetColors)
    this.handleSave('Update Color Palette')
  }

  // Add/Select/Remove etc animation frames

  handleSelectFrame = frameIndex => {
    this.doSnapshotActivity(frameIndex)
    this.processedChangeMarker = null // Since we now want to reload data for our new EditCanvas
    // console.log("handleSelectFrame: setting this.processedChangeMarker = null")
    this.setState({ selectedFrameIdx: frameIndex }, () => {
      // for new frame clears preview canvases and update edit canvas
      const c2 = this.props.asset.content2
      if (c2.frameData[this.state.selectedFrameIdx].length === 0) {
        for (let i = 0; i < this.previewCtxArray.length; i++)
          this.previewCtxArray[i].clearRect(0, 0, c2.width, c2.height)
      }
    })
  }

  handleSelectLayer = layerIndex => {
    // this.doSnapshotActivity(layerIndex)
    this.setState({ selectedLayerIdx: layerIndex })
  }

  //
  // SAVE and UNDO/REDO
  //

  initDefaultUndoStack() {
    // undoSteps will be an array of
    //   {
    //      when:           Date.now() of when it was added to the stack
    //      byUserName      username who made the change
    //      byUserContext   Where the user made the change (IP address etc)
    //      changeInfo      The change - for example 'Deleted frame'
    //      savedContent2   The saved data
    //    }
    //
    // Oldest items will be at index=0 in array

    if (this.hasOwnProperty('undoSteps') === false) this.undoSteps = []

    if (this.hasOwnProperty('redoSteps') === false) this.redoSteps = []
  }

  doMakeUndoStackEntry(changeInfoString) {
    return {
      when: Date.now(),
      byUserName: 'usernameTODO', // TODO
      byUserContext: 'someMachineTODO', // TODO
      changeInfo: changeInfoString,
      savedContent2: $.extend(true, {}, this.props.asset.content2),
    }
  }

  doTrimUndoStack() {
    let u = this.undoSteps
    if (u.length > 20) u.shift() // Remove 0th element (which is the oldest)
  }

  doSaveStateForUndo(changeInfoString) {
    this.doTrimUndoStack()
    this.undoSteps.push(this.doMakeUndoStackEntry(changeInfoString))
  }

  doTrimRedoStack() {
    if (this.redoSteps.length > 20) this.redoSteps.shift()
  }

  doSaveStateForRedo(changeInfoString) {
    this.doTrimRedoStack()
    this.redoSteps.push(this.doMakeUndoStackEntry(changeInfoString))
  }

  /* This stores a short-term record indicating this user is viewing this graphic
   * It provides the data for the 'just now' part of the history navigation and also
   * the 'viewers' indicator. It helps users know other people are looking at some asset
   * right now
   *
   * This gets _.throttle()d in the constructor so we don't kill the DB
   */
  doSnapshotActivity(frameIdxOverride) {
    let passiveAction = {
      selectedFrameIdx: frameIdxOverride ? frameIdxOverride : this.state.selectedFrameIdx,
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  toolHandleUndo() {
    if (this.undoSteps.length > 0) {
      let zombie = this.undoSteps.pop()
      let c2 = zombie.savedContent2
      // Make sure we aren't on a frame/layer that doesn't exist
      if (this.state.selectedFrameIdx > c2.frameNames.length - 1 && c2.frameNames.length > 0)
        this.setState({ selectedFrameIdx: c2.frameNames.length - 1 })
      if (this.state.selectedLayerIdx > c2.layerParams.length - 1 && c2.layerParams.length > 0)
        this.setState({ selectedLayerIdx: c2.layerParams.length - 1 })

      this.doSaveStateForRedo('Redo changes')
      // Now force this into the DB and that will cause a re-render
      this.saveChangedContent2(c2, c2.frameData[0][0], 'Undo changes', true) // Allow Backwash from database to replace current viewed state

      if (this.prevToolIdx !== null) this.setState({ toolChosen: Tools[this.prevToolIdx] })
    }
  }

  toolHandleRedo() {
    if (this.redoSteps.length > 0) {
      let zombie = this.redoSteps.pop()
      let c2 = zombie.savedContent2
      // Make sure we aren't on a frame/layer that doesn't exist
      if (this.state.selectedFrameIdx > c2.frameNames.length - 1 && c2.frameNames.length > 0)
        this.setState({ selectedFrameIdx: c2.frameNames.length - 1 })
      if (this.state.selectedLayerIdx > c2.layerParams.length - 1 && c2.layerParams.length > 0)
        this.setState({ selectedLayerIdx: c2.layerParams.length - 1 })

      this.doSaveStateForUndo('Undo changes')
      // Now force this into the DB and that will cause a re-render
      this.saveChangedContent2(c2, c2.frameData[0][0], 'Redo changes', true) // Allow Backwash from database to replace current viewed state

      if (this.prevToolIdx !== null) this.setState({ toolChosen: Tools[this.prevToolIdx] })
    }
  }

  toolEraseFrame() {
    if (confirm('Do you really want to erase the whole frame?')) {
      const w = this.props.asset.content2.width
      const h = this.props.asset.content2.height
      this.doSaveStateForUndo(`Erase Frame #${this.state.selectedFrameIdx + 1}`)

      this.previewCtxArray.forEach(ctx => {
        ctx.clearRect(0, 0, w, h)
      })
      this.handleSave('Erase frame')
    }
  }

  handleSave(changeText = 'change graphic', dontSaveFrameData = false, allowBackwash = true) {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }
    // console.log("handleSave(", changeText, ") -- dontSaveFrameData:", dontSaveFrameData, "  allowBackwash:", allowBackwash)

    const asset = this.props.asset
    let c2 = asset.content2

    // Make really sure we have the frameCanvasArrays up-to-date with the latest edits from all layers
    if (this.previewCanvasArray && !dontSaveFrameData) this.updateEditCanvasFromSelectedPreviewCanvas()

    if (this.previewCanvasArray && !dontSaveFrameData) {
      // hack for automatic checking and saving old assets to new
      // dontSaveFrameData - hack when deleting/moving frames (previewCanvases are not yet updated)
      let layerCount = this.previewCanvasArray.length // New layer is not yet added, so we don't use c2.layerParams.length
      for (let i = 0; i < layerCount; i++)
        c2.frameData[this.state.selectedFrameIdx][i] = this.previewCanvasArray[i].toDataURL('image/png')

      // Saving the composite Frame (using all layers for this frame) for convenient use in the map editor.
      // TODO(@stauzs): Would this be nicer as a list comprehension?    c2.spriteData = _.map(this.frameCanvasArray, c => c.toDataURL('image/png'))
      c2.spriteData = []
      for (let i = 0; i < this.frameCanvasArray.length; i++)
        c2.spriteData[i] = this.frameCanvasArray[i].toDataURL('image/png')
    }

    // tileset saving
    let tilesetInfo = this.createTileset()
    if (tilesetInfo) {
      c2.tileset = tilesetInfo.image
      c2.cols = tilesetInfo.cols
      c2.rows = tilesetInfo.rows
    } else console.log('Did not create tileset')

    this.setThumbnail(asset)

    this.saveChangedContent2(c2, asset.thumbnail, changeText, allowBackwash)
  } // TODO(DGOLDS): Maybe _.throttle() this?

  createTileset() {
    if (this.tilesetInfo) {
      const tmpTilesetInfo = this.tilesetInfo
      this.tilesetInfo = null
      return tmpTilesetInfo
    }

    if (!this.frameCanvasArray || this.frameCanvasArray.length == 0) return null

    let c2 = this.props.asset.content2
    let cols = Math.ceil(Math.sqrt(c2.frameNames.length))
    let rows = Math.ceil(c2.frameNames.length / cols)
    let canvas = document.createElement('canvas')
    // let canvas = document.getElementById("tilesetCanvas")
    canvas.width = c2.width * cols
    canvas.height = c2.height * rows
    let ctx = canvas.getContext('2d')
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let i = row * cols + col
        if (this.frameCanvasArray[i]) ctx.drawImage(this.frameCanvasArray[i], col * c2.width, row * c2.height)
      }
    }

    return {
      image: canvas.toDataURL('image/png'),
      cols,
      rows,
    }
  }

  saveChangedContent2(c2, thumbnail, changeText, allowBackwash = false) {
    // console.log("saveChangedContent2(", changeText, ") --   allowBackwash:", allowBackwash)

    // this will prevent small sync gap between parent and component:
    // noticeable: undo -> draw a line ( part of the line will be truncated )
    this.props.asset.content2 = c2

    c2.changeMarker = '_graphic_SCC2_' + Random.id() // http://docs.meteor.com/packages/random.html
    this.processedChangeMarker = allowBackwash ? null : c2.changeMarker
    // console.log("saveChangedContent2... setting local and c2 Backwash this.processedChangeMarker = " + this.processedChangeMarker)
    this.props.handleContentChange(c2, thumbnail, changeText)
    this.doSnapshotActivity()
  }

  setThumbnail(asset) {
    let origCanvas
    if (this.thumbCanvas) {
      // origCanvas = this.thumbCanvas.toDataURL('image/png')
      origCanvas = this.thumbCanvas
      this.thumbCanvas = null
    } else if (this.frameCanvasArray && this.frameCanvasArray[0]) {
      // origCanvas = this.frameCanvasArray[0].toDataURL('image/png')
      origCanvas = this.frameCanvasArray[0]
    }

    if (origCanvas) {
      const tmpCanvas = document.createElement('canvas')
      const tmpCtx = tmpCanvas.getContext('2d')
      tmpCanvas.width = _.clamp(origCanvas.width, 32, THUMBNAIL_WIDTH)
      tmpCanvas.height = _.clamp(origCanvas.height, 32, THUMBNAIL_HEIGHT)
      const wRatio = tmpCanvas.width / origCanvas.width
      const hRatio = tmpCanvas.height / origCanvas.height
      let ratio = wRatio < hRatio ? wRatio : hRatio
      if (wRatio >= 1 && hRatio >= 1) ratio = 1
      const width = origCanvas.width * ratio
      const height = origCanvas.height * ratio
      const x = (tmpCanvas.width - width) / 2
      const y = (tmpCanvas.height - height) / 2

      tmpCtx.drawImage(origCanvas, x, y, width, height)
      asset.thumbnail = tmpCanvas.toDataURL('image/png')
    }
  }

  /// Drag & Drop of image files over preview and editor
  // TODO: See how to factor this into another function? Depends how much of our internal state it needs

  /// Allow Previews to put info in DataTransfer object so we can drag them around
  handlePreviewDragStart(idx, e) {
    // Target (this) element is the source node.
    //let dragSrcEl = e.target

    if (
      idx === -1 // The Edit Window does this
    )
      idx = this.state.selectedLayerIdx

    e.dataTransfer.effectAllowed = 'copy' // This must match what is in handleDragOverPreview()
    e.dataTransfer.setData('mgb/image', this.previewCanvasArray[idx].toDataURL('image/png'))
  }

  handleDragOverPreview(event) {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.
  }

  /**
   * @param {number} idx - layer index, when -1 automatically selects active layer
   * @param {event} - drop event
   * */
  handleDropPreview(idx, event) {
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }

    var self = this

    if (
      idx === -1 // The Edit Window does this
    )
      idx = this.state.selectedLayerIdx

    // Note that idx === -2 means the MgbResizerHost control.
    // In thise case we must ONLY resize the graphics, not actually import the graphic.

    let mgbImageDataUri = event.dataTransfer.getData('mgb/image')
    if (mgbImageDataUri !== undefined && mgbImageDataUri !== null && mgbImageDataUri.length > 0) {
      // SPECIAL CASE - DRAG FROM us to us   i.e. Frame-to-frame image drag within MGB (or across MGB windows)
      var img = new Image()
      img.onload = function(e) {
        // Seems to have loaded ok..
        self.doSaveStateForUndo(`Drag+Drop Frame to Frame #` + idx.toString())
        if (idx === -2) {
          // Special case - MGB RESIZER CONTROL... So just resize to that imported image
          // Currently unreachable since I took this off of the resize control
          self.handleImageResize(
            Math.min(img.width, MAX_BITMAP_WIDTH),
            Math.min(img.height, MAX_BITMAP_HEIGHT),
          )
        } else {
          let w = self.props.asset.content2.width
          let h = self.props.asset.content2.height
          self.previewCtxArray[idx].clearRect(0, 0, w, h)
          self.previewCtxArray[idx].drawImage(e.target, 0, 0) // add w, h to scale it.
          if (idx === self.state.selectedLayerIdx) self.updateEditCanvasFromSelectedPreviewCanvas()
          self.handleSave(`Copy frame to frame #${idx + 1}`)
        }
      }
      img.src = mgbImageDataUri // is the data URL because called
      return
    }

    var imageUrl = event.dataTransfer.getData('URL')
    if (imageUrl) {
      this.pasteImage(imageUrl, idx)
      return
    }

    var imgData = DragNDropHelper.getDataFromEvent(event)
    if (imgData && imgData.link) {
      if (!imgData.asset || imgData.asset.kind === 'graphic') this.pasteImage(imgData.link, idx)
      else {
        // use thumbnail instead
        const linkToImage = makeExpireThumbnailLink(imgData.asset)
        this.pasteImage(linkToImage, idx)
      }
      return
    }

    let files = event.dataTransfer.files // FileList object.
    if (files.length > 0) {
      var reader = new FileReader()
      reader.onload = event => {
        let theUrl = event.target.result
        if (idx === -2) {
          // Special case - MGB RESIZER CONTROL... So just resize to that imported image
          var img = new Image()
          img.onload = () => {
            self.handleImageResize(
              Math.min(img.width, MAX_BITMAP_WIDTH),
              Math.min(img.height, MAX_BITMAP_HEIGHT),
            )
          }
          img.src = theUrl
        } else this.pasteImage(theUrl, idx)
      }
      reader.readAsDataURL(files[0])
    }
  }

  // <- End of drag-and-drop stuff

  pasteImage(url, idx = this.state.selectedLayerIdx) {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = e => {
      // The DataURI seems to have loaded ok now as an Image, so process what to do with it
      this.doSaveStateForUndo(`Drag+Drop Image to Frame #` + idx.toString())

      const w = this.props.asset.content2.width
      const h = this.props.asset.content2.height
      this.previewCtxArray[idx].clearRect(0, 0, w, h)

      if (img.width > w || img.height > h) {
        const aspect = w * img.height / (h * img.width)
        if (aspect > 1) {
          const nHeight = h / aspect
          this.previewCtxArray[idx].drawImage(e.target, 0, (h - nHeight) * 0.5, w, nHeight) // add w, h to scale it.
        } else {
          const nWidth = w / aspect
          this.previewCtxArray[idx].drawImage(e.target, (w - nWidth) * 0.5, 0, nWidth, h) // add w, h to scale it.
        }
      } else this.previewCtxArray[idx].drawImage(e.target, 0, 0) // add w, h to scale it.

      if (idx === this.state.selectedLayerIdx) this.updateEditCanvasFromSelectedPreviewCanvas()
      this.handleSave(`Drag external file to frame #${idx + 1}`)
    }
    img.src = url // is the data URL because called
  }

  toolOpenImportPopup = () => this.setState({ showGraphicImportPopup: true })
  toolCloseImportPopup = () => this.setState({ showGraphicImportPopup: false })

  // @@@
  // This is passed to the <GraphicImport> Control so the tiles can be imported
  importTileset = (tileWidth, tileHeight, imgDataArr, thumbCanvas, tilesetInfo) => {
    let c2 = this.props.asset.content2
    this.thumbCanvas = thumbCanvas
    this.tilesetInfo = tilesetInfo

    c2.width = tileWidth
    c2.height = tileHeight
    c2.frameNames = []
    c2.frameData = []
    c2.spriteData = []
    // c2.fps = 10;
    for (let i = 0; i < imgDataArr.length; i++) {
      c2.frameNames[i] = 'Frame ' + i
      c2.frameData[i] = []
      c2.frameData[i][0] = imgDataArr[i]
      c2.spriteData[i] = imgDataArr[i]
    }
    c2.layerParams = [{ name: 'Layer 1', isHidden: false, isLocked: false }]
    c2.animations = []

    this.handleSave('Import tileset', true, true) // DG - added allowBackwash = true so we get and process the redraw immediately
    this.setState({ editScale: this.getDefaultScale(), showGraphicImportPopup: false })
  }

  //
  // TOOLBAR
  //

  // This is used by render() so is frequently called.
  // It can therefore have values that are based on this, this.state, this.props etc
  generateToolbarActions() {
    const simpleTools = {
      Undo: {
        label: 'Undo', // Label shown
        name: 'toolHandleUndo', // function name in this class
        tooltip: 'Undo', // Tooltip to show on Hover etc
        iconText: this.undoSteps.length, // Text that may (optionally) be shown with the icon
        disabled: !this.undoSteps.length, // True if this is to be shown as disabled
        icon: 'undo icon', // Semantic-UI icon CSS class
        shortcut: 'Ctrl+Z', // Keyboard shortcut
        level: 2, // Show this at this featureLevel or higher
        simpleTool: true, // this tool is not selectable, only action is on tool click
      },
      Redo: {
        label: 'Redo',
        name: 'toolHandleRedo',
        tooltip: 'Redo',
        iconText: this.redoSteps.length,
        disabled: !this.redoSteps.length,
        icon: 'undo flip icon',
        shortcut: 'Ctrl+Shift+Z',
        level: 2,
        simpleTool: true,
      },
      Cut: {
        label: 'Cut',
        name: 'toolCutSelected',
        tooltip: 'Cut',
        disabled: !this.state.selectRect,
        icon: 'cut icon',
        shortcut: 'Ctrl+X',
        level: 6,
        simpleTool: true,
      },
      Copy: {
        label: 'Copy',
        name: 'toolCopySelected',
        tooltip: 'Copy',
        disabled: !this.state.selectRect,
        icon: 'copy icon',
        shortcut: 'Ctrl+C',
        level: 6,
        simpleTool: true,
      },
      EraseFrame: {
        label: 'Erase Frame',
        name: 'toolEraseFrame',
        tooltip: 'Erase Frame',
        disabled: false,
        icon: 'remove circle outline icon',
        shortcut: 'Ctrl+Shift+E',
        level: 2,
        simpleTool: true,
      },
      Import: {
        label: 'Import',
        name: 'toolOpenImportPopup',
        tooltip: 'Import',
        disabled: false,
        icon: 'add square icon',
        shortcut: 'Ctrl+I',
        level: 3,
        simpleTool: true,
      },
    }

    for (let i = 0; i < Tools.length; i++) {
      let toolLabel = Tools[i].label
      if (simpleTools[toolLabel]) Tools[i] = simpleTools[toolLabel]
      // special case for disabling paste tool when there is no pasteCanvas
      if (toolLabel === 'Paste') Tools[i].disabled = !this.state.pasteCanvas

      // hide unnecssary tools to make space for art tutorials
      //Tools[i].hideTool = ((this.props.asset.skillPath && _.startsWith( this.props.asset.skillPath, 'art' )) && ["Cut", "Copy", "Paste", "Import"].indexOf(toolLabel) !== -1)
    }

    const actions = {}
    const config = {
      // level: 1,       // default level -- This is now in expectedToolbars.getDefaultLevel

      // vertical: true, // Nope, we want to have horizontal for now

      buttons: [],
    }

    _.each(Tools, tool => {
      // if (tool.hideTool === true)
      //   return

      config.buttons.push({
        active: this.state.toolChosen === tool,
        name: tool.name,
        label: tool.label,
        iconText: tool.iconText,
        disabled: tool.disabled,
        tooltip: tool.tooltip,
        shortcut: tool.shortcut,
        level: tool.level || 3,
        icon: tool.icon,
        component: tool.component,
      })
      actions[tool.name] = this.handleToolSelected.bind(this, tool)
    })

    return { actions, config }
  }

  setGrid = img => {
    this.gridImg = img
  }

  drawGrid() {
    const zoom = this.state.editScale
    if (zoom >= MIN_ZOOM_FOR_GRIDLINES && this.gridImg && this.state.showGrid) {
      const c2 = this.props.asset.content2
      for (let col = 0; col < c2.width; col++) {
        for (let row = 0; row < c2.height; row++) this.editCtx.drawImage(this.gridImg, zoom * col, zoom * row)
      }
    }
  }

  setScrollMode(mode) {
    this.setState({ scrollMode: mode })
  }

  setPrevToolIdx(toolIdx) {
    this.prevToolIdx = toolIdx
  }

  toggleMiniMap = () => {
    const newVal = !this.state.showMiniMap
    _memoState_showMiniMap = newVal
    this.setState({ showMiniMap: newVal })
  }

  handleEditCanvasScroll = e => {
    if (this.refs.miniMap) this.refs.miniMap.scroll(e.target.scrollTop, e.target.scrollLeft)
  }

  handleToggleColorPicker = () => {
    const newVal = !this.state.isColorPickerPinned
    _memoState_isColorPickerPinned = newVal
    this.setState({ isColorPickerPinned: newVal })
  }

  render() {
    this.initDefaultContent2() // The NewAsset code is lazy, so add base content here
    this.initDefaultUndoStack()

    const { asset, currUser, videoStore: { state: { videos } } } = this.props

    const {
      editScale,
      selectedColors,
      isColorPickerPinned,
      selectedFrameIdx,
      selectRect,
      selectDimensions,
      scrollMode,
      showDrawingStatus,
      showMiniMap,
      showGrid,
      showCheckeredBg,
      toolChosen,
    } = this.state

    const c2 = asset.content2
    const { actions, config } = this.generateToolbarActions()

    let imgEditorSty = {}
    if (toolChosen) imgEditorSty.cursor = toolChosen.editCursor

    const scrollModes = ['Normal', 'Rotate', 'Scale', 'Flip']

    const layerIdx = this.state.selectedLayerIdx
    const layerParam = this.props.asset.content2.layerParams[layerIdx]
    const layerCount = this.previewCanvasArray ? this.previewCanvasArray.length : 0
    const layerName =
      layerParam && layerParam.name && layerParam.name.length > 0
        ? layerParam.name
        : `Unnamed layer #${layerIdx + 1}`

    const isSkillTutorialGraphic = asset && asset.skillPath && _.startsWith(asset.skillPath, 'art')
    const colorPickerEl = (
      <SketchPicker
        onChangeComplete={this.handleColorChangeComplete.bind(this, 'fg')}
        color={selectedColors['fg'].rgb}
        presetColors={c2.presetColors || []}
      />
    )

    // Make element
    return (
      <div>
        <Grid columns="equal">
          <Grid.Row>
            <Grid.Column>
              {/* First Toolbar row */}
              <Grid.Row style={{ paddingBottom: '0.3em', whiteSpace: 'nowrap' }}>
                <Grid.Column>
                  {isColorPickerPinned ? (
                    <Button
                      id="mgbjr-EditGraphic-colorPicker"
                      className="TopToolBarRowIcon"
                      style={{ backgroundColor: selectedColors['fg'].hex }}
                      onClick={this.handleToggleColorPicker}
                      icon={{ name: 'block layout', style: { color: selectedColors['fg'].hex } }}
                    />
                  ) : (
                    <Popup
                      on="hover"
                      position="bottom left"
                      hoverable
                      hideOnScroll
                      mouseEnterDelay={250}
                      id="mgbjr-EditGraphic-colorPicker-body"
                      trigger={
                        <Button
                          id="mgbjr-EditGraphic-colorPicker"
                          className="TopToolBarRowIcon"
                          style={{ backgroundColor: selectedColors['fg'].hex }}
                          onClick={this.handleToggleColorPicker}
                          icon={{ name: 'block layout', style: { color: selectedColors['fg'].hex } }}
                        />
                      }
                      header="Color Picker"
                      content={colorPickerEl}
                    />
                  )}

                  <ResizeImagePopup
                    initialWidth={c2.width}
                    initialHeight={c2.height}
                    maxWidth={MAX_BITMAP_WIDTH}
                    maxHeight={MAX_BITMAP_HEIGHT}
                    scalingOptions={['None']}
                    handleResize={this.handleImageResize}
                  />

                  <Popup
                    trigger={
                      <span
                        id="mgbjr-editGraphic-changeCanvasZoom"
                        style={{ cursor: 'pointer' }}
                        onClick={this.zoomIn}
                        className="ui button zoomLeftIcon noMargin"
                      >
                        <Icon name="zoom in" className="noMargin" />
                      </span>
                    }
                    on="hover"
                    header="Zoom In"
                    mouseEnterDelay={250}
                    content="Click here or scroll/mousewheel over edit area to change zoom level."
                    size="tiny"
                    position="bottom left"
                  />

                  <Popup
                    trigger={
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={this.resetZoom}
                        className="ui button zoomMiddleIcon noMargin"
                      >
                        {editScale}x
                      </span>
                    }
                    on="hover"
                    header="Reset Zoom"
                    mouseEnterDelay={250}
                    content="Click here to reset zoom"
                    size="tiny"
                    position="bottom left"
                  />

                  <Popup
                    trigger={
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={this.zoomOut}
                        className="ui button zoomRightIcon"
                      >
                        <Icon name="zoom out" className="noMargin" />
                      </span>
                    }
                    on="hover"
                    header="Zoom Out"
                    mouseEnterDelay={250}
                    content="Click here or scroll/mousewheel over edit area to change zoom level."
                    size="tiny"
                    position="bottom left"
                  />

                  <Popup
                    wide
                    trigger={
                      <span className="ui button TopToolBarRowIcon" id="mgbjr-editGraphic-toggleGrid">
                        <span>Views&emsp;</span>
                        <span style={{ cursor: 'pointer' }} onClick={this.handleToggleGrid}>
                          <Icon name="grid layout" color={showGrid ? 'blue' : 'grey'} />
                        </span>
                        <span>&nbsp;</span>
                        <span style={{ cursor: 'pointer' }} onClick={this.handleToggleCheckeredBg}>
                          <Icon name="clone" color={showCheckeredBg ? 'blue' : 'grey'} />
                        </span>
                        <span>&nbsp;</span>
                        <span style={{ cursor: 'pointer' }} onClick={this.toggleMiniMap}>
                          <Icon name="tv" color={showMiniMap ? 'blue' : 'grey'} />
                        </span>
                        <span>&nbsp;</span>
                        <span style={{ cursor: 'pointer' }} onClick={this.handleToggleDrawingStatus}>
                          <Icon name="bullseye" color={showDrawingStatus ? 'blue' : 'grey'} />
                        </span>
                        <span>&nbsp;</span>
                        <span style={{ cursor: 'pointer' }} onClick={this.handleToggleAnimFrames}>
                          <Icon name="film" color={this.state.showAnimFrames ? 'blue' : 'grey'} />
                        </span>
                      </span>
                    }
                    on="hover"
                    mouseEnterDelay={250}
                    header="Preview Helpers"
                    content={
                      <div>
                        <Divider hidden />
                        <p>
                          <Icon color={showGrid ? 'blue' : 'grey'} name="grid layout" /> Show/Hide Gridlines
                          <span style={editScale >= MIN_ZOOM_FOR_GRIDLINES ? null : { color: 'red' }}>
                            {' '}
                            (shows when zoom > {MIN_ZOOM_FOR_GRIDLINES - 1}x)
                          </span>
                        </p>
                        <p>
                          <Icon color={showCheckeredBg ? 'blue' : 'grey'} name="clone" /> Show/Hide
                          transparency checkerboard helper
                        </p>
                        <p>
                          <Icon color={showMiniMap ? 'blue' : 'grey'} name="tv" /> Show/Hide drawing preview
                          at 1x scale
                        </p>
                        <p>
                          <Icon color={showDrawingStatus ? 'blue' : 'grey'} name="bullseye" /> Show/Hide
                          drawing status bar info
                        </p>
                        <p>
                          <Icon color={this.state.showAnimFrames ? 'blue' : 'grey'} name="film" />{' '}
                          Minimize/Maximize frames and animations
                        </p>
                      </div>
                    }
                    size="tiny"
                    position="bottom left"
                  />
                </Grid.Column>
              </Grid.Row>
              {/* Second Toolbar row */}
              <Grid.Row style={{ paddingTop: 0, paddingBottom: 0, whiteSpace: 'nowrap' }}>
                <Grid.Column>
                  {
                    <Toolbar
                      actions={actions}
                      config={config}
                      name="EditGraphic"
                      setPrevToolIdx={this.setPrevToolIdx.bind(this)}
                    />
                  }
                </Grid.Column>
              </Grid.Row>

              {/* 2nd 'row' is for potentially multiple columns */}
              <Grid.Row style={{ paddingTop: 0, paddingBottom: '0.25em', display: 'flex' }}>
                {/* A. Optional Color Picker & Palette */}
                {isColorPickerPinned && (
                  <Grid.Column style={{ paddingRight: '1em', paddingTop: '0.5em' }}>
                    {isColorPickerPinned && colorPickerEl}
                  </Grid.Column>
                )}

                {/* B. Main Drawing area and tools */}
                <Grid.Column>
                  <Grid.Row style={{ marginBottom: '6px' }}>
                    <Grid.Column width={12}>
                      {/* Paste options - only shown when paste tool is active */}
                      {toolChosen &&
                      toolChosen.label == 'Paste' && (
                        <div className="ui form">
                          <div className="inline fields">
                            <label>Scroll modifier:</label>
                            {scrollModes.map(mode => (
                              <div key={mode} className="field">
                                <div className="ui radio checkbox">
                                  <input
                                    type="radio"
                                    name={mode}
                                    checked={mode == scrollMode ? 'checked' : ''}
                                    onChange={this.setScrollMode.bind(this, mode)}
                                  />
                                  <label>{mode}</label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/*** Status Bar ***/}
                      <div
                        className={`ui horizontal list ${showDrawingStatus ? '' : 'mgb-hidden'}`}
                        ref="statusBarDiv"
                        style={{ marginBottom: '4px', marginTop: '1px', whiteSpace: 'nowrap' }}
                      >
                        <Popup
                          trigger={
                            <div className="item">
                              <div className="content">
                                <div
                                  className="ui small circular label"
                                  style={{ cursor: 'pointer' }}
                                  onClick={this.handleGotoNextFrame}
                                >
                                  &nbsp;
                                  <Icon name="spinner" />
                                  <span>Frame {1 + selectedFrameIdx}</span>
                                  &nbsp;
                                </div>
                              </div>
                            </div>
                          }
                          header={`Frame #${1 + selectedFrameIdx} of ${c2.frameNames.length}`}
                          content="Use ALT+mousewheel over Edit area to change current edited frame. You can also upload image files by dragging them to the frame previews or to the drawing area"
                          size="small"
                          mouseEnterDelay={250}
                          position="bottom left"
                        />
                        &nbsp;
                        <Popup
                          trigger={
                            <div className="item">
                              <div className="content">
                                <div
                                  className="ui small circular label"
                                  style={{ cursor: 'pointer' }}
                                  onClick={this.handleGotoNextLayer}
                                >
                                  &nbsp;
                                  <Icon name="tasks" />
                                  <span>
                                    layer: <em>{layerName}</em>
                                  </span>
                                  &nbsp;
                                </div>
                              </div>
                            </div>
                          }
                          header={`Graphic has ${layerCount} layers`}
                          content="Click here or use the layers table to change the currently selected layer"
                          size="small"
                          mouseEnterDelay={250}
                          position="bottom left"
                        />
                        &nbsp;
                        <div className="item">
                          <div className="content" ref="statusBarMouseAtText" />
                        </div>
                        <div className="item">
                          <i className="square icon" ref="statusBarColorAtIcon" />
                          <div className="content" ref="statusBarColorAtText" />
                        </div>
                      </div>

                      {/*** Drawing Canvas ***/}
                      <Grid.Row style={{ minHeight: '64px' }}>
                        <Grid.Column style={{ height: '100%' }}>
                          <div
                            style={{
                              overflow: 'auto',
                              maxWidth: 'calc(100vw - 32px)',
                              maxHeight: editCanvasMaxHeight + 'px',
                            }}
                            onScroll={this.handleEditCanvasScroll}
                          >
                            <canvas
                              id="mgb_edit_graphic_main_canvas"
                              ref="editCanvas"
                              style={imgEditorSty}
                              width={editScale * c2.width}
                              height={editScale * c2.height}
                              className={
                                (showCheckeredBg ? 'mgbEditGraphicSty_checkeredBackground' : '') +
                                ' mgbEditGraphicSty_thinBorder'
                              }
                              onDragOver={this.handleDragOverPreview.bind(this)}
                              onDrop={this.handleDropPreview.bind(this, -1)}
                            />
                            {/*** <canvas id="tilesetCanvas"></canvas> ***/}
                            <CanvasGrid scale={editScale} setGrid={this.setGrid} />
                          </div>
                        </Grid.Column>
                      </Grid.Row>

                      {/* Selection size info while selection is active */}
                      {selectRect && (
                        <div>
                          Selected area:&emsp;width = {selectDimensions.width}&emsp;height ={' '}
                          {selectDimensions.height}
                        </div>
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid.Column>
              </Grid.Row>
            </Grid.Column>
            {/* Art Mentor Column */}
            {isSkillTutorialGraphic && (
              <ArtTutorial
                style={{ backgroundColor: 'rgba(0,255,0,0.02)' }}
                isOwner={currUser && currUser._id === asset.ownerId}
                active={asset.skillPath ? true : false}
                skillPath={asset.skillPath}
                currUser={this.props.currUser}
                userSkills={this.userSkills}
                assetId={asset._id}
                frameData={c2.frameData}
                handleSelectFrame={frame => this.handleSelectFrame(frame)}
              />
            )}
          </Grid.Row>

          {/*** GraphicImport ***/}
          <Modal open={this.state.showGraphicImportPopup} onClose={this.toolCloseImportPopup}>
            <GraphicImport
              importTileset={this.importTileset}
              maxTileWidth={MAX_BITMAP_WIDTH}
              maxTileHeight={MAX_BITMAP_WIDTH}
            />
          </Modal>

          {/*** SpriteLayers ***/}

          <SpriteLayers
            content2={c2}
            isMinimized={!this.state.showAnimFrames}
            availableWidth={this.props.availableWidth}
            hasPermission={this.hasPermission}
            handleSave={this.handleSave.bind(this)}
            selectedFrameIdx={this.state.selectedFrameIdx}
            selectedLayerIdx={this.state.selectedLayerIdx}
            // The following params are an anti-pattern for React.
            // TODO: Need to make this a normal flow instead
            forceDraw={this.forceDraw}
            forceUpdate={this.forceUpdateForLayers}
            getFrameData={frameId => this.frameCanvasArray[frameId].toDataURL('image/png')}
            getLayerData={layerId => this.previewCanvasArray[layerId].toDataURL('image/png')}
            handleSelectLayer={this.handleSelectLayer}
            handleSelectFrame={this.handleSelectFrame}
          />

          {/*** MiniMap ***/}
          {showMiniMap &&
          this.refs.editCanvas && (
            <MiniMap
              ref={this.handleRefMiniMap}
              width={c2.width}
              height={c2.height}
              toggleMiniMap={this.toggleMiniMap}
              editCanvasMaxHeight={editCanvasMaxHeight}
              editCanvasHeight={this.refs.editCanvas ? this.refs.editCanvas.height : null}
              editCanvasMaxWidth={screen.width}
              editCanvasWidth={this.refs.editCanvas ? this.refs.editCanvas.width : null}
              editCanvasScale={editScale}
            />
          )}
        </Grid>
        {videos && <VideoPopup />}
      </div>
    )
  }
}

EditGraphic.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default withStores({ videoStore })(EditGraphic)
