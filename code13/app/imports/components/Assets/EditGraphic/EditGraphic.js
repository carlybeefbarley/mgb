import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import sty from  './editGraphic.css';
import ColorPicker from 'react-color';        // http://casesandberg.github.io/react-color/
import AssetUrlGenerator from '../AssetUrlGenerator.js';

import ToolPen from './ToolPen.js';
import ToolEraser from './ToolEraser.js';
import ToolFill from './ToolFill.js';
import ToolMove from './ToolMove.js';
import ToolCircle from './ToolCircle.js';
import ToolRect from './ToolRect.js';
import ToolEyedropper from './ToolEyedropper.js';

import {snapshotActivity} from '../../../schemas/activitySnapshots.js';

const tools = {
  ToolPen,
  ToolEraser,
  ToolFill,
  ToolMove,
  ToolCircle,
  ToolRect,
  ToolEyedropper
};

// This is React, but some fast-changing items use Jquery or direct DOM manipulation,
// typically those that can change per mouse-move:
//   1. Drawing on preview+Editor canvas
//   2. Some popup handling (uses Semanticui .popup() jquery extension. Typically these have the 'hazPopup' class
//   3. Status bar has some very dynamic data like mouse position, current color, etc. See sb_* functions


export default class EditGraphic extends React.Component {
  // static PropTypes = {   // Note - static requires Ecmascript 7
  //   asset: PropTypes.object,
  //   handleContentChange: PropTypes.function,
  //   canEdit: PropTypes.bool
  // }

  constructor(props) {
    super(props);
    this.state = {
      editScale:        4,        // Zoom scale of the Edit Canvas
      selectedFrameIdx: 0,
      selectedColors:   {
        // as defined by http://casesandberg.github.io/react-color/#api-onChangeComplete
        // Note that the .hex value excludes the leading # so it is for example (white) 'ffffff'
        fg:    { hex: "00ff00", rgb: {r: 0, g: 255, b:0, a: 1} }    // Alpha = 0...1
      }
    }
  }


  // Graphic asset - Data format:
  //
  // content2.width
  // content2.height
  // content2.layerNames[layerIndex]     // array of layer names (content is string)
  // content2.frameNames[frameIndex]
  // content2.frameData[frameIndex][layerIndex]   /// each is a dataURL

  // React Callback: componentDidMount()
  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    this.editCtxImageData1x1 = this.editCtx.createImageData(1,1);

    //this.editCanvasOverlay =  ReactDOM.findDOMNode(this.refs.editCanvasOverlay);
    //this.editCtxOverlay = this.editCanvasOverlay.getContext('2d');

    //this.initDefaultContent2()              // Probably superfluous since done in render() but here to be sure.
    this.getPreviewCanvasReferences()
    this.loadPreviewsFromAssetAsync()

    // Initialize Status bar
    this._statusBar = {
      outer: $(ReactDOM.findDOMNode(this.refs.statusBarDiv)),
      mouseAtText: $(ReactDOM.findDOMNode(this.refs.statusBarMouseAtText)),
      colorAtText: $(ReactDOM.findDOMNode(this.refs.statusBarColorAtText)),
      colorAtIcon: $(ReactDOM.findDOMNode(this.refs.statusBarColorAtIcon))

    }
    this.setStatusBarInfo()

    this.handleColorChangeComplete('fg', { hex: "00ff00", rgb: {r: 0, g: 255, b:0, a: 1} } )


    this.editCanvas.addEventListener('wheel',         this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',     this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',     this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',       this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave',    this.handleMouseLeave.bind(this));

    // Tool button initializations
    this.activateToolPopups();
    this.mgb_toolActive = false;  // probably should be React state.__
    this.mgb_toolChosen = null;   // probably should be React state.__
    
    // Some constants we will use
    this.mgb_MAX_BITMAP_WIDTH = 1024
    this.mgb_MAX_BITMAP_HEIGHT = 1024
    
    this.doSnapshotActivity()
  }


  activateToolPopups()
  {
    // See http://semantic-ui.com/modules/popup.html#/usage

    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup()

    let $cp =  $a.find('.mgbColorPickerHost')
    $cp.popup({
      popup: '.mgbColorPickerWidget.popup',
      lastResort: 'right center',               // https://github.com/Semantic-Org/Semantic-UI/issues/3004
      hoverable: true
    })

    let $resizer =  $a.find('.mgbResizerHost')
    $resizer.popup({
      popup: '.mgbResizer.popup',
      lastResort: 'right center',               // https://github.com/Semantic-Org/Semantic-UI/issues/3004
      hoverable: true
    })
  }

