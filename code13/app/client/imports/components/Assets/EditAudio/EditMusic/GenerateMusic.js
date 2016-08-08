import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import Djent from './djent/Djent.js';

export default class GenerateMusic extends React.Component {

	constructor(props) {
  	super(props);

	}

	importAudio(audioObject){
		this.props.importMusic(audioObject, "Generated music")
	}

	render(){
		return (
			<div className="content">
				<Djent 
					importAudio={this.importAudio.bind(this)}
				/>
	    </div>
		)
	}	
}