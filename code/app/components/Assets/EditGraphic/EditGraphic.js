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


  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    //this.editCtx.fillStyle = '#a0c0c0';
    //this.editCtx.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);

    //this.editCanvasOverlay =  ReactDOM.findDOMNode(this.refs.editCanvasOverlay);
    //this.editCtxOverlay = this.editCanvasOverlay.getContext('2d');
    //this.editCtxOverlay.fillStyle = '#a0c0c0';
    //this.editCtxOverlay.fillRect(0, 0, this.editCanvasOverlay.width, this.editCanvasOverlay.height);


    this.previewCanvas =  ReactDOM.findDOMNode(this.refs.previewCanvas);
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.previewCtx.fillStyle = '#a0c0c0';
    this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    let asset = this.props.asset;

    if (asset.hasOwnProperty('content2'))
      this.loadPreviewFromDataURI(asset.content2.imageData)

    this.editCanvas.addEventListener('wheel',      this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',  this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',  this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',    this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    this.mgb_toolActive = false;
    this.handleToolPaint();
}


  componentDidUpdate(prevProps,  prevState)
  {
    let asset = this.props.asset;

    if (asset.hasOwnProperty('content2'))
      this.loadPreviewFromDataURI(asset.content2.imageData)
  }


  loadPreviewFromDataURI(dataURI)
  {
    if (dataURI !== undefined && dataURI.startsWith("data:image/png;base64,"))
    {
      var _img = new Image;
      var _ctx = this.previewCtx;
      var self = this;
      _img.src = dataURI;   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = function() {
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
        self.updateEditCanvasFromPreviewCanvas();
      }
    }
    else {
      console.log("Unrecognized graphic data URI")
    }
  }

  updateEditCanvasFromPreviewCanvas()
  {
    // TODO: Add dirty region to bound work
    let w = this.previewCanvas.width;
    let h = this.previewCanvas.height;
    let s = 8;
    this.editCtx.imageSmoothingEnabled = this.checked;
    this.editCtx.mozImageSmoothingEnabled = this.checked;
    this.editCtx.webkitImageSmoothingEnabled = this.checked;
    this.editCtx.msImageSmoothingEnabled = this.checked;
    this.editCtx.drawImage(this.previewCanvas, 0, 0, w, h, 0, 0, w*s, h*s)
  }

  handleSave()
  {
    let x = { imageData: this.previewCanvas.toDataURL('image/png') };
    this.props.handleContentChange(x);
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

  handleMouseUp(event)      // Also used for MouseLeave event
  {
    this.mgb_toolActive = false;
    this.handleSave()
  }

  _pixelDrawAt(event, color)
  {
    let x = event.offsetX & 0xfff8;
    let y = event.offsetY & 0xfff8;

    let chosenColor = this.mgb_toolChosen === "paint" ? color : '#a0c0c0';

    this.editCtx.fillStyle = chosenColor;
    this.editCtx.fillRect(x, y, 8, 8);

    this.previewCtx.fillStyle = chosenColor;
    this.previewCtx.fillRect(x/8, y/8, 1, 1)
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


  render() {

    let asset = this.props.asset;

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
          <canvas ref="previewCanvas" width="64" height="32"></canvas>
        </div>

      </div>
    )
  }
}
