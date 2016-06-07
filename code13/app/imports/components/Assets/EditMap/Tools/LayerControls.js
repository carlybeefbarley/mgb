"use strict";
import React from 'react';
import TileHelper from '../TileHelper.js';

export default class LayerControls extends React.Component {

  addLayer() {
    const parent = this.props.layer;
    const map = parent.props.info.content.map;
    const lss = map.map.layers;
    // TODO: check for duplicate names.. as they are confusing
    const ls = TileHelper.genLayer(map.map.width, map.map.height, "Layer " + (lss.length + 1));

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

  render() {
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
            >
            <i className="add icon"></i>
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
