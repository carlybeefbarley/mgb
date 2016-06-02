"use strict";
import React, { PropTypes } from 'react';
import TileMapLayer from "./TileMapLayer.js";
import TileSet from "./Tools/TileSet.js";
import TileHelper from "./TileHelper.js";

export default class MapArea extends React.Component {

  constructor(props){
    super(props);
    let images = {};

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
    this.generateImages();
  }

  removeDots(sin){
    return sin.replace(/\./gi,'*');
  }
  set map(val){
    this.props.asset.content2 = val;
  }
  get map(){
    return this.props.asset.content2;
  }

  generateImages(){
    const imgs = this.props.asset.content2.images;
    if(!imgs){
      return;
    }
    const keys = Object.keys(imgs);
    keys.forEach((i, index) => {
      const img = new Image;
      img.onload = () => {
        this.images[i] = img;
        if(index == keys.length-1){
          this.updateImages();
        }
      };
      img.src = imgs[i];
    });
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
        console.log("reading", file);
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

  updateImages(){
    const map = this.map;
    if(!map){
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.ctx = canvas.getContext("2d");
    this.errors.length = 0;

    // generate small image for every available gid
    let index = 0;
    for(let ts of map.tilesets){
      let fgid = ts.firstgid;
      if(!this.images[ts.image]){
        this.errors.push("missing: '" + ts.image + "'" );
        continue;
      }
      canvas.width = ts.tilewidth;
      canvas.height = ts.tileheight;

      let tot = ts.tilecount;
      let pos = {x: 0, y: 0};
      for(let i=0; i<tot; i++){
        TileHelper.getTilePos(i, Math.floor(ts.imagewidth / ts.tilewidth), ts.tilewidth, ts.tileheight, pos);
        canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.ctx.drawImage(this.images[ts.image],
          pos.x, pos.y,
          ts.tilewidth, ts.tileheight,
          0, 0,
          ts.tilewidth, ts.tileheight
        );

        this.gidCache[fgid + i] = canvas.toDataURL();
      }
      index++;
    }

    this.addTilesetTool();
    if(this.errors.length) {
      this.addTool("error", "Errors", this.errors);
    }
    else {
      this.removeTool("error");
    }

    this.forceUpdate();
  }

  addTilesetTool(){
    let ts = this.map.tilesets[this.activeTileset]
    this.addTool("Tileset",  ts.name, {map:this}, TileSet);
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
    console.log($(e.target).data("key"), e.target.key);
    const sel = this.selection[0];
    const layer = this.map.layers[this.activeLayer];

    layer.data[key] = sel;

    this.forceUpdate();
  }

  renderMap(){
    const map = this.map;

    if(!map || !map.layers) {
      return (<div className="map-empty" />);
    }
    else{
      let layers = [];
      for (var i = 0; i < map.layers.length; i++) {
        layers.push(<TileMapLayer
          data={map.layers[i]}
          key={i}
          map={this.map}
          gidCache={this.gidCache}
          onClick={this.handleMapClicked.bind(this)}
          />);
      }
      return (<div className="map-filled" style={{
        width: (map.width * map.tilewidth)+"px",
        height: (map.height * map.tileheight)+"px",
        position: "relative",
        margin: "10px 0"
      }}>{layers}</div>);
    }
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

  render (){
    let styles = [];
    const keys = Object.keys(this.gidCache);
    keys.forEach((k) => {
      styles.push(".tilemap-tile.gid-" + k + "{ background-image: url('"+ this.gidCache[k]+ "');}");
    });

    return (
      <div
        className="tilemap-wrapper"
        onDrop={this.importFromDrop.bind(this)}
        onDragOver={this.prepareForDrag.bind(this)}
        >
        <style>{styles}</style>
        <button className="ui primary button"
          >Drop here to import</button>
        {this.renderMap()}
      </div>
    )
  }
};
