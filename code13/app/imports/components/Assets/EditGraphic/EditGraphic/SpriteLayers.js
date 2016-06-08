import React, { PropTypes } from 'react';

import Layer from './Layer.js';

export default class SpriteLayers extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	allLayersHidden: false,
	    	allLayersLocked: false,
	    	isCanvasVisible: false,
	    	isPlaying: false,
	    };
	}

	toggleAllVisibility(){
		let isVisible = !this.state.allLayersHidden;
		this.setState({ allLayersHidden: isVisible });
		let layerParams = this.props.content2.layerParams;
		for(let i=0; i<layerParams.length; i++){
			layerParams[i].isHidden = isVisible;
		}
		this.handleSave("All layers visibility");
	}

	toggleAllLocking(){
		let isLocked = !this.state.allLayersLocked;
		this.setState({ allLayersLocked: isLocked });
		let layerParams = this.props.content2.layerParams;
		for(let i=0; i<layerParams.length; i++){
			layerParams[i].isLocked = isLocked;
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

	togglePlayAnimation(){
		let isPlaying = !this.state.isPlaying; 
		this.setState({ isPlaying: isPlaying });

		if(isPlaying){
			this.playAnimation(this.props.EditGraphic.state.selectedFrameIdx);
		}
	}

	playAnimation(frameID){
		this.selectFrame(frameID);
		let nextFrameID = (frameID+1) % this.props.content2.frameNames.length;
		let self = this;
		setTimeout(function(){
			if(self.state.isPlaying){
				self.playAnimation(nextFrameID);
			}
		}, Math.round(1000/this.props.content2.fps));	
	}

	stepFrame(isForward){
		let selectedID = this.props.EditGraphic.state.selectedFrameIdx;
		let frameID = isForward ? selectedID+1 : selectedID-1;
		if(frameID >= 0 && frameID < this.props.content2.layerParams.length){
			this.selectFrame(frameID);	
		}
	}

	rewindFrames(isForward){
		let frameID = isForward ? this.props.content2.layerParams.length-1 : 0; 
		this.selectFrame(frameID);
	}

	changeFps(event){
		console.log(event.target.value);
		this.props.content2.fps = event.target.value;
		this.props.handleSave("Changed FPS");
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
      	
      <div className="ui sixteen wide column">
      <div className="row">
  		<div onClick={this.rewindFrames.bind(this, false)} className="ui icon button">
			<i className="icon step backward"></i>
		</div>
		<div onClick={this.stepFrame.bind(this, false)} className="ui icon button">
			<i className="icon backward"></i>
		</div>
		<div onClick={this.togglePlayAnimation.bind(this)} className="ui icon button">
			<i className={"icon " + (this.state.isPlaying ? "pause" : "play" )}></i>
		</div>
		<div onClick={this.stepFrame.bind(this, true)} className="ui icon button">
			<i className="icon forward"></i>
		</div>
		<div onClick={this.rewindFrames.bind(this, true)} className="ui icon button">
			<i className="icon step forward"></i>
		</div>
		<div className="ui labeled input">
		  <div className="ui label">
		    FPS
		  </div>
		  <input type="number" min="1" max="60" value={this.props.content2.fps} onChange={this.changeFps.bind(this)} />
		</div>
      </div>

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
				    <i className={"icon " + (this.state.isCanvasVisible ? "unhide" : "hide" )}></i> Canvas
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
      </div>

    );
  }
}
 
SpriteLayers.propTypes = {
  content2: PropTypes.object.isRequired,
};