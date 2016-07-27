"use strict"
import _ from 'lodash';
import React from 'react'
import LayerTypes from './LayerTypes.js'

export default class Layers extends React.Component {

  get map(){
    return this.props.info.content.map;
  }

  getLayer(){
    const layer = this.map.getActiveLayer()
    if(!layer || layer.kind != LayerTypes.object){
      return null
    }
    return layer
  }

  showOrHideObject(index){
    const activeLayer = this.map.getActiveLayer();
    const objects = activeLayer.data.objects;
    objects[index].visible = !objects[index].visible;
  }
  handleClick(index){
    const l = this.getLayer();
    if(!l){
      // TODO: redraw map / clear cache?
      return;
    }
    // TODO: create set/getActiveObject in the object layer
    l.setPickedObjectSlow(index);

    this.map.forceUpdate();
    this.forceUpdate();
  }
  renderBlock(content = []){
    return (
      <div className="mgbAccordionScroller">
        <div className="ui fluid styled accordion">
          <div className="active title">
              <span className="explicittrigger">
                <i className="dropdown icon"></i>
                {this.props.info.title}
              </span>
          </div>
          <div className="active content menu">{content}</div>
        </div>
      </div>
    );
  }
  render() {

    const activeLayer = this.map.getActiveLayer()
    if(!activeLayer || activeLayer.kind != LayerTypes.object){
      return this.renderBlock()
    }
    // TODO: refactor - so I don't need to access "private" member
    const active = activeLayer.getPickedObject()
    const objects = activeLayer.data.objects
    const toRender = []

    for(let i=objects.length-1; i>-1; i--){
      let className = "icon"
          + (objects[i].visible ? " unhide" : " hide")

      toRender.push(
        <div key={i}
             className={(i == active ? "bold active" : "item")}
             onClick={this.handleClick.bind(this, i)}
          >
          <i className={className}
             onClick={this.showOrHideObject.bind(this, i, objects[i].visible)}
            ></i><a href="javascript:;">{objects[i].name || "(unnamed object)"}</a></div>
      )
    }
    return this.renderBlock(toRender)
  }
}
