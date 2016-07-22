import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportAudio from './ImportAudio.js';
import AudioStock from './AudioStock.js';
import CreateAudio from './CreateAudio.js';
import WaveSurfer from './lib/WaveSurfer.js';

export default class EditAudio extends React.Component {

	constructor(props) {
  	super(props);

  	// console.log(props.asset.content2);

  	this.state = {
  		playerStatus: "pause"
  	}
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#audioPlayer'
		    , waveColor: 'violet'
    		, progressColor: 'purple'
		});

		this.audioCanvas = $("#audioPlayer canvas")[0]
		this.audioCtx = this.audioCanvas.getContext('2d')
		this.thumbnailCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
		this.thumbnailCtx = this.thumbnailCanvas.getContext('2d')

		// popups references
		this.importAudioPopup = ReactDOM.findDOMNode(this.refs.importAudioPopup)
		this.createAudioPopup = ReactDOM.findDOMNode(this.refs.createAudioPopup)
		this.audioStockPopup = ReactDOM.findDOMNode(this.refs.audioStockPopup)

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
    $(this.importAudioPopup).modal('show');
  }

	importAudio(audioObject, saveText){
		if(!this.hasPermission) return;

		if(audioObject){
			this.wavesurfer.load(audioObject.src);
			let c2 = this.props.asset.content2;
			c2.dataUri = audioObject.src;
			c2.duration = audioObject.duration;
			this.saveText = saveText;
		}

		$(this.importAudioPopup).modal('hide')
		$(this.createAudioPopup).modal('hide')
	}

	openStockPopup(){
		$(this.audioStockPopup).modal('show');
	}

	getFromStock(audioObject){
		console.log(audioObject);
	}

	openCreateAudioPopup(){
		$(this.createAudioPopup).modal('show');
	}

	togglePlayAudio(){
		if(this.state.playerStatus === "play"){
			this.wavesurfer.pause();
			this.setState({ playerStatus: "pause" });
		} else {
			this.wavesurfer.play();
			this.setState({ playerStatus: "play" });	
		}
	}

	stopAudio(){
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
    if(!this.saveText) return; // don't save at start when audio is loaded

    let asset = this.props.asset
    let c2    = asset.content2

    this.thumbnailCtx.putImageData(this.audioCtx.getImageData(0, 0, 290, 128), 0, 0)
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
						<button className="ui small icon button"
							title="Get sound from stock"
							onClick={this.openStockPopup.bind(this)}>
						  <i className="folder icon"></i> Stock [not ready]
						</button>
						<button className="ui small icon button"
							title="Create sound with effect generator"
							onClick={this.openCreateAudioPopup.bind(this)}>
						  <i className="options icon"></i> Create
						</button>
					</div>

					<div className="content">
						<div id="audioPlayer"></div>
						<canvas ref="thumbnailCanvas" style={{display: "none"}} width="290px" height="128px"></canvas>
						<div className="row">
							<button className="ui icon button small" onClick={this.togglePlayAudio.bind(this)}>
							  <i className={"icon " + (this.state.playerStatus === "play" ? "pause" : "play")}></i>
							</button>
							<button className="ui icon button small" onClick={this.stopAudio.bind(this)}>
							  <i className={"icon stop"}></i>
							</button>
						</div>
					</div>


				</div>

			{/*** POPUPS ***/}
				<div className="ui modal" ref="importAudioPopup">
					<ImportAudio 
						importAudio={this.importAudio.bind(this)}
					/>
				</div>

				<div className="ui modal" ref="audioStockPopup">
					<AudioStock 
						getFromStock={this.getFromStock.bind(this)}
					/>
				</div>

				<div className="ui modal" ref="createAudioPopup">
					<CreateAudio
						importAudio={this.importAudio.bind(this)}
					/>
				</div>

			</div>
		);
	}	
}