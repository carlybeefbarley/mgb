import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import sty from  '../editGraphic.css';

export default class Layer extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	editName: false,
	    };
	}

	toggleVisibility(){
		this.props.layer.isHidden = !this.props.layer.isHidden;
		this.props.handleSave('Layer visibility');
	}

	toggleLocking(){
		this.props.layer.isLocked = !this.props.layer.isLocked;
		this.props.handleSave('Layer locking');
	}

	selectLayer(event){
    let clickedDiv = event.target;
    // don't invoke select if remove layer
    if(clickedDiv.className.search('remove') !== -1){
      return;
    }
    if(clickedDiv.firstChild && clickedDiv.firstChild.className && clickedDiv.firstChild.className.search('remove') !== -1){
      return;
    }

    this.props.selectLayer(this.props.idx);
	}

	selectFrame(frameID){
		this.props.selectFrame(frameID);
	}

	editName(){
		ReactDOM.findDOMNode(this.refs.nameInput).value = ReactDOM.findDOMNode(this.refs.nameText).textContent;	
		ReactDOM.findDOMNode(this.refs.nameInput).select();
		ReactDOM.findDOMNode(this.refs.nameInput).focus();	
		this.setState({ editName: true });
	}

	changeName(event){
		event.preventDefault();
		this.setState({ editName: false });
		this.props.layer.name = ReactDOM.findDOMNode(this.refs.nameInput).value;
		this.props.handleSave('Changed layer name');
	}

  moveLayerUp(){
    this.props.moveLayerUp(this.props.idx);
  }

  moveLayerDown(){
    this.props.moveLayerDown(this.props.idx);
  }

  copyLayer(){
    this.props.copyLayer(this.props.idx);
  }

  pasteLayer(){
    this.props.pasteLayer(this.props.idx);
  }

  deleteLayer(){
    this.props.deleteLayer(this.props.idx);
  }


  render() {
    return (
      <tr 
        className={this.props.isSelected ? "active" : ""}
        onClick={this.selectLayer.bind(this)} 
        key={this.props.idx}
        >
          <td>
          	<i 
          		className={"icon " + (this.props.layer.isHidden ? "hide" : "unhide" )}
          		onClick={this.toggleVisibility.bind(this)}
          	></i>
          </td>
          <td>
          	<i 
          		className={"icon " + (this.props.layer.isLocked ? "lock" : "unlock" )}
          		onClick={this.toggleLocking.bind(this)}
          	></i>
          </td>
          <td onDoubleClick={this.editName.bind(this)} onSubmit={this.changeName.bind(this)}>
          	<div ref="nameText" className={this.state.editName ? "hidden" : "visible"}>{this.props.layer.name}</div>
          	<form className={"ui input " + (this.state.editName ? "visible" : "hidden")} ><input ref="nameInput" type="text" /></form>          
          </td>
          <td>
            <div className="ui simple dropdown">
              <i className="icon setting"></i>
              <div className="menu">
                <div onClick={this.moveLayerUp.bind(this)}
                  className={"item " + (this.props.idx === 0 ? "disabled" : "") }>
                  <i className="arrow up icon"></i>
                  Move Up
                </div>
                <div onClick={this.moveLayerDown.bind(this)}
                  className={"item " + (this.props.layerCount-1 === this.props.idx ? "disabled" : "")}>
                  <i className="arrow down icon"></i>
                  Move Down
                </div>
                <div className="divider"></div>
                <div onClick={this.editName.bind(this)}
                  className="item">
                  <i className="edit icon"></i>
                  Rename
                </div>
                <div className="divider"></div>
                <div onClick={this.copyLayer.bind(this)}
                  className={"item "}>
                  <i className="copy icon"></i>
                  Copy
                </div>
                <div onClick={this.pasteLayer.bind(this)}
                  className={"item " + (this.props.copyLayerID === null ? "disabled" : "")}>
                  <i className="paste icon"></i>
                  Paste
                </div>
                <div className="divider"></div>
                <div onClick={this.deleteLayer.bind(this)}
                  className="item">
                  <i className="remove icon"></i>
                  Delete
                </div>
              </div>
            </div>
          </td>
          {
            _.map(this.props.frameNames, (frameName, frameID) => { 
              const isActiveCell = this.props.isSelected && this.props.selectedFrame === frameID
              return (
              <td className="selectable" onClick={this.selectFrame.bind(this, frameID)}
                key={this.props.idx+"_"+frameID}
                title={isActiveCell ? `This is the current edit focus: Layer "${this.props.layer.name}" of Frame #${this.props.selectedFrame+1}`: "click here to edit this frame/layer"}
                className={isActiveCell ? "highlight" : ""}>
                {isActiveCell ? "•" : ""}
              </td>)  
            })
          }
          <td className="layerCanvas">
          	<div 
          		className={"ui image " + (this.props.isCanvasLayersVisible ? "" : "hidden") }
          		draggable="true" 
              title={`Preview for Layer "${this.props.layer.name}" of Frame #${this.props.selectedFrame+1}`}
          		/* onDragStart={this.handlePreviewDragStart.bind(this, this.props.idx)} */ 
          		style={{"maxWidth": "256px", "maxHeight": "256px", "overflow": "auto" }}>
          			<canvas width={this.props.width} height={this.props.height}></canvas>
        	</div>
          </td>
          <td>
            <i onClick={this.deleteLayer.bind(this)}
              className="remove icon"></i>
          </td>
      </tr>
    );
  }
}
 
Layer.propTypes = {
  idx: PropTypes.number.isRequired,
  layer: PropTypes.object.isRequired,
  layerCount: PropTypes.number.isRequired,
  frameNames: PropTypes.array.isRequired,
  selectedFrame: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isCanvasLayersVisible: PropTypes.bool.isRequired,
  copyLayerID: PropTypes.number,

  selectLayer: PropTypes.func.isRequired,
  moveLayerUp: PropTypes.func.isRequired,
  moveLayerDown: PropTypes.func.isRequired,
  copyLayer: PropTypes.func.isRequired,
  pasteLayer: PropTypes.func.isRequired,
  selectFrame: PropTypes.func.isRequired,
  deleteLayer: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
};