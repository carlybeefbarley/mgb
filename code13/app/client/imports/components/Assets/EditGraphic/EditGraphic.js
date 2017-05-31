import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Grid, Header, Popup, Button, Icon } from 'semantic-ui-react'
import ReactDOM from 'react-dom'
import sty from  './editGraphic.css'
import ReactColor from 'react-color'        // http://casesandberg.github.io/react-color/
import Tools from './GraphicTools'

import SpriteLayers from './Layers/SpriteLayers'
import GraphicImport from './GraphicImport/GraphicImport'
import CanvasGrid from './CanvasGrid'
import MiniMap from './MiniMap/MiniMap'

import { snapshotActivity } from '/imports/schemas/activitySnapshots'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import ResizeImagePopup from './ResizeImagePopup'
import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'
import SpecialGlobals from '/imports/SpecialGlobals'
import ArtTutorial from './ArtTutorials'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'

import { makeExpireThumbnailLink } from '/client/imports/helpers/assetFetchers'

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


// Also, in order to optimize some draw and draw-while-save-is-pending scenarios, there is some special handling
// of saves via this.handleSave()
//   The normal flow of changes are..
//          Step 1.   User changes graphic locally with tool. The tool should save to the preview and edit canvases
//          Step 2.   We send the saved data to the Meteor server. Note that this may take a few hundred ms
//          Step 3.   While the save-response is pending, we allow the user to continue editing
//          Step 4.   The change to the Azzet collection comes back to us via the meteor DDP sync mechanism..
//                       ** At this point we must decide what to do with the subsequent edits. We use a special
//                       ** marker in the asset.content2 object:   content2.recentMarker.. which we change randomly each
//                       ** time we save data. If the recentMarker coming back is one we just set, then we don't allow
//                       ** this data from the server to replace the user's subsequent edits.
//                       ** See the code using 'recentMarker' variable for the actual implementation of this optimization.
let recentMarker = null  // See explanation above

// keeps data about selected color from previous graphic asset
let _selectedColors = {
  // as defined by http://casesandberg.github.io/react-color/#api-onChangeComplete
  // Note that the .hex value excludes the leading # so it is for example (white) 'ffffff'
  fg:    { hex: "#000080", rgb: {r: 0, g: 0, b:128, a: 1} }    // Alpha = 0...1
}

const editCanvasMaxHeight = 600

export default class EditGraphic extends React.Component {
  // See AssetEdit.js for propTypes. That wrapper just passes them to us

  handleToggleGrid = () => this.setState( { showGrid: !this.state.showGrid} )
  handleToggleCheckeredBg = () => this.setState( { showCheckeredBg: !this.state.showCheckeredBg} )

