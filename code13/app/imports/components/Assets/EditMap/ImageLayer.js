"use strict";
import React from 'react';
import AbstractLayer from "./AbstractLayer.js";
import LayerTypes from "./Tools/LayerTypes.js";

export default class ImageLayer extends AbstractLayer {
  constructor(...args){
    super(...args);
    this.kind = LayerTypes.image;
  }

  draw(){
    if(!this.options.image){
      return;
    }
    const img = this.map.images.get(this.options.image);
    if(!img){
      return;
    }
    // TODO: cut invisible parts
    this.ctx.drawImage(img,
      0, 0, img.width, img.height,
      (this.options.x + this.map.camera.x) * this.map.camera.zoom,
      (this.options.y + this.map.camera.y) * this.map.camera.zoom,
      img.width * this.map.camera.zoom, img.height * this.map.camera.zoom);
  }

  handleMouseMove(){

  }
  handleMouseDown(){

  }
  onMouseLeave(){

  }
  onDrop(e){
    e.preventDefault();
    e.stopPropagation();
    const dataStr = e.dataTransfer.getData("text");
    let asset, data;
    if(dataStr){
      data = JSON.parse(dataStr);
    }
    asset = data.asset;

    if(asset && asset.kind != "graphic"){
      return;
    }
    console.log("Dropped asset:", asset);

    this.options.image = data.link;
    this.map.fullUpdate();
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
              onDrop={this.onDrop.bind(this)}
              style={{
              //width: "100%", height: "100%",
              display: "block"
            }}>
      </canvas>
    </div>);
  }
}
