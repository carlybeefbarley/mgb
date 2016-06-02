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
      //width: p.width + "px",
      //height: p.height + "px",
    };

    //if(p.gidCache[p.gid]){
      //style.backgroundImage = 'url(' + p.gidCache[p.gid] + ')';
    //}
    let className = "tilemap-tile gid-" + p.gid;
    return (<div
      className={className}
      data-gid={p.gid}
      data-index={p.index}
      style={style}></div>);
  }
}
