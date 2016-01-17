import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';
import sty from  './editGraphic.css';
import tools from './Tools.js';
import ColorPicker from 'react-color';        // http://casesandberg.github.io/react-color/

@reactMixin.decorate(History)
export default class EditGraphic extends React.Component {
  static PropTypes = {
    asset: PropTypes.object,
    handleContentChange: PropTypes.function
  }

  constructor(props) {
    super(props);
    this.state = {
      editScale:        8,        // Zoom scale of the Edit Canvas
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
    this.loadPreviewsFromAsset()

    //Keypress not working
    //let $grid = $(ReactDOM.findDOMNode(this.refs.outerGrid))
    //$grid.keydown(function (e) { console.log(e)})


    this.editCanvas.addEventListener('wheel',         this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',     this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',     this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',       this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave',    this.handleMouseLeave.bind(this));

    // Tool button initializations
    this.activateToolPopups();
    this.mgb_toolActive = false;
    this.mgb_toolChosen = null;
  }


  activateToolPopups()
  {
    // See http://semantic-ui.com/modules/popup.html#/usage

    let $a = $(ReactDOM.findDOMNode(this))
    $a.find('.button').popup()
    $a.find('.hazpopup').popup()

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


  initDefaultContent2()       // TODO - this isn't ideal React since it is messing with props. TODO: clean this up
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
    this.loadPreviewsFromAsset()
  }


  getPreviewCanvasReferences()
  {
    this.previewCanvasArray = []                // Preview canvas for this animation frame
    this.previewCtxArray = []                   // 2d drawing context for the animation frame
    this.previewCtxImageData1x1Array = []       // Used for painting quickly to each preview frame

    let asset = this.props.asset;
    let c2 = asset.content2;
    let frameCount = c2.frameNames.length;

    for (let i = 0; i < frameCount; i++) {
      this.previewCanvasArray[i] =  ReactDOM.findDOMNode(this.refs["previewCanvas" + i.toString()]);
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d');
      this.previewCtxImageData1x1Array[i] = this.previewCtxArray[i].createImageData(1,1);
    }
  }


  loadPreviewsFromAsset()
  {
    let c2 = this.props.asset.content2;
    let frameCount = c2.frameNames.length;

    for (let i = 0; i < frameCount; i++) {
      let dataURI = c2.frameData[i][0];

      if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
        var _img = new Image
        var self = this
        _img.src = dataURI    // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
        _img.mgb_hack = i     // so in onload() callback we know which previewCtx to apply the data to
        _img.onload = function (e) {
          self.previewCtxArray[e.target.mgb_hack].drawImage(e.target, 0, 0);
          if (e.target.mgb_hack === self.state.selectedFrameIdx)
            self.updateEditCanvasFromSelectedPreviewCanvas();
        }
      }
      else {
        this.updateEditCanvasFromSelectedPreviewCanvas();
      }
    }
  }


  updateEditCanvasFromSelectedPreviewCanvas()
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


  handleSave()
  {
    let asset = this.props.asset;
    let c2    = asset.content2;
    let frameCount = this.previewCanvasArray.length;  // We don't use c2.frameNames.length  coz of the Add Frame button

    for (let i = 0; i < frameCount; i++) {
      c2.frameData[i][0] = this.previewCanvasArray[i].toDataURL('image/png')
    }
    asset.thumbnail = this.previewCanvasArray[0].toDataURL('image/png')
    this.props.handleContentChange(c2, asset.thumbnail);
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

      chosenColor: this.state.selectedColors['fg'],

      previewCtx:             pCtx,
      previewCtxImageData1x1: pCtxImageData1x1,
      editCtx:                this.editCtx,
      editCtxImageData1x1:    this.editCtxImageData1x1,

      // setPixelsAt() Like CanvasRenderingContext2D.fillRect, but
      //   (a) It SETS rather than draws-with-alpha-blending
      //   (b) It does this to both the current Preview AND the Edit contexts (with zoom scaling)
      //   So this is faster than a ClearRect+FillRect in many cases.
      setPixelsAt: function (x, y, w=1, h=1) {


        // First set Pixels on the Preview context
        self._setImageData4BytesFromRGBA(retval.previewCtxImageData1x1.data, retval.chosenColor.rgb)
        for (let i = 0; i < w; i++) {
          for (let j = 0; j < h; j++) {
            retval.previewCtx.putImageData(retval.previewCtxImageData1x1, x+i, y+j)
          }
        }

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

    event.preventDefault();

    // if wheel is for scale:
      //let s = this.state.editScale;
      //if (event.wheelDelta < 0 && s >1)
      //  this.setState( {editScale : s >> 1})
      //else if (event.wheelDelta > 0 && s < 8)
      //  this.setState( {editScale : s << 1})

    // if wheel is for frame
    let f = this.state.selectedFrameIdx
    if (event.wheelDelta < 0 && f >0)
      this.setState( {selectedFrameIdx : f-1})
    else if (event.wheelDelta > 0 && f+1 < this.previewCanvasArray.length)
      this.setState( {selectedFrameIdx : f+1})

  }


  handleResize(dw, dh)
  {
    if (dw !== 0 || dh !== 0)
    {
      let c2 = this.props.asset.content2
      c2.width = Math.min(c2.width+dw, 64)
      c2.height = Math.min(c2.height+dh, 64)
      this.handleSave()
    }
  }



  handleMouseDown(event) {
    if (this.mgb_toolChosen !== null) {
      if (this.mgb_toolChosen.supportsDrag === true)
        this.mgb_toolActive = true

      this.mgb_toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))

      if (this.mgb_toolChosen.supportsDrag === false)
        this.handleSave()   // This is a one-shot tool, so save it's results now
    }
  }


  handleMouseMove(event)
  {
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true ) {
      this.mgb_toolChosen.handleMouseMove(this.collateDrawingToolEnv(event))
    }
  }


  handleMouseUp(event)
  {
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true) {
      this.mgb_toolChosen.handleMouseUp(this.collateDrawingToolEnv(event))
      this.handleSave()
      this.mgb_toolActive = false
    }
  }


  handleMouseLeave(event)
  {
    if (this.mgb_toolChosen !== null && this.mgb_toolActive === true) {

      this.mgb_toolChosen.handleMouseLeave(this.collateDrawingToolEnv(event))
      this.handleSave()
      this.mgb_toolActive = false
    }
  }

  //handleKeyDown(event)
  //{
  //  for (let t of tools)
  //  {
  //    console.log(t)
  //  }
  //
  //}


