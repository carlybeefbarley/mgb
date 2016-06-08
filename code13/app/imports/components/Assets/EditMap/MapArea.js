"use strict";
import React, { PropTypes } from 'react';
import TileMapLayer from "./TileMapLayer.js";
import TileSet from "./Tools/TileSet.js";
import Layers from "./Tools/Layers.js";
import TileHelper from "./TileHelper.js";

export default class MapArea extends React.Component {

  constructor(props){
    super(props);
    let images = {};
    // expose map for debugging purposes - access in console
    window.map = this;

    // temporary workaround for saved images until we connect asset editor and map editor
    this.images = new Proxy(images, {
      get: (target, property, receiver) => {
        // meteor throws error about properties with . in name
        // could be related: https://github.com/meteor/meteor/issues/4522
        property = this.removeDots(property);
        return images[property];
      },
      set: (target, property, value, receiver) => {
        property = this.removeDots(property);
        images[property] = value;
        if(!this.map.images){
          this.map.images = {};
        }
        this.map.images[property] = value.src;
        return true;
      }
    });
    // TODO: this should be some kind of matrix
    this.selection = [];
    this.errors = [];
    this.gidCache = {};

    this.activeLayer = 0;
    this.activeTileset = 0;
    this.state = {
      preview: false
    };
    this.preview = {
      x: 5,
      y: 45
    };

    this.layers = [];
    this.tilesets = [];
    //this.margin = 0;
    this.spacing = 0;
  }

  removeDots(sin){
    return sin.replace(/\./gi,'*');
  }

  set map(val){
    this.data = val;
  }
  get map(){
    return this.data;
  }

