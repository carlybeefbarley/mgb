"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';
export default class TilesetControls extends React.Component {

  addImageFromInput(e) {
    // enter key
    if(e.which != 13){
      return;
    }
    this.addTilesetFromUrl(this.refs.input.value)
  }

  addTilesetFromUrl(url){
    if(!url){
      return;
    }
    let val = url;
    if(url.indexOf(location.origin) == 0){
      val = val.substr(location.origin.length);
    }

    let img = new Image();
    img.onload = (e) => {
      this.addTileset(img);
    };
    img.onerror = (e)=> {
      console.error("failed to load image:", val);
    };
    img.src = val;
  }

  addTileset(img) {
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;
    const tss = map.data.tilesets;
    const ts = TileHelper.genTileset(map.data, img.src, img.width, img.height);

    tss.push(ts);
    map.images[img.src] = img;
    map.updateImages();
    parent.selectTileset(tss.length - 1);
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
