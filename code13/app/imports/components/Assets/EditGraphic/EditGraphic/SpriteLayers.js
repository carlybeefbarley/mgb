import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Layer from './Layer.js';

export default class SpriteLayers extends React.Component {

	constructor(props) {
	    super(props);
	 
	    this.state = {
	    	allLayersHidden: false,
	    	allLayersLocked: false,
	    	isCanvasFramesVisible: false,
	    	isCanvasLayersVisible: false,
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
		this.props.EditGraphic.handleSelectLayer(idx);
	}

	selectFrame(idx){
		this.props.EditGraphic.handleSelectFrame(idx);

		console.log(this.getAnimationsTH());
	}

	addFrame(){
	    // if (!this.props.canEdit)
	    // { 
	    //   this.props.editDeniedReminder()
	    //   return
	    // }
	    // this.doSaveStateForUndo("Add Frame");
	    let fN = this.props.content2.frameNames;
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

	toggleCanvasFramesVisibility(){
		this.setState({ isCanvasFramesVisible: !this.state.isCanvasFramesVisible });
	}

	toggleCanvasLayersVisibility(){
		this.setState({ isCanvasLayersVisible: !this.state.isCanvasLayersVisible });
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

	insertFrameAfter(frameID, doCopy){
		this.props.EditGraphic.insertFrameAfter(frameID, doCopy);
	}

	frameMoveLeft(frameID){
		this.props.EditGraphic.frameMoveLeft(frameID);
	}

	frameMoveRight(frameID){
		this.props.EditGraphic.frameMoveRight(frameID);
	}


	/* Selecting frames testing */
	thOnDragStart(frameID){
		console.log('drag start', frameID);
	}

	thOnDragEnd(frameID){
		console.log('drag end', frameID);
	}

	thOnDragEnter(frameID){
		console.log('drag enter', frameID);
	}


	/* ANIMATIONS */

	getAnimIdByFrame(frameID){
		let c2 = this.props.content2;	
		let animID = false;
		for(let i=0; i<c2.animations.length; i++){
			let animation = c2.animations[i];
			if(frameID >= animation.frames[0] && frameID <= animation.frames[animation.frames.length-1]){
				animID = i;
				break;
			}
		}
		return animID;	
	}

	addAnimation(frameID){
		let c2 = this.props.content2;	
		let animID = this.getAnimIdByFrame(frameID);

		if(animID === false){
			c2.animations.push({ 
				name: "Anim "+c2.animations.length,
				frames: [frameID],
				fps: 10, 
			});
		}
		this.handleSave('Add animation');
	}

	getAnimationsTH(){
		let colors = ["red", "orange", "green", "yellow", "black"];
		let colorID = 0;

		let c2 = this.props.content2;
		let animTH = [];
		for(let frameID=0; frameID<c2.frameNames.length; frameID++){
			let animID = this.getAnimIdByFrame(frameID);

			if(animID === false){
				animTH.push({ name:"", colspan:1, color:""});
			} 
			else {
				let animation = c2.animations[animID];
				animTH.push({
					name: animation.name,
					colspan: animation.frames.length,
					color: colors[colorID],
				});
				colorID++;
				frameID += animation.frames.length-1;	
			}	
		}
		return animTH;
	}


	deleteLayer(layerID){
		this.props.EditGraphic.handleDeleteLayer(layerID);
	}

	deleteFrame(frameID){
		this.props.EditGraphic.handleDeleteFrame(frameID);
	}	

	handleSave(changeText="change graphic"){
		this.props.handleSave(changeText);
	}

	renderLayers(){
		let c2 = this.props.content2;
		return c2.layerParams.map((layer, idx) => (
			<Layer 
				key={idx}
				idx={idx}
				layer={layer}
				frameNames={c2.frameNames} 
				selectedFrame={this.props.EditGraphic.state.selectedFrameIdx}
				isSelected={this.props.EditGraphic.state.selectedLayerIdx === idx}
				width={c2.width}
				height={c2.height}
				isCanvasLayersVisible={this.state.isCanvasLayersVisible}

				selectLayer={this.selectLayer.bind(this)}
				selectFrame={this.selectFrame.bind(this)}
				deleteLayer={this.deleteLayer.bind(this)}
				handleSave={this.handleSave.bind(this)}
			/>
		));		
	}


  render() { 
  	let c2 = this.props.content2;

  	{/** 
  	let animations = [
  		{"first", [2,3], 10}
  		, {"second", [4,5,6], 10}
  	];

  	for(let i=0; i<content2.frameData.length; i++){

  	}
  **/}

    return (
      	
      <div className="ui sixteen wide column">
	      <div className="row">
	  		<div onClick={this.rewindFrames.bind(this, false)} className="ui icon button">
				<i className="icon step backward"></i>
			</div>
			<div onClick={this.stepFrame.bind(this, false)} className="ui icon button">
				<i className="icon backward"></i>
			</div>
			<div onClick={this.togglePlayAnimation.bind(this)} 
				className={"ui icon button " + (this.state.isPlaying ? "black" : "")}>
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
			<div className="ui right floated mini button" onClick={this.toggleCanvasFramesVisibility.bind(this)}>
				<i className={"icon " + (this.state.isCanvasFramesVisible ? "unhide" : "hide" )}></i> Frames
			</div>
			<div className="ui right floated mini button" onClick={this.toggleCanvasLayersVisibility.bind(this)}>
				<i className={"icon " + (this.state.isCanvasLayersVisible ? "unhide" : "hide" )}></i> Layers
			</div>
	      </div>

	      <table className="ui celled padded table spriteLayersTable">
	        <thead>
	    {/** Animation tabs **/}
	          <tr className={c2.animations.length === 0 ? "hidden" : ""}>
	          	<th></th>
	          	<th></th>
	          	<th></th>
	          	{
	          		_.map(this.getAnimationsTH(), (item, idx) => { return (
				      <th key={"thAnim_"+idx} >
						<div className={"ui "+(item.color ? "simple dropdown label "+item.color : "")} colspan={c2.colspan}>
							{item.name}
							<div className="menu">
								<div 
				      				onClick={this.insertFrameAfter.bind(this, idx, true)}
				      				className="item">
				      				<i className="add circle icon"></i>
				      				New
				      			</div>
				      			<div 
				      				onClick={this.insertFrameAfter.bind(this, idx, true)}
				      				className="item">
				      				<i className="add circle icon"></i>
				      				New
				      			</div>
							</div>
						</div>
				      </th>
				    )})
	          	}
	          	<th></th>
	          	<th></th>
	          </tr>

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
	            {
	            	_.map(c2.frameNames, (frameName, idx) => { return (
				      <th key={"th_"+idx} 
				      	width="32px"
				      	className="frameTH"
				      	
				      	>
				      	<div className="ui simple dropdown"
				      	onDragStart={this.thOnDragStart.bind(this, idx)}
				      	onDragEnd={this.thOnDragEnd.bind(this, idx)}
				      	onDragEnter={this.thOnDragEnter.bind(this, idx)}


				      	>
				      		{idx+1}
				      		<div className="menu">				      			
				      			<div 
				      				onClick={this.insertFrameAfter.bind(this, idx, true)}
				      				className="item">
				      				<i className="add circle icon"></i>
				      				New
				      			</div>
				      			<div 
				      				onClick={this.insertFrameAfter.bind(this, idx, false)}
				      				className="item">
				      				<i className="circle icon outline"></i>
				      				New Empty Frame
				      			</div>
				      			<div className="item"
				      				onClick={this.addAnimation.bind(this, idx)}>
				      				<i className="wait icon"></i>
				      				Add animation
				      			</div>
				      			<div className="divider"></div>
				      			<div 
				      				onClick={this.frameMoveLeft.bind(this, idx)}
				      				className={"item " + (idx === 0 ? "disabled" : "")}>
				      				<i className="arrow left icon"></i>
				      				Move Left
				      			</div>
				      			<div 
				      				onClick={this.frameMoveRight.bind(this, idx)}
				      				className={"item " + (idx === this.props.content2.frameNames.length-1 ? "disabled" : "")}>
				      				<i className="arrow right icon"></i>
				      				Move Right
				      			</div>
				      			<div className="divider"></div>
				      			<div className={"item " + (this.props.content2.frameData.length === 1 ? "disabled" : "")}
				      				onClick={this.deleteFrame.bind(this, idx)}>
				      				<i className="remove icon"></i>
				      				Delete
				      			</div>
				      		</div>
				      	</div>
				      </th>);
				    })
	            }
	            <th>
	            <div className="row">
	            	<a class="ui label" onClick={this.addFrame.bind(this)}>
					    <i className="add circle icon"></i> Add Frame
					</a>
				</div>
	            </th>
	            <th width="32px"></th>
	          </tr>

	      {/** Previews for frames **/}
	          <tr className={"layerCanvases " + (this.state.isCanvasFramesVisible ? "" : "hidden")}>
	          	<th></th>
	          	<th></th>
	          	<th></th>
	          	{
	          		_.map(c2.frameNames, (frameName, idx) => { return (
				      <th key={"thCanvas_"+idx}>
				      	<div className="ui image "				      		
				          	style={{"maxWidth": "256px", "maxHeight": "256px", "overflow": "scroll" }}>
				      		<canvas width={c2.width} height={c2.height}></canvas>
				      	</div>
				      </th>
				    )})
	          	}
	          	<th></th>
	          	<th></th>
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