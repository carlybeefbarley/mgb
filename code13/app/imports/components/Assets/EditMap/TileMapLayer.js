import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";

export default class TileMapLayer extends React.Component {

  changeTile (e) {
    let index = $(e.target).data("index");
    if (e.ctrlKey) {
      index = 0;
    }
    this.props.onClick(e, index);
    this.forceUpdate();
  }

  handleMouseDown(e){
    if(e.button == 0){
      this.mouseDown = true;
    }
  }
  // this should be triggered on window instead of main element
  handleMouseUp (e){
    if(e.button == 0) {
      this.mouseDown = false;
      this.changeTile(e);
    }
  }

  handleMouseMove(e){
    if(this.mouseDown){
      this.changeTile(e);
    }
  }
  /*
    drawing on canvas should be faster,
    but requires extra work.. picking, zooming etc
    let's check reacts performance :)
   */
  render(){
    const d = this.props.data.data;
    const map = this.props.map.map;
    let tiles = [];

    let pos = {x:0, y:0};

    if(d) {
      for (let i = 0; i < d.length; i++) {
        TileHelper.getTilePos(i, map.width, map.tilewidth, map.tileheight, pos);

        tiles.push(<Tile
            gid       = {d[i]}
            key       = {i}
            index     = {i}
            width     = {map.tilewidth}
            height    = {map.tileheight}
            x         = {pos.x}
            y         = {pos.y}
            gidCache  = {this.props.gidCache}
          />)
      }
    }

    return (<div
      className={this.props.active ? "tilemap-layer" : "tilemap-layer no-events"}
      data-name={this.props.data.name}

      onMouseMove={this.handleMouseMove.bind(this)}
      onMouseUp={this.handleMouseUp.bind(this)}
      onMouseDown={this.handleMouseDown.bind(this)}

      >{tiles}</div>);
  }
}
