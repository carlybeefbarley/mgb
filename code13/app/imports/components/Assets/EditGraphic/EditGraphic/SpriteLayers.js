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
	    	copyFrameID: null,
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

	moveLayerUp(layerID){
		let c2 = this.props.content2;

		let tmpParam = c2.layerParams[layerID];
		c2.layerParams[layerID] = c2.layerParams[layerID-1];
		c2.layerParams[layerID-1] = tmpParam;

		for(let i=0; i<c2.frameNames.length; i++){
			let frame = c2.frameData[i];
			let tmpData = frame[layerID];
			frame[layerID] = frame[layerID-1];
			frame[layerID-1] = tmpData;
		}
		this.handleSave('Layer moved up', true);
	}

	moveLayerDown(layerID){
		let c2 = this.props.content2;

		let tmpParam = c2.layerParams[layerID];
		c2.layerParams[layerID] = c2.layerParams[layerID+1];
		c2.layerParams[layerID+1] = tmpParam;

		for(let i=0; i<c2.frameNames.length; i++){
			let frame = c2.frameData[i];
			let tmpData = frame[layerID];
			frame[layerID] = frame[layerID+1];
			frame[layerID+1] = tmpData;
		}
		this.handleSave('Layer moved down', true);
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
		this.handleSave("Changed FPS");
	}

	insertFrameAfter(frameID, doCopy){
		this.props.EditGraphic.insertFrameAfter(frameID, doCopy);
	}

	copyFrame(frameID){
		this.setState({ copyFrameID: frameID });
	}

	pasteFrame(frameID){
		let c2 = this.props.content2;
		if(this.state.copyFrameID === null) return;
		if(!c2.frameData[this.state.copyFrameID]) return;

		c2.frameData[frameID] = c2.frameData[this.state.copyFrameID];
		this.handleSave("Paste frame #"+(this.state.copyFrameID)+" to #"+frameID, true);
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
		// let colors = ["olive", "green", "teal", "blue"];
		let colors = ["orange", "green", "blue", "violet"];
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
					animID: animID,
					name: animation.name,
					fps: animation.fps,
					colspan: animation.frames.length,
					color: colors[colorID%colors.length],
					startFrame: animation.frames[0] + 1,
					endFrame: animation.frames[animation.frames.length-1] + 1,
				});
				colorID++;
				frameID += animation.frames.length-1;	
			}	
		}
		return animTH;
	}

	changeAnimStart(animID, e) {
		let c2 = this.props.content2;
		let animation = c2.animations[animID];
		let endFrame = animation.frames[animation.frames.length-1];
		let startFrame = e.target.value-1; 	// value is -1, because user sees frames from 1 instead of 0
		if(endFrame < startFrame) return;

		animation.frames = []; 	// clear frames and add then in for loop
		for(let i=endFrame; i>=startFrame && i>=0; i--){
			let tmpID = this.getAnimIdByFrame(i);
			if(tmpID === false || tmpID === animID){	// everything ok, this frame can be added to animation
				animation.frames.unshift(i);
			} else { 	// overlaps with next animation
				break;
			}
		}
		this.handleSave("Changed animation length");
	}

	changeAnimEnd(animID, e) {
		let c2 = this.props.content2;
		let animation = c2.animations[animID];
		let startFrame = animation.frames[0];
		let endFrame = e.target.value-1; 	// value is -1, because user sees frames from 1 instead of 0
		if(endFrame < startFrame) return;

		animation.frames = []; 			// clear frames and add then in for loop		
		for(let i=startFrame; i<=endFrame && i<c2.frameNames.length; i++){
			let tmpID = this.getAnimIdByFrame(i);
			if(tmpID === false || tmpID === animID){	// everything ok, this frame can be added to animation
				animation.frames.push(i);
			} else { 	// overlaps with next animation
				break;
			}
		}
		this.handleSave("Changed animation length");
	}

	changeAnimFPS(animID, e){
		let newFPS = e.target.value;
		if(newFPS < 1 || newFPS > 60) return;
		this.props.content2.animations[animID].fps = newFPS;
		this.handleSave("Change animation FPS");
			
	}

	renameAnimation(animID, e) {
		let newName = e.target.value;
		if(newName === "") return;
		this.props.content2.animations[animID].name = newName;
		this.handleSave("Rename animation");
	}

	deleteAnimation(animID){
		this.props.content2.animations.splice(animID, 1);
		console.log(this.props.content2.animations);
		this.handleSave("Delete animation");
	}


	deleteLayer(layerID){
		this.props.EditGraphic.handleDeleteLayer(layerID);
	}

	deleteFrame(frameID){
		this.props.EditGraphic.handleDeleteFrame(frameID);
	}	

	handleSave(changeText="change graphic", dontSaveFrameData){
		this.props.handleSave(changeText, dontSaveFrameData);
	}

	renderLayers(){
		let c2 = this.props.content2;
		return c2.layerParams.map((layer, idx) => (
			<Layer 
				key={idx}
				idx={idx}
				layer={layer}
				layerCount={c2.layerParams.length}
				frameNames={c2.frameNames} 
				selectedFrame={this.props.EditGraphic.state.selectedFrameIdx}
				isSelected={this.props.EditGraphic.state.selectedLayerIdx === idx}
				width={c2.width}
				height={c2.height}
				isCanvasLayersVisible={this.state.isCanvasLayersVisible}

				selectLayer={this.selectLayer.bind(this)}
				moveLayerUp={this.moveLayerUp.bind(this)}
				moveLayerDown={this.moveLayerDown.bind(this)}
				selectFrame={this.selectFrame.bind(this)}
				deleteLayer={this.deleteLayer.bind(this)}
				handleSave={this.handleSave.bind(this)}
			/>
		));		
	}


  render() { 
  	const c2 = this.props.content2;

    return (
      	
      <div className="ui sixteen wide column">
	      <div className="row">
	  		<div onClick={this.rewindFrames.bind(this, false)} className="ui small icon button">
				<i className="icon step backward"></i>
			</div>
			<div onClick={this.stepFrame.bind(this, false)} className="ui small icon button">
				<i className="icon backward"></i>
			</div>
			<div onClick={this.togglePlayAnimation.bind(this)} 
				className={"ui small icon button " + (this.state.isPlaying ? "black" : "")}>
					<i className={"icon small " + (this.state.isPlaying ? "pause" : "play" )}></i>
			</div>
			<div onClick={this.stepFrame.bind(this, true)} className="ui small icon button">
				<i className="icon small forward"></i>
			</div>
			<div onClick={this.rewindFrames.bind(this, true)} className="ui small icon button">
				<i className="icon small step forward"></i>
			</div>
			<div className="ui small labeled input">
			  <div className="ui small label" title="Frames Per Second">
			    FPS
			  </div>
			  <input className="ui small input" type="number" min="1" max="60" value={this.props.content2.fps} onChange={this.changeFps.bind(this)} />
			</div>
			<div className="ui right floated mini button" onClick={this.toggleCanvasFramesVisibility.bind(this)}>
				<i className={"icon " + (this.state.isCanvasFramesVisible ? "unhide" : "hide" )}></i> Frames
			</div>
			<div className="ui right floated mini button" onClick={this.toggleCanvasLayersVisibility.bind(this)}>
				<i className={"icon " + (this.state.isCanvasLayersVisible ? "unhide" : "hide" )}></i> Layers
			</div>
	      </div>

	      <table className="ui celled small padded table spriteLayersTable">
	        <thead>


	    {/** Animation tabs **/}

	          <tr className={"animTR " + (c2.animations.length === 0 ? "hidden" : "")}>
	          	<th></th>
	          	<th></th>
	          	<th></th>
	          	<th></th>
	          	{
	          		_.map(this.getAnimationsTH(), (item, idx) => { return (
				      <th key={"thAnim_"+idx} colSpan={item.colspan} className="animTH">
						<div className={"ui "+(item.color ? "simple tiny dropdown label "+item.color : "")}>
							{item.name}
							{
								item.name ? (
									<div className="menu">
										<div className="ui item input">
											<span className="text">
												Name
											</span>
											<input type="text" value={item.name} onChange={this.renameAnimation.bind(this, item.animID)} />		
										</div>		
						      			<div className="ui item input">
						      				<span className="text">From:</span>
						      				<input 
						      					onChange={this.changeAnimStart.bind(this, item.animID)} 
						      					type="number" value={item.startFrame} min="1" max={c2.frameNames.length} />
						      				<span className="text">To:</span>
						      				<input 
						      					onChange={this.changeAnimEnd.bind(this, item.animID)} 
						      					type="number" value={item.endFrame} min="1" max={c2.frameNames.length} />
						      			</div>
						      			<div className="ui item input">
											<span className="text">
												FPS
											</span>
											<input type="number" value={item.fps} min="1" max="60" onChange={this.changeAnimFPS.bind(this, item.animID)} />		
										</div>	
						      			<div className="divide"></div>
						      			<div className="item" onClick={this.deleteAnimation.bind(this, item.animID)}>
						      				<i className="remove icon"></i>
				      						Delete
						      			</div>
									</div>)
									:
									""
							}
						</div>
				      </th>
				    )})
	          	}
	          	<th></th>
	          	<th></th>
	          </tr>
		{/* animations end */}

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
	            <th width="32px"></th>
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
				      				onClick={this.copyFrame.bind(this, idx)}
				      				className={"item "}>
				      				<i className="copy icon"></i>
				      				Copy
				      			</div>
				      			<div 
				      				onClick={this.pasteFrame.bind(this, idx)}
				      				className={"item " + (this.state.copyFrameID === null ? "disabled" : "")}>
				      				<i className="paste icon"></i>
				      				Paste
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
	          	<th></th>
	          	{
	          		_.map(c2.frameNames, (frameName, idx) => { return (
				      <th key={"thCanvas_"+idx}>
				      	<div className="ui image "				      		
				          	style={{"maxWidth": "256px", "maxHeight": "256px", "overflow": "auto" }}>
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