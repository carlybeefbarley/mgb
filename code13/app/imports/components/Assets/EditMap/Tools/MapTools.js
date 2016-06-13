import React from 'react';
export default class InfoTool extends React.Component {

  doPreview() {
    this.props.map.togglePreviewState();
  }

  doSave() {
    this.props.map.props.parent.handleSave(e);
  }

  doCameraReset() {
    this.props.map.resetCamera();
    // for some reason grid fails to adjust canvas size
    this.props.map.refs.grid.sync();
  }
  doUndo(){

  }
  doRedo(){

  }
  toggleRandomMode(){
    this.props.map.options.randomMode = !this.props.map.options.randomMode;
  }
  enableMode(mode){

  }
  render() {
    return (
      <div>
        <div className="ui icon buttons small">
          <button className="ui button"
                  title="Drop tileset on the map area to import it"
            ><i className="question icon"></i></button>
          <button className="ui button"
                  onClick={this.doPreview.bind(this)}
                  title=""
            >Preview
          </button>
          <button className="ui button"
                  onClick={this.doSave.bind(this)}
            ><i className="save icon"></i>
          </button>
        </div>

        <div className="ui icon small buttons">
          <button className="ui button"
                  onClick={this.doCameraReset.bind(this)}
            ><i className="camera reset icon"></i>
          </button>
        </div>
        <div className="ui icon small buttons">
          <button className="ui button"
                  onClick={this.doUndo.bind(this)}
            ><i className="undo icon"></i>
          </button>
          <button className="ui button"
                  onClick={this.doRedo.bind(this)}
            ><i className="undo icon" style={{transform: "scaleX(-1)"}}></i>
          </button>
        </div>
        <div className="ui icon buttons small">
          <button className={(this.props.map.options.randomMode ? "ui button active" : "ui button")}
                  onClick={this.toggleRandomMode.bind(this)}
            ><i className="random icon"></i>
          </button>
        </div>
        <div className="ui icon buttons small">
          <button className={(this.props.map.options.mode == "stamp" ? "ui button active" : "ui button")}
                  onClick={this.enableMode.bind(this, "stamp")}
            ><i className="stamp icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "terrain" ? "ui button active" : "ui button")}
                  onClick={this.enableMode.bind(this, "terrain")}
            ><i className="terrain icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "fill" ? "ui button active" : "ui button")}
                  onClick={this.enableMode.bind(this, "fill")}
            ><i className="fill icon"></i>
          </button>
          <button className={(this.props.map.options.mode == "eraser" ? "ui button active" : "ui button")}
                  onClick={this.enableMode.bind(this, "eraser")}
            ><i className="eraser icon"></i>
          </button>
        </div>
      </div>
    )
  }
}