// Tool selection action

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
// it isn't a drawing tool and that's what t he plugin api is focussed on

  handleColorChangeComplete(colortype, chosenColor)
  {
    // See http://casesandberg.github.io/react-color/#api-onChangeComplete
    this.state.selectedColors[colortype] = chosenColor;
    this.setState( { selectedColors: this.state.selectedColors } )      // TODO: Handle this immutably
  }

// Add/Select/Remove etc animation frames


  handleAddFrame()
  {
    let fN = this.props.asset.content2.frameNames
    let newFrameName = "Frame " + fN.length.toString()
    fN.push(newFrameName)
    this.props.asset.content2.frameData.push([])
    this.handleSave()
    this.forceUpdate()
  }


  handleSelectFrame(frameIndex)
  {
    this.setState( { selectedFrameIdx: frameIndex})
  }

  // React Callback: render()
  render() {
    this.initDefaultContent2()      // The NewAsset code is lazy, so add base content here

    let asset = this.props.asset
    let c2 = asset.content2
    let zoom = this.state.editScale
    var selectedFrameIdx =  this.state.selectedFrameIdx

    // Generate preview Canvasses
    let previewCanvasses = _.map(c2.frameNames, (name, idx) => {
      return (
        <canvas ref={"previewCanvas"+idx.toString()}
                key={"previewCanvas"+idx.toString()}
                width={c2.width} height={c2.height}
                onClick={this.handleSelectFrame.bind(this, idx)}
                className={ selectedFrameIdx == idx ? sty.thickBorder : sty.thinBorder}></canvas>
    )})

    // Generate tools
    let toolComponents = _.map(tools, (tool) => { return (
      <div  className={"ui button" + (this.mgb_toolChosen === tool ? " active" : "" )}
            onClick={this.handleToolSelected.bind(this, tool)}
            key={tool.name}
            data-content={tool.name + " (" + tool.shortcutKey + ")"}
            data-variation="tiny"
            data-position="right center">
        <i className={tool.icon}></i>
      </div>);
    });

    // Make element
    return (
      <div className="ui grid" ref="outerGrid">

        <div className="ui one wide column">
          <div className="ui vertical icon buttons" ref="toolbar">
            {toolComponents}


            <div className="ui button mgbColorPickerHost"
                 data-position="right center">
              <i className="block layout icon"></i>
            </div>
          </div>
        </div>

        <div className={sty.tagPosition + " ui twelve wide column"} >
          <div className="row">
            <a className="ui label mgbResizerHost" data-position="right center">
              <i className="icon expand"></i> {"Size: " + c2.width + " x " + c2.height}
            </a>
            <span>&nbsp;&nbsp;&nbsp;</span>
            <a className="ui label hazpopup" onClick={this.handleZoom.bind(this)}
               data-content="Click to change zoom level"
               data-variation="tiny"
               data-position="bottom center">
              <i className="icon zoom"></i> Zoom {zoom}x
            </a>
            <span>&nbsp;&nbsp;&nbsp;</span>
            <a className="ui label hazpopup" onClick={this.handleSave.bind(this)}
               data-content="Changes are continuously saved and updated to other viewers "
               data-variation="tiny"
               data-position="bottom center">
              <i className="save icon"></i> Autosave ON
            </a>
            <span>&nbsp;&nbsp;&nbsp;</span>
            <a className="ui label hazpopup" onClick={this.handleSave.bind(this)}
               data-content="Use mouse wheel over edit area to change current edited frame"
               data-variation="tiny"
               data-position="bottom center">
              <i className="tasks icon"></i> Frame #{this.state.selectedFrameIdx} of {c2.frameNames.length}
            </a>

          </div>
          <div className="row">
            <br></br>
          </div>
          <div className="row">
            <canvas ref="editCanvas" width={zoom*c2.width} height={zoom*c2.height} className={sty.checkeredBackground + " " + sty.thinBorder + " " + sty.atZeroZero}></canvas>
          </div>


          <div className="ui popup mgbColorPickerWidget">
            <div className="ui header">Color Picker (1..9)</div>
            <ColorPicker type="sketch"
                         onChangeComplete={this.handleColorChangeComplete.bind(this, 'fg')}
                         color={this.state.selectedColors['fg'].rgb}/>
          </div>


          <div className="ui popup mgbResizer">
            <div className="ui ">Grow or shrink Graphic</div>
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

        <div className="ui two wide column ">
          {previewCanvasses}
          <a className="mini ui compact button" onClick={this.handleAddFrame.bind(this)}>Add Frame</a>
        </div>

      </div>
    )
  }
}
