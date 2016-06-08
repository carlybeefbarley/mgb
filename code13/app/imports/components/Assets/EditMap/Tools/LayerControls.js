"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';

export default class LayerControls extends React.Component {

  constructor(...args){
    super(...args);
  }

  get map(){
    const parent = this.props.layer;
    return parent.props.info.content.map;
  }
  get options(){
    return this.map.meta.options;
  }

  addLayer() {
    const parent = this.props.layer;
    const map = parent.props.info.content.map;
    const lss = map.map.layers;
    // TODO: check for duplicate names..
    const ls = TileHelper.genLayer(map.data.width, map.data.height, "Layer " + (lss.length + 1));

    lss.push(ls);
    map.forceUpdate();
    parent.forceUpdate();
  }

  removeLayer() {
    const parent = this.props.layer;
    const map = parent.props.info.content.map;
    const lss = map.map.layers;

    lss.splice(map.activeLayer, 1);
    parent.forceUpdate();
    map.forceUpdate();
  }

  highlightActiveLayerToggle(){
    this.options.highlightActiveLayers = !this.options.highlightActiveLayers;
    if(this.options.highlightActiveLayers){
      $(this.map.refs.mapElement).addClass("highlight-active-layer");
    }
    else{
      $(this.map.refs.mapElement).removeClass("highlight-active-layer");
    }
    this.forceUpdate();
  }

  render() {
    const highlihgtClassName = `ui floated icon button ${this.options.highlightActiveLayers ? 'active' : ''}`;

    return (
      <div className="ui mini">
        <div className="ui icon buttons mini"
             title="New Layer"
             style={{
                    position: "relative",
                    top: "-10px"
                  }}
          >
          <button className="ui floated icon button"
                  onClick={this.addLayer.bind(this)}
                  title="Create new Layer"
            ><i className="add icon"></i>
          </button>
          <button className={highlihgtClassName}
                  onClick={this.highlightActiveLayerToggle.bind(this)}
                  title="Highlight Active layer"
            ><i className="add icon"></i>
          </button>
        </div>
        <div className="ui icon buttons right floated mini"
             title="Remove Active Layer"
             style={{
              position: "relative",
              top: "-10px"
            }}>
          <button className="ui icon button"
                  onClick={this.removeLayer.bind(this)}
            >
            <i className="remove icon"></i>
          </button>
        </div>
      </div>
    )
  }
}
