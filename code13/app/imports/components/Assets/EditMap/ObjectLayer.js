"use strict";
import React from 'react';
import AbstractLayer from "./AbstractLayer.js";
import TileHelper from "./TileHelper.js";

export default class ObjectLayer extends AbstractLayer {
  handleMouseMove(){

  }
  handleMouseDown(){

  }
  onMouseLeave(){

  }
  render(){
    // TODO - probably we can leave only canvas element here
    return (<div
      ref="layer"
      className={this.isActive() ? "tilemap-layer" : "tilemap-layer no-events"}
      data-name={this.props.data.name}
      >
      <canvas ref="canvas"
              onMouseMove={this.handleMouseMove.bind(this)}
              onMouseDown={this.handleMouseDown.bind(this)}
              onMouseLeave={this.onMouseLeave.bind(this)}
              style={{
              display: "block"
            }}>
      </canvas>
    </div>);
  }
}
