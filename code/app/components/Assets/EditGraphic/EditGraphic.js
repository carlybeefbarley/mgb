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
      selectedFrameIdx: 0
    }
  }



  // Graphic asset - Data format:
  //
  // content2.width
  // content2.height
  // content2.layerNames[layerIndex]     // array of layer names (content is string)
  // content2.frameNames[frameIndex]
  // content2.frameData[frameIndex][layerIndex]   /// each is a dataURL



  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    //this.editCtx.fillStyle = '#a0c0c0';
    //this.editCtx.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);

    //this.editCanvasOverlay =  ReactDOM.findDOMNode(this.refs.editCanvasOverlay);
    //this.editCtxOverlay = this.editCanvasOverlay.getContext('2d');
    //this.editCtxOverlay.fillStyle = '#a0c0c0';
    //this.editCtxOverlay.fillRect(0, 0, this.editCanvasOverlay.width, this.editCanvasOverlay.height);

    this.createDefaultContent2()              // Probably superfluous since done in render() but here to be sure.
    this.getPreviewCanvasReferences()
    this.loadPreviewsFromAsset()

    this.editCanvas.addEventListener('wheel',      this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',  this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',  this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',    this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Tool button initializations
    this.activateMenuPopups();
    this.mgb_toolActive = false;
    this.mgb_toolChosen = null;
}


  activateMenuPopups()
  {
    var $a = $(ReactDOM.findDOMNode(this))
    var $b = $a.find('.button')

    $b.popup()
  }


  createDefaultContent2()       // TODO - this isn't ideal React since it is messing with props. TODO: clean this up
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

  componentDidUpdate(prevProps,  prevState)
  {
    this.getPreviewCanvasReferences()       // Since they could have changed during the update due to frame add/remove
    this.loadPreviewsFromAsset()
  }

  getPreviewCanvasReferences()
  {
    this.previewCanvasArray = [];
    this.previewCtxArray = []

    let asset = this.props.asset;
    let c2 = asset.content2;
    let frameCount = c2.frameNames.length;

    for (let i = 0; i < frameCount; i++) {
      this.previewCanvasArray[i] =  ReactDOM.findDOMNode(this.refs["previewCanvas" + i.toString()]);
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d');
      this.previewCtxArray[i].fillStyle = '#a0c0c0';
      this.previewCtxArray[i].fillRect(0, 0, c2.width, c2.height);
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
    let w = this.previewCanvasArray[this.state.selectedFrameIdx].width;
    let h = this.previewCanvasArray[this.state.selectedFrameIdx].height;
    let s = 8;
    this.editCtx.imageSmoothingEnabled = this.checked;
    this.editCtx.mozImageSmoothingEnabled = this.checked;
    this.editCtx.webkitImageSmoothingEnabled = this.checked;
    this.editCtx.msImageSmoothingEnabled = this.checked;
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

  collateDrawingToolEnv(event)  // used to gather current useful state for the Tools and passed to them in most callbacks
  {
    let asset = this.props.asset;
    let c2    = asset.content2;
    let SCALE = 8;

    return {
      x: Math.floor(event.offsetX / SCALE),
      y: Math.floor(event.offsetY / SCALE),
      width:  c2.width,
      height: c2.height,
      scale:  SCALE,                  // TODO (edit Zoom)
      chosenColor: 'red',             // TODO
      eraserColor: 'black',           // TODO
      previewCtx: this.previewCtxArray[this.state.selectedFrameIdx],
      //previewCanvas: this.previewCanvasArray[this.state.selectedFrameIdx],
      editCtx: this.editCtx,
      //editCanvas: this.editCanvas
    }
  }


  handleMouseWheel(event)
  {
    event.preventDefault();             // TODO: Zoom
  }


  handleMouseDown(event) {
    if (this.mgb_toolChosen !== null) {
      if (this.mgb_toolChosen.supportsDrag === true)
        this.mgb_toolActive = true
      this.mgb_toolChosen.handleMouseDown(this.collateDrawingToolEnv(event))
    }
    if (this.mgb_toolChosen.supportsDrag === false)
      this.handleSave()   // This is a one-shot tool, so save it's results now
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


// Tool selection action

  handleToolSelected(tool, e,x,y,z)
  {
    let $toolbarItem = $(e.target)

    $toolbarItem
      .closest('.ui.buttons')
      .find('.button')
      .removeClass('active');

    $toolbarItem.addClass('active')

    this.mgb_toolChosen = tool;
    $(this.editCanvas).css('cursor', tool.editCursor);
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


  render() {
    this.createDefaultContent2()      // The NewAsset code is lazy, add base content here

    let asset = this.props.asset
    let c2 = asset.content2
    var selectedFrameIdx =  this.state.selectedFrameIdx

    // Generate preview Canvasses
    let previewCanvasses = _.map(c2.frameNames, (name, idx) => {
      return (
        <canvas ref={"previewCanvas"+idx.toString()}
                key={"previewCanvas"+idx.toString()}
                width={c2.width} height={c2.height}
                onClick={this.handleSelectFrame.bind(this, idx)}
                className={ selectedFrameIdx == idx ? sty.thinBorder : ""}></canvas>
    )})

    // Generate tools
    let toolComponents = _.map(tools, (tool) => { return (
      <div  className={"ui button" + (this.mgb_toolChosen === tool ? " active" : "" )}
            onClick={this.handleToolSelected.bind(this, tool)}
            key={tool.name}
            data-content={tool.name}
            data-variation="tiny"
            data-position="right center">
        <i className={tool.icon}></i>
      </div>);
    });

    // Make element
    return (
      <div className="ui grid">

        <div className="ui one wide column">
          <div className="ui vertical icon buttons">
            {toolComponents}
            <div className="ui button" onClick={this.handleSave.bind(this)}
                 data-content="Save"
                 data-variation="tiny"
                 data-position="right center">
              <i className="save icon"></i>
            </div>
          </div>
        </div>

        <div className={sty.tagPosition + " ui twelve wide column"}>
          <canvas ref="editCanvas" width="512" height="256" className={sty.thinBorder}></canvas>
          {/*<canvas ref="editCanvasOverlay" width="512" height="256" className={sty.forceTopLeft}></canvas>*/}

          <div className="ui three item menu">
            <a className="item">Grid</a>
            <a className="item">Zoom</a>
            <a className="item active">Animate</a>
          </div>

          <ColorPicker type="sketch" />


        </div>

        <div className="ui two wide column ">
          {previewCanvasses}
          <a className="mini ui compact button" onClick={this.handleAddFrame.bind(this)}>Add Frame</a>
        </div>

      </div>
    )
  }
}
