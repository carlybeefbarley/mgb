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

	selectLayer(){
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

  deleteLayer(){
    this.props.deleteLayer(this.props.idx);
  }


  render() {
  	let framesTD = _.map(this.props.frameNames, (frameName, frameID) => { return (
      <td onClick={this.selectFrame.bind(this, frameID)}
      	className={this.props.isSelected && this.props.selectedFrame === frameID ? "highlight" : ""}>
          {/* selectedFrameIdx === idx ? <i className="circle icon"></i> : "" */}
      </td>);
    });

    return (
      <tr 
        className={this.props.isSelected ? "active" : ""}
        onClick={this.selectLayer.bind(this)} >
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
          {framesTD}
          <td>
          	<div 
          		className={"ui image " + (this.props.isCanvasLayersVisible ? "" : "hidden") }
          		draggable="true" 
          		/* onDragStart={this.handlePreviewDragStart.bind(this, this.props.idx)} */ 
          		style={{"maxWidth": "256px", "maxHeight": "256px", "overflow": "scroll" }}>
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
  frameNames: PropTypes.array.isRequired,
  selectedFrame: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isCanvasLayersVisible: PropTypes.bool.isRequired,

  selectLayer: PropTypes.func.isRequired,
  selectFrame: PropTypes.func.isRequired,
  deleteLayer: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
};