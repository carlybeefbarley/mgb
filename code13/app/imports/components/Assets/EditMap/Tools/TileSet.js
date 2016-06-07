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
    const index = mapTilesets.indexOf(this);
    if(index > -1){
      mapTilesets.splice(mapTilesets.indexOf(this), 1);
    }
  }

  highlightTile(event, e = event.nativeEvent, force = false){
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];
    const palette = map.gidCache;

    const pos = {
      x: 0,
      y: 0,
      id: 0
    };

    const spacing = 1;

    TileHelper.getTileCoordsRel(
      (e.offsetX < 0 ? 0 : e.offsetX),
      (e.offsetY < 0 ? 0 : e.offsetY),
      ts.tilewidth, ts.tileheight, spacing, pos);

    pos.id = pos.x + pos.y * (1 + Math.floor(ts.imagewidth / (ts.tilewidth + spacing))) + ts.firstgid;

    if(this.prevTile){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
        return;
      }
      if(force){
        this.drawTiles();
      }
      else {
        let pal = palette[this.prevTile.id];
        if (pal) {
          this.drawTile(palette[this.prevTile.id], this.prevTile, true);
        }
        else {
          this.ctx.clearRect(
            this.prevTile.x * ts.tilewidth + this.prevTile.x,
            this.prevTile.y * ts.tileheight + this.prevTile.y,
            ts.tilewidth, ts.tileheight);
        }
      }
    }

    this.ctx.fillStyle = "rgba(0,0,255, 0.3)";
    this.ctx.fillRect(pos.x * ts.tilewidth + pos.x, pos.y * ts.tileheight + pos.y, ts.tilewidth, ts.tileheight);
    this.prevTile = pos;

  }

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];

    const canvas = this.refs.canvas;
    canvas.width = ts.imagewidth;
    canvas.height = ts.imageheight;

    this.ctx = canvas.getContext("2d");
    this.props.info.content.map.tilesets.push(this);
  }

  selectTile(e){
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];
    if(!this.prevTile){
      this.highlightTile(e);
    }
    const gid = this.prevTile.id;
    const wasActive = map.selection.indexOf(gid);
    map.clearActiveSelection();
    if(wasActive == -1){
      map.addToActiveSelection(gid);
    }

    this.highlightTile(e, e.nativeEvent, true);
  }

  selectTileset(tilesetNum){
    this.props.info.content.map.activeTileset = tilesetNum
    this.drawTiles();
    this.forceUpdate();
  }

  onDrop(e){
    e.preventDefault();
    const assetJson = e.dataTransfer.getData("asset");
    let asset;
    if(assetJson){
      asset = JSON.parse(assetJson);
    }
    if(asset.kind != "graphic"){
      return;
    }
    const url = e.dataTransfer.getData("link");
    this.refs.controls.addTilesetFromUrl(url);
  }

  onDrag(e){
    e.dataTransfer.dropEffect = 'copy';
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
          <div className="active content tilesets accept-drop"
               drop-text="Drop asset here to create TileSet"
               onDrop={this.onDrop.bind(this)}
               onDrag={this.onDrag.bind(this)}
            >
            <TilesetControls tileset={this} ref="controls"/>
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

    const spacing = 0;
    let gid = 0;
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i;
      TileHelper.getTilePosRel(i, Math.floor((ts.imagewidth + spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, pos);
      const pal = palette[gid];
      this.drawTile(pal, pos);
    }
  }
  drawTile(pal, pos, clear = false){
    if(clear){
      this.ctx.clearRect(pos.x * (pal.ts.tilewidth + 1), pos.y * (pal.ts.tileheight + 1), pal.w, pal.h);
    }
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w, pal.h,
      pos.x * (pal.ts.tilewidth + 1), pos.y * (pal.ts.tileheight + 1) , pal.w, pal.h,
    );
    if(map.selection.indexOf(pal.gid) > -1){
      this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
      this.ctx.fillRect(
        pos.x * (pal.ts.tilewidth + 1), pos.y * (pal.ts.tileheight + 1) , pal.w, pal.h,
      );
    }
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
      <div className="mgbAccordionScroller tilesets">
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
          <div className="active content tilesets acceptDrop"
               data-drop-text="Drop asset here to create TileSet"
               onDrop={this.onDrop.bind(this)}
               onDragOver={(e) => {e.preventDefault();}}

            >
            <TilesetControls tileset={this} ref="controls"/>
            <div
              className="tileset"
              ref="layer"
              style={{
                height: ts.imageheight+"px",
                overflow: "auto",
                clear: "both"
              }}
              >
              <canvas ref="canvas"
                      onClick={this.selectTile.bind(this)}
                      onMouseMove={this.highlightTile.bind(this)}
                ></canvas>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
