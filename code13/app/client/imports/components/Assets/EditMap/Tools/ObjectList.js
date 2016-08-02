"use strict"
import _ from 'lodash';
import React from 'react'
import LayerTypes from './LayerTypes.js'

export default class Layers extends React.Component {

  componentDidMount(){
    $('.ui.accordion')
      .accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })
  }

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

  raise() {
    const parent = this.getLayer();
    const map = this.map;
    map.saveForUndo("Raise object");

    parent.raiseLowerObject();

    this.forceUpdate();
    parent.forceUpdate();
    map.forceUpdate();
  }

  lower() {
    const parent = this.getLayer();
    const map = this.map;
    map.saveForUndo("Lower object");

    parent.raiseLowerObject(true);

    this.forceUpdate();
    parent.forceUpdate();
    map.forceUpdate();
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
  }
  renderBlock(content = [], active = 0){

    let rise = '', lower = '';

    if(content && content.length){
      const d = this.getLayer().data;
      const l = d.objects ? d.objects.length -1 : 0;
      rise =(
        <button className={ active < l && active > -1 ? "ui floated icon button" : "ui floated icon button disabled"}
                onClick={this.raise.bind(this)}
                title="Raise Object"
          ><i className="angle up icon"></i>
        </button>
      );
      lower = (
        <button className={ active > 0 && active > -1 ? "ui floated icon button" : "ui floated icon button disabled"}
                onClick={this.lower.bind(this)}
                title="Lower Object"
          ><i className="angle down icon"></i>
        </button>
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
            <div className="ui mini" style={{
                position: "relative",
                top: "-10px"
              }}>
              <div className="ui icon buttons mini">
                {rise}
                {lower}
              </div>
            </div>
            {content}
          </div>
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
    return this.renderBlock(toRender, active)
  }
}
