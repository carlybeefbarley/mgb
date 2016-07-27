import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import sty from  './importMusic.css';
import WaveSurfer from '../lib/WaveSurfer.js'

export default class ImportMusic extends React.Component {

	constructor(props) {
  	super(props);

  	this.state = {
	    status: "empty" // empty, draggedOver, uploading, uploaded
	    , playerStatus: "empty" // empty, play, pause
	  }
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#importMusicPlayer'
		    , waveColor: '#4dd2ff'
    		, progressColor: '#01a2d9'
		})
		var self = this;
		this.wavesurfer.on('finish', function () {
			self.wavesurfer.stop();
    	self.setState({ playerStatus: "pause" })
		});
	}

	onDragOver(event){
		event.stopPropagation();
  	event.preventDefault();
  	event.dataTransfer.dropEffect = 'copy';
  	this.setState({ status: "draggedOver" });
	}

	onDragLeave(event){
		this.setState({ status: "empty" });
	}

	onDrop(event){
		event.stopPropagation()
  	event.preventDefault()

  	let self = this;
  	let files = event.dataTransfer.files;
  	if (files.length > 0){
      var reader = new FileReader()
      reader.onload = (ev) => {
        let theUrl = ev.target.result
        
        let tmpMusic = new Audio();
        tmpMusic.oncanplaythrough = function(e){ // music is uploaded to browser
        	self.setState({ status: "uploaded" });
        	// TODO load other type of audio files and convert to ogg (especially wav)
					if(tmpMusic.src.startsWith("data:audio/ogg;base64,")){
						self.musicLoaded(tmpMusic);
					}         	
        }
        tmpMusic.src = theUrl;	        
      }
      reader.readAsDataURL(files[0])
    }
	}

	musicLoaded(musicObject){
		this.musicObject = musicObject;
		this.wavesurfer.load(musicObject.src);
	}

	togglePlayMusic(){
		if(this.state.playerStatus === "play"){
			this.wavesurfer.pause();
			this.setState({ playerStatus: "pause" })
		} else {
			this.wavesurfer.play();
			this.setState({ playerStatus: "play" })
		}
	}

	stopMusic(){
		this.wavesurfer.stop();
		this.setState({ playerStatus: "pause" })
	}

	clearAll(){
		if(this.wavesurfer.isPlaying()) this.wavesurfer.stop();
		this.wavesurfer.empty();
		this.setState({ status: "empty", playerStatus: "empty" })
	}

	finishImport(){
		// console.log(this.wavesurfer);
		this.props.importMusic(this.musicObject, "Imported music")
	}

	render(){
		return (
			<div className="content">

				{/*** upload form ***/}
      	<div className={"uploadForm " + (this.state.status === "uploaded" ? "hidden " : " ") + (this.state.status === "draggedOver" ? "draggedOver" : "")}
      		onDragOver={this.onDragOver.bind(this)}
      		onDragLeave={this.onDragLeave.bind(this)}
      		onDrop={this.onDrop.bind(this)}>
      			<br/><br/><br/><br/><br/>
      			<h2>Drop music file here!</h2>
      			<br/><br/><br/><br/><br/>
      	</div>

      {/*** uploaded music ***/}
      	<div className={this.state.status === "uploaded" ? "" : "hidden"}>
	        <div className="row">
		        <button className="ui icon button small" onClick={this.togglePlayMusic.bind(this)}>
						  <i className={"icon " + (this.state.playerStatus === "play" ? "pause" : "play")}></i>
						</button>
						<button className="ui icon button small" onClick={this.stopMusic.bind(this)}>
						  <i className={"icon stop"}></i>
						</button>
						<span>&nbsp;&nbsp;&nbsp;</span>
	        	<button onClick={this.finishImport.bind(this)} className="ui small icon button">
							<i className="icon small save"></i>Finish import
						</button>
						<button onClick={this.clearAll.bind(this)} className="ui small icon button">
							<i className="icon small remove circle"></i>Clear All
						</button>
	        </div>
	        <div className="ui divider"></div>
	        
	        <div id="importMusicPlayer"></div>
	      </div>

	    </div>
		);
	}	
}