// TODO: DGOLDS to clean this up
  initDefaultContent2()       // TODO - this isn't ideal React since it is messing with props.
  {
    let asset = this.props.asset
    if (!asset.hasOwnProperty("content2") || !asset.content2.hasOwnProperty('width')) {
      asset.content2 = {
        width: 64,
        height: 32,
        layerNames: ["Layer 01"],
        frameNames: ["Frame 01", "Frame 02"],
        frameData: [ [], [] ]}
    }
  }


  // React Callback: componentDidUpdate()
  componentDidUpdate(prevProps,  prevState)
  {
    this.getPreviewCanvasReferences()       // Since they could have changed during the update due to frame add/remove
    this.loadPreviewsFromAssetAsync()
  }

  /** Stash references to the preview canvases after initial render and subsequent renders
   * 
   */
  getPreviewCanvasReferences()
  {
    this.previewCanvasArray = []                // Preview canvas for this animation frame
    this.previewCtxArray = []                   // 2d drawing context for the animation frame
    this.previewCtxImageData1x1Array = []       // Used for painting quickly to each preview frame

    let asset = this.props.asset;
    let c2 = asset.content2;
    let frameCount = c2.frameNames.length;

    this.previewCanvasArray = $(".mgbPreviewCanvasContainer").find("canvas").get()

    for (let i = 0; i < frameCount; i++) {
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d');
      this.previewCtxImageData1x1Array[i] = this.previewCtxArray[i].createImageData(1,1);
    }
  }


  // Note that this has to use Image.onload so it will complete asynchronously.
  // TODO(DGOLDS): Add an on-complete callback including a timeout handler to support better error handling and avoid races
  loadPreviewsFromAssetAsync()
  {
    let c2 = this.props.asset.content2;
    let frameCount = c2.frameNames.length;

    for (let i = 0; i < frameCount; i++) {
      let dataURI = c2.frameData[i][0];

      if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
        var _img = new Image
        var self = this
        _img.mgb_hack_idx = i     // so in onload() callback we know which previewCtx to apply the data to
        _img.onload = function (e) {
          let loadedImage = e.target
          self.previewCtxArray[loadedImage.mgb_hack_idx].clearRect(0,0, _img.width, _img.height)
          self.previewCtxArray[loadedImage.mgb_hack_idx].drawImage(loadedImage, 0, 0)
          if (loadedImage.mgb_hack_idx === self.state.selectedFrameIdx)
            self.updateEditCanvasFromSelectedPreviewCanvas()
        }
        _img.src = dataURI    // Trigger load & onload -> data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      }
      else {
        // TODO: May need some error indication here
        this.updateEditCanvasFromSelectedPreviewCanvas();
      }
    }
  }


  updateEditCanvasFromSelectedPreviewCanvas()   // TODO(DGOLDS?): This still has some smoothing issues. Do i still need the per-browser flags?
  {
    let w = this.previewCanvasArray[this.state.selectedFrameIdx].width
    let h = this.previewCanvasArray[this.state.selectedFrameIdx].height
    let s = this.state.editScale
    this.editCtx.imageSmoothingEnabled = this.checked
    this.editCtx.mozImageSmoothingEnabled = this.checked
    this.editCtx.webkitImageSmoothingEnabled = this.checked
    this.editCtx.msImageSmoothingEnabled = this.checked
    this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height)
    this.editCtx.drawImage(this.previewCanvasArray[this.state.selectedFrameIdx], 0, 0, w, h, 0, 0, w*s, h*s)
  }

  // A plugin-api for the graphic editing tools in Tools.js

  _setImageData4BytesFromRGBA(d, c)
  {
    d[0] = c.r ; d[1] = c.g ; d[2] = c.b ; d[3] = c.a * 255
  }

  collateDrawingToolEnv(event)  // used to gather current useful state for the Tools and passed to them in most callbacks
  {
    let asset = this.props.asset;
    let c2    = asset.content2;
    let pCtx  = this.previewCtxArray[this.state.selectedFrameIdx]

    let pCtxImageData1x1 = this.previewCtxImageData1x1Array[this.state.selectedFrameIdx]
    var self = this;

    let retval =  {
      x: Math.floor(event.offsetX / this.state.editScale),
      y: Math.floor(event.offsetY / this.state.editScale),

      width:  c2.width,
      height: c2.height,
      scale:  this.state.editScale,
      event: event,

      chosenColor: this.state.selectedColors['fg'],

      previewCtx:             pCtx,
      previewCtxImageData1x1: pCtxImageData1x1,
      editCtx:                this.editCtx,
      editCtxImageData1x1:    this.editCtxImageData1x1,

      // setPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   (a) It SETS rather than draws-with-alpha-blending
      //   (b) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is faster than a ClearRect+FillRect in many cases.
      setPreviewPixelsAt: function (x, y, w=1, h=1) {

        // First set Pixels on the Preview context
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
      setPixelsAt: function (x, y, w=1, h=1) {

        // First set Pixels on the Preview context
        retval.setPreviewPixelsAt(x, y, w, h)

        // Now set Pixels (zoomed) to the Edit context
        self._setImageData4BytesFromRGBA(retval.editCtxImageData1x1.data,    retval.chosenColor.rgb)
        for (let i = 0; i < (w * retval.scale); i++) {
          for (let j = 0; j < (h * retval.scale); j++) {
            retval.editCtx.putImageData(retval.editCtxImageData1x1, (x * retval.scale) + i, (y * retval.scale) + j)
          }
        }
      },

      // clearPixelsAt() Like CanvasRenderingContext2D.clearRect, but
      //   (a) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is more convenient than a ClearRect+FillRect in many cases.
      clearPixelsAt: function (x, y, w=1, h=1) {
        let s = retval.scale;
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


  handleZoom()
  {
    this.setState( {editScale : (this.state.editScale == 8 ? 1 : (this.state.editScale << 1))})
  }

  // handleMouseWheel is an alias for zoom
  handleMouseWheel(event)
  {
    // We only handle alt-key. Anything else is system behavior (scrolling etc)
    if (event.altKey === false)
      return

    event.preventDefault();     // No default scroll behavior in these cases

    // WheelDelta system is to handle MacOS that has frequent small deltas,
    // rather than windows wheels which typically have +/- 120
    this.mgb_wheelDeltaAccumulator = (this.mgb_wheelDeltaAccumulator || 0) + event.wheelDelta;
    let wd =  this.mgb_wheelDeltaAccumulator;    // shorthand

    if (Math.abs(wd) > 60) {
      if (event.shiftKey === true) {
        // if wheel is for scale:
        let s = this.state.editScale;
        if (wd > 0 && s > 1)
          this.setState({editScale: s >> 1})
        else if (wd < 0 && s < 8)
          this.setState({editScale: s << 1})
      }
      else {
        // if wheel is for frame
        let f = this.state.selectedFrameIdx
        if (wd < 0 && f > 0)
          this.handleSelectFrame(f - 1)
        else if (wd > 0 && f + 1 < this.previewCanvasArray.length)
          this.handleSelectFrame(f + 1)
      }
      this.mgb_wheelDeltaAccumulator = 0
    }
  }


// TODO(Guntis): Replace Terrible UI with the four buttons! 
  handleResize(dw, dh, force = false)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
    
    if (dw !== 0 || dh !== 0 || force === true)
    {
      this.doSaveStateForUndo(`Resize by (${dw}, ${dh}) `)    // TODO: Only stack and save if different
      let c2 = this.props.asset.content2
      c2.width = Math.min(c2.width+dw, this.mgb_MAX_BITMAP_WIDTH)
      c2.height = Math.min(c2.height+dh, this.mgb_MAX_BITMAP_HEIGHT)
      this.handleSave(`Resize image`);      // Less spammy in activity log      
    }
    // TODO: Toast on error
    // TODO: Reduce zoom if very large
  }


  handleMouseDown(event) {
    
    if (this.mgb_toolChosen !== null) {
      if (this.mgb_toolChosen.changesImage === true)
      {
        if (!this.props.canEdit)
        { 
          this.props.editDeniedReminder()
          return
        }

        this.doSaveStateForUndo(this.mgb_toolChosen.name)   // So that tools like eyedropper don't save and need undo
      }
      if (this.mgb_toolChosen.supportsDrag === true)
        this.mgb_toolActive = true

      this.mgb_toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))

      if (this.mgb_toolChosen.supportsDrag === false && this.mgb_toolChosen.changesImage === true)
        this.handleSave(`Drawing`)   // This is a one-shot tool, so save it's results now
    }
  }


  setStatusBarInfo(mouseAtText = null, colorAtText = null, colorCSSstring = null)
  {
    if (mouseAtText === null)
      this._statusBar.outer.hide()
    else {
      this._statusBar.outer.show()
      this._statusBar.mouseAtText.text(mouseAtText)
      this._statusBar.colorAtText.html(colorAtText)
      if (colorCSSstring !== null)
        this._statusBar.colorAtIcon.css( { color: colorCSSstring } )
    }
  }

  RGBToHex(r,g,b) {
    var bin = r << 16 | g << 8 | b;
    return (function(h){
      return new Array(7-h.length).join("0")+h
    })(bin.toString(16).toLowerCase())
  }

  // Might be better to have two event handlers, each with a clearer role? 
  // This does two things: Update SB, and call on to Tool 
  handleMouseMove(event)
  {
    // Update statusBar
    let x = Math.floor(event.offsetX / this.state.editScale)
    let y = Math.floor(event.offsetY / this.state.editScale)
    let pCtx  = this.previewCtxArray[this.state.selectedFrameIdx]
    let imageDataAtMouse = pCtx.getImageData(x, y, 1, 1)
    let d = imageDataAtMouse.data

    let colorCSSstring = `#${this.RGBToHex(...d)}`
    this.setStatusBarInfo(`Mouse at ${x},${y}`, `${colorCSSstring}&nbsp;&nbsp;Alpha=${d[3]}`, colorCSSstring)

    // Tool api handoff
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true ) {
      this.mgb_toolChosen.handleMouseMove(this.collateDrawingToolEnv(event))
    }
  }


  handleMouseUp(event)
  {
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true) {
      this.mgb_toolChosen.handleMouseUp(this.collateDrawingToolEnv(event))
      if (this.mgb_toolChosen.changesImage === true)
        this.handleSave(`Drawing`)
      this.mgb_toolActive = false
    }
  }


  handleMouseLeave(event)
  {
    this.setStatusBarInfo()
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true) {
      this.mgb_toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      this.handleSave(`Drawing`)
      this.mgb_toolActive = false
    }
  }


  // TODO: DGolds to provide shortcut key subsystem
  //handleKeyDown(event)
  //{
  //  for (let t of tools)
  //  {
  //    console.log(t)
  //  }
  //
  //}


