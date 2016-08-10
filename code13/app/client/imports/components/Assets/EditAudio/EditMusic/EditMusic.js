import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportMusic from './ImportMusic.js';
import MusicStock from './MusicStock.js';
import GenerateMusic from './GenerateMusic.js';

import WaveSurfer from '../lib/WaveSurfer.js';

export default class EditMusic extends React.Component {

	constructor(props) {
  	super(props)

  	console.log(props.asset.content2)

  	// console.log(props.asset.content2);

  	this.state = {
  		playerStatus: "pause"
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

		// popups references
		this.importMusicPopup = ReactDOM.findDOMNode(this.refs.importMusicPopup)
		this.musicStockPopup = ReactDOM.findDOMNode(this.refs.musicStockPopup)
		this.generateMusicPopup = ReactDOM.findDOMNode(this.refs.generateMusicPopup)

		let c2 = this.props.asset.content2;
		if(c2.dataUri){
			this.wavesurfer.load(c2.dataUri);
		}

		let self = this;
		this.wavesurfer.on('finish', function () {
			self.wavesurfer.stop();
    	self.setState({ playerStatus: "pause" })
		})
		this.wavesurfer.on('ready', function () {
			self.handleSave()
		})
	}

	openImportPopup(){
    $(this.importMusicPopup).modal('show');
  }

	importMusic(musicObject, saveText){
		if(!this.hasPermission) return;

		if(musicObject){
			this.wavesurfer.load(musicObject.src);
			let c2 = this.props.asset.content2;
			c2.dataUri = musicObject.src;
			c2.duration = musicObject.duration;
			this.saveText = saveText;
		}

		$(this.importMusicPopup).modal('hide')
		$(this.musicStockPopup).modal('hide')
		$(this.generateMusicPopup).modal('hide')
	}

	openStockPopup(){
		$(this.musicStockPopup).modal('show')
	}

	openGeneratePopup(){
		$(this.generateMusicPopup).modal('show')		
	}

	getFromStock(musicObject){
		console.log(musicObject);
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

	hasPermission() {
    if (!this.props.canEdit) { 
      this.props.editDeniedReminder()
      return false
    }
    else {
      return true
    }
  }

	handleSave()
  {
    if(!this.hasPermission) return;
    if(!this.saveText) return; // don't save at start when music is loaded

    let asset = this.props.asset
    let c2    = asset.content2

    this.thumbnailCtx.putImageData(this.musicCtx.getImageData(0, 0, 290, 128), 0, 0)
    this.props.handleContentChange(c2, this.thumbnailCanvas.toDataURL('image/png'), this.saveText)
  }

	render(){

		return (
			<div className="ui grid">
				<div className="ui sixteen wide column">

			{/*** button row ***/}
					<div className="row">
						<button className="ui small icon button"
							title="Import sound from your computer (only .ogg files now)"
							onClick={this.openImportPopup.bind(this)}>
						  <i className="add square icon"></i> Import (.ogg)
						</button>
					{/*
						<button className="ui small icon button"
							title="Get sound from stock"
							onClick={this.openStockPopup.bind(this)}>
						  <i className="folder icon"></i> Stock [not ready]
						</button>
					*/}
						<button className="ui small icon button"
							title="Generate music"
							onClick={this.openGeneratePopup.bind(this)}>
						  <i className="options icon"></i> Generate music [not ready]
						</button>
					</div>

					<div className="content">
						<div id="musicPlayer"></div>
						<canvas ref="thumbnailCanvas" style={{display: "none"}} width="290px" height="128px"></canvas>
						<div className="row">
							<button className="ui icon button small" onClick={this.togglePlayMusic.bind(this)}>
							  <i className={"icon " + (this.state.playerStatus === "play" ? "pause" : "play")}></i>
							</button>
							<button className="ui icon button small" onClick={this.stopMusic.bind(this)}>
							  <i className={"icon stop"}></i>
							</button>
						</div>
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
			</div>
		);
	}	
}