import React, { PropTypes } from 'react';

import Layer from './Layer.js';

export default class SpriteLayers extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	selectedFrameIdx: 0,
          	selectedLayerIdx: 0,
	    	allLayersHidden: false,
	    	allLayersLocked: false,
	    };
	}

	handleAddLayer(){

	}

	toggleAllVisibility(){
		this.setState({ allLayersHidden: !this.state.allLayersHidden });
		let layerParams = this.props.content2.layerParams;
		for(let i=0; i<layerParams.length; i++){
			layerParams[i].isHidden = this.state.allLayersHidden;
		}
		console.log(this.state.allLayersHidden, layerParams[0].isHidden);
		this.handleSave("All layers visibility");
	}

	toggleAllLocking(){
		this.setState({ allLayersLocked: !this.state.allLayersLocked });
		let layerParams = this.props.content2.layerParams;
		for(let i=0; i<layerParams.length; i++){
			layerParams[i].isLocked = this.state.allLayersLocked;
		}
		this.handleSave("All layers locking");
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
		// let tmp = [];
		// for(let i=0; i<c2.layerNames.length; i++){
		// 	tmp[i] = {
		// 		name: c2.layerNames[i], 
		// 		isHidden: c2.hiddenLayers[i],
		// 		isLocked: c2.lockedLayers[i],
		// 		frameNames: c2.frameNames, 
		// 		selectedFrame: this.state.selectedFrameIdx,
		// 		isSelected: this.state.selectedLayerIdx === i,
		// 	};
		// }

		return c2.layerParams.map((layer, idx) => (
			<Layer 
				idx={idx} 
				layer={layer}
				frameNames={c2.frameNames} 
				selectedFrame={this.state.selectedFrameIdx}
				isSelected={this.state.selectedLayerIdx === idx}

				selectLayer={this.selectLayer.bind(this)}
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
                	className={"icon " + (this.state.allLayersHidden ? "hide" : "unhide" )} 
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