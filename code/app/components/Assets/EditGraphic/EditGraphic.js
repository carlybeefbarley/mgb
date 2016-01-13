import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';

@reactMixin.decorate(History)
export default class EditGraphic extends React.Component {
  static PropTypes = {
    asset: PropTypes.object,
    handleContentChange: PropTypes.function
  }


  componentDidMount() {
    this.editCanvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.editCtx = this.editCanvas.getContext('2d');
    this.editCtx.fillStyle = '#a0c0c0';
    this.editCtx.fillRect(0, 0, this.editCanvas.width, this.editCanvas.height);

    this.previewCanvas =  ReactDOM.findDOMNode(this.refs.previewCanvas);
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.previewCtx.fillStyle = '#a0c0c0';
    this.previewCtx.fillRect(0, 0, this.previewCanvas.width, this.previewCanvas.height);

    let asset = this.props.asset;

    if (asset.hasOwnProperty('content') && asset.content.startsWith("data:image/png;base64,"))
    {
      var _img = new Image;
      var _ctx= this.editCtx;
      _img.src = asset.content;   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = function() {
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
      }
    }

    this.editCanvas.addEventListener('wheel',      this.handleMouseWheel.bind(this));
    this.editCanvas.addEventListener('mousemove',  this.handleMouseMove.bind(this));
    this.editCanvas.addEventListener('mousedown',  this.handleMouseDown.bind(this));
    this.editCanvas.addEventListener('mouseup',    this.handleMouseUp.bind(this));
    this.editCanvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    this.mgb_toolActive = false;
    this.HandleToolPaint();
}


  componentDidUpdate(prevProps,  prevState)
  {
    let asset = this.props.asset;

    if (asset.hasOwnProperty('content') && asset.content.startsWith("data:image/png;base64,"))
    {
      var _img = new Image;
      var _ctx= this.editCtx;
      _img.src = asset.content;   // data uri, e.g.   'data:image/png;base64,FFFFFFFFFFF' etc
      _img.onload = function() {
        _ctx.drawImage(_img,0,0); // needs to be done in onload...
      }
    }
  }

  handleMouseWheel(event)
  {
    event.preventDefault();
   // debugger;
   //console.log(event)
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
    this.editCtx.fillRect(x, y, 6, 6);

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

  handleSave()
  {
    let x = this.editCanvas.toDataURL('image/png');
    this.props.handleContentChange(x);
  }

  HandleToolPaint()
  {
    $(this.refs.toolPaint).addClass("active");
    $(this.refs.toolEraser).removeClass("active");
    this.mgb_toolChosen = "paint";
  }

  HandleToolEraser()
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
            <a className="item" onClick={this.HandleToolPaint.bind(this)} ref="toolPaint">
              <i className="paint brush icon"></i>
              Paint
            </a>
            <a className="item" onClick={this.HandleToolEraser.bind(this)} ref="toolEraser">
              <i className="eraser icon"></i>
              Erase
            </a>
            <a className="item">
              <i className="block layout icon"></i>
              Shape
            </a>
            <a className="item" onClick={this.handleSave.bind(this)}>
              <i className="save icon" ></i>
              Save
            </a>
          </div>
        </div>

        <div className="ui eight wide column  ">
          <canvas ref="editCanvas" width="400" height="200"></canvas>
        </div>

        <div className="ui two wide column inverted ">
          <canvas ref="previewCanvas" width="64" height="32"></canvas>
        </div>

      </div>
    )
  }
}
