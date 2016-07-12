"use strict";
import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";
import TileSelection from "./Tools/TileSelection.js";
import EditModes from "./Tools/EditModes.js";
import TileCollection from "./Tools/TileCollection.js";
import LayerTypes from "./Tools/LayerTypes.js";

export default class AbstractLayer extends React.Component {
  /* lifecycle functions */
  constructor(...args) {
    super(...args);
    this.ctx = null;
    this.mouseDown = false;

    this._mup = this.handleMouseUp.bind(this);
    this._mov = this.handleMouseMove.bind(this);
    this._kup = this._onKeyUp.bind(this);
  }
  componentDidMount() {
    this.adjustCanvas();
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");

    this.props.map.layers.push(this);
    window.addEventListener("mouseup", this._mup);
    window.addEventListener("keyup", this._kup);
    window.addEventListener("mousemove", this._mov);
  }
  componentWillUnmount() {
    const index = this.props.map.layers.indexOf(this);
    if (index > -1) {
      this.props.map.layers.splice(index, 1);
    }
    window.removeEventListener("mouseup", this._mup);
    window.removeEventListener("keyup", this._kup);
    window.removeEventListener("mousemove", this._mov);
  }
  // this layer has been selected
  activate(){
    if(this.activeMode){
      this.map.setMode(this.activeMode);
    }
  }

  // this layer has been deselected - called before another layer activate
  deactivate(){
    this.activeMode = this.map.options.mode;
  }
  /* endof lifecycle functions */

  get options() {
    return this.props.data;
  }
  get data() {
    return this.props.data;
  }
  get map() {
    return this.props.map;
  }

  // this might get pretty slow and at some point there will be requirement for camera events
  get camera(){
    if(!this._camera){
      this._camera = Object.create(this.map.camera);
    }
    this._camera.x = this.map.camera.x + this.options.x;
    this._camera.y = this.map.camera.y + this.options.y;
    this._camera.zoom = this.map.camera.zoom;
    return this._camera;
  }
  isActive() {
    return this.options == map.data.layers[map.activeLayer];
  }
  adjustCanvas(){
    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();
  }

  draw(){
    this.isDirty = true;
  }


  /* events */
  handleMouseUp(e){
    this.mouseDown = false;

    this.movementX = 0;
    this.movementY = 0;

    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;

    this.pointerPosX = (this.mouseX / this.camera.zoom - this.camera.x);
    this.pointerPosY = (this.mouseY / this.camera.zoom - this.camera.y);
  }
  handleMouseDown(e){
    this.mouseDown = true;

    this.movementX = 0;
    this.movementY = 0;

    this.mouseX = e.offsetX;
    this.mouseY = e.offsetY;

    this.pointerPosX = (this.mouseX / this.camera.zoom - this.camera.x);
    this.pointerPosY = (this.mouseY / this.camera.zoom - this.camera.y);

    if(e.buttons == 4){
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }
  handleMouseMove(e){
    this.mouseY = e.offsetY;
    this.mouseX = e.offsetX;
    if(this.mouseDown){
      this.movementX += (e.movementX / this.camera.zoom);
      this.movementY += (e.movementY / this.camera.zoom);

    }
  }
  _onKeyUp(e){
    if(this.isActive()){
      this.onKeyUp && this.onKeyUp(e);
    }
  }

  render(){
    return (<div
      ref="layer"
      className={this.isActive() ? "tilemap-layer" : "tilemap-layer no-events"}
      data-name={this.props.data.name}
      >
      <canvas ref="canvas"
              onMouseDown={this.handleMouseDown.bind(this)}
              onMouseLeave={this.onMouseLeave.bind(this)}
              style={{
              display: "block"
            }}>
      </canvas>
    </div>);
  }

}
