import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import SFXR from './sfxr.js';

SFXR.Params.prototype.query = function () {
  let result = "";
  let self = this;
  $.each(this, function (key,value) {
    if (self.hasOwnProperty(key))
      result += "&" + key + "=" + value;
  });
  return result.substring(1);
};

var SOUND;

export default class CreateAudio extends React.Component {

	constructor(props) {
  	super(props);

  	this.state = {

	  }
	}

	componentDidMount(){
		this.PARAMS = new SFXR.Params();
	  this.PARAMS.sound_vol = 0.25;
	  this.PARAMS.sample_rate = 44100;
	  this.PARAMS.sample_size = 8;
	  this.gen("pickupCoin");
	  this.playAudio();
	}

	gen(fx){
	  this.PARAMS[fx]();
	}

	playAudio(noregen){
		let self = this;
		setTimeout(function () { 
	    var audio = new Audio();
	    if (!noregen) {
	      SOUND = new SFXR.SoundEffect(self.PARAMS).generate();
	      // $("#file_size").text(Math.round(SOUND.wav.length / 1024) + "kB");
	      // $("#num_samples").text(SOUND.header.subChunk2Size / 
	      //                        (SOUND.header.bitsPerSample >> 3));
	      // $("#clipping").text(SOUND.clipping);
	    }
	    audio.src = SOUND.dataURI;
	    // $("#wav").attr("href", SOUND.dataURI);
	    // $("#sfx").attr("href", "sfx.wav?" + PARAMS.query());
	    audio.play(); 
  	}, 0);
	}

	render(){
		return (
			<div className="ui modal createPopup">
				<div className="content">
					<button className="ui icon button small" onClick={this.playAudio.bind(this, false)}>
					  <i className="play icon"></i>
					</button>

					create audio

		    </div>
			</div>
		);
	}	
}