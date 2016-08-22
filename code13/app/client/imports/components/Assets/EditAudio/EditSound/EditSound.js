import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportSound from './ImportSound.js';
import SoundStock from './SoundStock.js';
import CreateSound from './CreateSound.js';
import WaveSurfer from '../lib/WaveSurfer.js';
import BrowserCompat from '/client/imports/components/Controls/BrowserCompat'

export default class EditSound extends React.Component {

	constructor(props) {
  	super(props)

  	// console.log(props)

  	this.state = {
  		playerStatus: "pause"
  	}
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#soundPlayer'
		    , waveColor: 'violet'
    		, progressColor: 'purple'
		});

		this.previewPlayer = WaveSurfer.create({
		    container: '#previewDiv'
		    , waveColor: 'violet'
    		, progressColor: 'purple'
		});

		this.soundCanvas = $("#soundPlayer canvas")[0]
		this.soundCtx = this.soundCanvas.getContext('2d')

		// popups references
		this.importSoundPopup = ReactDOM.findDOMNode(this.refs.importSoundPopup)
		this.createSoundPopup = ReactDOM.findDOMNode(this.refs.createSoundPopup)
		this.soundStockPopup = ReactDOM.findDOMNode(this.refs.soundStockPopup)

		let c2 = this.props.asset.content2;
		if(c2.dataUri){
			this.wavesurfer.load(c2.dataUri);
			this.previewPlayer.load(c2.dataUri);
		}

		let self = this;
		this.wavesurfer.on('finish', function () {
			self.wavesurfer.stop();
    	self.setState({ playerStatus: "pause" })
		})
		this.wavesurfer.on('ready', function () {
			// self.handleSave()
		})
		this.previewPlayer.on('ready', function () {
			self.handleSave()
		})
	}

	importSound(soundObject, saveText){
		if(!this.hasPermission) return;

		if(soundObject){
			this.wavesurfer.load(soundObject.src)
			this.previewPlayer.load(soundObject.src)
			let c2 = this.props.asset.content2;
			c2.dataUri = soundObject.src;
			c2.duration = soundObject.duration;
			this.saveText = saveText;
		}

		$(this.importSoundPopup).modal('hide')
		$(this.createSoundPopup).modal('hide')
		$(this.soundStockPopup).modal('hide')
	}

	openImportPopup(){
    $(this.importSoundPopup).modal('show');
  }

	openStockPopup(){
		$(this.soundStockPopup).modal('show');
	}

	openCreateSoundPopup(){
		$(this.createSoundPopup).modal('show');
	}

	togglePlaySound(){
		if(this.state.playerStatus === "play"){
			this.wavesurfer.pause();
			this.setState({ playerStatus: "pause" });
		} else {
			this.wavesurfer.play();
			this.setState({ playerStatus: "play" });	
		}
	}

	stopSound(){
		this.wavesurfer.stop();
		this.setState({ playerStatus: "pause" });
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
    if(!this.saveText) return; // don't save at start when sound is loaded

    let asset = this.props.asset
    let c2    = asset.content2

    const previewCanvas = $("#previewDiv").children().first().children().first()[0]
    this.props.handleContentChange(c2, previewCanvas.toDataURL('image/png'), this.saveText)
  }

	render(){

		return (
			<div className="ui grid">
				<div className="ui sixteen wide column">
					<BrowserCompat context="edit.sound" />

			{/*** button row ***/}
					<div className="row">
						<button className="ui small icon button"
							title="Import sound from your computer (only .ogg files now)"
							onClick={this.openImportPopup.bind(this)}>
						  <i className="add square icon"></i> Import (.ogg)
						</button>
						<button className="ui small icon button"
							title="Get sound from stock"
							onClick={this.openStockPopup.bind(this)}>
						  <i className="folder icon"></i> Stock [not ready]
						</button>
						<button className="ui small icon button"
							title="Create sound with effect generator"
							onClick={this.openCreateSoundPopup.bind(this)}>
						  <i className="options icon"></i> Create
						</button>
					</div>

					<div className="content">
						<div id="soundPlayer"></div>
						<div className="row">
							<button className="ui icon button small" onClick={this.togglePlaySound.bind(this)}>
							  <i className={"icon " + (this.state.playerStatus === "play" ? "pause" : "play")}></i>
							</button>
							<button className="ui icon button small" onClick={this.stopSound.bind(this)}>
							  <i className={"icon stop"}></i>
							</button>
						</div>
					</div>
					<div id="previewDiv" style={{width:"280px", height:"128px", visibility: "hidden"}}></div>


				</div>

			{/*** POPUPS ***/}
				<div className="ui modal" ref="importSoundPopup">
					<ImportSound 
						importSound={this.importSound.bind(this)}
					/>
				</div>

				<div className="ui modal" ref="soundStockPopup">
					<SoundStock 
						importSound={this.importSound.bind(this)}
					/>
				</div>

				<div className="ui modal" ref="createSoundPopup">
					<CreateSound
						importSound={this.importSound.bind(this)}
					/>
				</div>

			</div>
		);
	}	
}