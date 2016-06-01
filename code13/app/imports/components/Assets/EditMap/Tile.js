"use strict";
import React from 'react';

export default class Tile extends React.Component {

  click(e){
    console.log("clicked tile with gid:", this.props);
  }

  render(){
    const p = this.props;
    const style = {
      top: p.y + "px",
      left: p.x + "px",
      width: p.width + "px",
      height: p.height + "px",
    };

    if(p.gidCache[p.gid]){
      style.backgroundImage = 'url(' + p.gidCache[p.gid] + ')';
    }

    return (<div
      className="tilemap-tile"
      onClick={this.click.bind(this)}
      data-gid={p.gid}
      style={style}></div>);
  }
}
