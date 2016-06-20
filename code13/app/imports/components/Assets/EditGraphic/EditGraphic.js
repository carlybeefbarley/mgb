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

import SpriteLayers from './EditGraphic/SpriteLayers.js';

import { snapshotActivity } from '../../../schemas/activitySnapshots.js';

const tools = {
  ToolPen,
  ToolEraser,
  ToolFill,
  ToolMove,
  ToolCircle,
  ToolRect,
  ToolEyedropper
};


// This is used to see if incoming changes actually recently came from us.. in which case we will 
let recentMarker = null

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
      selectedLayerIdx: 0,
      selectedColors:   {
        // as defined by http://casesandberg.github.io/react-color/#api-onChangeComplete
        // Note that the .hex value excludes the leading # so it is for example (white) 'ffffff'
        fg:    { hex: "00ff00", rgb: {r: 0, g: 255, b:0, a: 1} }    // Alpha = 0...1
      },
      toolActive: false,
      toolChosen: null
    }

    this.fixingOldAssets();
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
  // content2.animations[]    // { name, frames[], fps }


  // React Callback: componentDidMount()
  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    this.editCtxImageData1x1 = this.editCtx.createImageData(1,1);

    //this.editCanvasOverlay =  ReactDOM.findDOMNode(this.refs.editCanvasOverlay);
    //this.editCtxOverlay = this.editCanvasOverlay.getContext('2d');

    //this.initDefaultContent2()              // Probably superfluous since done in render() but here to be sure.
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

    this.handleColorChangeComplete('fg', { hex: "00ff00", rgb: {r: 0, g: 255, b:0, a: 1} } )


    this.editCanvas.addEventListener('wheel',         this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',     this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',     this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',       this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave',    this.handleMouseLeave.bind(this));

    // Tool button initializations
    this.activateToolPopups();
    
    // Some constants we will use
    this.mgb_MAX_BITMAP_WIDTH = 1024
    this.mgb_MAX_BITMAP_HEIGHT = 1024
    
    this.doSnapshotActivity()
  }

  // componentWillUpdate(){
  //  console.error("wil update");
  // }

  // there are some missing params for old assets beeing added here
  fixingOldAssets(){
    let autoFix = false;
    let c2 = this.props.asset.content2;
    // console.log(c2.layerParams, c2.layerNames);
    if(!c2.layerParams && c2.layerNames){
      c2.layerParams = [];
      for(let i=0; i<c2.layerNames.length; i++){
        c2.layerParams[i] = {name:c2.layerNames[i], isHidden: false, isLocked: false};
      } 
      autoFix = true;
    }
    if(!c2.spriteData){
      c2.spriteData = [];
      autoFix = true;
    }
    if(!c2.fps){
      c2.fps = 10;
      autoFix = true;
    }
    if(!c2.animations){
      c2.animations = [];
      autoFix = true;
    }

    if(autoFix) this.handleSave("Automatic fixing old assets");
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
        fps: 10,
        layerParams: [{name:"Layer 1", isHidden: false, isLocked: false}],
        frameNames: ["Frame 1"],
        frameData: [ [ ] ],
        spriteData: [],
        animations: [],
      };
    }
  }

  // React Callback: componentDidUpdate()
  componentDidUpdate(prevProps,  prevState)
  {
    this.getPreviewCanvasReferences()       // Since they could have changed during the update due to frame add/remove

    if (this.props.asset.content2.changeMarker === recentMarker)
    {
      // This is the data we just sent up.. So let's _not_ nuke any subsequent edits (i.e don't call loadAllPreviewsAsync())
//      recentMarker = null // So we don't ignore this data in future
      // TODO.. we may need a window of a few recentMarkers in case of slow updates. Maybe just hold back sends while there is a pending save?
    }
    else
    {
      this.loadAllPreviewsAsync()     // It wasn't the change we just sent, so apply the data
    }
  }

  /** Stash references to the preview canvases after initial render and subsequent renders
   * 
   */
  getPreviewCanvasReferences()
  {

    let asset = this.props.asset;
    let c2 = asset.content2;

    // TODO rename to layerCanvas and cts arrays instead of preview

    this.previewCanvasArray = []                // Preview canvas for this animation frame
    this.previewCtxArray = []                   // 2d drawing context for the animation frame
    this.previewCtxImageData1x1Array = []       // Used for painting quickly to each preview frame

    this.previewCanvasArray = $(".spriteLayersTable td").find("canvas").get();
    for (let i = 0; i < c2.layerParams.length; i++) {
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d');
      this.previewCtxImageData1x1Array[i] = this.previewCtxArray[i].createImageData(1,1);
    }


    this.frameCanvasArray = [];    // frame canvases where layers are merged
    this.frameCtxArray = [];
    this.frameCtxImageData1x1Array = [];

    this.frameCanvasArray = $(".spriteLayersTable th").find("canvas").get();
    for (let i = 0; i < c2.frameNames.length; i++) {
      this.frameCtxArray[i] = this.frameCanvasArray[i].getContext('2d');
      this.frameCtxImageData1x1Array[i] = this.frameCtxArray[i].createImageData(1,1);
    }
  }


  // Note that this has to use Image.onload so it will complete asynchronously.
  // TODO(DGOLDS): Add an on-complete callback including a timeout handler to support better error handling and avoid races
  loadAllPreviewsAsync(){
    let c2 = this.props.asset.content2;
    let frameCount = c2.frameNames.length;
    let layerCount = c2.layerParams.length;

    for(let frameID=0; frameID<frameCount; frameID++){
      this.frameCtxArray[frameID].clearRect(0, 0, c2.width, c2.height);
      for(let layerID=layerCount-1; layerID>=0; layerID--){
        this.loadAssetAsync(frameID, layerID);
      }
    }
  }

  loadFramAssync(frameID){
    let c2 = this.props.asset.content2;
    let layerCount = c2.layerParams.length;
    this.frameCtxArray[frameID].clearRect(0, 0, c2.width, c2.height);
    for(let layerID=layerCount-1; layerID>=0; layerID--){
      this.loadAssetAsync(frameID, layerID);
    }
  }

  loadAssetAsync(frameID, layerID){
    let c2 = this.props.asset.content2;
    if(!c2.frameData[frameID] || !c2.frameData[frameID][layerID]) { // manage empty frameData cases
      // console.log('empty framedata', frameID, layerID)
      if(frameID === this.state.selectedFrameIdx){
        this.previewCtxArray[layerID].clearRect(0,0, c2.width, c2.height);
      }
      return;
    }
    let dataURI = c2.frameData[frameID][layerID];
    if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
      _img = new Image;
      _img.frameID = frameID;   // hack so in onload() we know which frame is loaded
      _img.layerID = layerID;   // hack so in onload() we know which layer is loaded
      let self = this;
      _img.onload = function(e){            
        let loadedImage = e.target;
        // console.log(self.state.selectedFrameIdx);
        if(loadedImage.frameID === self.state.selectedFrameIdx){       
          self.previewCtxArray[loadedImage.layerID].clearRect(0,0, c2.width, c2.height); 
          self.previewCtxArray[loadedImage.layerID].drawImage(loadedImage, 0, 0);
          if(loadedImage.layerID === 0){
            // update edit canvas when bottom layer is loaded
            self.updateEditCanvasFromSelectedPreviewCanvas(loadedImage.frameID);  
          }
        }
        if(!c2.layerParams[loadedImage.layerID].isHidden){ 
          self.frameCtxArray[loadedImage.frameID].drawImage(loadedImage, 0, 0);
        }
      }
      _img.src = dataURI;
    }
    else {
      // TODO: May need some error indication here
      this.updateEditCanvasFromSelectedPreviewCanvas();
    }
  }




  updateEditCanvasFromSelectedPreviewCanvas()   // TODO(DGOLDS?): This still has some smoothing issues. Do i still need the per-browser flags?
  {
    let w = this.previewCanvasArray[this.state.selectedLayerIdx].width
    let h = this.previewCanvasArray[this.state.selectedLayerIdx].height
    let s = this.state.editScale
    let c2 = this.props.asset.content2;
    this.editCtx.imageSmoothingEnabled = this.checked
    this.editCtx.mozImageSmoothingEnabled = this.checked
//  this.editCtx.webkitImageSmoothingEnabled = this.checked
    this.editCtx.msImageSmoothingEnabled = this.checked
    this.editCtx.clearRect(0, 0, this.editCanvas.width, this.editCanvas.height)
    this.frameCtxArray[this.state.selectedFrameIdx].clearRect(0, 0, c2.width, c2.height);

    // console.log(this.state.selectedFrameIdx);

    // draws all layers on edit canvas and layer canvas
    for(let i=this.previewCanvasArray.length-1; i>=0; i--){
      if(!this.props.asset.content2.layerParams[i].isHidden){ 
        this.editCtx.drawImage(this.previewCanvasArray[i], 0, 0, w, h, 0, 0, w*s, h*s);
        this.frameCtxArray[this.state.selectedFrameIdx].drawImage(this.previewCanvasArray[i], 0, 0, w, h, 0, 0, w, h);
      }
    }
    
    
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
    let pCtx  = this.previewCtxArray[this.state.selectedLayerIdx]

    let pCtxImageData1x1 = this.previewCtxImageData1x1Array[this.state.selectedLayerIdx]
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
        let f = this.state.selectedLayerIdx;
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
    let layerParam = this.props.asset.content2.layerParams[this.state.selectedLayerIdx];
    if(layerParam.isLocked || layerParam.isHidden){
      // TODO alert popup
      console.log("You can't draw on locked or hidden layer!");
    }
    else if (this.state.toolChosen !== null) {
      if (this.state.toolChosen.changesImage === true)
      {
        if (!this.props.canEdit)
        { 
          this.props.editDeniedReminder()
          return
        }

        this.doSaveStateForUndo(this.state.toolChosen.name)   // So that tools like eyedropper don't save and need undo
      }
      if (this.state.toolChosen.supportsDrag === true)
        this.setState({ toolActive: true });

      this.state.toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))

      if (this.state.toolChosen.supportsDrag === false && this.state.toolChosen.changesImage === true)
        this.handleSave(`Drawing`)   // This is a one-shot tool, so save it's results now
    }
  }

  hasPermission(){
    if (!this.props.canEdit){ 
      this.props.editDeniedReminder();
      return false;
    }
    else {
      return true;
    }

  }


  setStatusBarInfo(mouseAtText = null, colorAtText = null, colorCSSstring = null)
  {
    if (mouseAtText === null) {  
      this._statusBar.outer.css( {visibility: "hidden"} )
    }
    else {
      this._statusBar.outer.css( {visibility: "visible"} )
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
    let pCtx  = this.previewCtxArray[this.state.selectedLayerIdx]
    let imageDataAtMouse = pCtx.getImageData(x, y, 1, 1)
    let d = imageDataAtMouse.data

    let colorCSSstring = `#${this.RGBToHex(...d)}`
    this.setStatusBarInfo(`Mouse at ${x},${y}`, `${colorCSSstring}&nbsp;&nbsp;Alpha=${d[3]}`, colorCSSstring)

    // Tool api handoff
    if (this.state.toolChosen !== null && this.state.toolActive === true ) {
      this.state.toolChosen.handleMouseMove(this.collateDrawingToolEnv(event))
    }
  }


  handleMouseUp(event)
  {
    if (this.state.toolChosen !== null && this.state.toolActive === true) {
      this.state.toolChosen.handleMouseUp(this.collateDrawingToolEnv(event))
      if (this.state.toolChosen.changesImage === true)
        this.handleSave(`Drawing`)
      this.setState({ toolActive: false });
    }
  }


  handleMouseLeave(event)
  {
    this.setStatusBarInfo()
    if (this.state.toolChosen !== null && this.state.toolActive === true) {
      this.state.toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      this.handleSave(`Drawing`)
      this.setState({ toolActive: false });
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
  handleToolSelected(tool)
  {
    this.setState({ toolChosen: tool });
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


  doSwapCanvases(i,j)
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }
        
    let c2 = this.props.asset.content2
    var tmp0 = i.getImageData(0,0, c2.width, c2.height)
    var tmp1 = j.getImageData(0,0, c2.width, c2.height)
    j.putImageData(tmp0, 0, 0)
    i.putImageData(tmp1, 0, 0)
  }

  handleSelectFrame(frameIndex)
  {
    // this.doSnapshotActivity(frameIndex)
    this.setState( { selectedFrameIdx: frameIndex}  )

    // for new frame clears preview canvases and update edit canvas
    let c2 = this.props.asset.content2;
    if(c2.frameData[frameIndex].length === 0){
      for(let i=0; i<this.previewCtxArray.length; i++){
        this.previewCtxArray[i].clearRect(0, 0, c2.width, c2.height);
      }
      this.updateEditCanvasFromSelectedPreviewCanvas();
    }
  }

  handleSelectLayer(layerIndex){
    // this.doSnapshotActivity(layerIndex);         // TODO guntis need to understand what is snapshotActivity
    this.setState( { selectedLayerIdx: layerIndex } );
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

  /* This stores a short-term record indicating this user is viewing this graphic
   * It provides the data for the 'just now' part of the history navigation and also 
   * the 'viewers' indicator. It helps users know other people are looking at some asset
   * right now
   */
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


  handleSave(changeText="change graphic", dontSaveFrameData)    // TODO(DGOLDS): Maybe _.throttle() this?
  {
    if (!this.props.canEdit)
    { 
      this.props.editDeniedReminder()
      return
    }

    let asset = this.props.asset;
    let c2    = asset.content2;

    if(this.previewCanvasArray && !dontSaveFrameData){ // hack for automatic checking and saving old assets to new
                                                        // dontSaveFrameData - hack when deleting/moving frames then previewCanvases are not updated
      let layerCount = this.previewCanvasArray.length; // New layer is not yet added, so we don't use c2.layerParams.length
      for (let i = 0; i < layerCount; i++) {
        c2.frameData[this.state.selectedFrameIdx][i] = this.previewCanvasArray[i].toDataURL('image/png')
      }
      asset.thumbnail = this.frameCanvasArray[0].toDataURL('image/png')   // MAINTAIN: Match semantics of handleUndo()

      // saving data for using in map editor
      c2.spriteData = [];
      for(let i = 0; i < this.frameCanvasArray.length; i++){
        c2.spriteData[i] = this.frameCanvasArray[i].toDataURL('image/png');  
      }

      recentMarker = "_graphic_" + Random.id()     // http://docs.meteor.com/packages/random.html
      c2.changeMarker = recentMarker      
    }

    this.props.handleContentChange(c2, asset.thumbnail, changeText)
    this.doSnapshotActivity()
  }



  /// Drag & Drop of image files over preview and editor
  // TODO: See how to factor this into another function? Depends how much of our internal state it needs

  /// Allow Previews to put info in DataTransfer object so we can drag them around
  handlePreviewDragStart(idx, e) {
    // Target (this) element is the source node.
    let dragSrcEl = e.target;

    if (idx === -1)                         // The Edit Window does this
      idx = this.state.selectedLayerIdx;

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
      idx = this.state.selectedLayerIdx;
      
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
          if (idx === self.state.selectedLayerIdx)
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
            if (idx === self.state.selectedLayerIdx)
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

    let toolComponents = _.map(tools, (tool) => { return (
      <div  className={"ui button" + (this.state.toolChosen === tool ? " active" : "" )}
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

        <div className={"mgbEditGraphicSty_tagPosition ui fifteen wide column"} >
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
            <div   style={{ "overflow": "auto", /*"maxWidth": "600px",*/ "maxHeight": "600px"}}>
              <canvas ref="editCanvas"
                        style={ this.state.toolChosen ? {"cursor": this.state.toolChosen.editCursor} : {} }
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
