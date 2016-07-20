import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import ImportAudio from './ImportAudio.js';
import AudioStock from './AudioStock.js';
import CreateAudio from './CreateAudio.js';
import WaveSurfer from './WaveSurfer.js';

export default class EditAudio extends React.Component {

	constructor(props) {
  	super(props);

  	console.log(props.asset.content2);

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

		let c2 = this.props.asset.content2;
		if(c2.dataUri){
			this.wavesurfer.load(c2.dataUri);
		}
	}

	openImportPopup(){
    // console.log('open import popup')
    $('.ui.modal.importPopup').modal('show');
  }

	importAudio(audioObject){
		if(!this.hasPermission) return;

		this.wavesurfer.load(audioObject.src);
		let c2 = this.props.asset.content2;
		c2.dataUri = audioObject.src;
		c2.duration = audioObject.duration;
		this.handleSave("Imported audio");
		$('.ui.modal.importPopup').modal('hide');
	}

	openStockPopup(){
		$('.ui.modal.stockPopup').modal('show');
	}

	getFromStock(audioObject){
		console.log(audioObject);
	}

	openCreateAudioPopup(){
		$('.ui.modal.createPopup').modal('show');
	}

	getCreatedAudio(audioObject){
		console.log(audioObject);
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

	handleSave(changeText="change audio")
  {
    if(!this.hasPermission) return;

    let c2 = this.props.asset.content2;
    this.props.handleContentChange(c2, null, changeText);
  }

	render(){

		return (
			<div className="ui grid">
				<div className="ui sixteen wide column">

			{/*** button row ***/}
					<div className="row">
						<button className="ui small icon button"
							onClick={this.openImportPopup.bind(this)}>
						  <i className="add square icon"></i> Import (.ogg)
						</button>
						<button className="ui small icon button"
							onClick={this.openStockPopup.bind(this)}>
						  <i className="folder icon"></i> Stock [not ready]
						</button>
						<button className="ui small icon button"
							onClick={this.openCreateAudioPopup.bind(this)}>
						  <i className="configure icon"></i> Create [not ready]
						</button>
					</div>

					<div className="content">
						<div id="audioPlayer"></div>
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
				<ImportAudio 
					importAudio={this.importAudio.bind(this)}
				/>

				<AudioStock 
					getFromStock={this.getFromStock.bind(this)}
				/>

				<CreateAudio
					getCreatedAudio={this.getCreatedAudio.bind(this)}
				/>

			</div>
		);
	}	
}