  set data(val){
    this.props.asset.content2 = val;
  }
  get data(){
    if(this.props.asset && !this.props.asset.content2.width){
      this.props.asset.content2 = TileHelper.genNewMap();
    }
    return this.props.asset.content2;
  }
  generateImages(cb){
    const imgs = this.props.asset.content2.images;
    if(!imgs){
      if(typeof cb == "function"){
        cb();
      }
      return false;
    }
    const keys = Object.keys(imgs);
    if(!keys.length){
      if(typeof cb == "function"){
        cb();
      }
      return false;
    }
    let loaded = 0;
    keys.forEach((i, index) => {
      const img = new Image;
      img.onload = () => {
        loaded++;
        this.images[i] = img;
        if(loaded == keys.length){
            this.updateImages(cb);
        }
      };
      img.src = imgs[i];
    });
    return true;
  }
/*
  componentWillReceiveProps (props){
    console.log("PROPS:", props);
  }
*/
  importFromDrop (e) {
    e.stopPropagation();
    e.preventDefault();
    if (!this.props.parent.props.canEdit) {
      this.props.parent.props.editDeniedReminder();
      return;
    }
    let files = e.dataTransfer.files; // FileList object.
    // file has been dropped
    if(files.length){
      Array.prototype.forEach.call(files, (file, i) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const ext = file.name.split(".").pop().toLowerCase();
          const method = 'handleFileByExt_'+ext;
          if(this[method]){
            this[method](file.name, e.target.result);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }
  }

  prepareForDrag(e){
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }

  /* TODO: browser compatibility - ie don't have TextDecoder - https://github.com/inexorabletash/text-encoding*/
  handleFileByExt_tmx(name, buffer){
    // https://github.com/inexorabletash/text-encoding
    const xmlString = (new TextDecoder).decode(new Uint8Array(buffer));
    //
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    alert("Sorry: TMX import is not implemented... yet\nTry JSON");

    this.map = this.xmlToJson(xml);
  }

  xmlToJson(xml){
    window.xml = xml;
  }

  handleFileByExt_json(name, buffer){
    const jsonString = (new TextDecoder).decode(new Uint8Array(buffer));
    this.map = JSON.parse(jsonString);
    this.updateImages();
  }

  handleFileByExt_png(name, buffer){
    const blob = new Blob([buffer], {type: 'application/octet-binary'});
    const img = new Image();
    img.onload = () => {
      // TODO: this is hackish hack - find out less hackish way!!!
      // we should be able to create dataUrl from buffer or blob directly
      const c = document.createElement("canvas");
      c.ctx = c.getContext("2d");
      c.width = img.width;
      c.height = img.height;
      c.ctx.drawImage(img, 0, 0);
      img.onload = () => {
        this.images[name] = img;
        this.updateImages();
      };

      img.src = c.toDataURL();
    };
    
    img.src = URL.createObjectURL(blob);
  }


  // TODO: optimize this.. seems pretty slow on maps with many/big tilesets..
  updateImages(cb){
    const map = this.map;
    // map has not loaded
    if(!map || !map.tilesets){
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.ctx = canvas.getContext("2d");
    this.errors.length = 0;
    // generate small image for every available gid
    let index = 0;
    for(let ts of map.tilesets){
      const fgid = ts.firstgid;
      if(!this.images[ts.image]){
        this.errors.push("missing: '" + ts.image + "'" );
        continue;
      }
      let tot = ts.tilecount;
      let pos = {x: 0, y: 0};
      for(let i=0; i<tot; i++) {
        TileHelper.getTilePosWithOffsets(i, Math.floor((ts.imagewidth + ts.spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, ts.margin, ts.spacing, pos);
        this.gidCache[fgid + i] = {
          image: this.images[ts.image],
          index,
          w: ts.tilewidth,
          h: ts.tileheight,
          x: pos.x,
          y: pos.y,
          ts: ts,
          gid: fgid + i
        };
      }
      index++;
    }

    if(this.errors.length) {
      this.addTool("error", "Errors", this.errors);
    }
    else {
      this.removeTool("error");
    }
    if(typeof cb === "function"){
      cb();
    }
    this.forceUpdate();
  }

  addLayerTool(){
    this.addTool("Layers", "Layers", {map: this}, Layers)
  }
  addTilesetTool(){
    let ts = this.data.tilesets[this.activeTileset]
    this.addTool("Tileset", "Tilesets", {map:this}, TileSet);
  }
  /*
  * TODO: move tools to the EditMap.js
  * MapArea should not handle tools
  * */
  addTool(id, title, content, type){
    let ptools = this.props.parent.state.tools;
    ptools[id] = {
      title, content, type
    };
    this.props.parent.setState({
      tools: ptools
    });
  }

  removeTool(id){
    let ptools = this.props.parent.state.tools;
    delete ptools[id];
    this.props.parent.setState({
      tools: ptools
    });
  }

  /* TODO: fill from selection */
  handleMapClicked(e, key){

    const sel = this.selection[0];
    const layer = this.map.layers[this.activeLayer];
    layer.data[key] = sel;

  }

  // tileset calls this method..
  /* TODO: selection should be matrix - new class?*/
  addToActiveSelection (gid){
    const index = this.selection.indexOf(gid);
    if(index == -1){
      this.selection.push(gid);
    }
  }
  removeFromActiveSelection(gid){
    const index = this.selection.indexOf(gid);
    if(index > -1){
      this.selection.splice(index, 1);
    }
  }
  clearActiveSelection(){
    this.selection.length = 0;
  }

  togglePreviewState(){
    this.refs.mapElement.style.transform = "";
    this.lastEvent = null;
    this.setState({
      preview: !this.state.preview
    });
  }

  movePreview(e){
    if(this.state.preview && e.button == 1) {
      if(!this.lastEvent){
        this.lastEvent = {
          pageX: e.pageX,
          pageY: e.pageY
        };
        this.refs.mapElement.style.transition = "0s";
        return;
      }

      this.preview.y += this.lastEvent.pageX - e.pageX;
      this.preview.x -= this.lastEvent.pageY - e.pageY;

      this.lastEvent.pageX = e.pageX;
      this.lastEvent.pageY = e.pageY;
      this.refs.mapElement.style.transform = "rotatey(" + this.preview.y + "deg) rotatex("+this.preview.x+"deg) scale(0.9)";

    }
  }

  handleMouseUp(e){
    this.lastEvent = null;
    this.refs.mapElement.style.transition = "0.3s";
  }

  componentDidMount(){
    this.fullUpdate();
  }

  fullUpdate(){
    this.generateImages(() => {
      this.addLayerTool();
      this.addTilesetTool();
      this.redrawLayers();
      this.redrawTilesets();
    });
  }

  redrawLayers(){
    this.layers.forEach((layer) => {
      layer.drawTiles();
    });
  }

  redrawTilesets(){
    this.tilesets.forEach((tileset) => {
      tileset.drawTiles();
    });
  }
  // TODO: keep aspect ratio
  // find out correct thumbnail size
  generatePreview(){
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    for(let i=0; i<this.layers.length; i++){
      const c = this.layers[i].refs.canvas;
      ctx.drawImage(c, 0, 0, c.width, c.height, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL();
  }

  renderMap(){
    const map = this.map;

    if(!map || !map.layers) {
      return (<div className="map-empty" ref="mapElement" />);
    }
    else{
      const layers = [];
      for (var i = 0; i < map.layers.length; i++) {
        if(!map.layers[i].visible){
          continue;
        }
        layers.push(<TileMapLayer
          data={map.layers[i]}
          key={i}
          map={this}
          active={this.activeLayer == i}
          onClick={this.handleMapClicked.bind(this)}
          />);
      }
      return (
        <div className={this.state.preview ? "map-filled preview" : "map-filled"}
             ref="mapElement"
             style={{
              width: (map.width * map.tilewidth)+"px",
              height: (map.height * map.tileheight)+"px",
              position: "relative",
              margin: "10px 0"
          }}>{layers}</div>
      );
    }
  }

  render (){
    return (
      <div
        className="tilemap-wrapper"
        onDrop={this.importFromDrop.bind(this)}
        onDragOver={this.prepareForDrag.bind(this)}
        onMouseMove={this.movePreview.bind(this)}
        onMouseUp={this.handleMouseUp.bind(this)}
        >
        <button className="ui primary button"
          >Drop here to import</button>
        <button className="ui button"
          onClick={this.togglePreviewState.bind(this)}
          >Preview</button>
        <button className="ui primary button"
                onClick={(e)=>{this.props.parent.handleSave(e)}}
          >Save</button>

        {this.renderMap()}
      </div>
    )
  }
};
