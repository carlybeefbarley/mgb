import React from 'react';
import Tile from './Tile.js';
import TileHelper from "./TileHelper.js";

export default class TileMapLayer extends React.Component {
  /*
    drawing on canvas should be faster,
    but requires extra work.. picking, zooming etc
    let's check reacts performance :)
   */
  render(){
    const d = this.props.data.data;
    const map = this.props.map;
    let tiles = [];

    let pos = {x:0, y:0};

    if(d) {
      for (let i = 0; i < d.length; i++) {
        TileHelper.getTilePos(i, map.width, map.tilewidth, map.tileheight, pos);

        tiles.push(<Tile
            gid       = {d[i]}
            key       = {i}
            width     = {map.tilewidth}
            height    = {map.tileheight}
            x         = {pos.x}
            y         = {pos.y}
            gidCache  = {this.props.gidCache}
          />)
      }
    }

    return (<div data-name={this.props.data.name}>{tiles}</div>);
  }
}
