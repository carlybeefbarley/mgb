"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';

export default class LayerControls extends React.Component {

  constructor(...args){
    super(...args);
  }

  componentDidMount(){
    this.updateOptions();
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
    const lss = map.data.layers;
    // TODO: check for duplicate names..
    const ls = TileHelper.genLayer(map.data.width, map.data.height, "Layer " + (lss.length + 1));

    lss.push(ls);
    map.forceUpdate();
    parent.forceUpdate();
  }

  removeLayer() {
    const parent = this.props.layer;
    const map = parent.props.info.content.map;
    const lss = map.data.layers;

    lss.splice(map.activeLayer, 1);
    parent.forceUpdate();
    map.forceUpdate();
  }

  raiseLayer() {
    const parent = this.props.layer;
    const map = this.map;
    const lss = map.data.layers;
    const layer = lss.splice(map.activeLayer, 1);

    map.activeLayer++;
    lss.splice(map.activeLayer, 0, layer[0]);
    parent.forceUpdate();
    map.forceUpdate();
  }
  lowerLayer() {
    const parent = this.props.layer;
    const map = this.map;
    const lss = map.data.layers;
    const layer = lss.splice(map.activeLayer, 1);

    map.activeLayer--;
    lss.splice(map.activeLayer, 0, layer[0]);
    parent.forceUpdate();
    map.forceUpdate();
  }

  updateOptions(){
    if(this.options.highlightActiveLayers){
      $(this.map.refs.mapElement).addClass("highlight-active-layer");
    }
    else{
      $(this.map.refs.mapElement).removeClass("highlight-active-layer");
    }

  }
  highlightActiveLayerToggle(){
    this.options.highlightActiveLayers = !this.options.highlightActiveLayers;
    this.updateOptions();
    this.forceUpdate();
  }
  showGridToggle(){
    this.options.showGrid = !this.options.showGrid;
    this.forceUpdate();
    this.map.forceUpdate();
  }

  render() {
    const highlihgtClassName = `ui floated icon button ${this.options.highlightActiveLayers ? 'primary' : ''}`;
    const showGridClassName = `ui floated icon button ${this.options.showGrid ? 'primary' : ''}`;

    const rise =(
      <button className={ this.map.activeLayer < this.map.data.layers.length - 1 ? "ui floated icon button" : "ui floated icon button disabled"}
                         onClick={this.raiseLayer.bind(this)}
                         title="Raise Layer"
      ><i className="angle up icon"></i>
      </button>
    );
    const lower = (
      <button className={ this.map.activeLayer > 0 ? "ui floated icon button" : "ui floated icon button disabled"}
                        onClick={this.lowerLayer.bind(this)}
                        title="Lower Layer"
        ><i className="angle down icon"></i>
      </button>
    );

    // TODO: ask David to get nice highlight layer icon - atm - paste was closest I could find
    return (
      <div className="ui mini" style={{
              position: "relative",
              top: "-10px"
            }}>
        <div className="ui icon buttons mini"
             title="New Layer"
          >
          <button className="ui floated icon button"
                  onClick={this.addLayer.bind(this)}
                  title="Create new Layer"
            ><i className="add icon"></i>
          </button>
          <button className={highlihgtClassName}
                  onClick={this.highlightActiveLayerToggle.bind(this)}
                  title="Highlight Active layer"
            ><i className="paste icon"></i>
          </button>
          <button className={showGridClassName}
                  onClick={this.showGridToggle.bind(this)}
                  title="Show Grid"
            ><i className="grid layout icon"></i>
          </button>
        </div>
        <div className="ui icon buttons mini">
          {rise}
          {lower}
        </div>
        <div className="ui icon buttons right floated mini"
             title="Remove Active Layer"
             >
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
