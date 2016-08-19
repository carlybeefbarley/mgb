import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import WaveSurfer from '../lib/WaveSurfer.js';

export default class Channel extends React.Component {

	constructor(props) {
  	super(props)
  	// console.log(props.asset.content2)

  	this.state = {

  	}
	}

	componentDidMount(){
		const channel = this.props.channel
		if(channel.dataUri){
			this.wave = WaveSurfer.create({
			    container: '#wave'+this.props.id
			    , waveColor: '#4dd2ff'
	    		, progressColor: '#01a2d9'
			})
			this.wave.load(channel.dataUri)
		}
	}

	changeVolume(e){
		this.props.channel.volume = parseFloat(e.target.value)
		this.props.handleSave("Volume change")
	}

	deleteChannel(){
		this.props.deleteChannel(this.props.id)
	}

	render(){
		let channel = this.props.channel
		return (
			<div key={this.props.id} id={"wave"+this.props.id} className="channelContainer">
				<div className="controls">
					{channel.title}
					<div>
	    			<input type="range" value={channel.volume} min="0" max="1" step="0.1"
	    			onChange={this.changeVolume.bind(this)}
	    			/> Volume<br/>
	    		</div>
	    		<buton className="ui mini icon button" onClick={this.deleteChannel.bind(this)}>
	    			<i className="remove icon"></i>
	    		</buton>
				</div>
				<div className="audioWave">

				</div>
			</div>
		)
	}
}