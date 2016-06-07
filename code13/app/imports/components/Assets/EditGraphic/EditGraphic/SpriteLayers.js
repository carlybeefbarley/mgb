import React, { PropTypes } from 'react';

import Layer from './Layer.js';

export default class SpriteLayers extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	allLayersHidden: false,
	    	allLayersLocked: false,
	    	isCanvasVisible: false,
	    };
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
		// this.setState({ selectedLayerIdx: idx });
		// this.props.EditGraphic.setState({ selectedLayerIdx: idx });
		this.props.EditGraphic.handleSelectLayer(idx);
	}

	selectFrame(idx){
		// this.setState({ selectedFrameIdx: idx });
		this.props.EditGraphic.handleSelectFrame(idx);
	}

	addFrame(){
	    // if (!this.props.canEdit)
	    // { 
	    //   this.props.editDeniedReminder()
	    //   return
	    // }
	    // this.doSaveStateForUndo("Add Frame");
	    let fN = this.props.content2.frameNames
	    let newFrameName = "Frame " + (fN.length+1).toString()
	    fN.push(newFrameName)
	    this.props.content2.frameData.push([])
	    this.handleSave('Add frame to graphic')
	    this.forceUpdate()    // Force react to update.. needed since some of this state was direct (not via React.state/React.props)
	 }

	addLayer(){
	    // if (!this.props.canEdit)
	    // { 
	    //   this.props.editDeniedReminder();
	    //   return;
	    // }
	    // this.doSaveStateForUndo("Add Layer");
	    let c2 = this.props.content2;
	    let newLayerName = "Layer " + (c2.layerParams.length+1).toString();
	    c2.layerParams.push({name: newLayerName, isHidden: false, isLocked: false });
	    let fD = c2.frameData;
	    for(let i; i<fD.length; i++){
	      fD[i][lN.length-1] = null;
	    }
	    this.handleSave('Add layer to graphic');
	    this.props.forceUpdate();    // Force react to update.. needed since some of this state was direct (not via React.state/React.props)
	}

	toggleCanvasVisibility(){
		this.setState({ isCanvasVisible: !this.state.isCanvasVisible });
	}

	handleSave(changeText="change graphic"){
		this.props.handleSave(changeText);
	}


	renderLayers(){
		let c2 = this.props.content2;
		return c2.layerParams.map((layer, idx) => (
			<Layer 
				idx={idx} 
				layer={layer}
				frameNames={c2.frameNames} 
				selectedFrame={this.props.EditGraphic.state.selectedFrameIdx}
				isSelected={this.props.EditGraphic.state.selectedLayerIdx === idx}
				width={c2.width}
				height={c2.height}
				isCanvasVisible={this.state.isCanvasVisible}

				selectLayer={this.selectLayer.bind(this)}
				selectFrame={this.selectFrame.bind(this)}
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
      	
      <table className="ui celled padded table spriteLayersTable">
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
	            <a class="ui label" onClick={this.addLayer.bind(this)}>
				    <i className="add circle icon"></i> Add Layer
				</a>
            </th>
            {framesTH}
            <th>
            <div className="row">
            	<a class="ui label" onClick={this.addFrame.bind(this)}>
				    <i className="add circle icon"></i> Add Frame
				</a>
				<span>&nbsp;&nbsp;</span>
				<a class="ui label" onClick={this.toggleCanvasVisibility.bind(this)}>
				    <i className={"icon " + ((this.state.isCanvasVisible ? "unhide" : "hide" ))}></i> Canvas
				</a>
			</div>
            </th>
            <th width="32px"></th>
          </tr>
        </thead>
        <tbody>
          {this.renderLayers()}
        </tbody>
      </table>

    );
  }
}
 
SpriteLayers.propTypes = {
  content2: PropTypes.object.isRequired,
};