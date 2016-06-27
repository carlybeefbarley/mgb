"use strict";
import React from 'react';

import TileMapLayer from "./TileMapLayer.js";
import ImageLayer from "./ImageLayer.js";
import ObjectLayer from "./ObjectLayer.js";
import GridLayer from "./GridLayer.js";

import TileSet from "./Tools/TileSet.js";
import Layers from "./Tools/Layers.js";
import Properties from "./Tools/Properties.js";

import MapTools from "./Tools/MapTools.js";
import TileHelper from "./TileHelper.js";
import TileCollection from "./Tools/TileCollection.js";
import TileSelection from "./Tools/TileSelection.js";
import EditModes from "./Tools/EditModes.js";
import LayerTypes from "./Tools/LayerTypes.js";


export default class MapArea extends React.Component {

  constructor(props){
    super(props);
    let images = {};
    this.startTime = Date.now();
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

    // here will be kept selections from tilesets
    this.collection = new TileCollection();

    // any modifications will be limited to the selection if not empty
    this.selection = new TileCollection();
    this.tmpSelection = new TileCollection();

    this.errors = [];
    this.gidCache = {};

    this.activeLayer = 0;
    this.activeTileset = 0;
    // x/y are angles not pixels
    this.preview = {
      x: 5,
      y: 45
    };

    this.layers = [];
    this.tilesets = [];
    //this.margin = 0;
    this.spacing = 0;


    this._camera = null;
    this.ignoreUndo = 0;
    this.undoSteps = [];
    this.redoSteps = [];

    this.globalMouseMove = (...args) => {this.handleMouseMove(...args);};
    this.globalMouseUp = (...args) => {this.handleMouseUp(...args);};
    this.globalResize = () => {
      this.layers.forEach((l)=>{
        l.adjustCanvas();
        l.draw();
      });
      if(this.refs.grid){
        this.refs.grid.adjustCanvas();
        this.refs.grid.drawGrid();
      }
    };
    this.globalKeyUp = (...args) => {
      this.handleKeyUp(...args);
    };

    console.log("Map area initialized!");
  }

  componentDidMount(){
    $(this.refs.mapElement).addClass("map-filled");
    this.fullUpdate();
    //this.resetCamera();

    window.addEventListener("mousemove", this.globalMouseMove);
    window.addEventListener("mouseup", this.globalMouseUp);
    window.addEventListener("resize", this.globalResize);
    window.addEventListener("keyup", this.globalKeyUp);
  }

  /*shouldComponentUpdate(){
    return false;
  }*/

  componentWillUpdate(){
    // allow to roll back updated changes
    // this.saveForUndo();
    //console.error("will update");
  }
  componentDidUpdate(){
    this.redraw();
  }
  componentWillUnmount(){
    window.removeEventListener("mousemove", this.globalMouseMove);
    window.removeEventListener("mouseup", this.globalMouseUp);
    window.removeEventListener("resize", this.globalResize);
    window.removeEventListener("keyup", this.globalKeyUp);
  }

  forceUpdate(...args){
    // ignore undo for local updates
    this.ignoreUndo++;
    super.forceUpdate(...args);
    this.ignoreUndo--;
  }

  removeDots(url){
    return TileHelper.normalizePath(url).replace(/\./gi,'*');
  }

