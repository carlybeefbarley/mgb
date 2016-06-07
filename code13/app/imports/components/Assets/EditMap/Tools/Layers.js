import React from 'react';
import LayerControls from "./LayerControls.js";

export default class Layers extends React.Component {

  componentDidMount() {
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

  handleClick(layerNum){
    this.props.info.content.map.activeLayer = layerNum;
    this.props.info.content.map.forceUpdate();
    this.forceUpdate();
  }
  showOrHideLayer(layer, visible, e){
    e.preventDefault();
    e.stopPropagation();
    console.log("show / hide");
    const mapData = this.props.info.content.map.map;
    mapData.layers[layer].visible = !visible;
    this.props.info.content.map.forceUpdate();

    this.forceUpdate();
  }

  render() {
    let layers = [];

    const map = this.props.info.content.map.map;
    const active = this.props.info.content.map.activeLayer;
    // layers goes from bottom to top - as first drawn layer will be last visible
    for(let i=map.layers.length-1; i>-1; i--){
      let className = "icon"
        + (map.layers[i].visible ? " unhide" : " hide")
      ;

      layers.push(
        <div key={i}
           className={(i == active ? "bold active" : "item")}
           onClick={this.handleClick.bind(this, i)}
           href="javascript:;"
          >
          <i className={className}
             onClick={this.showOrHideLayer.bind(this, i, map.layers[i].visible)}
            ></i><a href="javascript:;">{map.layers[i].name}</a></div>
      );
    }
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
            <span className="explicittrigger">
              <i className="dropdown icon"></i>
              {this.props.info.title}
            </span>
          </div>
          <div className="active content menu">
            <LayerControls layer={this} />
            {layers}
          </div>
        </div>
      </div>
    )
  }
}
