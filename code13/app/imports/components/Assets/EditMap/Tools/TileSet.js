"use strict";
import React from 'react';
import Tile from '../Tile.js';
import TileHelper from '../TileHelper.js';
import TilesetControls from "./TilesetControls.js";

export default class TileSet extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  selectTile(e){
    const $el = $(e.target);
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];

    // some kind of jquery bug...
    // const gid = $el.data("gid");
    const gid = e.target.getAttribute("data-gid");

    let wasActive = $el.hasClass("active");
    map.clearActiveSelection();
    $el.parent().find(".active").removeClass("active");

    if(!wasActive){
      $el.addClass("active");
      map.addToActiveSelection(gid);
    }
  }

  selectTileset(tilesetNum){
    this.props.info.content.map.activeTileset = tilesetNum
    this.forceUpdate();
  }

  renderEmpty(){
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
          </div>
          <div className="active content">
            <TilesetControls tileset={this} />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const map = this.props.info.content.map;
    const tss = map.map.tilesets;

    if(!tss.length){
      return this.renderEmpty();
    }

    const ts = tss[map.activeTileset];

    let tiles = [];
    let tilesets = [];

    let tot = ts.tilecount;
    let pos = {x: 0, y: 0};
    let fgid = ts.firstgid;

    for(let i=0; i<tot; i++){
      TileHelper.getTilePosWithOffsets(i, Math.floor(ts.imagewidth / ts.tilewidth), ts.tilewidth, ts.tileheight, 0, 0, pos);

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
        <a className={tss[i] === ts ? "item active" : "item" }
           href="javascript:;"
           onClick={this.selectTileset.bind(this, i)}
           key={i}
          >{tss[i].name} {tss[i].imagewidth}x{tss[i].imageheight}</a>
      );
    }
    /* TODO: save active tileset and use only that as active */
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
            <div className="ui simple dropdown item"
                 style={{float:"right", paddingRight: "20px"}}
              >
              <i className="dropdown icon"></i>{ts.name.substr(-20)} {ts.imagewidth}x{ts.imageheight}
              <div className="floating ui tiny green label">{tss.length}</div>
              <div className="menu">
                {tilesets}
              </div>
            </div>

          </div>
          <div className="active content">
            <TilesetControls tileset={this} />
            <div
              className="tileset"
              style={{
                height: ts.imageheight+"px",
                overflow: "auto",
                clear: "both"
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
