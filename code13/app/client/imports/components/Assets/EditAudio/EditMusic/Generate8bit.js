import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

// import Djent from './8bit/Djent.js';
import { PianoInstrument, NoiseInstrument, SinWaveInstrument } from './8bit/instruments.js'

export default class Generate8bit extends React.Component {

	constructor(props) {
  	super(props);

	}

	importAudio(audioObject){
		this.props.importMusic(audioObject, "Generated music")
	}

	render(){
		let pianoInstrument = new PianoInstrument()
		console.log(pianoInstrument)

		return (
			<div className="content">
				Hello
	    </div>
		)
	}	
}