// Tool selection action. 
// TODO: This sometimes doesn't work. Look again at moving this state to React state for simplicity

  handleToolSelected(tool, e)
  {
    let $toolbar = $(this.refs.toolbar)
    let $toolbarItem = $(e.target)

    $toolbarItem
      .closest('.ui.buttons')
      .find('.button')
      .removeClass('active');

    $toolbarItem.addClass('active')

    this.mgb_toolChosen = tool;
    $(this.editCanvas).css('cursor', tool.editCursor);
  }


// Color picker handling. This doesn't go through the normal tool api for now since
// it isn't a drawing tool (and that's what the plugin api is focused on)



  handleColorChangeComplete(colortype, chosenColor)
  {
    // See http://casesandberg.github.io/react-color/#api-onChangeComplete
    this.state.selectedColors[colortype] = chosenColor;
    this.setState( { selectedColors: this.state.selectedColors } )      // Won't trigger redraw because React does shallow compare? Fast but not the 'react-way'

    // So we have to fix up UI stuff
    let colorCSSstring = `#${this.RGBToHex(chosenColor.rgb.r, chosenColor.rgb.g, chosenColor.rgb.b)}`

    $(ReactDOM.findDOMNode(this.refs.colorPickerIcon)).css( { color: colorCSSstring});

  }

