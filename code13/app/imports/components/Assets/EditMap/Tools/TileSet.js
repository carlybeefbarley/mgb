"use strict";
import React from 'react';
import Tile from '../Tile.js';
import TileHelper from '../TileHelper.js';
import TilesetControls from "./TilesetControls.js";

export default class TileSet extends React.Component {

  constructor(...args){
    super(...args);
    this.prevTile = null;
  }


  componentWillUnmount(){
    const mapTilesets = this.props.info.content.map.tilesets;
    mapTilesets.splice(mapTilesets.indexof(this), 1);
  }

  onMouseMove(e){
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];
    const palette = map.gidCache;

    const pos = {
      x: 0,
      y: 0,
      id: 0
    };
    TileHelper.getTileCoordsRel(e.offsetX, e.offsetY, ts.tilewidth, ts.tileheight, pos);
    pos.id = pos.x + pos.y * Math.floor(ts.imagewidth / ts.tilewidth);
    //this.drawTile(palette[pos.id], pos);

    if(this.prevTile){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y){
        return;
      }
      this.drawTile(palette[this.prevTile.id], this.prevTile, ts, true);
    }

    this.ctx.fillStyle = "rgba(0,0,255, 0.5)";
    this.ctx.fillRect(pos.x, pos.y, ts.tilewidth, ts.tileheight);
    this.prevTile = pos;

  }

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })

    const canvas = this.refs.canvas;
    const $el = $(this.refs.layer);
    canvas.width = $el.width();
    canvas.height = $el.height();

    this.ctx = canvas.getContext("2d");
    this.props.info.content.map.tilesets.push(this);
  }

  selectTile(e){
    const $el = $(e.target);
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];

    // some kind of jquery bug...
    // const gid = $el.data("gid");
    const gid = e.target.getAttribute("data-gid");

    const wasActive = $el.hasClass("active");
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

  drawTiles(){
    this.prevTile = null;

    const map = this.props.info.content.map;
    const tss = map.map.tilesets;
    const ts = tss[map.activeTileset];

    const palette = map.gidCache;
    const mapData = map.data;
    const ctx = this.ctx;

    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    const tiles = [];
    const pos = {x:0, y:0};

    for (let i = ts.firstgid; i < ts.tilecount; i++) {
      TileHelper.getTilePosRel(i, mapData.width, ts.tilewidth, ts.tileheight, pos);
      if(!palette[i]){
        continue;
      }
      const pal = palette[i];
      this.drawTile(pal, ts, pos);

    }
  }
  drawTile(palette, pos, ts, clear = false){
    if(clear){
      this.ctx.clearRect(pos.x, pos.x, palette.w, palette.h);
    }
    this.ctx.drawImage(palette.image,
      palette.x, palette.y, palette.w, palette.h,
      pos.x * (ts.tilewidth + 1), pos.y * (ts.tileheight + 1) , palette.w, palette.h,
    );
  }

  render() {
    const map = this.props.info.content.map;
    const tss = map.map.tilesets;
    const ts = tss[map.activeTileset];
    if(!tss.length){
      return this.renderEmpty();
    }
    const tilesets = [];
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
              ref="layer"
              style={{
                height: ts.imageheight+"px",
                overflow: "auto",
                clear: "both"
              }}
              onClick={this.selectTile.bind(this)}>
              <canvas ref="canvas"
                onMouseMove={this.onMouseMove.bind(this)}
                ></canvas>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
