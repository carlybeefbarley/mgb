import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'
import sty from  './editGraphic.css'
import ColorPicker from 'react-color'        // http://casesandberg.github.io/react-color/
import Tools from './GraphicTools'

import SpriteLayers from './Layers/SpriteLayers.js'
import GraphicImport from './GraphicImport/GraphicImport.js'

import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'
import NumberInput from '/client/imports/components/Controls/NumberInput'


// Some constants we will use
const MAX_BITMAP_WIDTH = 1024
const MAX_BITMAP_HEIGHT = 1024
const MAX_GRAPHIC_FRAMES = 64 // TODO: Pass this into Importer, and also obey it generally


// This is React, but some fast-changing items use Jquery or direct DOM manipulation,
// typically those that can change per mouse-move:
//   1. Drawing on preview+Editor canvas
//   2. Some popup handling (uses Semanticui .popup() jquery extension. Typically these have the 'hazPopup' class
//   3. Status bar has some very dynamic data like mouse position, current color, etc. See sb_* functions


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

export default class EditGraphic extends React.Component {
  // static PropTypes = {   // Note - static requires Ecmascript 7
  //   asset: PropTypes.object,
  //   handleContentChange: PropTypes.function,
  //   canEdit: PropTypes.bool
  // }

  constructor(props) {
    super(props)

    // console.log(this.props.asset.content2);

    this.doSnapshotActivity = _.throttle(this.doSnapshotActivity, 5*1000)

    this.zoomLevels = [1, 2, 4, 6, 8];

    this.state = {
      editScale:        4,        // Zoom scale of the Edit Canvas
      selectedFrameIdx: 0,
      selectedLayerIdx: 0,
      selectedColors:   {
        // as defined by http://casesandberg.github.io/react-color/#api-onChangeComplete
        // Note that the .hex value excludes the leading # so it is for example (white) 'ffffff'
        fg:    { hex: "000080", rgb: {r: 0, g: 0, b:128, a: 1} }    // Alpha = 0...1
      },
      toolActive: false,
      toolChosen: this.findToolByLabelString("Pen"),
      selectRect: null,   // if asset area is selected then value {startX, startY, endX, endY}
      pasteCanvas: null     // if object cut or copied then {x, y, width, height, imgData}
    }

    this.fixingOldAssets()

    this.onpaste = (e) => {
      "use strict";
      var items = e.clipboardData.items;
      if (items) {
        //access data directly
        for (var i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            //image
            var blob = items[i].getAsFile();
            var source = URL.createObjectURL(blob)
            this.pasteImage(source);
          }
        }
        e.preventDefault()
      }
    }

    // animframe for updating selecting rectangle animation
    this._raf = () => {
      if(this.state.selectRect) this.drawSelectRect(this.state.selectRect);
      window.requestAnimationFrame(this._raf);
    }
    this._raf()

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

    this.handleColorChangeComplete('fg', { hex: "000080", rgb: {r: 0, g: 0, b:128, a: 1} } )

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

    // Tool button initializations
    this.activateToolPopups()    
    
    this.doSnapshotActivity()

    //TODO: add only to canvas?
    window.addEventListener("paste", this.onpaste, false)
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

    if (autoFix) this.handleSave("Automatic fixing old assets")
  }


  activateToolPopups()
  {
    // See http://semantic-ui.com/modules/popup.html#/usage

    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup( { delay: {show: 250, hide: 0}} )

    // let $cp =  $a.find('.mgbColorPickerHost')
    let $cp =  $a.find('.layout.icon').parent()
    $cp.popup({
      popup: '.mgbColorPickerWidget.popup',
      lastResort: 'right top',               // https://github.com/Semantic-Org/Semantic-UI/issues/3004
      hoverable: true
    })

    // let $resizer =  $a.find('.mgbResizerHost')
    // $resizer.popup({
    //   popup: '.mgbResizer.popup',
    //   lastResort: 'right center',               // https://github.com/Semantic-Org/Semantic-UI/issues/3004
    //   hoverable: true
    // })
  }

