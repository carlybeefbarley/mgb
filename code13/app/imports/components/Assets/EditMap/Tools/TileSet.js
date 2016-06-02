"use strict";
import React from 'react';
import Tile from '../Tile.js';
import TileHelper from '../TileHelper.js';


export default class TileSet extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  selectTile(e){
    const $el = $(e.target);
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];

    let wasActive = $el.hasClass("active");
    map.clearActiveSelection();
    $el.parent().find(".active").removeClass("active");
    if(!wasActive){
      $el.addClass("active");
      map.addToActiveSelection($el.data("gid"));
    }
  }

  selectTileset(tilesetNum){
    this.props.info.content.map.activeTileset = tilesetNum
    this.forceUpdate();
  }

  render() {
    const map = this.props.info.content.map;
    const tss = map.map.tilesets;
    const ts = tss[map.activeTileset];

    let tiles = [];
    let tilesets = [];

    let tot = ts.tilecount;
    let pos = {x: 0, y: 0};
    let fgid = ts.firstgid;

    for(let i=0; i<tot; i++){
      TileHelper.getTilePos(i, Math.floor(ts.imagewidth / ts.tilewidth), ts.tilewidth, ts.tileheight, pos);

      tiles.push(<Tile
        gid       = {fgid + i}
        key       = {i}
        width     = {ts.tilewidth}
        height    = {ts.tileheight}
        x         = {pos.x}
        y         = {pos.y}
        />);
    }

    for(let i=0; i<tss.length; i++){
      tilesets.push(
        <span className="item"
              onClick={this.selectTileset.bind(this, i)}
              key={i}
          >{tss[i].name} {tss[i].imagewidth}x{tss[i].imageheight}</span>
      );
    }
    /* TODO: save active tileset and use only that as active */
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              Tilesets
            </span>
            <div className="ui simple dropdown item"
                 style={{float:"right"}}
              >
              {ts.name} {ts.imagewidth}x{ts.imageheight}<i className="dropdown icon"></i>
              <div className="menu">
                {tilesets}
              </div>
            </div>

          </div>
          <div className="active content">
            <div
              className="tileset"
              style={{
                height: ts.imageheight+"px"
              }}
              onClick={this.selectTile.bind(this)}>
            {tiles}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