  constructor(props, context) {
    super(props)
    registerDebugGlobal( 'editGraphic', this, __filename, 'Active Instance of Graphic editor')

    this.doSnapshotActivity = _.throttle(this.doSnapshotActivity, 5*1000)

    this.zoomLevels = [1, 2, 4, 6, 8, 10, 12, 14, 16]
    this.gridImg = null

    this.userSkills = context.skills

    this.prevToolIdx = null // for undo/redo to set back previous tool
    this.state = {
      editScale:        this.getDefaultScale(),        // Zoom scale of the Edit Canvas
      selectedFrameIdx: 0,
      showCheckeredBg:  false,
      showGrid:         true,
      selectedLayerIdx: 0,
      isMiniMap:        true,
      selectedColors:   _selectedColors,
      toolActive: false,
      toolChosen: this.findToolByLabelString("Pen"),
      selectRect: null,   // if asset area is selected then value {startX, startY, endX, endY}
      selectDimensions: { width: 0, height: 0 },
      pasteCanvas: null,     // if object cut or copied then {x, y, width, height, imgData}
      scrollMode: "Normal"
    }

    // TODO check if this can be deleted completely
    // this.fixingOldAssets()

    this.onpaste = (e) => {
      var items = e.clipboardData.items
      if (items) {
        let isImagePasted = false
        //access data directly
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            //image
            isImagePasted = true
            var blob = items[i].getAsFile()
            var source = URL.createObjectURL(blob)
            this.pasteImage(source)
          }
        }
        if (isImagePasted)
          e.preventDefault()
      }
    }

    // animframe for updating selecting rectangle animation
    this._raf = () => {
      if(this.state.selectRect) this.drawSelectRect(this.state.selectRect)
      window.requestAnimationFrame(this._raf)
    }
    this._raf()

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
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas)
    this.miniMap =  ReactDOM.findDOMNode(this.refs.miniMap)
    this.editCtx = this.editCanvas.getContext('2d')
    this.editCtxImageData1x1 = this.editCtx.createImageData(1,1)

    this.getPreviewCanvasReferences()
    this.loadAllPreviewsAsync()

    // Initialize Status bar
    this._statusBar = {
      outer: $(ReactDOM.findDOMNode(this.refs.statusBarDiv)),
      mouseAtText: $(ReactDOM.findDOMNode(this.refs.statusBarMouseAtText)),
      colorAtText: $(ReactDOM.findDOMNode(this.refs.statusBarColorAtText)),
      colorAtIcon: $(ReactDOM.findDOMNode(this.refs.statusBarColorAtIcon))
    }
    this.setStatusBarInfo()

    this.handleColorChangeComplete('fg', _selectedColors.fg )

    // Touch and Mouse events for Edit Canvas
    this.editCanvas.addEventListener('touchmove',     this.handleTouchMove.bind(this))
    this.editCanvas.addEventListener('touchstart',    this.handleTouchStart.bind(this))
    this.editCanvas.addEventListener('touchend',      this.handleTouchEnd.bind(this))
    this.editCanvas.addEventListener('touchcancel',   this.handleTouchCancel.bind(this))
    this.editCanvas.addEventListener('wheel',         this.handleMouseWheel.bind(this))
    this.editCanvas.addEventListener('mousemove',     this.handleMouseMove.bind(this))
    this.editCanvas.addEventListener('mousedown',     this.handleMouseDown.bind(this))
    this.editCanvas.addEventListener('mouseup',       this.handleMouseUp.bind(this))
    this.editCanvas.addEventListener('mouseleave',    this.handleMouseLeave.bind(this))
    this.editCanvas.addEventListener('mouseenter',    this.handleMouseEnter.bind(this))
    this.editCanvas.addEventListener('contextmenu',   this.handleContextMenu.bind(this))

    this.doSnapshotActivity()

    //TODO: add only to canvas?
    window.addEventListener("paste", this.onpaste, false)

    // TODO inspect. without this color picker hide doesn't work
    document.querySelector('#root').addEventListener("click", () => {} )
  }

  componentWillUnmount() {
    window.removeEventListener("paste", this.onpaste)
  }

  // there are some missing params for old assets being added here
  fixingOldAssets() {
    let autoFix = false
    let c2 = this.props.asset.content2

    if (!c2.layerParams && c2.layerNames) {
      c2.layerParams = []
      for (let i=0; i<c2.layerNames.length; i++)
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

    if (autoFix)
      this.handleSave("Automatic fixing old assets")
  }

// TODO: DGOLDS to clean this up -- combine with mgb1ImportTiles etc
  initDefaultContent2()
  {
    let asset = this.props.asset
    if (!asset.hasOwnProperty("content2") || !asset.content2.hasOwnProperty('width')) {
      asset.content2 = {
        width: DEFAULT_GRAPHIC_WIDTH,
        height: DEFAULT_GRAPHIC_HEIGHT,
        fps: 10,
        layerParams: [{name:"Layer 1", isHidden: false, isLocked: false}],
        frameNames: ["Frame 1"],
        frameData: [ [ ] ],
        spriteData: [],
        animations: []
      }
    }
  }

  getDefaultScale () {
    if (this.props.asset.skillPath && _.startsWith( this.props.asset.skillPath, 'art' ))
      return 12

    const c2 = this.props.asset.content2
    const width = c2.width || DEFAULT_GRAPHIC_WIDTH
    const height = c2.height || DEFAULT_GRAPHIC_HEIGHT
    const wRatio = (screen.width *0.9) / width
    const hRatio = (screen.height * 0.5) / height
    let scale = wRatio < hRatio ? Math.floor(wRatio) : Math.floor(hRatio)

    if ( scale > 4)
      scale = 4
    else if (scale < 1)
      scale = 1
    else if (scale == 3)
      scale = 2

    return scale
  }


  // React Callback: componentDidUpdate()
  componentDidUpdate(prevProps, prevState)
  {
    const c2 = this.props.asset.content2
    this.getPreviewCanvasReferences()       // Since they could have changed during the update due to frame add/remove
    // console.log(prevState.selectedFrameIdx, this.state.selectedFrameIdx);

    if (recentMarker !== null && c2.changeMarker === recentMarker)
    {
      /* Do nothing.. */
      // console.log("Backwash prevented by marker "+recentMarker)
      // This is the data we just sent up.. So let's _not_ nuke any subsequent edits (i.e don't call loadAllPreviewsAsync())
      // TODO.. we may need a window of a few recentMarkers in case of slow updates. Maybe just hold back sends while there is a pending save?
    }
    else if (prevState.selectedFrameIdx !== this.state.selectedFrameIdx)
      this.updateFrameLayers()
    else
      this.loadAllPreviewsAsync()     // It wasn't the change we just sent, so apply the data

    if(c2.doResaveTileset){
      c2.doResaveTileset = false
      // minimum delay just to be sure that previewcanvases are drawn
      // this will affect edge case for graphic import
      setTimeout( () => this.handleSave('Resave tilest'), 50)
    }
  }

  /** Stash references to the preview canvases after initial render and subsequent renders
   *
   */
  getPreviewCanvasReferences()
  {
    let asset = this.props.asset
    let c2 = asset.content2

    // TODO rename to layerCanvas and cts arrays instead of preview

    this.previewCanvasArray = []                // Preview canvas for this animation frame
    this.previewCtxArray = []                   // 2d drawing context for the animation frame
    this.previewCtxImageData1x1Array = []       // Used for painting quickly to each preview frame

    this.previewCanvasArray = $(".spriteLayersTable td").find("canvas").get()
    for (let i = 0; i < c2.layerParams.length; i++) {
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d')
      this.previewCtxImageData1x1Array[i] = this.previewCtxArray[i].createImageData(1,1)
    }

    this.frameCanvasArray = []     // frame canvases where layers are merged
    this.frameCtxArray = []
    this.frameCtxImageData1x1Array = []

    this.frameCanvasArray = $(".spriteLayersTable th").find("canvas").get()
    for (let i = 0; i < c2.frameNames.length; i++) {
      this.frameCtxArray[i] = this.frameCanvasArray[i].getContext('2d')
      this.frameCtxImageData1x1Array[i] = this.frameCtxArray[i].createImageData(1,1)
    }
  }


  // Note that this HAS to use Image.onload so it will complete asynchronously.
  // TODO(DGOLDS): Add an on-complete callback including a timeout handler to support better error handling and avoid races
  loadAllPreviewsAsync() {
    let c2 = this.props.asset.content2
    let frameCount = c2.frameNames.length
    let layerCount = c2.layerParams.length

    for (let frameID=0; frameID<frameCount; frameID++) {
      this.frameCtxArray[frameID].clearRect(0, 0, c2.width, c2.height)
      for (let layerID=layerCount-1; layerID>=0; layerID--)
        this.loadAssetAsync(frameID, layerID)
    }
    setTimeout(() => this.updateEditCanvasFromSelectedPreviewCanvas(), 0)
  }

  loadAssetAsync(frameID, layerID) {
    let c2 = this.props.asset.content2
    if (!c2.frameData[frameID] || !c2.frameData[frameID][layerID]) { // manage empty frameData cases
      // console.log('empty framedata', frameID, layerID)
      if (frameID === this.state.selectedFrameIdx)
        this.previewCtxArray[layerID].clearRect(0,0, c2.width, c2.height)
      return
    }
    let dataURI = c2.frameData[frameID][layerID]
    // if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
    if (dataURI !== undefined && dataURI.startsWith("data:image/")) {
      var _img = new Image
      _img.frameID = frameID   // hack so in onload() we know which frame is loaded
      _img.layerID = layerID   // hack so in onload() we know which layer is loaded
      let self = this
      _img.onload = function(e) {
        let loadedImage = e.target
        if(loadedImage.frameID === self.state.selectedFrameIdx) {
          self.previewCtxArray[loadedImage.layerID].clearRect(0,0, c2.width, c2.height)
          self.previewCtxArray[loadedImage.layerID].drawImage(loadedImage, 0, 0)
        }
        if (!c2.layerParams[loadedImage.layerID].isHidden) {
          let frame = self.frameCtxArray[loadedImage.frameID]
          if (frame)
            frame.drawImage(loadedImage, 0, 0)  // There seems to be a race condition that means frame is sometime null.
        }
      }
      _img.src = dataURI
    }
    else {
      // TODO: May need some error indication here
      console.trace("Unrecognized dataURI for Asset#", this.props.asset._id)
      this.updateEditCanvasFromSelectedPreviewCanvas()
    }
  }

  updateFrameLayers() {
    let c2 = this.props.asset.content2
    let frameData = c2.frameData[this.state.selectedFrameIdx]
    for (let i=frameData.length-1; i>=0; i--)
      this.loadAssetAsync(this.state.selectedFrameIdx, i)
    setTimeout(() => this.updateEditCanvasFromSelectedPreviewCanvas(), 0)
  }

  updateEditCanvasFromSelectedPreviewCanvas()   // TODO(DGOLDS?): Do we still need the vendor-prefix smoothing flags?
  {
    let w = this.previewCanvasArray[this.state.selectedLayerIdx].width
    let h = this.previewCanvasArray[this.state.selectedLayerIdx].height
    let s = this.state.editScale
    let c2 = this.props.asset.content2
    this.editCtx.imageSmoothingEnabled = false
    this.editCtx.mozImageSmoothingEnabled = false
    this.editCtx.webkitImageSmoothingEnabled = false    // Needed for Safari, even though Chrome complains about it
    this.editCtx.msImageSmoothingEnabled = false
    this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height)
    this.frameCtxArray[this.state.selectedFrameIdx].clearRect(0, 0, c2.width, c2.height)

    // draws all layers on edit canvas and layer canvas
    for (let i=this.previewCanvasArray.length-1; i>=0; i--) {
      if (!this.props.asset.content2.layerParams[i].isHidden) {
        this.editCtx.drawImage(this.previewCanvasArray[i], 0, 0, w, h, 0, 0, w*s, h*s)
        this.frameCtxArray[this.state.selectedFrameIdx].drawImage(this.previewCanvasArray[i], 0, 0, w, h, 0, 0, w, h)
      }
    }

    // draw minimap
    if(this.state.isMiniMap) 
      this.refs.miniMap.redraw(this.editCanvas, w, h)

    this.drawGrid()
  }

  forceDraw ()
  {
    let c2 = this.props.asset.content2
    if (!c2.frameData || !c2.frameData[0])
      return

    this.frameCtxArray[0].clearRect(0, 0, c2.width, c2.height)
    for (let i=c2.frameData[0].length-1; i>=0; i--) {
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
      x1: (selectRect.startX < selectRect.endX ? selectRect.startX : selectRect.endX) * self.state.editScale -0.5
      , x2: (selectRect.startX > selectRect.endX ? selectRect.startX : selectRect.endX) * self.state.editScale +0.5
      , y1: (selectRect.startY < selectRect.endY ? selectRect.startY : selectRect.endY) * self.state.editScale -0.5
      , y2: (selectRect.startY > selectRect.endY ? selectRect.startY : selectRect.endY) * self.state.editScale +0.5
    };

    this.editCtx.lineWidth = 1
    this.editCtx.strokeStyle = '#000000'
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x2, scaleRect.y1)
    drawLine(scaleRect.x2, scaleRect.y1, scaleRect.x2, scaleRect.y2)
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x1, scaleRect.y2)
    drawLine(scaleRect.x1, scaleRect.y2, scaleRect.x2, scaleRect.y2)

    let time = new Date().getMilliseconds()
    time = Math.round(time/100)
    let timeOffset = (time % 10) * 2

    this.editCtx.strokeStyle = '#ffffff'
    let width = Math.abs(scaleRect.x1 - scaleRect.x2)
    let height = Math.abs(scaleRect.y1 - scaleRect.y2)
    let dashSize = 10
    let dashCount = Math.ceil((width+dashSize-timeOffset)/(dashSize*2))
    // draw horizontal dashes
    for(let i=0; i<dashCount; i++) {
      let x = scaleRect.x1 - dashSize + timeOffset + i*dashSize*2
      let x2 = x+dashSize
      if (x < scaleRect.x1)
        x = scaleRect.x1;
      if (x2 > scaleRect.x2)
        x2 = scaleRect.x2
      drawLine(x, scaleRect.y1, x2, scaleRect.y1)
      drawLine(x, scaleRect.y2, x2, scaleRect.y2)
    }

    dashCount = Math.ceil((height+dashSize-timeOffset)/(dashSize*2))
    // draw vertical dashes
    for (let i=0; i<dashCount; i++) {
      let y = scaleRect.y1 - dashSize + timeOffset + i*dashSize*2
      let y2 = y+dashSize
      if (y < scaleRect.y1)
        y = scaleRect.y1
      if (y2 > scaleRect.y2)
        y2 = scaleRect.y2
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

  _setImageData4BytesFromRGBA(d, c)
  {
    d[0] = c.r ; d[1] = c.g ; d[2] = c.b ; d[3] = c.a * 255
  }

  collateDrawingToolEnv(event)  // used to gather current useful state for the Tools and passed to them in most callbacks
  {
    let asset = this.props.asset
    let c2    = asset.content2
    let pCtx  = this.previewCtxArray[this.state.selectedLayerIdx]

    let pCtxImageData1x1 = this.previewCtxImageData1x1Array[this.state.selectedLayerIdx]
    var self = this

    let retval = {
      x: Math.floor(event.offsetX / this.state.editScale),
      y: Math.floor(event.offsetY / this.state.editScale),

      width:  c2.width,
      height: c2.height,
      scale:  this.state.editScale,
      event:  event,

      chosenColor: this.state.selectedColors['fg'],

      previewCtx:             pCtx,
      previewCtxImageData1x1: pCtxImageData1x1,
      editCtx:                this.editCtx,
      editCtxImageData1x1:    this.editCtxImageData1x1,

      // setPreviewPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   It SETS rather than draws-with-alpha-blending
      setPreviewPixelsAt: function (x, y, w=1, h=1)
      {
        // Set Pixels on the Preview context ONLY
        self._setImageData4BytesFromRGBA(retval.previewCtxImageData1x1.data, retval.chosenColor.rgb)
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < h; j++)
            retval.previewCtx.putImageData(retval.previewCtxImageData1x1, Math.round(x + i), Math.round(y + j))
        }
      },

      // setPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   (a) It SETS rather than draws-with-alpha-blending
      //   (b) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is faster than a ClearRect+FillRect in many cases.
      setPixelsAt: function (x, y, w=1, h=1)
      {
        // First, set Pixels on the Preview context
        retval.setPreviewPixelsAt(x, y, w, h)

        // Next, set Pixels (zoomed) to the Edit context
        self._setImageData4BytesFromRGBA(retval.editCtxImageData1x1.data,    retval.chosenColor.rgb)
        for (let i = 0; i < (w * retval.scale); i++) {
          for (let j = 0; j < (h * retval.scale); j++)
            retval.editCtx.putImageData(retval.editCtxImageData1x1, (x * retval.scale) + i, (y * retval.scale) + j)
        }
      },

      saveSelectRect: function(startX, startY, endX, endY) {
        if (startX > endX)
          [startX, endX] = [endX, startX]
        if (startY > endY)
          [startY, endY] = [endY, startY]
        self.setState({
          selectRect: {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY
          }
        })
      },

      getPasteCanvas: function() {
        return self.state.pasteCanvas
      },

      unselect: function() {
        self.setState( { selectRect: null } )
        self.updateEditCanvasFromSelectedPreviewCanvas()
      },

      showDimensions: function(width, height) {
        self.setState({ selectDimensions: { width: width, height: height} })
      },

      setPrevTool: function(){
        if(self.prevToolIdx != null)
          self.setState({ toolChosen: Tools[self.prevToolIdx] })
      },

      // clearPixelsAt() Like CanvasRenderingContext2D.clearRect, but
      //   (a) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is more convenient than a ClearRect+FillRect in many cases.
      clearPixelsAt: function (x, y, w=1, h=1) {
        let s = retval.scale
        retval.previewCtx.clearRect(x, y, w, h)
        retval.editCtx.clearRect(x*s, y*s, w*s, h*s)
      },

      setColorRGBA(r, g, b, aByte) {
        self.handleColorChangeComplete('fg', { rgb: { r:r, g:g, b:b, a:(aByte/256)}})
      },

      updateEditCanvasFromSelectedPreviewCanvas: self.updateEditCanvasFromSelectedPreviewCanvas.bind(self)
    }

    return retval
  }


  //
  // CUT/COPY/PASTE    -  Note that there is also some special support in collateDrawingToolEnv()
  //

  toolCutSelected()
  {
    if (!this.state.selectRect)
      return

    this.toolCopySelected()
    let ctx = this.previewCtxArray[this.state.selectedLayerIdx]
    let r = this.state.selectRect
    let width = Math.abs(r.startX - r.endX)
    let height = Math.abs(r.startY - r.endY)
    ctx.clearRect(r.startX , r.startY, width, height)
    this.handleSave("Cut selected area")
  }

  toolCopySelected()
  {
    if (!this.state.selectRect)
      return

    let x = this.state.selectRect.startX
    let y = this.state.selectRect.startY
    let width = Math.abs(this.state.selectRect.startX - this.state.selectRect.endX)
    let height = Math.abs(this.state.selectRect.startY - this.state.selectRect.endY)
    let ctx = this.previewCtxArray[this.state.selectedLayerIdx]
    let imgData = ctx.getImageData(x, y, width, height)

    let pasteCanvas = document.createElement("canvas")      // TODO: Check this gets deallocated somehow
    pasteCanvas.width = width
    pasteCanvas.height = height
    let pasteCtx = pasteCanvas.getContext("2d")
    pasteCtx.putImageData(imgData, 0, 0)
    this.setState({ pasteCanvas: pasteCanvas })
  }

  findToolByLabelString(labelString)
  {
    let tool = null

    // manually select paste tool
    for (var key in Tools) {
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
    if (i < this.zoomLevels.length-1) {
      recentMarker = null       // Since we now want to reload data for our new EditCanvas
      this.setState({ editScale: this.zoomLevels[i+1] })
    }
  }

  zoomOut = () => {
    const i = this.zoomLevels.indexOf(this.state.editScale)
    if (i > 0) {
      recentMarker = null       // Since we now want to reload data for our new EditCanvas
      this.setState({ editScale: this.zoomLevels[i-1] })
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
  _redispatchEditCanvasMouseEventFromTouchEvent(mouseEventName, touchEvent, touch)
  {
    //console.log(touchEvent.type, touchEvent)
    const mouseEvent = new MouseEvent(mouseEventName, !touch ? {} : {
      clientX:  touch.clientX,    // Can be undefined for touchend/touchcancel
      clientY:  touch.clientY,    // Can be undefined for touchend/touchcancel
      altKey:   touch.altKey,
      metaKey:  touch.metaKey,
      ctrlKey:  touch.ctrlKey,
      shiftKey: touch.shiftKey
    })
    this.editCanvas.dispatchEvent(mouseEvent)
    touchEvent.preventDefault()
  }

  handleTouchStart(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent("mousedown", touchEvent, event.touches[0])
  }

  handleTouchMove(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent("mousemove", touchEvent, event.touches[0])
  }

  handleTouchEnd(touchEvent) {
    this._redispatchEditCanvasMouseEventFromTouchEvent("mouseup", touchEvent, event.changedTouches[0])
  }

  handleTouchCancel(touchEvent) {
    this.handleTouchEnd(touchEvent)   // Idk if we would do something different in future
  }

  //
  // MOUSE EVENTS (on Edit Canvas)
  //

  // handleMouseWheel is an alias for zoom
  handleMouseWheel(event)
  {
    // We only handle alt/shift/ctrl-key. Anything else is system behavior (scrolling etc)
    // if (event.altKey === false && event.shiftKey === false && event.ctrlKey === false && this.state.scrollMode == "Normal")
    //   return

    event.preventDefault()      // No default scroll behavior in these cases

    let wd = event.deltaY       // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    if (Math.abs(wd) >= 1) {
      // if paste tool then use ctrl/alt/shift for resizing, rotating, flipping
      if (this.state.toolChosen !== null && this.state.toolChosen.label === "Paste")
        this.state.toolChosen.handleMouseWheel(this.collateDrawingToolEnv(event), wd, this.state.scrollMode)
      else {
        if(event.altKey || event.ctrlKey) {                                  // ???+Wheel is NextFrame/PrevFrame
          let f = this.state.selectedFrameIdx
          if (wd < 0 && f > 0)
            this.handleSelectFrame(f - 1)
          else if (wd > 0 && f + 1 < this.frameCanvasArray.length)  // aka c2.frameNames.length
            this.handleSelectFrame(f + 1)
        }
        // zoom with mouse wheel
        // no Shift button as it was before
        // because users are clicking zoom button way too often (from hotjar heatmaps)
        else {
          if (wd > 0)
            this.zoomOut()
          else if (wd < 0)
            this.zoomIn()
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

    // console.log(event.which)
    if (event.which && event.which == 3) {
      const moveTool = this.findToolByLabelString('Move')
      this.state.toolChosen = moveTool
      event.preventDefault()
    }

    if (this.state.toolChosen === null) {
      this.setStatusBarWarning("Choose a drawing tool such as Pen")
      return
    }

    if (this.state.toolChosen.changesImage && !this.props.canEdit)
    {
      this.setStatusBarWarning("You do not have permission to edit this image")
      this.props.editDeniedReminder()
      return
    }

    if (this.state.toolChosen.changesImage)
      this.doSaveStateForUndo(this.state.toolChosen.label)   // So that tools like eyedropper don't save and need undo

    if (this.state.toolChosen.supportsDrag === true)
      this.setState({ toolActive: true })

    this.state.toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))

    if (this.state.toolChosen.supportsDrag === false && this.state.toolChosen.changesImage === true)
      this.handleSave(`Drawing`, false, false)   // This is a one-shot tool, so save its results now
  }

  handleContextMenu(event) {
    event.preventDefault()
  }


  // Might be better to have two event handlers, each with a clearer role?
  // This does two things: (1) Update SB, and (2) Call on to Tool handler
  handleMouseMove(event)
  {
    const { editScale, selectedLayerIdx, toolActive, toolChosen } = this.state

    // 1. Update statusBar
    const x = Math.floor(event.offsetX / editScale)
    const y = Math.floor(event.offsetY / editScale)
    const pCtx  = this.previewCtxArray[selectedLayerIdx]
    const imageDataAtMouse = pCtx.getImageData(x, y, 1, 1)
    const d = imageDataAtMouse.data

    const colorCSSstring = `#${this.RGBToHex(...d)}`
    this.setStatusBarInfo(`Mouse at ${x},${y}`, `${colorCSSstring}&nbsp;&nbsp;Alpha=${d[3]}`, colorCSSstring)

    // 2. Tool api handoff
    if (toolChosen !== null && ( toolActive === true || toolChosen.hasHover === true))
      toolChosen.handleMouseMove(this.collateDrawingToolEnv(event))
  }


  handleMouseUp(event)
  {
    const { toolActive, toolChosen } = this.state

    if (toolChosen !== null && toolActive === true) {
      toolChosen.handleMouseUp(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true)
        this.handleSave(`Drawing`, false, false)
      this.setState({ toolActive: false })
    }
  }

  handleMouseLeave(event)
  {
    const { toolActive, toolChosen } = this.state

    this.setStatusBarInfo()
    if (toolChosen !== null && toolActive === true && !settings_ignoreMouseLeave) {
      toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true)
        this.handleSave(`Drawing`, false, false)
      this.setState({ toolActive: false })
    }
  }

  handleMouseEnter(event)
  {
    const { toolActive, toolChosen } = this.state
    this.setStatusBarInfo()
    if (toolChosen !== null && toolActive === true && settings_ignoreMouseLeave && ((event.buttons & 1) === 0)) {
      toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true)
        this.handleSave(`Drawing`, false, false)
      this.setState({ toolActive: false })
    }
  }

  //
  // CHANGE TILE WIDTH/HEIGHT
  //

  handleImageResize = (newWidth, newHeight, scalingMode = 'None') => {
    if (!this.hasPermission())
      return

    const c2 = this.props.asset.content2
    this.doSaveStateForUndo(`Resize from ${c2.width}x${c2.height} to ${newWidth}x${newHeight} using scaling mode '${scalingMode}`)
    c2.width = newWidth
    c2.height = newHeight
    this.handleSave("Change canvas size")
  }

  hasPermission = () => {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return false
    }
    return true
  }


  setStatusBarWarning(warningText = "")
  {
    const sb = this._statusBar

    sb.colorAtText.html("")
    sb.colorAtIcon.css( { color: "rgba(0,0,0,0)" } )
    sb.mouseAtText.text(warningText)
    sb.outer.css( {visibility: "visible"} )
  }


  setStatusBarInfo(mouseAtText = "", colorAtText = "", colorCSSstring = "rgba(0,0,0,0)")
  {
    const sb = this._statusBar

    if (mouseAtText === '')
      sb.outer.css( {visibility: "hidden"} )
    else {
      const layerIdx = this.state.selectedLayerIdx
      const layerParam = this.props.asset.content2.layerParams[layerIdx]
      const layerName = layerParam.name && layerParam.name.length > 0 ? layerParam.name : `Unnamed layer #${layerIdx+1}`
      const layerMsg = ` of \"${layerName}\"`
                    + (layerParam.isLocked ? " (locked)": "")
                    + (layerParam.isHidden ? " (hidden)" : "")

      sb.colorAtIcon.css( { color: colorCSSstring } )
      sb.mouseAtText.text(mouseAtText + layerMsg)
      sb.colorAtText.html(colorAtText)
      sb.outer.css( {visibility: "visible"} )
    }
  }

  RGBToHex(r,g,b) {
    var bin = r << 16 | g << 8 | b
    return (function(h) {
      return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toLowerCase())
  }

  // Tool selection action
  handleToolSelected(tool)
  {
    // if not selectable tool then trigger action here
    if (tool.simpleTool) {
      this.setState({ toolChosen: null })
      this.setStatusBarWarning('')
      this[tool.name]()
      return
    }

    // special case for select tool - toggleable button which also clears selected area
    if (tool.label === "Select" && this.state.selectRect) {
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

  handleColorChangeComplete(colortype, chosenColor)
  {
    if (!chosenColor.hex)
      chosenColor.hex = `#${this.RGBToHex(chosenColor.rgb.r, chosenColor.rgb.g, chosenColor.rgb.b)}`

    if (chosenColor.hex.indexOf('NaN') === -1)
    {
      // It is a valid color. Remember it - this is because react-color Color Picker returns screwy colors if it's container is hidden
      this._recentValidColor = _.clone(chosenColor)
    }
    else
    {
      // It is an invalid color. Ignore this result and use the last good color we had. or red if no last good color
      chosenColor = this._recentValidColor ||  { hex: "#800000", rgb: { r: 128, g: 0, b:0, a: 1 } }
    }
    // See http://casesandberg.github.io/react-color/#api-onChangeComplete
    this.state.selectedColors[colortype] = chosenColor
    this.setState( { selectedColors: this.state.selectedColors } )      // Won't trigger redraw because React does shallow compare? Fast but not the 'react-way'

    _selectedColors[colortype] = _.cloneDeep(chosenColor)

    // So we have to fix up UI stuff. This is a bit of a hack for perf. See statusBarInfo()
    $('.mgbColorPickerIcon.icon').css( { color: chosenColor.hex})
  }


// Add/Select/Remove etc animation frames

  handleSelectFrame(frameIndex)
  {
    this.doSnapshotActivity(frameIndex)
    recentMarker = null       // Since we now want to reload data for our new EditCanvas
    this.setState( { selectedFrameIdx: frameIndex}  )

    // for new frame clears preview canvases and update edit canvas
    let c2 = this.props.asset.content2
    if (c2.frameData[frameIndex].length === 0) {
      for (let i=0; i<this.previewCtxArray.length; i++)
        this.previewCtxArray[i].clearRect(0, 0, c2.width, c2.height)
      this.updateEditCanvasFromSelectedPreviewCanvas()
    }
  }

  handleSelectLayer(layerIndex) {
    // this.doSnapshotActivity(layerIndex)
    this.setState( { selectedLayerIdx: layerIndex } )
  }


  //
  // SAVE and UNDO/REDO
  //


  initDefaultUndoStack()
  {
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

    if (this.hasOwnProperty("undoSteps") === false)
      this.undoSteps = []

    if (this.hasOwnProperty("redoSteps") === false)
      this.redoSteps = []
  }

  doMakeUndoStackEntry(changeInfoString)
  {
    return {
      when: Date.now(),
      byUserName: "usernameTODO",        // TODO
      byUserContext: "someMachineTODO",  // TODO
      changeInfo: changeInfoString,
      savedContent2: $.extend(true, {}, this.props.asset.content2)
    }
  }

  doTrimUndoStack()
  {
    let u = this.undoSteps
    if (u.length > 20)
      u.shift()         // Remove 0th element (which is the oldest)
  }

  doSaveStateForUndo(changeInfoString)
  {
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
  doSnapshotActivity(frameIdxOverride)
  {
    let passiveAction = {
      selectedFrameIdx: frameIdxOverride ? frameIdxOverride : this.state.selectedFrameIdx
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  toolHandleUndo()
  {
    if (this.undoSteps.length > 0)
    {
      let zombie = this.undoSteps.pop()
      let c2 = zombie.savedContent2
      // Make sure we aren't on a frame/layer that doesn't exist
      if (this.state.selectedFrameIdx > c2.frameNames.length-1 && c2.frameNames.length > 0)
        this.setState({ selectedFrameIdx: c2.frameNames.length-1 })
      if (this.state.selectedLayerIdx > c2.layerParams.length-1 && c2.layerParams.length > 0)
        this.setState({ selectedLayerIdx: c2.layerParams.length-1 })

      this.doSaveStateForRedo("Redo changes")
      // Now force this into the DB and that will cause a re-render
      this.saveChangedContent2(c2, c2.frameData[0][0], "Undo changes", true)        // Allow Backwash from database to replace current viewed state

      if(this.prevToolIdx != null)
        this.setState({ toolChosen: Tools[this.prevToolIdx] })
    }
  }

  toolHandleRedo() {
    if (this.redoSteps.length > 0)
    {
      let zombie = this.redoSteps.pop()
      let c2 = zombie.savedContent2
      // Make sure we aren't on a frame/layer that doesn't exist
      if (this.state.selectedFrameIdx > c2.frameNames.length-1 && c2.frameNames.length > 0)
        this.setState({ selectedFrameIdx: c2.frameNames.length-1 })
      if (this.state.selectedLayerIdx > c2.layerParams.length-1 && c2.layerParams.length > 0)
        this.setState({ selectedLayerIdx: c2.layerParams.length-1 })

      this.doSaveStateForUndo("Undo changes")
      // Now force this into the DB and that will cause a re-render
      this.saveChangedContent2(c2, c2.frameData[0][0], "Redo changes", true)        // Allow Backwash from database to replace current viewed state

      if(this.prevToolIdx != null)
        this.setState({ toolChosen: Tools[this.prevToolIdx] })
    }
  }

  toolEraseFrame(){
    if(confirm('Do you really want to erase whole frame?')){
      let w = this.props.asset.content2.width
      let h = this.props.asset.content2.height

      this.previewCtxArray.map( (ctx) => {
        ctx.clearRect(0, 0, w, h)
      })
      this.handleSave("Erase frame")
    }
  }


  handleSave(changeText="change graphic", dontSaveFrameData = false, allowBackwash = true)    // TODO(DGOLDS): Maybe _.throttle() this?
  {
    if (!this.props.canEdit)
    {
      this.props.editDeniedReminder()
      return
    }

    // Make really sure we have the frameCanvasArrays up-to-date with the latest edits from all layers
    if (this.previewCanvasArray && !dontSaveFrameData)
      this.updateEditCanvasFromSelectedPreviewCanvas()

    const asset = this.props.asset
    let c2 = asset.content2

    if (this.previewCanvasArray && !dontSaveFrameData)
    { // hack for automatic checking and saving old assets to new
        // dontSaveFrameData - hack when deleting/moving frames (previewCanvases are not yet updated)
      let layerCount = this.previewCanvasArray.length  // New layer is not yet added, so we don't use c2.layerParams.length
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
    }
    else
      console.log('Did not create tileset')

    this.setThumbnail(asset)

    this.saveChangedContent2(c2, asset.thumbnail, changeText, allowBackwash)
  }

  createTileset() {
    if (!this.frameCanvasArray || this.frameCanvasArray.length == 0)
      return null

    let c2   = this.props.asset.content2
    let cols = Math.ceil(Math.sqrt(c2.frameNames.length))
    let rows = Math.ceil(c2.frameNames.length/cols)
    let canvas = document.createElement("canvas")
    // let canvas = document.getElementById("tilesetCanvas")
    canvas.width = c2.width * cols
    canvas.height = c2.height * rows
    let ctx = canvas.getContext('2d')
    for (let row=0; row<rows; row++) {
      for (let col=0; col<cols; col++) {
        let i = row*cols + col
        if (this.frameCanvasArray[i])
          ctx.drawImage(this.frameCanvasArray[i], col*c2.width, row*c2.height);
      }
    }

    return {
      image: canvas.toDataURL('image/png'),
      cols: cols,
      rows: rows
    }
  }


  saveChangedContent2(c2, thumbnail, changeText, allowBackwash = false)
  {
    // this will prevent small sync gap between parent and component:
    // noticeable: undo -> draw a line ( part of the line will be truncated )
    this.props.asset.content2 = c2

    recentMarker = allowBackwash ? null : "_graphic_" + Random.id()   // http://docs.meteor.com/packages/random.html
    c2.changeMarker = recentMarker
    //console.log("Backwash marker = " + recentMarker)
    this.props.handleContentChange(c2, thumbnail, changeText)
    this.doSnapshotActivity()
  }

  setThumbnail (asset) {
    let origCanvas
    if (this.thumbCanvas) {
      // origCanvas = this.thumbCanvas.toDataURL('image/png')
      origCanvas = this.thumbCanvas
      this.thumbCanvas = null
    }
    else if (this.frameCanvasArray && this.frameCanvasArray[0]) {
      // origCanvas = this.frameCanvasArray[0].toDataURL('image/png')
      origCanvas = this.frameCanvasArray[0]
    }

    if (origCanvas) {
      const tmpCanvas = document.createElement("canvas")
      const tmpCtx = tmpCanvas.getContext('2d')
      tmpCanvas.width = _.clamp(origCanvas.width, 32, THUMBNAIL_WIDTH)
      tmpCanvas.height = _.clamp(origCanvas.height, 32, THUMBNAIL_HEIGHT)
      const wRatio = tmpCanvas.width / origCanvas.width
      const hRatio = tmpCanvas.height / origCanvas.height
      let ratio = wRatio < hRatio ? wRatio : hRatio
      if (wRatio >= 1 && hRatio >= 1)
        ratio = 1
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
    let dragSrcEl = e.target

    if (idx === -1)                         // The Edit Window does this
      idx = this.state.selectedLayerIdx

    e.dataTransfer.effectAllowed = 'copy'   // This must match what is in handleDragOverPreview()
    e.dataTransfer.setData('mgb/image', this.previewCanvasArray[idx].toDataURL('image/png'))
  }


  handleDragOverPreview(event)
  {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'   // Explicitly show this is a copy.
  }

  /**
   * @param {number} idx - layer index, when -1 automatically selects active layer
   * @param {event} - drop event
   * */
  handleDropPreview(idx, event)
  {
    event.stopPropagation()
    event.preventDefault()

    if (!this.props.canEdit)
    {
      this.props.editDeniedReminder()
      return
    }

    var self = this

    if (idx === -1)                         // The Edit Window does this
      idx = this.state.selectedLayerIdx

    // Note that idx === -2 means the MgbResizerHost control.
    // In thise case we must ONLY resize the graphics, not actually import the graphic.

    let mgbImageDataUri =  event.dataTransfer.getData('mgb/image')
    if (mgbImageDataUri !== undefined && mgbImageDataUri !== null && mgbImageDataUri.length > 0)
    {
      // SPECIAL CASE - DRAG FROM us to us   i.e. Frame-to-frame image drag within MGB (or across MGB windows)
      var img = new Image
      img.onload = function(e) {
        // Seems to have loaded ok..
        self.doSaveStateForUndo(`Drag+Drop Frame to Frame #`+idx.toString())
        if (idx === -2)     // Special case - MGB RESIZER CONTROL... So just resize to that imported image
        {
          // Currently unreachable since I took this off of the resize control
          self.handleImageResize(Math.min(img.width, MAX_BITMAP_WIDTH), Math.min(img.height, MAX_BITMAP_HEIGHT) )
        }
        else
        {
          let w = self.props.asset.content2.width
          let h = self.props.asset.content2.height
          self.previewCtxArray[idx].clearRect(0,0,w,h)
          self.previewCtxArray[idx].drawImage(e.target, 0, 0)   // add w, h to scale it.
          if (idx === self.state.selectedLayerIdx)
            self.updateEditCanvasFromSelectedPreviewCanvas()
          self.handleSave(`Copy frame to frame #${idx+1}`)
        }
      }
      img.src = mgbImageDataUri    // is the data URL because called
      return
    }

    var imageUrl = event.dataTransfer.getData('URL')
    if (imageUrl) {
      this.pasteImage(imageUrl, idx)
      return
    }

    var imgData = DragNDropHelper.getDataFromEvent(event)
    if (imgData && imgData.link) {
      if(!imgData.asset || imgData.asset.kind === 'graphic')
        this.pasteImage(imgData.link, idx)
      else{
        // use thumbnail instead
        const linkToImage = makeExpireThumbnailLink(imgData.asset)
        this.pasteImage(linkToImage, idx)
      }
      return
    }

    let files = event.dataTransfer.files     // FileList object.
    if (files.length > 0)
    {
      var reader = new FileReader()
      reader.onload = (event) => {
        let theUrl = event.target.result
        if (idx === -2)     // Special case - MGB RESIZER CONTROL... So just resize to that imported image
        {
          var img = new Image
          img.onload = () => {
            self.handleImageResize(Math.min(img.width, MAX_BITMAP_WIDTH), Math.min(img.height, MAX_BITMAP_HEIGHT))
          }
          img.src = theUrl
        }
        else
          this.pasteImage(theUrl, idx)
      }
      reader.readAsDataURL(files[0])
    }
  }

  // <- End of drag-and-drop stuff

  pasteImage(url, idx = this.state.selectedLayerIdx)
  {
    const img = new Image
    img.crossOrigin = "anonymous"
    img.onload = e => {
      // The DataURI seems to have loaded ok now as an Image, so process what to do with it
      this.doSaveStateForUndo(`Drag+Drop Image to Frame #`+idx.toString())

      const w = this.props.asset.content2.width
      const h = this.props.asset.content2.height
      this.previewCtxArray[idx].clearRect(0, 0, w, h)

      if (img.width > w || img.height > h) {
        const aspect =   (w * img.height) / (h * img.width)
        if (aspect > 1){
          const nHeight = h / aspect
          this.previewCtxArray[idx].drawImage(e.target, 0, (h - nHeight) * 0.5, w, nHeight)  // add w, h to scale it.
        }
        else{
          const nWidth = w / aspect
          this.previewCtxArray[idx].drawImage(e.target, (w - nWidth) * 0.5, 0, nWidth, h)  // add w, h to scale it.
        }
      }
      else
        this.previewCtxArray[idx].drawImage(e.target, 0, 0)  // add w, h to scale it.

      if (idx === this.state.selectedLayerIdx)
        this.updateEditCanvasFromSelectedPreviewCanvas()
      this.handleSave(`Drag external file to frame #${idx+1}`)
    }
    img.src = url  // is the data URL because called
  }


  toolOpenImportPopup() {
    const importPopup = ReactDOM.findDOMNode(this.refs.graphicImportPopup)
    $(importPopup).modal('show')
  }


  // This is passed to the <GraphicImport> Control so the tiles can be imported
  importTileset = (tileWidth, tileHeight, imgDataArr, thumbCanvas) => {
    let c2 = this.props.asset.content2
    this.thumbCanvas = thumbCanvas

    c2.width = tileWidth
    c2.height = tileHeight
    c2.frameNames = []
    c2.frameData = []
    c2.spriteData = []
    // c2.fps = 10;
    for (let i=0; i<imgDataArr.length; i++) {
      c2.frameNames[i] = "Frame "+i
      c2.frameData[i] = []
      c2.frameData[i][0] = imgDataArr[i]
      c2.spriteData[i] =  imgDataArr[i]
    }
    c2.layerParams = [ {name: "Layer 1", isHidden: false, isLocked: false} ]
    c2.animations = []

    this.handleSave("Import tileset", true)
    let importPopup = ReactDOM.findDOMNode(this.refs.graphicImportPopup)
    $(importPopup).modal('hide')
    this.setState({ editScale: this.getDefaultScale() })

    // hack, but because of whole EditGraphic architecture
    // we need to create tileset, but frame canvases are not yet drawn
    // they are drawn only after content2 travels to server and back
    c2.doResaveTileset = true
  }

  //
  // TOOLBAR
  //

  // This is used by render() so is frequently called.
  // It can therefore have values that are based on this, this.state, this.props etc
  generateToolbarActions() {
    const simpleTools =
    {
      Undo: {
        label: "Undo",                    // Label shown
        name: "toolHandleUndo",           // function name in this class
        tooltip: "Undo",                  // Tooltip to show on Hover etc
        iconText: this.undoSteps.length,  // Text that may (optionally) be shown with the icon
        disabled: !this.undoSteps.length, // True if this is to be shown as disabled
        icon: "undo icon",                // Semantic-UI icon CSS class
        shortcut: 'Ctrl+Z',               // Keyboard shortcut
        level: 2,                         // Show this at this featureLevel or higher
        simpleTool: true                  // this tool is not selectable, only action is on tool click
      },
      Redo: {
        label: "Redo",
        name: "toolHandleRedo",
        tooltip: "Redo",
        iconText: this.redoSteps.length,
        disabled: !this.redoSteps.length,
        icon: "undo flip icon",
        shortcut: 'Ctrl+Shift+Z',
        level: 2,
        simpleTool: true
      },
      EraseFrame: {
        label: "Erase Frame",
        name: "toolEraseFrame",
        tooltip: "Erase Frame",
        disabled: false,
        icon: "remove circle outline icon",
        shortcut: 'Ctrl+Shift+E',
        level: 2,
        simpleTool: true
      },
      Cut: {
        label: "Cut",
        name: "toolCutSelected",
        tooltip: "Cut",
        disabled: !this.state.selectRect,
        icon: "cut icon",
        shortcut: 'Ctrl+X',
        level: 6,
        simpleTool: true
      },
      Copy: {
        label: "Copy",
        name: "toolCopySelected",
        tooltip: "Copy",
        disabled: !this.state.selectRect,
        icon: "copy icon",
        shortcut: 'Ctrl+C',
        level: 6,
        simpleTool: true
      },
      Import: {
        label: "Import",
        name: "toolOpenImportPopup",
        tooltip: "Import",
        disabled: false,
        icon: "add square icon",
        shortcut: 'Ctrl+I',
        level: 3,
        simpleTool: true
      }
    }

    for (let i=0; i<Tools.length; i++) {
      let toolLabel = Tools[i].label
      if (simpleTools[toolLabel])
        Tools[i] = simpleTools[toolLabel]
      // special case for disabling paste tool when there is no pasteCanvas
      if (toolLabel === "Paste")
        Tools[i].disabled = !this.state.pasteCanvas

      // hide unnecssary tools to make space for art tutorials
      Tools[i].hideTool = ((this.props.asset.skillPath && _.startsWith( this.props.asset.skillPath, 'art' )) && ["Cut", "Copy", "Paste", "Import"].indexOf(toolLabel) !== -1)
    }

    const actions = {}
    const config = {
      // level: 1,       // default level -- This is now in expectedToolbars.getDefaultLevel

      // vertical: true, // Nope, we want to have horizontal for now

      buttons: []
    }

    _.each(Tools, (tool) => {
      if (tool.hideTool === true) return

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
        component: tool.component
      })
      actions[tool.name] = this.handleToolSelected.bind(this, tool)
    })

    return { actions, config }
  }

  setGrid = (img) => {
    this.gridImg = img
  }

  drawGrid() {
    const zoom = this.state.editScale
    if (zoom >= MIN_ZOOM_FOR_GRIDLINES && this.gridImg && this.state.showGrid) {
      const c2 = this.props.asset.content2
      for(let col=0; col<c2.width; col++){
        for(let row=0; row<c2.height; row++){
          this.editCtx.drawImage(this.gridImg, zoom*col, zoom*row)
        }
      }
    }
  }

  setScrollMode(mode) {
    this.setState({ scrollMode: mode})
  }

  setPrevToolIdx(toolIdx){
    this.prevToolIdx = toolIdx
  }

  toggleMiniMap = () => {
    this.setState({ isMiniMap: !this.state.isMiniMap })
  }

  render() {
    this.initDefaultContent2()      // The NewAsset code is lazy, so add base content here
    this.initDefaultUndoStack()

    const { asset, currUser } = this.props
    const c2 = asset.content2
    const zoom = this.state.editScale
    const { actions, config } = this.generateToolbarActions()

    let imgEditorSty = {}
    if (this.state.toolChosen)
      imgEditorSty.cursor = this.state.toolChosen.editCursor

    const scrollModes = ["Normal", "Rotate", "Scale", "Flip"]

    const isSkillTutorialGraphic = asset && asset.skillPath && _.startsWith( asset.skillPath, 'art' )
    const column1Width = isSkillTutorialGraphic ? 8 : 16

    // Make element
    return (
      <Grid>
        {/***  Central Column is for Edit and other wide stuff  ***/}
        <Grid.Column width={column1Width}>
          <div className="row" style={{marginBottom: "6px"}}>
            <Popup
              on='hover'
              positioning='bottom left'
              hoverable
              hideOnScroll
              mouseEnterDelay={250}
              id="mgbjr-EditGraphic-colorPicker-body"
              trigger={(
                <Button
                  size='small'
                  id='mgbjr-EditGraphic-colorPicker'
                  style={{ backgroundColor: this.state.selectedColors['fg'].hex }}
                  icon={{ name: 'block layout', style: { color: this.state.selectedColors['fg'].hex }}}
                />
              )}
            >
              <Header>Color Picker</Header>
              <ReactColor
                  type="sketch"
                  onChangeComplete={this.handleColorChangeComplete.bind(this, 'fg')}
                  color={this.state.selectedColors['fg'].rgb}
              />
            </Popup>

            {
              !asset.skillPath &&
              <ResizeImagePopup
                  initialWidth={c2.width}
                  initialHeight={c2.height}
                  maxWidth={MAX_BITMAP_WIDTH}
                  maxHeight={MAX_BITMAP_HEIGHT}
                  scalingOptions={['None']}
                  handleResize={this.handleImageResize} />
            }

            {/* !!!! span instead of buttons becasue firefox don't understand miltiple actions inside Button:*/}
            {/* <button> */}
            {/*   <span onClick...></span> */ }
            {/*   <span onClick...></span> */ }
            {/* </button> */ }

            {/*<Popup
                trigger={ (
                  <span id="mgbjr-editGraphic-changeCanvasZoom">
                    <span style={{ cursor: 'pointer' }} onClick={this.zoomOut}>
                      <Icon name='zoom out'/>
                    </span>
                    {zoom}x
                    <span>&nbsp;&nbsp;</span>
                    <span style={{ cursor: 'pointer' }} onClick={this.zoomIn}>
                      <Icon name='zoom in'/>
                    </span>
                  </span>
                )}
                on='hover'
                header='Zoom'
                mouseEnterDelay={250}
                content="Click here or SHIFT+mousewheel over edit area to change zoom level. Use mousewheel to scroll if the zoom is too large"
                size='tiny'
                positioning='bottom left'/>*/}

            <Popup
                trigger={ (
                  <span id="mgbjr-editGraphic-changeCanvasZoom" style={{ cursor: 'pointer' }} onClick={this.zoomIn} className="ui button small zoomIcon noMargin">
                    <Icon name='zoom in' className='noMargin' />
                  </span>
                )}
                on='hover'
                header='Zoom In'
                mouseEnterDelay={250}
                content="Click here or SHIFT+mousewheel over edit area to change zoom level. Use mousewheel to scroll if the zoom is too large"
                size='tiny'
                positioning='bottom left'/>

            <Popup
                trigger={ (
                  <span style={{ cursor: 'pointer' }} onClick={this.resetZoom} className="ui button small zoomIcon noMargin">
                    {zoom}x
                  </span>
                )}
                on='hover'
                header='Reset Zoom'
                mouseEnterDelay={250}
                content="Click here to reset zoom"
                size='tiny'
                positioning='bottom left'/>


            <Popup
                trigger={ (
                  <span style={{ cursor: 'pointer' }} onClick={this.zoomOut} className="ui button small zoomIcon">
                    <Icon name='zoom out' className='noMargin' />
                  </span>
                )}
                on='hover'
                header='Zoom Out'
                mouseEnterDelay={250}
                content="Click here or SHIFT+mousewheel over edit area to change zoom level. Use mousewheel to scroll if the zoom is too large"
                size='tiny'
                positioning='bottom left'/>

      
            <Popup
              trigger={<Button primary={this.state.isMiniMap} size='small' icon='map' content={'Minimap'}  onClick={this.toggleMiniMap} />}
              content="Open minimap to see graphic asset in 1x scale"
              size='small'
              mouseEnterDelay={250}
              positioning='bottom left'/>

            <Popup
                trigger={ (
                  <span className="ui button small" id="mgbjr-editGraphic-toggleGrid">
                    Grid&nbsp;
                    <span style={{ cursor: 'pointer' }} onClick={this.handleToggleGrid}>
                      <Icon name='grid layout' color={this.state.showGrid ? null : 'grey'}/>
                    </span>
                    <span>&nbsp;</span>
                    <span style={{ cursor: 'pointer' }} onClick={this.handleToggleCheckeredBg}>
                      <Icon name='clone' color={this.state.showCheckeredBg ? null : 'grey'}/>
                    </span>
                  </span>
                )}
                on='hover'
                mouseEnterDelay={250}
                header='Grid Options'
                content={(
                  <div>
                    <p>Show/Hide Gridlines (at Zoom >= {MIN_ZOOM_FOR_GRIDLINES}x)</p>
                    <p>Show/Hide background transparency checkerboard helper'</p>
                  </div>
                  )}
                size='tiny'
                positioning='bottom left'/>

            <Popup
              trigger={<Button size='small' icon='spinner' content={`Frame #${1+this.state.selectedFrameIdx} of ${c2.frameNames.length}`}/>}
              content="Use ALT+mousewheel over Edit area to change current edited frame. You can also upload image files by dragging them to the frame previews or to the drawing area"
              size='small'
              mouseEnterDelay={250}
              positioning='bottom left'/>
            </div>
          <Grid.Row style={{marginBottom: "6px"}}>
            {<Toolbar
              actions={actions}
              config={config}
              name="EditGraphic"
              setPrevToolIdx={this.setPrevToolIdx.bind(this)}
            />}
          </Grid.Row>

          <div className={"ui form " + (this.state.toolChosen && this.state.toolChosen.label=="Paste" ? "" : "mgb-hidden")}>
            <div className="inline fields">
              <label>Scroll modes</label>
              {
                scrollModes.map( (mode) => (
                  <div key={mode} className="field">
                  <div className="ui radio checkbox" >
                    <input type="radio" name={mode}
                    checked={mode == this.state.scrollMode ? "checked" : ""}
                    onChange={this.setScrollMode.bind(this, mode)} />
                    <label>{mode}</label>
                  </div>
                  </div>

                ))
              }
            </div>
          </div>

          {/*** Drawing Canvas ***/}
          <Grid.Row style={{"minHeight": "92px"}}>
            <Grid.Column style={{height: '100%'}} width={10}>
              <div style={{ "overflow": "auto", /*"maxWidth": "600px",*/ "maxHeight": editCanvasMaxHeight+"px"}}>
                <canvas
                  ref="editCanvas"
                  style={imgEditorSty}
                  width={zoom * c2.width}
                  height={zoom * c2.height}
                  className={(
                    (this.state.showCheckeredBg ? 'mgbEditGraphicSty_checkeredBackground' : '')
                    + ' mgbEditGraphicSty_thinBorder')}
                  id="mgb_edit_graphic_main_canvas"
                  onDragOver={this.handleDragOverPreview.bind(this)}
                  onDrop={this.handleDropPreview.bind(this,-1)}>
                </canvas>
                {/*** <canvas id="tilesetCanvas"></canvas> ***/}
                <CanvasGrid
                  scale={this.state.editScale}
                  setGrid={this.setGrid}
                />

                {/*** MiniMap ***/}
                {
                  this.state.isMiniMap &&
                  <MiniMap
                    ref       = {"miniMap"}
                    width     = {c2.width}
                    height    = {c2.height}
                    toggleMiniMap       = {this.toggleMiniMap}
                    editCanvasMaxHeight = {editCanvasMaxHeight}
                  />
                }

              </div>
            </Grid.Column>
          </Grid.Row>

          {/*** Status Bar ***/}
          <div className="ui horizontal very relaxed list" ref="statusBarDiv">
            <div className="item">
              <Icon name='pointing up' />
              <div className="content" ref="statusBarMouseAtText">
                Mouse at xy
              </div>
            </div>

            <div className="item">
              <i className="square icon" ref="statusBarColorAtIcon"/>
              <div className="content" ref="statusBarColorAtText">
                Color at xy
              </div>
            </div>

          </div>

          <div className={this.state.selectRect ? "" : "mgb-hidden"}>
            width: {this.state.selectDimensions.width} &nbsp;&nbsp;&nbsp; height: {this.state.selectDimensions.height}
          </div>
        </Grid.Column>
        {/*** Art Mentor ***/}
        {isSkillTutorialGraphic &&
          <ArtTutorial
            style       =     { { backgroundColor: 'rgba(0,255,0,0.02)' } }
            isOwner     =     { currUser && currUser._id === asset.ownerId }
            active      =     { asset.skillPath ? true : false}
            skillPath   =     { asset.skillPath }
            currUser    =     { this.props.currUser }
            userSkills  =     { this.userSkills }
            assetId     =     { asset._id }
            frameData   =     { c2.frameData }
            handleSelectFrame = { frame => this.handleSelectFrame(frame) }
          />
        }

        {/*** GraphicImport ***/}
        <div className="ui modal" ref="graphicImportPopup">
          <GraphicImport
            EditGraphic={this}
            importTileset={this.importTileset}
            maxTileWidth={MAX_BITMAP_WIDTH}
            maxTileHeight={MAX_BITMAP_WIDTH}
          />
        </div>

      {/*** SpriteLayers ***/}

          <SpriteLayers
            content2={c2}
            EditGraphic={this}

            hasPermission={this.hasPermission}
            handleSave={this.handleSave.bind(this)}
            forceDraw={this.forceDraw.bind(this)}
            forceUpdate={this.forceUpdate.bind(this)}
            getFrameData={ frameId => this.frameCanvasArray[frameId].toDataURL('image/png') }
            getLayerData={ layerId => (this.previewCanvasArray[layerId].toDataURL('image/png') ) }
          />

      </Grid>
    )
  }
}

EditGraphic.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}
