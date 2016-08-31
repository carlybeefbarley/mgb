import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportMusic from './ImportMusic.js';
import MusicStock from './MusicStock.js';
import GenerateMusic from './GenerateMusic.js';
import Generate8bit from './Generate8bit.js';

import WaveSurfer from '../lib/WaveSurfer.js';
import Channel from './Channel.js';
import BrowserCompat from '/client/imports/components/Controls/BrowserCompat'

export default class EditMusic extends React.Component {

	constructor(props) {
  	super(props)

  	// console.log(props.asset.content2)
  	const pxPerSecond = 30

  	this.state = {
  		isPlaying: false,
  		isLooping: true,
  		canvasWidth: pxPerSecond*props.asset.content2.duration,		// changing depending on props.duration
  		canvasHeight: 128,
  		pxPerSecond: pxPerSecond,		// defines width of canvass 
  	}
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#musicPlayer'
		    , waveColor: '#4dd2ff'
    		, progressColor: '#01a2d9'
		});

		this.musicCanvas = $("#musicPlayer canvas")[0]
		this.musicCtx = this.musicCanvas.getContext('2d')
		this.thumbnailCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
		this.thumbnailCtx = this.thumbnailCanvas.getContext('2d')

		this.timelineCanvas = ReactDOM.findDOMNode(this.refs.timeline)
		this.timelineCtx = this.timelineCanvas.getContext('2d')
		this.drawTimeline()

		// popups references
		this.importMusicPopup = ReactDOM.findDOMNode(this.refs.importMusicPopup)
		this.musicStockPopup = ReactDOM.findDOMNode(this.refs.musicStockPopup)
		this.generateMusicPopup = ReactDOM.findDOMNode(this.refs.generateMusicPopup)
		this.generate8bitPopup = ReactDOM.findDOMNode(this.refs.generate8bitPopup)

		let c2 = this.props.asset.content2
		if(c2.dataUri){
			this.wavesurfer.load(c2.dataUri)
		}

		let self = this;
		this.wavesurfer.on('finish', function () {
			self.wavesurfer.stop();
    	self.setState({ isPlaying: false })
		})
		this.wavesurfer.on('ready', function () {
			self.handleSave()
		})


		this.cursor = ReactDOM.findDOMNode(this.refs.cursor)
		this.cursorOffsetX = 200
		this.songTime = 0
		this.splitTime = 0
		// animframe for updating cursor position
    this._raf = () => {
      this.updateTimer()
      window.requestAnimationFrame(this._raf);
    }
    this._raf()
	}

	componentDidUpdate(prevProps, prevState){
		// console.log('did update')
		this.drawTimeline()
	}

	openImportPopup(){
    $(this.importMusicPopup).modal('show');
  }

	importMusic(audioObject, saveText){
		if(!this.hasPermission) return;

		if(audioObject){
			this.wavesurfer.load(audioObject.src);
			let c2 = this.props.asset.content2;
			c2.dataUri = audioObject.src;
			c2.duration = audioObject.duration;
			this.saveText = saveText;
			this.addChannel(audioObject.src)
		}

		$(this.importMusicPopup).modal('hide')
		$(this.musicStockPopup).modal('hide')
		$(this.generateMusicPopup).modal('hide')
		$(this.generate8bitPopup).modal('hide')
	}

	openStockPopup(){
		$(this.musicStockPopup).modal('show')
	}

	openGeneratePopup(){
		$(this.generateMusicPopup).modal('show')		
	}

	open8bitPopup(){
		$(this.generate8bitPopup).modal('show')	
	}

	getFromStock(audioObject){
		console.log(audioObject);
	}

	togglePlayMusic(){
		if(this.state.isPlaying){
			this.callChildren("pause")
			// this.wavesurfer.pause();
		} else {
			this.splitTime = Date.now()
			this.callChildren("play")
			// this.wavesurfer.play();
		}
		this.setState({ isPlaying: !this.state.isPlaying })	
	}

	stopMusic(){
		// this.wavesurfer.stop();
		this.setState({ isPlaying: false })
		this.songTime = 0
		this.updateCursor()
		this.callChildren("stop")
	}

	callChildren(func, args){
		if(!args) args = []
		this.props.asset.content2.channels.forEach((channel, id) => {
			this.refs["channel"+id][func]()
		})
	}

	drawTimeline(){
		this.timelineCtx.clearRect(0, 0, this.state.canvasWidth, 50)
		let c2 = this.props.asset.content2
		if(!c2.duration) return
		let count = Math.floor(c2.duration)
		this.timelineCtx.save()
   	this.timelineCtx.strokeStyle = '#333'
   	this.timelineCtx.globalAlpha = 0.4
		for(let i=0; i<count; i++){
			const x = i * this.state.pxPerSecond + 0.5	// 0.5 for 1px line instead of 2px
			const y = i%5==0 ? 10 : 5
			this.timelineCtx.beginPath()
     	this.timelineCtx.moveTo( x, 0 )
     	this.timelineCtx.lineTo( x, y )
     	this.timelineCtx.stroke()
		}
		this.timelineCtx.restore()
	}

	updateTimer(){
		if(this.state.isPlaying){
			const ms = Date.now()
			// const deltaTime = (date - this.splitTime) * this.speed
			const deltaTime = ms - this.splitTime
			this.songTime += deltaTime
			this.splitTime = ms
			if(this.songTime/1000 >= this.props.asset.content2.duration){
				this.stopMusic()
			}
			this.updateCursor()
		}
	}

	updateCursor(){
		const x = this.cursorOffsetX + this.state.pxPerSecond * this.songTime / 1000
		this.cursor.style.left = x + "px"
	}

	hasPermission() {
    if (!this.props.canEdit) { 
      this.props.editDeniedReminder()
      return false
    }
    else {
      return true
    }
  }

  onAudioLoaded(){
  	if(!this.saveText) return; // don't save at start when music is loaded
  	this.handleSave(this.saveText)
  	this.saveText = null
  }

	handleSave(saveText)
  {
    if(!this.hasPermission()) return;
    
    let asset = this.props.asset
    let c2    = asset.content2

    this.thumbnailCtx.putImageData(this.musicCtx.getImageData(0, 0, 290, 128), 0, 0)
    this.props.handleContentChange(c2, this.thumbnailCanvas.toDataURL('image/png'), saveText)
  }

  changeDuration(e){
  	let c2 = this.props.asset.content2
  	c2.duration = parseFloat(e.target.value)
  	this.handleSave("Change duration")
  	let canvasWidth = c2.duration * this.state.pxPerSecond+1
  	this.setState({ canvasWidth: canvasWidth })
  }

  addChannel(dataUri){
  	let c2 = this.props.asset.content2
  	if(!c2.channels) c2.channels = []
  	c2.channels.push({
  		title: "Channel "+c2.channels.length,
  		volume: 0.75,
  		dataUri: dataUri,
  	})
  	this.handleSave("Add channel")
  }

  deleteChannel(channelID){
  	let c2 = this.props.asset.content2
  	console.log(channelID, c2.channels)
  	c2.channels.splice(channelID, 1)
  	this.handleSave("Remove channel")
  }

  renderChannels(){
  	let c2 = this.props.asset.content2
  	if(!c2.channels) {
  		return (<div>No channels added...</div>)
  	}

  	// return // TODO remove this to render channels

  	return c2.channels.map((channel, id) => (
			<Channel 
				key={id}
				id={id}
				ref={"channel"+id}
				channel={channel}
				canvasWidth={this.state.canvasWidth}
				canvasHeight={this.state.canvasHeight}
				pxPerSecond={this.state.pxPerSecond}

				handleSave={this.handleSave.bind(this)}
				deleteChannel={this.deleteChannel.bind(this)}
			/>
		))
  }

	render(){

		let c2 = this.props.asset.content2

		return (
			<div className="ui grid">
				<div className="ui sixteen wide column">
					<BrowserCompat context="edit.music" />

			{/*** button row ***/}
					<div className="row">
						<button className="ui small icon button"
							title="Import sound from your computer"
							onClick={this.openImportPopup.bind(this)}>
						  <i className="add square icon"></i> Import
						</button>
					{/*
						<button className="ui small icon button"
							title="Get sound from stock"
							onClick={this.openStockPopup.bind(this)}>
						  <i className="folder icon"></i> Stock [not ready]
						</button>
					*/}
						<button className="ui small icon button"
							title="Generate music (Currently only creates Heavy Metal.. More music styles to follow :)"
							onClick={this.openGeneratePopup.bind(this)}>
						  <i className="options icon"></i> Generate metal music
						</button>

						<button className="ui small icon button"
							title="Generate music (Currently only creates 8bit music.. More music styles to follow :)"
							onClick={this.open8bitPopup.bind(this)}>
						  <i className="options icon"></i> Generate 8bit music
						</button>
					</div>

					<div className="row">
						<button className="ui small icon button"
							title="Add new audio channel"
							onClick={this.addChannel.bind(this, null)}>
						  <i className="add square icon"></i> Add channel
						</button>
						<button className="ui icon button small" onClick={this.togglePlayMusic.bind(this)}>
						  <i className={"icon " + (this.state.isPlaying ? "pause" : "play")}></i>
						</button>
						<button className="ui icon button small" onClick={this.stopMusic.bind(this)}>
						  <i className={"icon stop"}></i>
						</button>
					</div>

					<div className="content">
						<div id="musicPlayer"></div>
						<div className="channelsHeader">
							<div className="controls">
								<div className="ui small labeled input">
								  <div className="ui label">
								    Duration
								  </div>
								  <input type="number" value={Math.floor(c2.duration)} min="1" max="999" onChange={this.changeDuration.bind(this)} />
								</div>
							</div>
							<div className="timeline">
								<canvas ref="timeline" width={this.state.canvasWidth} height="50px"></canvas>
							</div>
						</div>

						<div className="channelList">
							<div ref="cursor" className="cursor" style={{ left:this.cursorOffsetX+"px" }}></div>
							{this.renderChannels()}
						</div>


						<canvas ref="thumbnailCanvas" style={{display: "none"}} width="290px" height="128px"></canvas>
					</div>


				</div>

			{/*** POPUPS ***/}
				<div className="ui modal" ref="importMusicPopup">
					<ImportMusic
						importMusic={this.importMusic.bind(this)}
					/>
				</div>
				
				<div className="ui modal" ref="musicStockPopup">
					<MusicStock 
						importMusic={this.importMusic.bind(this)}
					/>
				</div>

				<div className="ui modal generateMusicPopup" ref="generateMusicPopup">
					<GenerateMusic 
						importMusic={this.importMusic.bind(this)}
					/>
				</div>
				<div className="ui modal generate8bitPopup" ref="generate8bitPopup">
					<Generate8bit
						importMusic={this.importMusic.bind(this)}
					/>
				</div>
			</div>
		);
	}	
}