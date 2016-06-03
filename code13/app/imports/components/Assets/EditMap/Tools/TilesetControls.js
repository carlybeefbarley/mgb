"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';
export default class TilesetControls extends React.Component {

  constructor(...args) {
    super(...args);

    this.oldpaste;
    // TODO: Loading..
    this.onpaste = (e) => {
      const data = e.clipboardData.getData("text/plain");
      // if it fails... just ignore
      let img = new Image();
      img.onload = (e) => {
        this.addTileset(img);
      };
      img.src = data;
    }
  }

  componentDidMount() {
    // TODO: will we ever unmount this control???
    this.oldpaste = document.body.onpaste;
    document.body.onpaste = this.onpaste;
  }

  componentWillUnmount() {
    document.body.onpaste = this.oldpaste;
  }

  addImageFromInput() {
    console.log("adding image:", this.refs.input.value);
    let img = new Image();
    img.onload = (e) => {
      this.addTileset(img);
    };
    img.src = this.refs.input.value;
  }

  addTileset(img) {
    const parent = this.props.tileset;
    const map = parent.props.info.content.map;
    const tss = map.map.tilesets;
    const ts = TileHelper.genTileset(map.map, img.src, img.width, img.height);

    tss.push(ts);
    map.images[img.src] = img;
    map.updateImages();
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
          <input type="text" onChange={this.addImageFromInput.bind(this)} ref="input" style={{
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
