import React, { PropTypes } from 'react';

import Layer from './Layer.js';

export default class SpriteLayers extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	selectedFrameIdx: 0,
          	selectedLayerIdx: 0,
	    	allLayerHidden: false,
	    	allLayersLocked: false,
	    };
	}

	handleAddLayer(){

	}

	toggleAllVisibility(){
		this.setState({ allLayerHidden: !this.state.allLayerHidden });
	}

	toggleAllLocking(){
		this.setState({ allLayersLocked: !this.state.allLayersLocked });
	}

	toggleLayerVisibility(idx){
		this.props.content2.hiddenLayers[idx] = !this.props.content2.hiddenLayers[idx];
		this.handleSave('Layer visibility');
	}

	selectLayer(idx){
		this.setState({ selectedLayerIdx: idx });
	}

	selectFrame(idx){
		this.setState({ selectedFrameIdx: idx });
	}

	handleSave(changeText="change graphic"){
		this.props.handleSave(changeText);
	}


	renderLayers(){
		let c2 = this.props.content2;
		let tmp = [];
		for(let i=0; i<c2.layerNames.length; i++){
			tmp[i] = {
				name: c2.layerNames[i], 
				isHidden: c2.hiddenLayers[i],
				isLocked: c2.lockedLayers[i],
				frameNames: c2.frameNames, 
				selectedFrame: this.state.selectedFrameIdx,
				isSelected: this.state.selectedLayerIdx === i,
			};
		}

		return tmp.map((layer, idx) => (
			<Layer 
				idx={idx} 
				name={layer.name} 
				isHidden={layer.isHidden}
				isLocked={layer.isLocked}
				frameNames={c2.frameNames} 
				selectedFrame={this.state.selectedFrameIdx}
				isSelected={this.state.selectedLayerIdx === idx}
				selectLayer={this.selectLayer.bind(this)}
				toggleLayerVisibility={this.toggleLayerVisibility.bind(this)}
				handleSave={this.handleSave.bind(this)}
			/>
		));		
	}

  render() { 
  	let c2 = this.props.content2;
  	let framesTH = _.map(c2.frameNames, (frameName, idx) => { return (
      <th width="10px">{idx+1}</th>);
    });

    return (
      	<div className="ui sixteen wide column">

          <table className="ui celled padded table">
            <thead>
              <tr>
                <th width="32px">
                	<i 
                	className={"icon " + (this.state.allLayerHidden ? "hide" : "unhide" )} 
                	onClick={this.toggleAllVisibility.bind(this)}
                	></i>
                </th>
                <th width="32px">
                	<i 
                	className={"icon " + (this.state.allLayersLocked ? "lock" : "unlock" )} 
                	onClick={this.toggleAllLocking.bind(this)}
                	></i>
                </th>
                <th width="200px">
                  <i className="add circle icon" onClick={this.handleAddLayer.bind(this)}></i>
                </th>
                {framesTH}
                <th></th>
                <th width="32px"></th>
              </tr>
            </thead>
            <tbody>
              {this.renderLayers()}
            </tbody>
          </table>

        </div>
    );
  }
}
 
SpriteLayers.propTypes = {
  content2: PropTypes.object.isRequired,
};