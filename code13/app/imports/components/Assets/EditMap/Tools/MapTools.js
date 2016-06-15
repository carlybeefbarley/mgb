import React from 'react';
import EditModes from "./EditModes";
export default class MapTools extends React.Component {

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
    return (
      <div>
        {/* mics buttons / camera / view / save */}
        <div className="ui icon buttons small">
          <button className="ui button"
                  title="Drop tileset on the map area to import it"
            ><i className="question icon"></i></button>
          <button className={(this.props.map.options.preview ? "ui button primary" : "ui button")}
                  onClick={this.doPreview.bind(this)}
                  title="3d Preview"
            >Preview
          </button>
          <button className="ui button"
                  onClick={this.doCameraReset.bind(this)}
                  title="Reset camera"
            ><i className="marker icon"></i>
          </button>
          <button className="ui button"
                  onClick={this.doSave.bind(this)}
                  title="Save map"
            ><i className="save icon"></i>
          </button>
        </div>
        {/* undo / redo */}
        <div className="ui icon small buttons">
          <button className="ui button disabled"
                  onClick={this.doUndo.bind(this)}
                  title="Undo"
            ><i className="undo icon"></i>
          </button>
          <button className="ui button disabled"
                  onClick={this.doRedo.bind(this)}
                  title="Redo"
            ><i className="undo icon" style={{transform: "scaleX(-1)"}}></i>
          </button>
        </div>
        {/* randomize */}
        <div className="ui icon buttons small">
          <button className={(this.props.map.options.randomMode ? "ui button primary" : "ui button")}
                  onClick={this.toggleRandomMode.bind(this)}
                  title="Random Mode - picks one tile from the selection"
            ><i className="random icon"></i>
          </button>
        </div>
        {/* put something on map */}
        <div className="ui icon buttons small">
          <button className={(this.props.map.options.mode == "stamp" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "stamp")}
                  title="Stamp Tool"
            ><i className="legal stamp icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "terrain" ? "ui button primary disabled" : "ui button disabled")}
                  onClick={this.enableMode.bind(this, "terrain")}
                  title="Terrain Tool"
            ><i className="terrain icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "fill" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "fill")}
                  title="bucket fill tool"
            ><i className="theme fill icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "eraser" ? "ui button primary" : "ui button")}
                  onClick={this.enableEraser.bind(this)}
                  title="Eraser"
            ><i className="eraser icon"></i>
          </button>
        </div>
        {/* select something */}
        <div className="ui icon buttons small">
          <button className={(this.props.map.options.mode == "rectanlge" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "rectanlge")}
                  title="Rectangle selection"
            ><i className="square outline rectangle icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "wand" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "wand")}
                  title="Magic Wand selection - select same adjascent tiles"
            ><i className="wizard icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "picker" ? "ui button primary" : "ui button")}
                  onClick={this.enableMode.bind(this, "picker")}
                  title="Select same tiles "
            ><i className="qrcode picker icon"></i>
          </button>
          <button className="ui button"
                  onClick={this.clearSelection.bind(this)}
                  title="Clear Selection"
            ><i className="ban icon"></i>
          </button>
        </div>
      </div>
    )
  }
}
