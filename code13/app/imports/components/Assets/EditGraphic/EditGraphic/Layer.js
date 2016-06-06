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

	handleSelectLayer(){
		this.props.selectLayer(this.props.idx);
	}

	handleSelectFrame(){

	}

	editName(){
		ReactDOM.findDOMNode(this.refs.nameInput).value = ReactDOM.findDOMNode(this.refs.nameText).textContent;
		ReactDOM.findDOMNode(this.refs.nameInput).select();
		this.setState({ editName: true });
	}

	changeName(event){
		event.preventDefault();
		this.setState({ editName: false });
		this.props.layer.name = ReactDOM.findDOMNode(this.refs.nameInput).value;
		this.props.handleSave('Changed layer name');
	}


  render() {
  	let framesTD = _.map(this.props.frameNames, (frameName, idx) => { return (
      <td onClick={this.handleSelectFrame.bind(this, idx)}>
          {/* selectedFrameIdx === idx ? <i className="circle icon"></i> : "" */}
      </td>);
    });

    return (
      <tr 
        className={this.props.isSelected ? "active" : ""}
        onClick={this.handleSelectLayer.bind(this)} >
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
          	<form><input ref="nameInput" type="text" className={this.state.editName ? "visible" : "hidden"} /></form>
          </td>
          {framesTD}
          <td></td>
          <td><i className="remove icon"></i></td>
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

  selectLayer: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
};