  // TODO: check all use cases and change to data.. as map.map looks confusing and ugly
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
            _x:0, _y:0, _zoom: 1
          },
          preview: false,
          mode: "stamp",
          randomMode: false
        }
      };
    }
    return this.data.meta;
  }
  get camera(){
    // prevent camera adjustments on asset update
    if(this._camera){
      return this._camera;
    }
    // backwards compatibility with older maps.. should be safe to remove in the future
    if(!this.meta.options.camera){
      this.meta.options.camera = {x: 0, y: 0, zoom: 1};
    }
    if( !this.meta.options.camera.zoom || isNaN(this.meta.options.camera.zoom) ){
      this.meta.options.camera.zoom = 1;
    }
    const self = this;
    this._camera = {
      _x: this.meta.options.camera.x || 0,
      _y: this.meta.options.camera.y || 0,
      _zoom: this.meta.options.camera.zoom || 1,
      set x(val){
        self.meta.options.camera.x = val;
        this._x = val;
      },
      get x(){return this._x},
      set y(val){
        self.meta.options.camera.y = val;
        this._y = val;
      },
      get y(){return this._y},
      set zoom(val){
        self.meta.options.camera.zoom = val;
        this._zoom = val;
      },
      get zoom(){return this._zoom}
    };
    return this.meta.options.camera;
  }
  get options(){
    return this.meta.options;
  }

  // palette is just more intuitive name
  get palette(){
    return this.gidCache;
  }

  // TMP - one undo step - just to prevent data loss
  saveForUndo(skipRedo = false){
    if(this.ignoreUndo){
      return;
    }
    const toSave = this.copyData(this.data);
    // prevent double saving undo
    if(this.undoSteps[this.undoSteps.length-1] == toSave){
      return;
    }
    if(!skipRedo){
      this.redoSteps.length = 0;
    }
    //console.error("saving for undo!");
    this.undoSteps.push(toSave);
    this.refs.tools.forceUpdate();
  }
  doUndo(){
    if(this.undoSteps.length){
      this.redoSteps.push(this.data);
      this.data = JSON.parse(this.undoSteps.pop());

      this.ignoreUndo++;
      this.update(() => {
        this.ignoreUndo--;
      });
    }
  }
  doRedo(){
    if(!this.redoSteps.length){
      return;
    }
    this.saveForUndo(true);

    this.data = this.redoSteps.pop();

    this.ignoreUndo++;
    this.update(() => {
      this.ignoreUndo--;
    });
  }
  copyData(data){
    return JSON.stringify(data);
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
    // image layer has separate field for image
    if(!this.data.images){
      this.data.images = {};
    }
    const imgs = this.data.images;

    for(let i=0; i<this.data.layers.length; i++){
      if(this.data.layers[i].image){
        this.data.images[this.data.layers[i].image] = this.data.layers[i].image;
      }
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
      img.setAttribute('crossOrigin', 'anonymous');
      img.onload = () => {
        loaded++;
        this.images[i] = img;
        if(loaded == keys.length){
          this.updateImages(cb);
        }
      };
      img.onerror = () => {
        console.error("Failed to load an image:", i);
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
      const img = this.images[ts.image];
      // this should be imported from mgb1
      if(!ts.imagewidth){
        ts.imagewidth = img.width;
        ts.imageheight = img.height;
        ts.tilewidth = img.width;
        ts.tileheight = img.height;
        ts.width = 1;
        ts.height = 1;
      }
      // update tileset to match new image / settings
      const extraPixels = ts.imagewidth % ts.tilewidth;
      const columns = (ts.imagewidth - extraPixels) / ts.tilewidth;
      let rows = (ts.imageheight - (ts.imageheight % ts.tileheight)) / ts.tileheight;
      ts.tilecount = columns * rows;
      ts.columns = columns;

      let tot = ts.tilecount;
      let pos = {x: 0, y: 0};
      for(let i=0; i<tot; i++) {
        TileHelper.getTilePosWithOffsets(i, Math.floor((ts.imagewidth + ts.spacing) / ts.tilewidth), ts.tilewidth, ts.tileheight, ts.margin, ts.spacing, pos);
        this.gidCache[fgid + i] = {
          image: img,
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
    this.forceUpdate();
    this.updateTilesets();
    if(typeof cb === "function"){
      cb();
    }
  }

  addLayerTool(){
    this.addTool("Layers", "Layers", {map: this}, Layers)
  }
  addTilesetTool(){
    this.addTool("Tileset", "Tilesets", {map:this}, TileSet);
  }
  addPropertiesTool(){
    this.addTool("Properties", "Properties", {map:this}, Properties);
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

  updateTools () {
    this.props.parent.forceUpdate();
  }
  // tileset calls this method..
  /* TODO: selection should be matrix - new class?*/
  /* selection methods */
  addToActiveSelection (gid){
    const index = this.collection.indexOf(gid);
    if(index == -1){
      this.collection.push(gid);
    }
  }
  removeFromActiveSelection(gid){
    const index = this.collection.indexOf(gid);
    if(index > -1){
      this.collection.splice(index, 1);
    }
  }
  clearActiveSelection(){
    this.collection.length = 0;
  }
  swapOutSelection(){
    for(let i=0; i<this.tmpSelection.length; i++){
      this.selection.pushUniquePos(this.tmpSelection[i]);
    }
    this.tmpSelection.clear();
  }
  removeFromSelection(){
    for(let i=0; i<this.tmpSelection.length; i++){
      this.selection.removeByPos(this.tmpSelection[i]);
    }
    this.tmpSelection.clear();
  }
  // keep only matching form both selections
  keepDiffInSelection(){
    const tmp = new TileCollection();

    for(let i=0; i<this.tmpSelection.length; i++){
      for(let j=0; j<this.selection.length; j++){
        if(this.tmpSelection[i].isEqual(this.selection[j])){
          tmp.pushUniquePos(this.selection[j]);
        }
      }
    }

    this.selection = tmp;
    this.tmpSelection.clear();
  }
  selectionToTmp(){
    this.tmpSelection.clear();
    for(let i=0; i<this.selection.length; i++){
      this.tmpSelection.push(this.selection[i]);
    }
  }
  selectionToCollection(){
    this.collection.clear();
    for(let i=0; i<this.selection.length; i++){
      this.collection.push(this.selection[i]);
    }
  }
  /* end of selection */


  togglePreviewState(){
    this.refs.mapElement.style.transform = "";
    this.lastEvent = null;

    // next state...
    if(!this.options.preview){
      $(this.refs.mapElement).addClass("preview");
    }
    else{
      $(this.refs.mapElement).removeClass("preview");
    }
    // this is not synchronous function !!!
    this.options.preview = !this.options.preview
    this.forceUpdate();
  }

  /* camera stuff */
  resetCamera(){
    this.lastEvent = null;
    this.camera.x = 0;
    this.camera.y = 0;
    this.camera.zoom = 1;

    if(this.options.preview) {
      this.preview.x = 5;
      this.preview.y = 45;
      this.refs.mapElement.style.transform = "rotatey(" + this.preview.y + "deg) rotatex(" + this.preview.x + "deg) scale(0.9)";
    }

    this.redrawLayers();
    this.refs.grid.drawGrid();
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

    if(this.refs.grid){
      this.refs.grid.drawGrid();
    }
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
  /* endof camera stuff */

  /* events */
  handleMouseMove(e){
    // move Preview
    if(this.options.preview && (e.button == 1)) {
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
  handleKeyUp(e){
    let update = false;
    // don't steal events from inputs
    if(e.target.tagName == "INPUT") {
      return;
    }
    switch (e.which) {
      case 37: //left
        this.camera.x += this.data.tilewidth * this.camera.zoom;
        update = true;
        break;
      case 38: //top
        this.camera.y += this.data.tileheight * this.camera.zoom;
        update = true;
        break;
      case 39: //right
        this.camera.x -= this.data.tilewidth * this.camera.zoom;
        update = true;
        break;
      case 40: // down
        this.camera.y -= this.data.tileheight * this.camera.zoom;
        update = true;
        break;
      case 13: // enter
        this.selectionToCollection();
        this.selection.clear();
        this.refs.tools.enableMode(EditModes.stamp);
        break;
      case 90: // ctrl + z
        if (e.ctrlKey) {
          if (e.shiftKey) {
            this.doRedo();
          }
          else {
            this.doUndo();
          }
        }
    }
    if(e.ctrlKey){
      console.log(e.which);
    }
    if(update){
      this.redraw();
    }
  }


  importFromDrop (e) {
    console.log("DROP map area!");
    const layer = this.getActiveLayer();
    if(layer && layer.onDrop){
      layer.onDrop(e);
    }
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
  /* endof events */

  /* update stuff */
  fullUpdate(cb = () => {}){
    this.generateImages(() => {
      this.update(cb);
    });
  }
  /* update all except images */
  update(cb = ()=>{}){
    this.addLayerTool();
    this.addTilesetTool();
    this.addPropertiesTool();
    this.redrawLayers();
    this.redrawTilesets();
    cb();
  }


  redraw(){
    this.redrawLayers();
    this.redrawGrid();
  }

  redrawGrid(){
    this.refs.grid && this.refs.grid.drawGrid();
  }
  redrawLayers(){
    this.layers.forEach((layer) => {
      layer.adjustCanvas();
      layer.draw();
    });
  }
  redrawTilesets(){
    this.tilesets.forEach((tileset) => {
      tileset.drawTiles();
    });
  }
  updateTilesets(){
    // do we have more than 1 tileset ?????
    // TODO: atm we are using only 1 tileset tool..
    this.tilesets.forEach((tileset) => {
      tileset.selectTileset(this.activeTileset);
    });
  }
  /* endof update stuff */

  getLayer(ld){
    for(let i=0; i < this.layers.length; i++){
      if(this.layers[i].options == ld){
        return this.layers[i];
      }
    }
  }
  getActiveLayer(){
    return this.getLayer(this.data.layers[this.activeLayer]);
  }

  // TODO: keep aspect ratio
  // find out correct thumbnail size
  generatePreview(){
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    const ratio = canvas.height / canvas.width;

    for(let i=0; i<this.data.layers.length; i++){
      const layer = this.getLayer(this.data.layers[i]);
      if(!layer){continue;}
      const c = layer.refs.canvas;
      ctx.drawImage(c, 0, 0, c.width, c.height*ratio, 0, 0, canvas.width, canvas.height);
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
        if(map.layers[i].type == LayerTypes.tile) {
          layers.push(<TileMapLayer
            data={map.layers[i]}
            key={i}
            map={this}
            active={this.activeLayer == i}
            />);
        }
        else if(map.layers[i].type == LayerTypes.image) {
          layers.push(<ImageLayer
            data={map.layers[i]}
            key={i}
            map={this}
            active={this.activeLayer == i}
            />);
        }
        else if(map.layers[i].type == LayerTypes.object) {
          layers.push(<ObjectLayer
            data={map.layers[i]}
            key={i}
            map={this}
            active={this.activeLayer == i}
            />);
        }
      }
      if(this.meta.options.showGrid) {
        layers.push(
          <GridLayer map={this} key={i} ref="grid" />
        );
      }
      // TODO: adjust canvas size
      return (
        <div
             ref="mapElement"
             onContextMenu={(e)=>{e.preventDefault(); return false;}}
             style={{
              //width: (640)+"px",
              height: (640)+"px",
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
        onWheel={this.handleOnWheel.bind(this)}
        >
        <MapTools map={this} ref="tools" />
        {this.renderMap()}
      </div>
    )
  }
};
