import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';
import sty from  './editGraphic.css';

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



  // Grahic asset - Data format:
  //
  // content2.width
  // content2.height
  // content2.layerNames[layerIndex]     // array of layer names (content is string)
  // content2.frameNames[frameIndex]
  // content2.frameData[frameIndex][layerIndex]   /// each is an a dataURL




  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    //this.editCtx.fillStyle = '#a0c0c0';
    //this.editCtx.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);

    //this.editCanvasOverlay =  ReactDOM.findDOMNode(this.refs.editCanvasOverlay);
    //this.editCtxOverlay = this.editCanvasOverlay.getContext('2d');
    //this.editCtxOverlay.fillStyle = '#a0c0c0';
    //this.editCtxOverlay.fillRect(0, 0, this.editCanvasOverlay.width, this.editCanvasOverlay.height);

    this.createDefaultContent2()
    let asset = this.props.asset;

    this.getPreviewCanvasReferences(asset)
    this.loadPreviewsFromAsset()

    this.editCanvas.addEventListener('wheel',      this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',  this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',  this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',    this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    this.mgb_toolActive = false;
    this.handleToolPaint();
}


  createDefaultContent2()       // TODO - this isn't ideal React since it is messing with props. TODO: clean this up
  {
    let asset = this.props.asset;

    if (!asset.content2.hasOwnProperty('width')) {
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
    let asset = this.props.asset;

    // CLEAR and RECREATE THE Previews - could have been added/removed/reordered
    this.getPreviewCanvasReferences(asset)

    if (asset.hasOwnProperty('content2'))
      this.loadPreviewsFromAsset()
  }

  getPreviewCanvasReferences(asset)
  {
    this.previewCanvasArray = [];
    this.previewCtxArray = []

    let c2  = asset.content2;
    let frameCount = c2.frameNames.length;

    for (let i = 0; i < frameCount; i++) {
      this.previewCanvasArray[i] =  ReactDOM.findDOMNode(this.refs["previewCanvas" + i.toString()]);
      if (this.previewCanvasArray[i] === null) {
        console.log("Could not find previewCanvas" + i.toString())
      }
      this.previewCtxArray[i] = this.previewCanvasArray[i].getContext('2d');
      this.previewCtxArray[i].fillStyle = '#a0c0c0';
      this.previewCtxArray[i].fillRect(0, 0, c2.width, c2.height);
    }

  }


  loadPreviewsFromAsset()
  {
    let c2 = this.props.asset.content2;
    var frameCount = c2.frameNames.length;
    for (let i = 0; i < frameCount; i++) {
      let dataURI = c2.frameData[i][0];

      if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,")) {
        var _img = new Image
        var self = this
        _img.src = dataURI    // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
        _img.mgb_hack = i     // so in onload we know which previewCtx to apply the data to
        _img.onload = function (e) {
          self.previewCtxArray[e.target.mgb_hack].drawImage(e.target, 0, 0);
          if (e.target.mgb_hack === self.state.selectedFrameIdx)
            self.updateEditCanvasFromPreviewCanvas();
        }
      }
      else {
        console.log("Unrecognized graphic data URI: " + dataURI)
        this.updateEditCanvasFromPreviewCanvas();

      }
    }
  }

  updateEditCanvasFromPreviewCanvas()
  {
    // TODO: Add dirty region to bound work
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
    let c2  = asset.content2;
    let frameCount = this.previewCanvasArray.length;  // We don't use c2.frameNames.length  coz of the Add Frame button

    for (let i = 0; i < frameCount; i++) {
      asset.content2.frameData[i][0] = this.previewCanvasArray[i].toDataURL('image/png')
    }
    this.props.handleContentChange(asset.content2);
  }


  handleMouseWheel(event)
  {
    event.preventDefault();   // TODO: Zoom
  }

  handleMouseDown(event)
  {
    this.mgb_toolActive = true;
    this._pixelDrawAt(event, 'red')
    this.handleSave()
  }

  handleMouseUp(event)
  {
    if (this.mgb_toolActive) {
      this.mgb_toolActive = false;
      this.handleSave()
    }
  }

  handleMouseLeave(event)
  {
    if (this.mgb_toolActive) {
      this.mgb_toolActive = false;
      this.handleSave()
    }
  }

  _pixelDrawAt(event, color)
  {
    let x = event.offsetX & 0xfff8;
    let y = event.offsetY & 0xfff8;

    let chosenColor = this.mgb_toolChosen === "paint" ? color : '#a0c0c0';

    this.editCtx.fillStyle = chosenColor;
    this.editCtx.fillRect(x, y, 8, 8);

    this.previewCtxArray[this.state.selectedFrameIdx].fillStyle = chosenColor;
    this.previewCtxArray[this.state.selectedFrameIdx].fillRect(x/8, y/8, 1, 1)
  }

  handleMouseMove(event)
  {
    if (this.mgb_toolActive) {
      this._pixelDrawAt(event, 'red')
    }
    $(event.target).css('cursor','crosshair');
  }

  handleToolPaint()
  {
    $(this.refs.toolPaint).addClass("active");
    $(this.refs.toolEraser).removeClass("active");
    this.mgb_toolChosen = "paint";
  }

  handleToolEraser()
  {
    $(this.refs.toolEraser).addClass("active");
    $(this.refs.toolPaint).removeClass("active");
    this.mgb_toolChosen = "eraser";

  }

  handleAddFrame()
  {
    let fN = this.props.asset.content2.frameNames;
    let newFrameName = "Frame " + fN.length.toString();
    fN.push(newFrameName);
    this.props.asset.content2.frameData.push([]);
    this.handleSave();
    this.forceUpdate();
  }

  handleSelectFrame(frameIndex)
  {
    this.setState( { selectedFrameIdx: frameIndex})
  }

  render() {
    this.createDefaultContent2()          // The outer create function is very lazy, so we fix up missing content here

    let asset = this.props.asset;

    let c2 = asset.content2;

    var selectedFrameIdx =  this.state.selectedFrameIdx;
    let previewCanvasses = _.map(c2.frameNames, (name, idx) => {
      console.log(" pc" + idx.toString())
      return (
        <canvas ref={"previewCanvas"+idx.toString()}
                key={"previewCanvas"+idx.toString()}
                width={c2.width} height={c2.height}
                onClick={this.handleSelectFrame.bind(this, idx)}
                className={ selectedFrameIdx == idx ? sty.thinBorder : ""}></canvas>
    )})

    return (
      <div className="ui grid">

        <div className="ui two wide column">
          <div className="ui vertical fluid  icon menu">
            <a className="item" onClick={this.handleToolPaint.bind(this)} ref="toolPaint">
              <i className="paint brush icon"></i>
              Paint
            </a>
            <a className="item" onClick={this.handleToolEraser.bind(this)} ref="toolEraser">
              <i className="eraser icon"></i>
              Erase
            </a>
            <a className="item">
              <i className="block layout icon"></i>
              Color
            </a>
            <a className="item">
              <i className="circle thin icon"></i>
              Shape
            </a>
            <a className="item" onClick={this.handleSave.bind(this)}>
              <i className="save icon" ></i>
              Save
            </a>
          </div>
        </div>

        <div className={sty.tagPosition + " ui twelve wide column"}>
          <canvas ref="editCanvas" width="512" height="256" className={sty.thinBorder}></canvas>
          {/*<canvas ref="editCanvasOverlay" width="512" height="256" className={sty.forceTopLeft}></canvas>*/}

        </div>

        <div className="ui two wide column ">
          {previewCanvasses}
          <a className="mini ui compact button" onClick={this.handleAddFrame.bind(this)}>Add Frame</a>
        </div>

      </div>
    )
  }
}
