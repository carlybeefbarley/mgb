import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';

@reactMixin.decorate(History)
export default class EditGraphic extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }


  componentDidMount() {
    $(this.refs.mySidebar).sidebar( {
      transition: 'push',
      context: $(this.refs.parentOfSidebar)
    });


    this.canvas =  ReactDOM.findDOMNode(this.refs.editCanvas);
    this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = '#a0c0c0';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(0, 0, 10, 10);

    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mouseup',   this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave',   this.handleMouseUp.bind(this));

    this.mgb_toolActive = false;
}

  handleMouseDown(event)
  {
    this.mgb_toolActive = true;
    this._pixelDrawAt(event, 'red')
  }

  handleMouseUp(event)
  {
    this.mgb_toolActive = false;
  }

  _pixelDrawAt(event, color)
  {
    let x = event.offsetX & 0xfff0;
    let y = event.offsetY & 0xfff0;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 13, 13);

  }

  handleMouseMove(event)
  {
    if (this.mgb_toolActive) {
      this._pixelDrawAt(event, 'red')
    }
    $(event.target).css('cursor','crosshair');
  }

  handleToggleSidebar()
  {
    $(this.refs.mySidebar).sidebar('toggle');
  }


  render() {

    let asset = this.props.asset;

    return (
      <div>
      <div ref="parentOfSidebar" className="ui segment inverted">
          <p onClick={this.handleToggleSidebar.bind(this)}>
            <i className="home icon"/>
            Edit {asset.kind} '{asset.name}'
          </p>

          <div ref="mySidebar" className="ui left vertical inverted  labeled  thin sidebar menu visible">
            <a className="item">
              <i className="paint brush icon"></i>
              Paint
            </a>
            <a className="item">
              <i className="eraser icon"></i>
              Erase
            </a>
            <a className="item">
              <i className="block layout icon"></i>
              Shape
            </a>
            <a className="item">
              <i className="save icon"></i>
              Save
            </a>
          </div>

          <div className="ui segments pusher">
            <div className="ui segment">
              <canvas ref="editCanvas" width="600" height="400"></canvas>
            </div>
            <div className="ui orange segment">
              <p>Other stuff to go here</p>
            </div>
          </div>

        </div>
      </div>
    )
  }
}
