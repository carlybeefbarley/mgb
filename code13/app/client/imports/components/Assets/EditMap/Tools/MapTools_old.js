"use strict";
import _ from 'lodash';
import React from 'react';
import EditModes from "./EditModes";

export default class MapTools extends React.Component {

  componentDidMount(){
    this.activateToolPopups();
  }
  activateToolPopups() {
    $('.hazPopup', this.refs.mainElement).popup();
  }

  doPreview() {
    this.props.map.togglePreviewState();
  }

  doSave(e) {
    this.props.map.props.parent.handleSave(e);
  }

  doCameraReset() {
    this.props.map.resetCamera();
  }
  doUndo(){
    this.props.map.doUndo();
    this.forceUpdate();
  }
  doRedo(){
    this.props.map.doRedo();
    this.forceUpdate();
  }
  toggleRandomMode(){
    this.props.map.options.randomMode = !this.props.map.options.randomMode;
    this.forceUpdate();
  }
  enableMode(mode){
    this.props.map.options.mode = mode;
    this.forceUpdate();
  }
  enableEraser(){
    this.enableMode(EditModes.eraser);
    this.props.map.selection.clear();
    this.props.map.collection.clear();
    this.props.map.redrawTilesets();
  }
  clearSelection(){
    this.props.map.tmpSelection.clear();
    this.props.map.selection.clear();
    this.props.map.collection.clear();
    this.props.map.redraw();
    const l = this.props.map.getActiveLayer();
    if(!l || !l.clearSelection){return;}
    l.clearSelection();
  }
  toggleFill(){
    const l = this.props.map.getActiveLayer();
    if(!l || !l.clearSelection){return;}
    l.toggleFill();
  }
  rotate(cw){
    const l = this.props.map.getActiveLayer();
    if(!l || !l.rotate){return;}
    if(cw){
      l.rotate();
    }
    else{
      l.rotateBack();
    }
  }

  render() {
    if(!this.props.map.options.mode){
      this.props.map.options.mode = "stamp";
    }

    // const activeClass = "black";
    const activeClass = "primary";
    const undoClass = this.props.map.undoSteps.length ? "ui button" : "ui button disabled";
    const redoClass = this.props.map.redoSteps.length ? "ui button" : "ui button disabled";
    //const undoClass = this.props.map.undoSteps.length ? "ui button hazPopup" : "ui button disabled hazPopup";
    //const undoCount = this.props.map.undoSteps.length;/// ? `<div class="floating ui tiny grey label">${this.props.map.undoSteps.length}</div>` : "";

    // TODO: disable object drawing buttons if active layer is not ObjectLayer
    //const canDraw;

    const undoTitle = "Undo" + (this.props.map.undoSteps.length ? " " + this.props.map.undoSteps[this.props.map.undoSteps.length - 1].reason : "");

    return (
      <div ref="mainElement">
        {/* mics buttons / camera / view / save */}
        <div className="ui icon buttons small ">
          <span className="ui button"
                  title="Drop tileset on the map area to import it"
            ><i className="question icon"></i>
          </span>
          <span className={(this.props.map.options.preview ? "ui button " + activeClass : "ui button")}
                  onClick={this.doPreview.bind(this)}
                  title="3d Preview"
            ><i className="cube icon"></i>
          </span>
          <span className="ui button"
                  onClick={this.doCameraReset.bind(this)}
                  title="Reset camera"
            ><i className="crosshairs icon"></i>
          </span>
          <span className="ui button"
                  onClick={this.doSave.bind(this)}
                  title="Save map"
            ><i className="save icon"></i>
          </span>
        </div>
        {/* undo / redo */}
        <div className="ui icon small buttons">
          <span className={undoClass}
                  onClick={this.doUndo.bind(this)}
                  title={undoTitle}
                  data-position="top center"
            ><i className="undo icon"></i>{this.props.map.undoSteps.length}
          </span>
          <span className={redoClass}
                  onClick={this.doRedo.bind(this)}
                  title="Redo"
            ><i className="undo icon" style={{transform: "scaleX(-1)"}}></i>
          </span>
        </div>
        {/* randomize */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.randomMode ? "ui button " + activeClass : "ui button")}
                  onClick={this.toggleRandomMode.bind(this)}
                  title="Random Mode - picks one tile from the selection"
            ><i className="random icon"></i>
          </span>
        </div>
        {/* put something on map */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.mode == EditModes.stamp ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableMode.bind(this, EditModes.stamp)}
                  title="Stamp Tool"
            ><i className="legal stamp icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.terrain ? "ui button disabled" + activeClass : "ui button disabled")}
                  onClick={this.enableMode.bind(this, EditModes.terrain)}
                  title="Terrain Tool"
            ><i className="world terrain icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.fill ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableMode.bind(this, EditModes.fill)}
                  title="bucket fill tool"
            ><i className="theme fill icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.eraser ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableEraser.bind(this)}
                  title="Eraser"
            ><i className="eraser icon"></i>
          </span>
        </div>
        {/* select something */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.mode == EditModes.rectangle ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableMode.bind(this,  EditModes.rectangle)}
                  title="Rectangle selection"
            ><i className="square outline rectangle icon"></i>
          </span>
          <span className={(this.props.map.options.mode ==  EditModes.wand ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableMode.bind(this, EditModes.wand)}
                  title="Magic Wand selection - select same adjascent tiles"
            ><i className="wizard icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.picker ? "ui button " + activeClass : "ui button")}
                  onClick={this.enableMode.bind(this, EditModes.picker)}
                  title="Select same tiles "
            ><i className="qrcode picker icon"></i>
          </span>
          <span className="ui button"
                  onClick={this.clearSelection.bind(this)}
                  title="Clear Selection"
            ><i className="ban icon"></i>
          </span>
        </div>
        <div className="ui icon buttons small">
          <span className="ui button"
              onClick={this.rotate.bind(this, true)}
              title="Rotate ClockWise - Z"
          ><i className="share icon"></i>
          </span>
          <span className="ui button"
                onClick={this.rotate.bind(this, false)}
                title="Rotate CounterClockWise - Shift + Z"
            ><i className="reply icon"></i>
          </span>
        </div>
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.mode == EditModes.drawRectangle ? "ui button " + activeClass : "ui button")}
                onClick={this.enableMode.bind(this, EditModes.drawRectangle)}
                title="Draw Rectangle"
            ><i className="stop icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.drawEllipse ? "ui button " + activeClass : "ui button")}
                onClick={this.enableMode.bind(this, EditModes.drawEllipse)}
                title="Draw Ellipse"
            ><i className="circle icon"></i>
          </span>
          <span className={(this.props.map.options.mode == EditModes.drawShape ? "ui button " + activeClass : "ui button")}
                onClick={this.enableMode.bind(this, EditModes.drawShape)}
                title="Draw Shape from multiple lines"
            ><i className="pencil icon"></i>
          </span>
          <span className="ui button"
                onClick={this.toggleFill.bind(this)}
                title="Toggle shape fill"
            ><i className="clone icon"></i>
          </span>
        </div>
      </div>
    )
  }
}
