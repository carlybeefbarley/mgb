"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';
export default class TilesetControls extends React.Component {

  addImageFromInput(e) {
    // enter key
    if(e.which != 13){
      return;
    }
    this.addTilesetFromUrl(this.refs.input.value);
    this.refs.input.value = "";
  }

  addTilesetFromUrl(url, asset){
    if(!url){
      return;
    }
    let val = TileHelper.normalizePath(url);

    let img = new Image();
    img.onload = (e) => {
      this.addTileset(img, asset);
    };
    img.onerror = (e)=> {
      console.error("failed to load image:", url, val);
    };
    img.src = val;
  }
  updateTilesetFromUrl(url, tileset){
    if(!url){
      return;
    }
    let val = TileHelper.normalizePath(url);
    let img = new Image();
    img.onload = (e) => {
      this.updateTileset(img, tileset);
    };
    img.onerror = (e)=> {
      console.error("failed to load image:", url, val);
    };
    img.src = val;
  }

  updateTileset(img, tileset){
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;
    const src = TileHelper.normalizePath(img.src);
    map.images.set(src, img);
    tileset.image = src;

    map.updateImages(()=>{map.update();});
  }

  addTileset(img, asset) {
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;
    const tss = map.data.tilesets;
    const name = asset ? asset.name : img.src.split("/").pop();
    const ts = TileHelper.genTileset(map.data, img.src, img.width, img.height,
      map.data.tilewidth, map.data.tileheight, name
    );

    tss.push(ts);
    map.images.set(TileHelper.normalizePath(img.src), img);
    map.updateImages();
    parent.selectTileset(tss.length - 1);
  }
  updateTilesetFromData(data){
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;

    const ts = TileHelper.genTileset(map.data, data.image, data.imagewidth, data.imageheight,
      data.tilewidth, data.tileheight, data.name
    );
    ts.tiles = data.tiles;

    const tss = map.data.tilesets;
    tss.push(ts);

    const img = new Image();
    img.onload = () => {
      map.images.set(TileHelper.normalizePath(img.src), img);
      map.updateImages();
      parent.selectTileset(tss.length - 1);
    };
    img.src = data.image;
  }

  removeTileset() {
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;
    const tss = map.map.tilesets;
    const active = map.activeTileset;

    map.activeTileset = 0;
    tss.splice(active, 1);
    map.fullUpdate();
  }

  render() {
    return (
      <div className="ui mini">

        <div className="ui icon buttons mini"
             style={{
              position: "relative",
              top: "-10px"
            }}
          >
          <input type="text" onKeyUp={this.addImageFromInput.bind(this)} ref="input" style={{
            fontSize: "15px"
          }} />
          {/*<button className="ui floated icon button">
           <i className="add icon"></i>
           </button>
           <button className="ui floated icon button">
           <i className="signal icon"></i>
           </button>
           <button className="ui floated icon button">
           <i className="shop icon"></i>
           </button>*/}
        </div>
        <div className="ui icon buttons right floated mini"
             title="Remove Active Tileset"
             style={{
              position: "relative",
              top: "-10px"
            }}>
          <button className="ui icon button"
                  onClick={this.removeTileset.bind(this)}
            >
            <i className="remove icon"></i>
          </button>

        </div>
      </div>
    )
  }
}
