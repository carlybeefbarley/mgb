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

  	this.state = {
  		canvasWidth: 860,
  		canvasHeight: 480,
  		isPlaying: false,
  		isGenerating: false,
  		audio: null,
  	}

	}

	componentDidMount(){
		this.canvas = ReactDOM.findDOMNode(this.refs.canvas)
		this.ctx = this.canvas.getContext("2d")
	}

	generate(){
		this.stop()
		this.setState({ isGenerating: true, audio: null })
		var self = this
		setTimeout(() => {
			this.song = new Song()
			this.setState({ audio: this.generateSample(this.song) })
			this.setState({ isGenerating: false })
			this.play()
		}, 50)		
	}

	generateSample(song) {
		var downsample=2; //increasing this will speed up generation but yield lower-res sound
		var bpm=140;
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
		
		for (var i in song.Channels)
		{
			channel=song.Channels[i];
			instrument=channel.instrument;
			for (var n in channel.notes)
			{
				note=channel.notes[n];
				var ns=((note.start*bpm)/duration) * this.state.canvasWidth
				var ne=((note.end*bpm)/duration) * this.state.canvasWidth
				
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


		var wave = new RIFFWAVE(data);
		var audio = new Audio(wave.dataURI);
		return audio;
	}

	togglePlay(){
		if(!this.state.audio) return

		this.state.isPlaying ? this.stop() : this.play()
	}

	play(){
		if(!this.state.audio) return
		this.state.audio.play()
		this.setState({ isPlaying: true })
	}

	stop(){
		if(!this.state.audio) return
		this.state.audio.pause()
		this.state.audio.currentTime = 0
		this.setState({ isPlaying: false })
	}

	importAudio(){
		this.props.importMusic(this.state.audio, "Generated 8bit music")
	}

	render(){

		return (
			<div className="content">
				<div className="row">
					<button className={"ui blue button " + (this.state.isGenerating ? "loading" : "")} 
              onClick={this.generate.bind(this)}>
              Generate
          </button>

          <button className={"ui button "+((!this.state.audio || this.state.isGenerating) ? "disabled" : "")} onClick={this.togglePlay.bind(this)}>
          	<i className={"icon " + (this.state.isPlaying ? "stop" : "play")}></i>
          </button>

          <button className={"ui right floated button "+(!this.state.audio ? "disabled " : "")} title="Import" onClick={this.importAudio.bind(this)}>
	          <i className="add square icon"></i> Import
	        </button>
				</div>
				<div className="ui divider"></div>
				<div>
					<canvas ref="canvas" width={this.state.canvasWidth+"px"} height={this.state.canvasHeight+"px"}></canvas>
				</div>
	    </div>
		)
	}	
}