// Add/Select/Remove etc animation frames


  handleAddFrame()
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }

    this.doSaveStateForUndo("Add Frame")
    let fN = this.props.asset.content2.frameNames
    let newFrameName = "Frame " + (fN.length+1).toString()
    fN.push(newFrameName)
    this.props.asset.content2.frameData.push([])
    this.handleSave('Add frame to graphic')
    this.forceUpdate()    // Force react to update.. needed since some of this state was direct (not via React.state/React.props)
  }


  doSwapCanvases(i,j)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
        
    let c2 = this.props.asset.content2
    var tmp0 = this.previewCtxArray[i].getImageData(0,0, c2.width, c2.height)
    var tmp1 = this.previewCtxArray[j].getImageData(0,0, c2.width, c2.height)
    this.previewCtxArray[j].putImageData(tmp0, 0, 0)
    this.previewCtxArray[i].putImageData(tmp1, 0, 0)
  }


  handleMoveFrameUp(currentIdx)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }

    let c2 = this.props.asset.content2
    let fN = c2.frameNames

    if (currentIdx > 0)
    {
      this.doSaveStateForUndo("Move Frame Up");

      [ fN[currentIdx],  fN[currentIdx-1] ] =  [  fN[currentIdx-1],  fN[currentIdx] ]
      this.doSwapCanvases(currentIdx, currentIdx-1)
      this.handleSave(`Change frame order`)
      this.handleSelectFrame(currentIdx-1)
      this.forceUpdate()
    }
  }

  handleMoveFrameDown(currentIdx)
  {
    let c2 = this.props.asset.content2
    let fN = c2.frameNames

    if (currentIdx < this.previewCanvasArray.length-1)
    {
      this.doSaveStateForUndo("Move Frame Down");
      [ fN[currentIdx],  fN[currentIdx+1] ] =  [  fN[currentIdx+1],  fN[currentIdx] ]
      this.doSwapCanvases(currentIdx, currentIdx+1)
      this.handleSave(`Change frame order`)
      this.handleSelectFrame(currentIdx+1)
      this.forceUpdate()     // Needed since the Reactivity doesn't look down this far (true?)
    }
  }


  handleDeleteFrame(idx)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
    
    let c2 = this.props.asset.content2

    this.doSaveStateForUndo("Delete Frame")

    c2.frameNames.splice(idx,1)
    let i = idx
    while (i < this.previewCanvasArray.length-1)
    {
      let tmp = this.previewCtxArray[i+1].getImageData(0,0, c2.width, c2.height)
      this.previewCtxArray[i].putImageData(tmp, 0, 0)
      i++
    }
    
    // Delete Frame seems to provoke a timing issuee where the popup exists while React is destroying it's parents. 
    // For now, it seems simplest to hide the popups directly when we delete a frame
    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.hazPopup').popup('hide')  

    this.handleSave(`Delete frame`)
  }


  handleFrameNameChangeInteractive(idx, event) {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
    this.doSaveStateForUndo("Rename Frame")
    this.props.asset.content2.frameNames[idx] = event.target.value
    this.handleSave(`Rename frame #${idx+1}`) // TODO: Do this OnBlur() so we don't spam the DB so much
  }


  handleSelectFrame(frameIndex)
  {
    this.doSnapshotActivity(frameIndex)
    this.setState( { selectedFrameIdx: frameIndex} )
  }

  // SAVE and UNDO
  
  // TODO: REDO function!


  initDefaultUndoStack()
  {
    // mgb_undoStack will be an array of
    //   {
    //      when:           Date.now() of when it was added to the stack
    //      byUserName      username who made the change
    //      byUserContext   Where the user made the change (IP address etc)
    //      changeInfo      The change - for example 'Deleted frame'
    //      savedContent2   The saved data
    //    }
    //
    // Oldest items will be at index=0 in array

    if (this.hasOwnProperty("mgb_undoStack") === false) {
      this.mgb_undoStack = []
    }
  }

  doMakeUndoStackEntry(changeInfoString)
  {
    return {
      when: Date.now(),
      byUserName: "usernameTODO",
      byUserContext: "someMachineTODO",
      changeInfo: changeInfoString,
      savedContent2: $.extend(true, {}, this.props.asset.content2)
    }
  }

  doTrimUndoStack()
  {
    let u = this.mgb_undoStack
    if (u.length > 20)
      u.shift()         // Remove 0th element (which is the oldest)
  }

  doSaveStateForUndo(changeInfoString)
  {
    let u = this.mgb_undoStack
    this.doTrimUndoStack()
    //console.log(`doSaveStateForUndo(${changeInfoString})`)
    u.push(this.doMakeUndoStackEntry(changeInfoString))
  }

  doSnapshotActivity(frameIdxOverride)
  {
    let passiveAction = {
      selectedFrameIdx: frameIdxOverride ? frameIdxOverride : this.state.selectedFrameIdx
    }
    snapshotActivity(this.props.asset, passiveAction)
  }

  handleUndo()
  {
    let u = this.mgb_undoStack
    if (u.length > 0)
    {
      let zombie = u.pop()
      this.props.handleContentChange(
        zombie.savedContent2,
        zombie.savedContent2.frameData[0][0],         // MAINTAIN: Match semantics of handleSave()
        "Undo changes"
      )
      this.doSnapshotActivity()
    }
  }


  handleSave(changeText="change graphic")    // TODO(DGOLDS): Maybe _.debounce() this?
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }

    let asset = this.props.asset;
    let c2    = asset.content2;
    let frameCount = this.previewCanvasArray.length;  // We don't use c2.frameNames.length  coz of the Add Frame button

    for (let i = 0; i < frameCount; i++) {
      c2.frameData[i][0] = this.previewCanvasArray[i].toDataURL('image/png')
    }
    asset.thumbnail = this.previewCanvasArray[0].toDataURL('image/png')   // MAINTAIN: Match semantics of handleUndo()
    this.props.handleContentChange(c2, asset.thumbnail, changeText);
    this.doSnapshotActivity()
  }



  /// Drag & Drop of image files over preview and editor
  // TODO: See how to factor this into another function? Depends how much of our internal state it needs

  /// Allow Previews to put info in DataTransfer object so we can drag them around
  handlePreviewDragStart(idx, e) {
    // Target (this) element is the source node.
    let dragSrcEl = e.target;

    if (idx === -1)                         // The Edit Window does this
      idx = this.state.selectedFrameIdx;

    e.dataTransfer.effectAllowed = 'copy';  // This must match what is in handleDragOverPreview()
    e.dataTransfer.setData('mgb/image', this.previewCanvasArray[idx].toDataURL('image/png')
    );
  }


  handleDragOverPreview(event)
  {
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }


  handleDropPreview(idx, event)
  {
    event.stopPropagation();
    event.preventDefault();
    
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
    
    var self = this;

    if (idx === -1)                         // The Edit Window does this
      idx = this.state.selectedFrameIdx;
      
    // Note that idx === -2 means the MgbResizerHost control. 
    // In thise case we must ONLY resize the graphics, not actually import the graphic. 

    let mgbImageDataUri =  event.dataTransfer.getData('mgb/image');
    if (mgbImageDataUri !== undefined && mgbImageDataUri !== null && mgbImageDataUri.length > 0)
    {
      // SPECIAL CASE - DRAG FROM us to us   i.e. Frame-to-frame image drag within MGB (or across MGB windows)
      var img = new Image;
      img.onload = function(e) {
        // Seems to have loaded ok..
        self.doSaveStateForUndo(`Drag+Drop Frame to Frame #`+idx.toString())
        if (idx === -2)     // Special case - MGB RESIZER CONTROL... So just resize to that imported image
        {
          let c2 = self.props.asset.content2
          c2.width = Math.min(img.width, self.mgb_MAX_BITMAP_WIDTH)
          c2.height = Math.min(img.height, self.mgb_MAX_BITMAP_HEIGHT)
          self.handleResize(0,0, true)
        }
        else
        {
          let w = self.props.asset.content2.width
          let h = self.props.asset.content2.height
          self.previewCtxArray[idx].clearRect(0,0,w,h)
          self.previewCtxArray[idx].drawImage(e.target, 0, 0);// add w, h to scale it.
          if (idx === self.state.selectedFrameIdx)
            self.updateEditCanvasFromSelectedPreviewCanvas();
          self.handleSave(`Copy frame to frame #${idx+1}`);
        }
      };
      img.src = mgbImageDataUri; // is the data URL because called
      return
    }

    let files = event.dataTransfer.files; // FileList object.
    if (files.length > 0)
    {
      var reader = new FileReader();
      reader.onload = function(event) {
        let theUrl = event.target.result
        var img = new Image;
        img.onload = function(e) {
          // The DataURI seems to have loaded ok now as an Image, so process what to do with it
          self.doSaveStateForUndo(`Drag+Drop Image to Frame #`+idx.toString())
          //console.log(img.width + "x" + img.height); // image is loaded; sizes are available

          if (idx === -2)     // Special case - MGB RESIZER CONTROL... So just resize to that imported image
          {
            let c2 = self.props.asset.content2
            c2.width = Math.min(img.width, self.mgb_MAX_BITMAP_WIDTH)
            c2.height = Math.min(img.height, self.mgb_MAX_BITMAP_HEIGHT)
            self.handleResize(0,0, true)
          }
          else
          {
            let w = self.props.asset.content2.width  
            let h = self.props.asset.content2.height  
            
            self.previewCtxArray[idx].clearRect(0,0,w,h)
            self.previewCtxArray[idx].drawImage(e.target, 0, 0);// add w, h to scale it.
            if (idx === self.state.selectedFrameIdx)
                self.updateEditCanvasFromSelectedPreviewCanvas();
            self.handleSave(`Drag external file to frame #${idx+1}`);
          }
        };
        img.src = theUrl; // is the data URL because called
      }
      reader.readAsDataURL(files[0]);
    }
  }
  
  // <- End of drag-and-drop stuff


  // React Callback: render()
  // See http://semantic-ui.com to understand the classNames we are using.
  render() {
    this.initDefaultContent2()      // The NewAsset code is lazy, so add base content here
    this.initDefaultUndoStack()

    let asset = this.props.asset
    let c2 = asset.content2
    let zoom = this.state.editScale
    var selectedFrameIdx =  this.state.selectedFrameIdx

    // Generate preview Canvasses
    let previewCanvasses = _.map(c2.frameNames, (name, idx) => {
      return (
      <div className="item" key={"previewCanvasItem"+idx.toString()}
            onDragOver={this.handleDragOverPreview.bind(this)}
            onDrop={this.handleDropPreview.bind(this,idx)}
      >
        <div className="ui image" draggable="true" onDragStart={this.handlePreviewDragStart.bind(this, idx)} style={{"maxWidth": "256px", "maxHeight": "256px", "overflow": "scroll" }}>
          <canvas width={c2.width} height={c2.height}
                  onClick={this.handleSelectFrame.bind(this, idx)}
                  className={ selectedFrameIdx == idx ? "mgbEditGraphicSty_thickBorder" : "mgbEditGraphicSty_thinBorder"}></canvas>
        </div>
        <div className="middle aligned content">
          <input placeholder={"Frame name"} value={c2.frameNames[idx]}
                 onChange={this.handleFrameNameChangeInteractive.bind(this, idx)}></input>

          <div className="ui tiny icon buttons">
            <div className="ui button hazPopup"
                 onClick={this.handleMoveFrameUp.bind(this, idx)}
                 data-position="bottom center"
                 data-title="Move Up"
                 data-content="Move animation frame upwards">
              <i className="up arrow icon" ></i>
            </div>
            <div className="ui button hazPopup"
                 onClick={this.handleMoveFrameDown.bind(this, idx)}
                 data-title="Move Down"
                 data-content="Move animation frame downwards"
                 data-position="bottom center">
              <i className="down arrow icon" ></i>
            </div>
            <div className="ui button hazPopup"
                 onClick={this.handleDeleteFrame.bind(this, idx)}
                 data-title="Delete Frame"
                 data-content="Delete Animation Frame"
                 data-position="bottom center">
              <i className="delete icon" ></i>
            </div>
          </div>
        </div>
      </div>
    )})

    // Generate tools. TODO(Guntis - clean up wther tool active is jquery-manual state or React.state)
    let toolComponents = _.map(tools, (tool) => { return (
      <div  className={"ui button" + (this.mgb_toolChosen === tool ? " active" : "" )}
            onClick={this.handleToolSelected.bind(this, tool)}
            key={tool.name}
            data-title={tool.name + " (" + tool.shortcutKey + ")"}
            data-content={tool.description}
            data-variation="tiny"
            data-position="right center">
        <i className={"large " + tool.icon}></i>
      </div>);
    });

    // Make element
    return (
      <div className="ui grid">

        {/***  Left Column for tools  ***/}

        <div className="ui one wide column">
          <div className="ui vertical icon buttons" ref="toolbar">

            <div className="ui button mgbColorPickerHost"
                 data-position="right center">
              <i className="block layout large icon" ref="colorPickerIcon"></i>
            </div>
            <br></br>
            {toolComponents}
          </div>
        </div>

        {/***  Center Column for Edit and other wide stuff  ***/}

        <div className={"mgbEditGraphicSty_tagPosition ui nine wide column"} >
          <div className="row">
            <a className="ui label" onClick={this.handleUndo.bind(this)}>
              <i className="icon undo"></i>Undo {this.mgb_undoStack.length}
            </a>
            <span>&nbsp;&nbsp;</span>
            <a className="ui label mgbResizerHost" data-position="right center"  onDragOver={this.handleDragOverPreview.bind(this)}
                        onDrop={this.handleDropPreview.bind(this,-2)}>
              <i className="icon expand"></i>{"Size: " + c2.width + " x " + c2.height}
            </a>
            <span>&nbsp;&nbsp;</span>
            <a className="ui label hazPopup" onClick={this.handleZoom.bind(this)}
               data-content="Click here or ALT+SHIFT+mousewheel over edit area to change zoom level. Use mousewheel to scroll if the zoom is too large"
               data-variation="tiny"
               data-position="bottom center">
              <i className="icon zoom"></i>Zoom {zoom}x
            </a>
            <span>&nbsp;&nbsp;</span>
            <a className="ui label hazPopup" onClick={this.handleSave.bind(this, "Manual save")}
               data-content="Changes are continuously saved and updated to other viewers "
               data-variation="tiny"
               data-position="bottom center">
              <i className="save icon"></i>
            </a>
            <span>&nbsp;&nbsp;</span>
            <a className="ui label hazPopup"
               data-content="Use ALT+mousewheel over Edit area to change current edited frame. You can also upload image files by dragging them to the frame previews or to the drawing area"
               data-variation="tiny"
               data-position="bottom center">
              <i className="tasks icon"></i>Frame #{1+this.state.selectedFrameIdx} of {c2.frameNames.length}
            </a>
            <span>&nbsp;&nbsp;</span>
            <AssetUrlGenerator asset={this.props.asset} />


          </div>
          <div className="row">
            <br></br>
          </div>
          <div className="row" style={{"minHeight": "276px"}}>
            <div   style={{ "overflow": "scroll", "maxWidth": "600px", "maxHeight": "600px"}}>
              <canvas ref="editCanvas"
                        width={zoom*c2.width}
                        height={zoom*c2.height}
                        className={"mgbEditGraphicSty_checkeredBackground mgbEditGraphicSty_thinBorder mgbEditGraphicSty_atZeroZero"}
                        onDragOver={this.handleDragOverPreview.bind(this)}
                        onDrop={this.handleDropPreview.bind(this,-1)}>
              </canvas>
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

          <div className="ui popup mgbResizer">
            <div className="ui">You can resize the Graphic using these buttons, or by dragging an image to this control</div>
            <div className="ui horizontal icon buttons">
              <div className="ui button" onClick={this.handleResize.bind(this, 1, 0)}
                   data-content="Increase Width"
                   data-variation="tiny"
                   data-position="bottom center">
                <i className="toggle right icon"></i>
              </div>
              <div className="ui button" onClick={this.handleResize.bind(this, -1, 0)}
                   data-content="Decrease Width"
                   data-variation="tiny"
                   data-position="bottom center">
                <i className="toggle left icon"></i>
              </div>
              <div className="ui button" onClick={this.handleResize.bind(this, 0, 1)}
                   data-content="Increase height)"
                   data-variation="tiny"
                   data-position="bottom center">
                <i className="toggle down icon"></i>
              </div>
              <div className="ui button" onClick={this.handleResize.bind(this, 0, -1)}
                   data-content="Decrease height)"
                   data-variation="tiny"
                   data-position="bottom center">
                <i className="toggle up icon"></i>
              </div>

            </div>
          </div>
        </div>

        {/***  Right Column for animations and frames  ***/}


        <div className="ui four wide column ">
          <div className="ui items mgbPreviewCanvasContainer">
            {previewCanvasses}
          </div>
          <a className="ui compact button" onClick={this.handleAddFrame.bind(this)}>Add Frame</a>
        </div>

      </div>
    )
  }
}
