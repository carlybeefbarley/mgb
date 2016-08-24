import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import sty from  './editMusic.css'
import WaveSurfer from '../lib/WaveSurfer.js'
import lamejs from '../lib/lame.all.js'

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
      let samples = new Int16Array(audioData, wav.dataOffset, wav.dataLen / 2);
      // from stereo to mono
      if(wav.channels === 2){	
        let s = new Int16Array(samples.length/2)
        for(let i=0; i<samples.length; i+=2){
        	let nextSample = samples.length-1 >= i+1 ? samples[i+1] : samples[i]	// special case for last element
        	s[i/2] = Math.round((samples[i] + nextSample)/2)
        }
        samples = s
        wav.channels = 1
    	}
    	// console.log(wav.channels, wav.sampleRate, samples)
      this.encodeMono(wav.channels, wav.sampleRate, samples);
    }
    reader.readAsArrayBuffer(file)
	}

	encodeMono(channels, sampleRate, samples) {
    var buffer = []
    var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128)
    var remaining = samples.length
    var maxSamples = 1152
    for (var i = 0; remaining >= maxSamples; i += maxSamples) {
        var mono = samples.subarray(i, i + maxSamples)
        var mp3buf = mp3enc.encodeBuffer(mono)
        if (mp3buf.length > 0) {
            buffer.push(new Int8Array(mp3buf))
        }
        remaining -= maxSamples
    }
    var d = mp3enc.flush()
    if(d.length > 0){
        buffer.push(new Int8Array(d))
    }
    console.log('done encoding, size=', buffer.length)
    var blob = new Blob(buffer, {type: 'audio/mp3'})

    const reader = new FileReader()
    reader.onload = (e) => {
    	let dataUri = e.target.result
    	tmpMusic = new Audio()
	    tmpMusic.oncanplaythrough = (event) => { // music is uploaded to browser
	    	this.setState({ status: "uploaded" })
	    	this.musicLoaded(tmpMusic)       	
	    }
	    tmpMusic.src = dataUri
    }
    reader.readAsDataURL(blob)
  }

  loadEncoded(file){
  	let reader = new FileReader()
    reader.onload = (ev) => {
      let audioData = ev.target.result        
      
      let tmpMusic = new Audio()
      tmpMusic.oncanplaythrough = (e) => { // music is uploaded to browser
      	this.setState({ status: "uploaded" })
				if(tmpMusic.src.startsWith("data:audio/")){
					this.musicLoaded(tmpMusic)
				} else {
					console.warn("Data type is not audio!")
				} 	
      }
      tmpMusic.src = audioData	        
    }
    reader.readAsDataURL(file)
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