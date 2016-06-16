"use strict";
import React from 'react';
import Tile from '../Tile.js';
import TileHelper from '../TileHelper.js';
import TilesetControls from "./TilesetControls.js";
import TileSelection from "./TileSelection.js";
import TileCollection from "./TileCollection.js";

import EditModes from "./EditModes.js";

export default class TileSet extends React.Component {
  /* lifecycle functions */
  constructor(...args){
    super(...args);
    this.prevTile = null;
    this.spacing = 1;
    this.mouseDown = false;
    this.startingtilePos = null;
  }
  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} });

    this.adjustCanvas();
    this.props.info.content.map.tilesets.push(this);
  }
  componentWillUnmount(){
    const mapTilesets = this.props.info.content.map.tilesets;
    const index = mapTilesets.indexOf(this);
    if(index > -1){
      mapTilesets.splice(mapTilesets.indexOf(this), 1);
    }
  }
  /* endof lifecycle functions */

  get map(){
    return this.props.info.content.map;
  }

  /* helpers */
  adjustCanvas(){
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];
    const canvas = this.refs.canvas;

    if(ts){
      canvas.width = TileHelper.getTilesetWidth(ts);
      canvas.height = TileHelper.getTilesetHeight(ts);
    }
    else{
      canvas.width = 1;
      canvas.height = 1;
    }

    this.ctx = canvas.getContext("2d");
  }
  getTilePosInfo(e){
    const map = this.map;
    const ts = map.data.tilesets[map.activeTileset];
    // image has not been loaded
    if(!ts){
      return;
    }
    const pos = new TileSelection();
    pos.updateFromMouse(e, ts, this.spacing);
    return pos;
  }
  /* endof helpers */

  /* functionality */
  selectTile(e, clear){
    const map = this.map;
    const ts = map.data.tilesets[map.activeTileset];
    if(!this.prevTile){
      this.prevTile = this.getTilePosInfo(e);
      // failed to get prev tile.. e.g. click was out of bounds
      if(!this.prevTile){
        return;
      }
    }

    map.collection.pushOrRemove(new TileSelection(this.prevTile));
    this.highlightTile(e, e.nativeEvent, true);
  }
  selectRectangle(e){
    const map = this.map;
    const ts = map.data.tilesets[map.activeTileset];
    // new map!
    if(!ts){
      return;
    }
    const pos = this.getTilePosInfo(e.nativeEvent);

    if(!e.ctrlKey){
      map.clearActiveSelection();
    }

    let startx, endx, starty, endy;
    if(this.startingtilePos.x < pos.x){
      startx = this.startingtilePos.x;
      endx = pos.x;
    }
    else{
      startx = pos.x;
      endx = this.startingtilePos.x;
    }
    if(this.startingtilePos.y < pos.y){
      starty = this.startingtilePos.y;
      endy = pos.y;
    }
    else{
      starty = pos.y;
      endy = this.startingtilePos.y;
    }

    for(let y = starty; y<=endy; y++){
      pos.y = y;
      for(let x = startx; x<=endx; x++){
        pos.x = x;
        pos.getGid(ts, this.spacing);
        map.collection.pushUnique(new TileSelection(pos));
      }
    }

    this.drawTiles();
  }
  selectTileset(tilesetNum){
    this.props.info.content.map.activeTileset = tilesetNum
    this.adjustCanvas();
    this.drawTiles();
    this.forceUpdate();
  }
  /* endof functionlity */

  /* drawing on canvas*/
  drawTiles(){
    this.prevTile = null;

    const map = this.props.info.content.map;
    // mas is not loaded
    if(!map.data){
      return;
    }
    const tss = map.data.tilesets;
    const ts = tss[map.activeTileset];
    const ctx = this.ctx;
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);

    if(!ts){
      return;
    }
    const palette = map.gidCache;
    const mapData = map.data;


    const pos = {x:0, y:0};
    const spacing = map.spacing;

    let gid = 0;
    for (let i = 0; i < ts.tilecount; i++) {
      gid = ts.firstgid + i;
      TileHelper.getTilePosRel(i, Math.floor((ts.imagewidth + spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, pos);
      const pal = palette[gid];
      // missing image
      if(!pal){
        return;
      }
      this.drawTile(pal, pos);
    }
  }
  drawTile(pal, pos, clear = false){
    if(clear){
      this.ctx.clearRect(pos.x * (pal.ts.tilewidth + this.spacing), pos.y * (pal.ts.tileheight + this.spacing), pal.w, pal.h);
    }
    this.ctx.drawImage(pal.image,
      pal.x, pal.y, pal.w, pal.h,
      pos.x * (pal.ts.tilewidth + this.spacing), pos.y * (pal.ts.tileheight + this.spacing) , pal.w, pal.h
    );
    if(map.collection.indexOfGid(pal.gid) > -1){
      this.ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
      this.ctx.fillRect(
        pos.x * (pal.ts.tilewidth + this.spacing), pos.y * (pal.ts.tileheight + this.spacing) , pal.w, pal.h
      );
    }
  }
  highlightTile(event, e = event.nativeEvent, force = false){
    const map = this.props.info.content.map;
    const ts = map.map.tilesets[map.activeTileset];
    if(!ts){
      return;
    }
    const palette = map.gidCache;
    const pos = this.getTilePosInfo(e);

    if(this.prevTile){
      if(this.prevTile.x == pos.x && this.prevTile.y == pos.y && !force){
        return;
      }
      if(force){
        this.drawTiles();
      }
      else {
        let pal = palette[this.prevTile.gid];
        if (pal) {
          this.drawTile(pal, this.prevTile, true);
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
  /* endof drawing on canvas */

  /* events */
  onDrop(e){
    e.preventDefault();
    const assetJson = e.dataTransfer.getData("asset");
    let asset;
    if(assetJson){
      asset = JSON.parse(assetJson);
    }
    if(asset && asset.kind != "graphic"){
      return;
    }
    const url = e.dataTransfer.getData("link");
    this.refs.controls.addTilesetFromUrl(url);
  }
  onDragOver(e){
    e.dataTransfer.dropEffect = 'copy';
    e.preventDefault();
  }

  onMouseDown(e){
    if(this.map.options.mode != EditModes.fill && this.map.options.mode != EditModes.stamp) {
      this.map.options.mode = EditModes.stamp;
    }

    // update active tool
    this.map.refs.tools.forceUpdate();

    if(!e.ctrlKey){
      this.map.clearActiveSelection();
    }
    this.mouseDown = true;
    this.selectTile(e);
    this.startingtilePos = new TileSelection(this.prevTile);
  }
  onMouseUp(e){
    this.mouseDown = false;
  }
  onMouseMove(e){
    if(this.mouseDown){
      this.selectRectangle(e);
    }
    this.highlightTile(e);
  }
  onMouseLeave(e){
    // remove highlighted tile
    this.drawTiles();
    this.prevTile = null;
    this.mouseDown = false;
  }
  /* endof events */

  /* react dom */
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
          {this.renderContent(true)}
        </div>
      </div>
    );
  }
  renderContent(empty = false){
    return (
      <div className="active content tilesets accept-drop"
           data-drop-text="Drop asset here to create TileSet"
           onDrop={this.onDrop.bind(this)}
           onDragOver={this.onDragOver.bind(this)}

        >
        <TilesetControls tileset={this} ref="controls"/>
        {!empty ? <span>Drop graphics here to create new tileset</span> : ''}
        <div
          className="tileset"
          ref="layer"
          style={{
                //height: "250px",
                overflow: "auto",
                clear: "both"
              }}
          >
          <canvas ref="canvas"
                  onMouseDown={this.onMouseDown.bind(this)}
                  onMouseUp={this.onMouseUp.bind(this)}
                  onMouseMove={this.onMouseMove.bind(this)}
                  onMouseLeave={this.onMouseLeave.bind(this)}
            ></canvas>
        </div>
      </div>
    )
  }
  render() {
    const map = this.props.info.content.map;
    const tss = map.map.tilesets;
    if(!tss.length){
      return this.renderEmpty();
    }

    let ts = tss[map.activeTileset];
    // TODO: this should not happen - debug!
    if(!ts){
      ts = tss[0];
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
          {this.renderContent(ts)}
        </div>
      </div>
    )
  }
}