// TODO: DGOLDS to clean this up
  initDefaultContent2() 
  {
    let asset = this.props.asset
    if (!asset.hasOwnProperty("content2") || !asset.content2.hasOwnProperty('width')) {
      asset.content2 = {
        width: 64,
        height: 32,
        fps: 10,
        layerParams: [{name:"Layer 1", isHidden: false, isLocked: false}],
        frameNames: ["Frame 1"],
        frameData: [ [ ] ],
        spriteData: [],
        animations: []
      }
    }
  }


  // React Callback: componentDidUpdate()
  componentDidUpdate(prevProps, prevState)
  {
    this.getPreviewCanvasReferences()       // Since they could have changed during the update due to frame add/remove
    // console.log(prevState.selectedFrameIdx, this.state.selectedFrameIdx);

    if (recentMarker !== null && this.props.asset.content2.changeMarker === recentMarker)
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

    for(let frameID=0; frameID<frameCount; frameID++) {
      this.frameCtxArray[frameID].clearRect(0, 0, c2.width, c2.height)
      for(let layerID=layerCount-1; layerID>=0; layerID--) {
        this.loadAssetAsync(frameID, layerID)
      }
    }
  }

  loadAssetAsync(frameID, layerID) {
    let c2 = this.props.asset.content2
    if (!c2.frameData[frameID] || !c2.frameData[frameID][layerID]) { // manage empty frameData cases
      // console.log('empty framedata', frameID, layerID)
      if (frameID === this.state.selectedFrameIdx) {
        this.previewCtxArray[layerID].clearRect(0,0, c2.width, c2.height)
      }
      return
    }
    let dataURI = c2.frameData[frameID][layerID];
    if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
      var _img = new Image;
      _img.frameID = frameID   // hack so in onload() we know which frame is loaded
      _img.layerID = layerID   // hack so in onload() we know which layer is loaded
      let self = this
      _img.onload = function(e) {            
        let loadedImage = e.target
        if(loadedImage.frameID === self.state.selectedFrameIdx) {       
          self.previewCtxArray[loadedImage.layerID].clearRect(0,0, c2.width, c2.height)
          self.previewCtxArray[loadedImage.layerID].drawImage(loadedImage, 0, 0)
          if(loadedImage.layerID === 0) {
            // update edit canvas when bottom layer is loaded
            // TODO: See if we could have a bug here with out-of-order async responses? is the 0th last?
            self.updateEditCanvasFromSelectedPreviewCanvas(loadedImage.frameID)
          }
        }
        if(!c2.layerParams[loadedImage.layerID].isHidden) { 
          self.frameCtxArray[loadedImage.frameID].drawImage(loadedImage, 0, 0)
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
  }


  updateEditCanvasFromSelectedPreviewCanvas()   // TODO(DGOLDS?): Do we still need the vendor-prefix smoothing flags?
  {
    let w = this.previewCanvasArray[this.state.selectedLayerIdx].width
    let h = this.previewCanvasArray[this.state.selectedLayerIdx].height
    let s = this.state.editScale
    let c2 = this.props.asset.content2
    this.editCtx.imageSmoothingEnabled = false
    this.editCtx.mozImageSmoothingEnabled = false
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

    this.editCtx.lineWidth = 1;
    this.editCtx.strokeStyle = '#000000';
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x2, scaleRect.y1);
    drawLine(scaleRect.x2, scaleRect.y1, scaleRect.x2, scaleRect.y2);
    drawLine(scaleRect.x1, scaleRect.y1, scaleRect.x1, scaleRect.y2);
    drawLine(scaleRect.x1, scaleRect.y2, scaleRect.x2, scaleRect.y2);

    let time = new Date().getMilliseconds();
    time = Math.round(time/100);
    let timeOffset = (time % 10) * 2;

    this.editCtx.strokeStyle = '#ffffff';
    let width = Math.abs(scaleRect.x1 - scaleRect.x2);
    let height = Math.abs(scaleRect.y1 - scaleRect.y2);
    let dashSize = 10;
    let dashCount = Math.ceil((width+dashSize-timeOffset)/(dashSize*2));
    // draw horizontal dashes
    for(let i=0; i<dashCount; i++){
      let x = scaleRect.x1 - dashSize + timeOffset + i*dashSize*2;
      let x2 = x+dashSize;
      if(x < scaleRect.x1) x = scaleRect.x1;
      if(x2 > scaleRect.x2) x2 = scaleRect.x2;
      drawLine(x, scaleRect.y1, x2, scaleRect.y1); 
      drawLine(x, scaleRect.y2, x2, scaleRect.y2); 
    }

    dashCount = Math.ceil((height+dashSize-timeOffset)/(dashSize*2));
    // draw vertical dashes
    for (let i=0; i<dashCount; i++) {
      let y = scaleRect.y1 - dashSize + timeOffset + i*dashSize*2
      let y2 = y+dashSize
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
          for (let j = 0; j < h; j++) {
            retval.previewCtx.putImageData(retval.previewCtxImageData1x1, Math.round(x + i), Math.round(y + j))
          }
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
        if (startX > endX) [startX, endX] = [endX, startX]
        if (startY > endY) [startY, endY] = [endY, startY]
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
        self.setState({ selectRect: null })
        self.updateEditCanvasFromSelectedPreviewCanvas()
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
    if (!this.state.selectRect) return

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
    if (!this.state.selectRect) return

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

  pasteSelected() {
    // is this dead code?
    debugger
    if (!this.state.pasteCanvas) 
      return

    const tool = this.findToolByLabelString("Paste")
    if (tool) this.setState({ toolChosen: tool })
  }

  zoomIn() {
    const i = this.zoomLevels.indexOf(this.state.editScale)
    if (i < this.zoomLevels.length-1) {
      recentMarker = null       // Since we now want to reload data for our new EditCanvas
      this.setState({ editScale: this.zoomLevels[i+1] })
    }
  }

  zoomOut() {
    const i = this.zoomLevels.indexOf(this.state.editScale)
    if (i > 0) {
      recentMarker = null       // Since we now want to reload data for our new EditCanvas
      this.setState({ editScale: this.zoomLevels[i-1] })
    }
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
    if (event.altKey === false && event.shiftKey === false && event.ctrlKey === false)
      return

    event.preventDefault()      // No default scroll behavior in these cases

    let wd = event.deltaY       // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    if (Math.abs(wd) >= 1) {
      // if paste tool then use ctrl/alt/shift for resizing, rotating, flipping
      if (this.state.toolChosen !== null && this.state.toolChosen.label === "Paste")
        this.state.toolChosen.handleMouseWheel(this.collateDrawingToolEnv(event), wd)
      else {
        // TODO maybe change keys so they are not the same as paste tool
        // zooming canvas and changing frames
        if (event.shiftKey === true) {          // Shift+Wheel is ZoomIn/ZoomOut
          if (wd > 0)
            this.zoomOut()
          else if (wd < 0)
            this.zoomIn()
        }
        else {                                  // ???+Wheel is NextFrame/PrevFrame
          let f = this.state.selectedFrameIdx
          if (wd < 0 && f > 0)
            this.handleSelectFrame(f - 1)
          else if (wd > 0 && f + 1 < this.frameCanvasArray.length)  // aka c2.frameNames.length
            this.handleSelectFrame(f + 1)
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
    if (toolChosen !== null && toolActive === true) {
      toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      if (toolChosen.changesImage === true)
        this.handleSave(`Drawing`, false, false)
      this.setState({ toolActive: false })
    }
  }


  handleResize(dw, dh, force = false)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
    
    if (dw !== 0 || dh !== 0 || force === true)
    {
      this.doSaveStateForUndo(`Resize by (${dw}, ${dh}) `)
      const c2 = this.props.asset.content2
      c2.width = Math.min(c2.width+dw,   MAX_BITMAP_WIDTH)
      c2.height = Math.min(c2.height+dh, MAX_BITMAP_HEIGHT)
      this.handleSave(`Resize image`)      // Less spammy in activity log      
    }
  }


  hasPermission() {
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

    if (mouseAtText === "") {  
      sb.outer.css( {visibility: "hidden"} )
    }
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

  handleColorChangeComplete(colortype, chosenColor)
  {
    // See http://casesandberg.github.io/react-color/#api-onChangeComplete
    this.state.selectedColors[colortype] = chosenColor
    this.setState( { selectedColors: this.state.selectedColors } )      // Won't trigger redraw because React does shallow compare? Fast but not the 'react-way'

    // So we have to fix up UI stuff. This is a bit of a hack for perf. See statusBarInfo()
    let colorCSSstring = `#${this.RGBToHex(chosenColor.rgb.r, chosenColor.rgb.g, chosenColor.rgb.b)}`
    $('.layout.icon').css( { color: colorCSSstring})
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
      for (let i=0; i<this.previewCtxArray.length; i++) {
        this.previewCtxArray[i].clearRect(0, 0, c2.width, c2.height)
      }
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
      asset.thumbnail = this.frameCanvasArray[0].toDataURL('image/png')     

      // Saving the composite Frame (using all layers for this frame) for convenient use in the map editor.
      // TODO(@stauzs): Would this be nicer as a list comprehension?    c2.spriteData = _.map(this.frameCanvasArray, c => c.toDataURL('image/png'))
      c2.spriteData = []
      for (let i = 0; i < this.frameCanvasArray.length; i++) 
        c2.spriteData[i] = this.frameCanvasArray[i].toDataURL('image/png')
      
      // tileset saving
      let tilesetInfo = this.createTileset()
      c2.tileset = tilesetInfo.image
      c2.cols = tilesetInfo.cols
      c2.rows = tilesetInfo.rows
    }

    this.saveChangedContent2(c2, asset.thumbnail, changeText, allowBackwash)
  }

  createTileset() {
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
    recentMarker = allowBackwash ? null : "_graphic_" + Random.id()   // http://docs.meteor.com/packages/random.html
    c2.changeMarker = recentMarker      
    //console.log("Backwash marker = " + recentMarker)
    this.props.handleContentChange(c2, thumbnail, changeText)
    this.doSnapshotActivity()
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
    e.dataTransfer.setData('mgb/image', this.previewCanvasArray[idx].toDataURL('image/png')
    )
  }


  handleDragOverPreview(event)
  {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'   // Explicitly show this is a copy.
  }


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
          let c2 = self.props.asset.content2
          c2.width = Math.min(img.width, MAX_BITMAP_WIDTH)
          c2.height = Math.min(img.height, MAX_BITMAP_HEIGHT)
          self.handleResize(0,0, true)
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

    let files = event.dataTransfer.files     // FileList object.
    if (files.length > 0)
    {
      var reader = new FileReader()
      reader.onload = (event) => {
        let theUrl = event.target.result
        if (idx === -2)     // Special case - MGB RESIZER CONTROL... So just resize to that imported image
        {
          var img = new Image
          img.onload = (e) => {
            let c2 = self.props.asset.content2
            c2.width = Math.min(img.width, MAX_BITMAP_WIDTH)
            c2.height = Math.min(img.height, MAX_BITMAP_HEIGHT)
            self.handleResize(0, 0, true)
          }
          img.src = theUrl
        }
        else{
          this.pasteImage(theUrl, idx)
        }
      }
      reader.readAsDataURL(files[0])
    }
  }

  // <- End of drag-and-drop stuff

  pasteImage(url, idx = this.state.selectedLayerIdx)
  {
    var img = new Image
    img.onload = (e) => {
      // The DataURI seems to have loaded ok now as an Image, so process what to do with it
      this.doSaveStateForUndo(`Drag+Drop Image to Frame #`+idx.toString())

      let w = this.props.asset.content2.width
      let h = this.props.asset.content2.height

      this.previewCtxArray[idx].clearRect(0,0,w,h)
      this.previewCtxArray[idx].drawImage(e.target, 0, 0)  // add w, h to scale it.
      if (idx === this.state.selectedLayerIdx) {
        this.updateEditCanvasFromSelectedPreviewCanvas()
      }
      this.handleSave(`Drag external file to frame #${idx+1}`)
    };
    img.src = url  // is the data URL because called
  }


  toolOpenImportPopup() {
    let importPopup = ReactDOM.findDOMNode(this.refs.graphicImportPopup)
    $(importPopup).modal('show')
  }

 
  // This is passed to the <GraphicImport> Control so the tiles can be imported
  importTileset(tileWidth, tileHeight, imgDataArr) { 
    let c2 = this.props.asset.content2

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
    // $('.ui.modal').modal('hide');
  }


  //
  // CHANGE TILE WIDTH/HEIGHT
  //

  changeCanvasWidth(clampedVal) {
    // The caller must have ensure clampedVal is an integer in range 1...MAX_BITMAP_WIDTH
    const currWidth = this.props.asset.content2.width
    if (currWidth !== clampedVal)
    {
      this.doSaveStateForUndo(`Change Graphic Width from ${currWidth} to ${clampedVal}`)
      this.props.asset.content2.width = clampedVal
      this.handleSave("Change canvas width")
    }
  }

  changeCanvasHeight(clampedVal) {
    const currHeight = this.props.asset.content2.height
    if (currHeight !== clampedVal)
    {
      this.doSaveStateForUndo(`Change Graphic Height from ${currHeight} to ${clampedVal}`)
      this.props.asset.content2.height = clampedVal
      this.handleSave("Change canvas height")
    }
  }


  //
  // TOOLBAR
  //

  // This is used by render() so is frequently called. 
  // It can therefore have values that are based on this, this.state, this.props etc
  generateToolbarActions() {
    const simpleTools = {
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
    }

    const actions = {}
    const config = {
      // default level
      level: 1,
      // vertical: true,
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


  // React Callback: render()
  // See http://semantic-ui.com to understand the classNames we are using.
  render() {
    this.initDefaultContent2()      // The NewAsset code is lazy, so add base content here
    this.initDefaultUndoStack()

    const asset = this.props.asset
    const c2 = asset.content2
    const zoom = this.state.editScale
    const { actions, config } = this.generateToolbarActions()

    // Make element
    return (
      <div className="ui grid">

        {/***  Central Column is for Edit and other wide stuff  ***/}

        <div className={"mgbEditGraphicSty_tagPosition ui sixteen wide column"} >
          <div className="row" style={{marginBottom: "6px"}}>

            <div className="ui small labeled input">
              <div className="ui small label" title="Canvas width">
                w:
              </div>
              <NumberInput
                className="ui small input"
                min={1}
                max={MAX_BITMAP_WIDTH}
                style={{width: "6em"}}
                value={c2.width}
                onFinalChange={(num) => {this.changeCanvasWidth(num)} } 
                />
            </div>

            <span>&nbsp;&nbsp;</span>
            <div className="ui small labeled input">
              <div className="ui small label" title="Canvas height">
                h:
              </div>
              <NumberInput
                className="ui small input"
                min={1}
                max={MAX_BITMAP_HEIGHT}
                style={{width: "6em"}}
                value={c2.height}
                onFinalChange={(num) => {this.changeCanvasHeight(num)} }
                />
            </div>


            <span>&nbsp;&nbsp;</span> 
            <div className="ui small button miniPadding hazPopup"
              data-content="Click here or SHIFT+mousewheel over edit area to change zoom level. Use mousewheel to scroll if the zoom is too large"
              data-variation="tiny"
              data-position="bottom center">
              <span style={{"cursor": "pointer"}} onClick={this.zoomOut.bind(this)}>
                <i className="icon zoom out"></i>
              </span>
              {zoom}x
              <span>&nbsp;&nbsp;</span>
              <span style={{"cursor": "pointer"}} onClick={this.zoomIn.bind(this)}>
                <i className="icon zoom"></i>
              </span>
            </div>


            <span>&nbsp;&nbsp;</span>
            <div className="ui small icon button hazPopup" onClick={this.handleSave.bind(this, "Manual save")}
               data-content="Changes are continuously saved and updated to other viewers "
               data-variation="tiny"
               data-position="bottom center">
              <i className="save icon"></i>
            </div>
            <span>&nbsp;&nbsp;</span>
            <div className="ui small button hazPopup"
               data-content="Use ALT+mousewheel over Edit area to change current edited frame. You can also upload image files by dragging them to the frame previews or to the drawing area"
               data-variation="tiny"
               data-position="bottom center">
              <i className="tasks icon"></i>Frame #{1+this.state.selectedFrameIdx} of {c2.frameNames.length}
            </div>
          </div>

          <div className="row" style={{marginBottom: "6px"}}>
            {<Toolbar actions={actions} config={config} name="EditGraphic" />}
          </div>


          <div className="row" style={{"minHeight": "92px"}}>
            <div   style={{ "overflow": "auto", /*"maxWidth": "600px",*/ "maxHeight": "600px"}}>
              <canvas ref="editCanvas"
                        style={ this.state.toolChosen ? {"cursor": this.state.toolChosen.editCursor} : {} }
                        width={zoom*c2.width}
                        height={zoom*c2.height}
                        className={"mgbEditGraphicSty_checkeredBackground mgbEditGraphicSty_thinBorder mgbEditGraphicSty_atZeroZero"}
                        onDragOver={this.handleDragOverPreview.bind(this)}
                        onDrop={this.handleDropPreview.bind(this,-1)}>
              </canvas>
              {/*** <canvas id="tilesetCanvas"></canvas> ***/}
            </div>
          </div>

          {/*** Status Bar ***/}

          <div className="ui horizontal very relaxed list" ref="statusBarDiv">
            <div className="item">
              <i className="pointing up icon"></i>
              <div className="content" ref="statusBarMouseAtText">
                Mouse at xy
              </div>
            </div>

            <div className="item">
              <i className="square icon" ref="statusBarColorAtIcon"></i>
              <div className="content" ref="statusBarColorAtText">
                Color at xy
              </div>
            </div>

          </div>


          {/***  Popups are defined in this column for no good reason ***/}

          <div className="ui popup mgbColorPickerWidget">
            <div className="ui header">Color Picker (1..9)</div>
            <ColorPicker type="sketch"
                         onChangeComplete={this.handleColorChangeComplete.bind(this, 'fg')}
                         color={this.state.selectedColors['fg'].rgb}/>
          </div>

        </div>

      {/*** GraphicImport ***/}
        <div className="ui modal" ref="graphicImportPopup">
          <GraphicImport
            EditGraphic={this}
            importTileset={this.importTileset.bind(this)}
            maxTileWidth={MAX_BITMAP_WIDTH}
            maxTileHeight={MAX_BITMAP_WIDTH}
          />
        </div>


      {/*** SpriteLayers ***/}
        
          <SpriteLayers 
            content2={c2}
            EditGraphic={this}

            hasPermission={this.hasPermission.bind(this)}
            handleSave={this.handleSave.bind(this)}     
            forceUpdate={this.forceUpdate.bind(this)}   
          />

      </div>
    )
  }
}
