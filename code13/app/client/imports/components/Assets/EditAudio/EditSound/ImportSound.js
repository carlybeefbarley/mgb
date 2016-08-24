import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import sty from  './editSound.css';
import WaveSurfer from '../lib/WaveSurfer.js'
import lamejs from '../lib/lame.all.js'

export default class ImportSound extends React.Component {

	constructor(props) {
  	super(props);

  	this.state = {
	    status: "empty" // empty, draggedOver, uploading, uploaded
	    , playerStatus: "empty" // empty, play, pause
	  }
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#importSoundPlayer'
		    , waveColor: 'violet'
    		, progressColor: 'purple'
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

  	let files = event.dataTransfer.files;
  	if(files.length > 0){
  		let file = files[0]
  		if(file.type === "audio/wav"){
  			this.loadWav(file)	// read as arraybuffer and encode to mp3
  		} else {
  			this.loadEncoded(file)	// read as dataUrl
  		}
  	}
	}

	loadWav(file){
		let reader = new FileReader()
    reader.onload = (e) => {
      let audioData = e.target.result
      let wav = lamejs.WavHeader.readHeader(new DataView(audioData));
      let samples = new Int16Array(audioData, wav.dataOffset, wav.dataLen / 2)
      lamejs.encodeMono(wav.channels, wav.sampleRate, samples, (audioObject) => {
      	this.setState({ status: "uploaded" })
    		this.audioLoaded(audioObject)  
      })
    }
    reader.readAsArrayBuffer(file)
	}

  loadEncoded(file){
  	let reader = new FileReader()
    reader.onload = (ev) => {
      let audioData = ev.target.result        
      
      let tmpMusic = new Audio()
      tmpMusic.oncanplaythrough = (e) => { // music is uploaded to browser
      	this.setState({ status: "uploaded" })
				if(tmpMusic.src.startsWith("data:audio/")){
					this.audioLoaded(tmpMusic)
				} else {
					console.warn("Data type is not audio!")
				} 	
      }
      tmpMusic.src = audioData	        
    }
    reader.readAsDataURL(file)
  }

	audioLoaded(audioObject){
		this.audioObject = audioObject;
		this.wavesurfer.load(audioObject.src);
	}

	togglePlaySound(){
		if(this.state.playerStatus === "play"){
			this.wavesurfer.pause();
			this.setState({ playerStatus: "pause" })
		} else {
			this.wavesurfer.play();
			this.setState({ playerStatus: "play" })
		}
	}

	stopSound(){
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
		this.props.importSound(this.audioObject, "Imported sound")
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
      			<h2>Drop sound file here!</h2>
      			<br/><br/><br/><br/><br/>
      	</div>

      {/*** uploaded sound ***/}
      	<div className={this.state.status === "uploaded" ? "" : "hidden"}>
	        <div className="row">
		        <button className="ui icon button small" onClick={this.togglePlaySound.bind(this)}>
						  <i className={"icon " + (this.state.playerStatus === "play" ? "pause" : "play")}></i>
						</button>
						<button className="ui icon button small" onClick={this.stopSound.bind(this)}>
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
	        
	        <div id="importSoundPlayer"></div>
	      </div>

	    </div>
		);
	}	
}