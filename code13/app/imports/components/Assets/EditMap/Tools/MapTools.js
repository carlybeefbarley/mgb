import React from 'react';
import EditModes from "./EditModes";

export default class MapTools extends React.Component {

  componentDidMount(){
    this.activateToolPopups();
  }
  activateToolPopups() {
    console.log("activate popup!");
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
    this.props.map.redrawTilesets();
  }
  clearSelection(){
    console.log("clear selection");
    this.props.map.tmpSelection.clear();
    this.props.map.selection.clear();
    this.props.map.redraw();
  }

  render() {
    if(!this.props.map.options.mode){
      this.props.map.options.mode = "stamp";
    }
    const undoClass = this.props.map.undoSteps.length ? "ui button" : "ui button disabled";
    //const undoClass = this.props.map.undoSteps.length ? "ui button hazPopup" : "ui button disabled hazPopup";
    //const undoCount = this.props.map.undoSteps.length;/// ? `<div class="floating ui tiny grey label">${this.props.map.undoSteps.length}</div>` : "";
    return (
      <div ref="mainElement">
        {/* mics buttons / camera / view / save */}
        <div className="ui icon buttons small ">
          <span className="ui button"
                  title="Drop tileset on the map area to import it"
            ><i className="question icon"></i>
          </span>
          <span className={(this.props.map.options.preview ? "ui button primary" : "ui button")}
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
                  title="Undo"
                  data-position="top center"
            ><i className="undo icon"></i>{this.props.map.undoSteps.length}
          </span>
          <span className="ui button disabled"
                  onClick={this.doRedo.bind(this)}
                  title="Redo"
            ><i className="undo icon" style={{transform: "scaleX(-1)"}}></i>
          </span>
        </div>
        {/* randomize */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.randomMode ? "ui button primary" : "ui button")}
                  onClick={this.toggleRandomMode.bind(this)}
                  title="Random Mode - picks one tile from the selection"
            ><i className="random icon"></i>
          </span>
        </div>
        {/* put something on map */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.mode == "stamp" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "stamp")}
                  title="Stamp Tool"
            ><i className="legal stamp icon"></i>
          </span>
          <span className={(this.props.map.options.mode == "terrain" ? "ui button primary disabled" : "ui button disabled")}
                  onClick={this.enableMode.bind(this, "terrain")}
                  title="Terrain Tool"
            ><i className="world terrain icon"></i>
          </span>
          <span className={(this.props.map.options.mode == "fill" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "fill")}
                  title="bucket fill tool"
            ><i className="theme fill icon"></i>
          </span>
          <span className={(this.props.map.options.mode == "eraser" ? "ui button primary" : "ui button")}
                  onClick={this.enableEraser.bind(this)}
                  title="Eraser"
            ><i className="eraser icon"></i>
          </span>
        </div>
        {/* select something */}
        <div className="ui icon buttons small">
          <span className={(this.props.map.options.mode == "rectanlge" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "rectanlge")}
                  title="Rectangle selection"
            ><i className="square outline rectangle icon"></i>
          </span>
          <span className={(this.props.map.options.mode == "wand" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "wand")}
                  title="Magic Wand selection - select same adjascent tiles"
            ><i className="wizard icon"></i>
          </span>
          <span className={(this.props.map.options.mode == "picker" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "picker")}
                  title="Select same tiles "
            ><i className="qrcode picker icon"></i>
          </span>
          <span className="ui button"
                  onClick={this.clearSelection.bind(this)}
                  title="Clear Selection"
            ><i className="ban icon"></i>
          </span>
        </div>
      </div>
    )
  }
}
