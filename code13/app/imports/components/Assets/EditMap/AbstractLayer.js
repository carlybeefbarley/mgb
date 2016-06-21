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
  }
  componentDidMount() {
    this.adjustCanvas();
    const canvas = this.refs.canvas;
    this.ctx = canvas.getContext("2d");

    this.props.map.layers.push(this);
    document.body.addEventListener("mouseup", this._mup);

  }
  componentWillUnmount() {
    const index = this.props.map.layers.indexOf(this);
    if (index > -1) {
      this.props.map.layers.splice(index, 1);
    }
    document.body.removeEventListener("mouseup", this._mup);
  }

  /* endof lifecycle functions */

  get options() {
    return this.props.data;
  }
  get map() {
    return this.props.map;
  }
  // this might get pretty slow and at some point there will be requirement for camera events
  get camera() {
    if (!this._camera) {
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

  }

  /* events */
  handleMouseUp(){
    this.mouseDown = false;
  }
  handleMouseDown(){
    this.mouseDown = true;
  }

}
