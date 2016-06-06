import React, { PropTypes } from 'react';

export default class Layer extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {

	    };
	}

	toggleVisibility(){
		// this.props.toggleLayerVisibility(this.props.idx);
		this.props.isHidden = !this.props.isHidden;
		this.props.handleSave('Layer visibility');
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
          		className={"icon " + (this.props.isHidden ? "hide" : "unhide" )}
          		onClick={this.toggleVisibility.bind(this)}
          	></i>
          </td>
          <td>
          	<i 
          		className={"icon " + (this.state.isLocked ? "lock" : "unlock" )}
          		onClick={this.toggleVisibility.bind(this)}
          	></i>
          </td>
          <td>{this.props.name}</td>
          {framesTD}
          <td></td>
          <td><i className="remove icon"></i></td>
      </tr>
    );
  }
}
 
Layer.propTypes = {
  idx: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  isHidden: PropTypes.bool.isRequired,
  isLocked: PropTypes.bool.isRequired,
  frameNames: PropTypes.array.isRequired,
  selectedFrame: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
};