"use strict";
import React, { PropTypes } from 'react';
import TileMapLayer from "./TileMapLayer.js";
import TileHelper from "./TileHelper.js";

export default class MapEditor extends React.Component {

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
    this.errors = [];
    this.gidCache = {};
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
    this.setState({
      asset: this.props.asset
    });
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
    }

    let ptools = this.props.parent.state.tools;
    if(this.errors.length){
      ptools['errors'] = {
        title: "Errors",
        text: this.errors
      };

      this.props.parent.setState({
        tools: ptools
      });
    }
    else{
      delete ptools['errors'];
      this.props.parent.setState({
        tools: ptools
      });
    }
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
  /* TODO: create tileset views */
  renderTilesets(){
    let tilesets = [];
    return <div className="tilesets"></div>
  }

  render (){
    return (
      <div
        onDrop={this.importFromDrop.bind(this)}
        onDragOver={this.prepareForDrag.bind(this)}
        >
        <button className="ui primary button"
          >Drop here to import</button>
        {this.renderMap()}
        {this.renderTilesets()}
      </div>
    )
  }
};
