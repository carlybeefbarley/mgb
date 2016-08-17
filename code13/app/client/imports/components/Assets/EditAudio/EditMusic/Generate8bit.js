import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Song from './8bit/song.js';
import RIFFWAVE from './8bit/encoder.js';


export default class Generate8bit extends React.Component {

	constructor(props) {
  	super(props)

  	this.sampleRate = 44100
		this.maxval = 32767
  	this.song = null
  	this.audio = null

  	this.state = {
  		canvasWidth: 860,
  		canvasHeight: 480,
  		isPlaying: false,
  		isGenerating: false,
  		isAudio: false,

  		bpm: 140,
  		isBass: true,
  		isLoop: true, 
  	}

	}

	componentDidMount(){
		this.canvas = ReactDOM.findDOMNode(this.refs.canvas)
		this.ctx = this.canvas.getContext("2d")
	}

	generate(){
		this.stop()
		this.audio = null
		this.setState({ isGenerating: true, isAudio: false })
		var self = this
		setTimeout(() => {
			this.song = new Song(this.state.isBass)
			this.audio = this.generateSample(this.song)
			this.audio.loop = this.state.isLoop
			this.play()
			this.setState({ isGenerating: false, isAudio: true })
		}, 50)		
	}

	generateSample(song) {
		var downsample=2; //increasing this will speed up generation but yield lower-res sound
		var bpm = this.state.bpm;
		bpm=1/(bpm/120);
		var duration=song.bars*song.secperbar*bpm;//duration of the song in seconds		
		var data=[];
		for (var t=0;t<Math.round(this.sampleRate*duration);t++) {data[t]=0;}

		for (var i in song.Channels)
		{
			channel=song.Channels[i];
			instrument=channel.instrument;
			for (var n in channel.notes)
			{				
				note=channel.notes[n];
				var ns=Math.floor(note.start*this.sampleRate*bpm);
				var ne=Math.floor(note.end*this.sampleRate*bpm);
				for (var t=ns;t<ne;t+=downsample)
				{
					var thisdata=instrument.generator(Math.floor(t),note.key/88,ns,ne)*note.vol;
					for (var d=0;d<downsample;d++)
					{data[Math.floor(t)+d]+=thisdata;}
					//data[Math.floor(t)]+=instrument.generator(Math.floor(t),note.key/88,ns,ne)*note.vol;
				}
				
			}
		}

		for (t in data) {data[t]=Math.min(Math.round((data[t]/song.Channels.length)*this.maxval/4),this.maxval);}

		this.drawNotes(song, bpm, duration)

		var wave = new RIFFWAVE(data);
		var audio = new Audio(wave.dataURI);
		return audio;
	}

	drawNotes(song, bpm, duration){	
		this.ctx.fillStyle='#ffffff';
		this.ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight);
		/*
		for (i=0;i<Screen.width;i++)
		{
			t=Math.floor(i*data.length/Screen.width);
			ctx.strokeStyle='rgb(255,0,0)';
			ctx.drawLine(i-0.5,Screen.height-data[t]/(maxval/4)*Screen.height-0.5,i-0.5,Screen.height-0.5);
		}
		*/
		
		for (let i in song.Channels)
		{
			let channel=song.Channels[i];
			// instrument=channel.instrument;
			for (let n in channel.notes)
			{
				let note=channel.notes[n];
				let ns=((note.start*bpm)/duration) * this.state.canvasWidth
				let ne=((note.end*bpm)/duration) * this.state.canvasWidth
				
				if (i==0) this.ctx.fillStyle='rgba(128,128,255,0.5)';
				else if (i==1) this.ctx.fillStyle='rgba(128,255,128,0.5)';
				else if (i==2) this.ctx.fillStyle='rgba(255,128,128,0.5)';
				this.ctx.fillRect(ns,(note.key)*5,Math.max(2,ne-ns),5);
				this.ctx.strokeStyle='rgba(0,0,0,0.25)';
				this.ctx.strokeRect(ns-0.5,(note.key)*5-0.5,Math.max(2,ne-ns),5);
				this.ctx.strokeStyle='rgba(255,255,255,0.25)';
				this.ctx.strokeRect(ns+0.5,(note.key)*5+0.5,Math.max(2,ne-ns),5);
			}
		}
	}

	togglePlay(){
		if(!this.audio) return

		this.state.isPlaying ? this.stop() : this.play()
	}

	play(){
		if(!this.audio) return
		this.audio.play()
		this.setState({ isPlaying: true })
	}

	stop(){
		if(!this.audio) return
		this.audio.pause()
		this.audio.currentTime = 0
		this.setState({ isPlaying: false })
	}

	toggleLoop(){
		if(this.audio) {
			this.audio.loop = this.isLoop
		}
		this.setState({ isLoop: !this.state.isLoop })
	}

	importAudio(){
		if(!this.audio) return
		this.props.importMusic(this.audio, "Generated 8bit music")
	}

	changeBPM(e){
		this.setState({ bpm: parseInt(e.target.value) })
	}

	toggleBass(){
		this.setState({ isBass: !this.state.isBass })
	}


	render(){

		return (
			<div className="content">
				<div className="row">
					<button className={"ui blue button " + (this.state.isGenerating ? "loading" : "")} 
              onClick={this.generate.bind(this)}>
              Generate
          </button>

          <button className={"ui button "+((!this.state.isAudio || this.state.isGenerating) ? "disabled" : "")} onClick={this.togglePlay.bind(this)}>
          	<i className={"icon " + (this.state.isPlaying ? "stop" : "play")}></i>
          </button>

          <div className={"ui toggle checkbox "}>
            <input type="checkbox" checked={(this.state.isLoop ? "checked" : "")} onChange={this.toggleLoop.bind(this)}/>
            <label>Loop</label>
          </div>

          <button className={"ui right floated button "+(!this.state.isAudio ? "disabled " : "")} title="Import" onClick={this.importAudio.bind(this)}>
	          <i className="add square icon"></i> Import
	        </button>
				</div>
				<div className="ui divider"></div>
				<div>
					<canvas ref="canvas" width={this.state.canvasWidth+"px"} height={this.state.canvasHeight+"px"}></canvas>
				</div>
				<div>
					<div title="Beats per minute"><b>BPM</b></div>
    			<input type="range" value={this.state.bpm} min="30" max="240" 
	    			onChange={this.changeBPM.bind(this)} 
	    			/>
    		</div>
    		<div className={"ui toggle checkbox "}>
          <input type="checkbox" checked={(this.state.isBass ? "checked" : "")} onChange={this.toggleBass.bind(this)}/>
          <label>Bass</label>
        </div>
	    </div>
		)
	}	
}