import React, { PropTypes } from 'react';

export default class Layer extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {

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
          <td>{this.props.layer.name}</td>
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