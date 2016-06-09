"use strict";
import React, { PropTypes } from 'react';
import TileMapLayer from "./TileMapLayer.js";
import GridLayer from "./GridLayer.js";
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
    // x/y are angles not pixels
    this.preview = {
      x: 5,
      y: 45
    };

    this.layers = [];
    this.tilesets = [];
    //this.margin = 0;
    this.spacing = 0;

    this.globalMouseMove = (...args) => {this.handleMouseMove(...args);}
    this.globalMouseUp = (...args) => {this.handleMouseUp(...args);}
  }

  componentDidMount(){
    $(this.refs.mapElement).addClass("map-filled");
    this.fullUpdate();
    window.addEventListener("mousemove", this.globalMouseMove);
    window.addEventListener("mouseup", this.globalMouseUp);
  }
  componentWillUnmount(){
    window.removeEventListener("mousemove", this.globalMouseMove);
    window.removeEventListener("mouseup", this.globalMouseUp);
  }

  removeDots(sin){
    return sin.replace(/\./gi,'*');
  }

  // TODO: check all usecases and change to data.. as map.map looks confusing and ugly
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

  // store meta information about current map
  // don't forget to strip meta when exporting it
  get meta(){
    if(!this.data.meta){
      this.data.meta = {
        options: {
          // empty maps aren't visible without grid
          showGrid: 1,
          camera: {
            x:0, y:0
          }
        }
      };
    }
    return this.data.meta;
  }
  get camera(){
    // backwards compatibility with older maps.. should be safe to remove in the future
    if(!this.meta.options.camera){
      this.meta.options.camera = {x: 0, y: 0, zoom: 1};
    }
    if( !this.meta.options.camera.zoom || isNaN(this.meta.options.camera.zoom) ){
      this.meta.options.camera.zoom = 1;
    }
    return this.meta.options.camera;
  }

  /* TODO: browser compatibility - IE don't have TextDecoder - https://github.com/inexorabletash/text-encoding*/
  xmlToJson(xml){
    window.xml = xml;
  }
  handleFileByExt_tmx(name, buffer){
    // https://github.com/inexorabletash/text-encoding
    const xmlString = (new TextDecoder).decode(new Uint8Array(buffer));
    //
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    alert("Sorry: TMX import is not implemented... yet\nTry JSON");

    this.map = this.xmlToJson(xml);
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
  updateImages(cb){
    const map = this.map;
    // map has not loaded
    if(!map || !map.tilesets){
      return;
    }

    this.errors.length = 0;
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

    // next state...
    if(!this.state.preview){
      $(this.refs.mapElement).addClass("preview");
    }
    else{
      $(this.refs.mapElement).removeClass("preview");
    }
    // this is not synchronous function !!!
    this.setState({
      preview: !this.state.preview
    });
  }



  /* TODO: move TileLayer specific function to TileLayer - map will handle all sorts of layers */
  /* TODO: fill from selection */
  handleMapClicked(e, key){

    let sel = this.selection[0];
    if(!e.ctrlKey && !sel){
      return;
    }
    if(e.ctrlKey){
      sel = 0;
    }
    const layer = this.map.layers[this.activeLayer];
    layer.data[key] = sel;

  }

  resetCamera(){
    this.lastEvent = null;
    this.camera.x = 0;
    this.camera.y = 0;
    this.refs.grid.drawGrid();
    this.redrawLayers();
  }
  moveCamera(e){
    if(!this.lastEvent){
      this.lastEvent = {
        pageX: e.pageX,
        pageY: e.pageY
      };
      return;
    }
    this.camera.x -= (this.lastEvent.pageX - e.pageX) / this.camera.zoom;
    this.camera.y -= (this.lastEvent.pageY - e.pageY) / this.camera.zoom;
    this.lastEvent.pageX = e.pageX;
    this.lastEvent.pageY = e.pageY;

    this.refs.grid.drawGrid();
    this.redrawLayers();
  }
  zoomCamera(newZoom, e){

    if(e){
      // zoom right on the cursor position
      // feels like a I need a separate class for camera at this point..
      const bounds = this.refs.mapElement.getBoundingClientRect();

      const ox = e.nativeEvent.offsetX / bounds.width;
      const oy = e.nativeEvent.offsetY / bounds.height;

      const width = bounds.width / this.camera.zoom;
      const newWidth = bounds.width / newZoom;

      const height = bounds.height / this.camera.zoom;
      const newHeight = bounds.height / newZoom;

      this.camera.x -= (width - newWidth) * ox;
      this.camera.y -= (height - newHeight) * oy;
    }

    this.camera.zoom = newZoom;

    this.refs.grid.drawGrid();
    this.redrawLayers();
  }
  movePreview(e){
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

  handleMouseMove(e){
    // move Preview
    if(this.state.preview && (e.button == 1)) {
      this.movePreview(e);
    }
    else if(e.button === 1 || e.button == 2){
      this.moveCamera(e);
    }
  }
  handleMouseUp(e){
    this.lastEvent = null;
    this.refs.mapElement.style.transition = "0.3s";
  }
  handleOnWheel(e){
    e.preventDefault();
    const step = 0.1;
    if(e.deltaY < 0){
      this.zoomCamera(this.camera.zoom + step, e);
    }
    else if(e.deltaY > 0){
      if(this.camera.zoom > step*2){
        this.zoomCamera(this.camera.zoom - step, e);
      }
    }
  }

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
      let i=0;
      for ( ; i < map.layers.length; i++) {
        if(!map.layers[i].visible){
          continue;
        }
        if(map.layers[i].type == "tilelayer") {
          layers.push(<TileMapLayer
            data={map.layers[i]}
            key={i}
            map={this}
            active={this.activeLayer == i}
            onClick={this.handleMapClicked.bind(this)}
            />);
        }
      }
      if(this.meta.options.showGrid) {
        layers.push(
          <GridLayer map={this} key={i} ref="grid" />
        );
      }
      return (
        <div
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
        onContextMenu={(e)=>{e.preventDefault(); return false;}}
        onWheel={this.handleOnWheel.bind(this)}
        >
        <button className="ui primary button"
          >Drop here to import</button>
        <button className="ui button"
          onClick={this.togglePreviewState.bind(this)}
          >Preview</button>
        <button className="ui primary button"
                onClick={(e)=>{this.props.parent.handleSave(e);}}
          >Save</button>
        <button className="ui primary button"
                onClick={()=>{this.resetCamera();}}
          >Reset camera</button>
        {this.renderMap()}
      </div>
    )
  }
};
