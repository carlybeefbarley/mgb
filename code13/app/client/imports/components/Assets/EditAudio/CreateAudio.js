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


export default class CreateAudio extends React.Component {

	constructor(props) {
  	super(props);

  	this.sound = null;
	  this.PARAMS = new SFXR.Params();
	  this.PARAMS.sound_vol = 0.25;
	  this.PARAMS.sample_rate = 44100;
	  this.PARAMS.sample_size = 8;

  	this.state = {
  		params: this.PARAMS	// this.PARAMS is actual object in sfxr lib and this.state.params just updates UI
	  }
	}

	componentDidMount(){
		
	}

	gen(fx){
	  this.PARAMS[fx]();
	  this.setState({ params: this.PARAMS })
	  this.playAudio();
	}

	playAudio(noregen){
		let self = this;
		setTimeout(function () { 
	    var audio = new Audio();
	    if (!noregen) {
	      self.sound = new SFXR.SoundEffect(self.PARAMS).generate();
	      // $("#file_size").text(Math.round(SOUND.wav.length / 1024) + "kB");
	      // $("#num_samples").text(SOUND.header.subChunk2Size / 
	      //                        (SOUND.header.bitsPerSample >> 3));
	      // $("#clipping").text(SOUND.clipping);
	    }
	    audio.src = self.sound.dataURI;
	    // $("#wav").attr("href", SOUND.dataURI);
	    // $("#sfx").attr("href", "sfx.wav?" + PARAMS.query());
	    audio.play(); 
  	}, 0);
	}

	changeParam(paramID, event){
		console.log( parseInt(event.target.value) );
		// console.log( event, paramID );
	}

	render(){

		let effects = 'pickupCoin,laserShoot,explosion,powerUp,hitHurt,jump,blipSelect,random,tone'.split(',');
		let effectButtons = _.map(effects, (effect) => { 
      return (
      	<button key={"effect_"+effect} className="ui button small" onClick={this.gen.bind(this, effect)}>
				  {effect}
				</button>
      );
    });

    let sliderParams = [
    	{ id: "p_env_attack", title: "Attack time" }
    	, { id: "p_env_sustain", title: "Sustain time" }
    	, { id: "p_env_punch", title: "Sustain punch" }
    	, { id: "p_env_decay", title: "Decay time" }
    	, { id: "p_base_freq", title: "Start frequency" }
    	, { id: "p_freq_limit", title: "Min freq. cutoff" }
    	, { id: "p_freq_ramp", title: "Slide" }
    	, { id: "p_freq_dramp", title: "Delta slide" }
    	, { id: "p_vib_strength", title: "Depth" }
    	, { id: "p_vib_speed", title: "Speed" }
    	, { id: "p_arp_mod", title: "Frequency mult" }
    	, { id: "p_arp_speed", title: "Change speed" }
    	, { id: "p_duty", title: "Duty cycle" }
    	, { id: "p_duty_ramp", title: "Sweep" }
    	, { id: "p_repeat_speed", title: "Rate" }
    	, { id: "p_pha_offset", title: "Offset" }
    	, { id: "p_pha_ramp", title: "Sweep" }
    	, { id: "p_lpf_freq", title: "Cutoff frequency" }
    	, { id: "p_lpf_ramp", title: "Cutoff sweep" }
    	, { id: "p_lpf_resonance", title: "Resonance" }
    	, { id: "p_hpf_freq", title: "Cutoff frequency" }
    	, { id: "p_hpf_ramp", title: "Cutoff sweep" }
    ];
    let sliders = _.map(sliderParams, (param) => {
    	return (
    		<div key={"slider_"+param.id}>
    			<input type="range" value="200" min="100" max="500" step="10" onChange={this.changeParam.bind(this, param.id)} /> {param.title}<br/>
    		</div>
    	);
    });



		return (
			<div className="ui modal createPopup">
				<div className="content">
					<div className="grid">

						<div style={{float: "left", width: "30%"}}>

							<button className="ui icon button small" onClick={this.playAudio.bind(this, false)}>
							  <i className="play icon"></i>
							</button>
							{effectButtons}
						</div>

						<div style={{float: "left", width: "30%"}}>
							<input type="range" value="200" min="100" max="500" step="10" onChange={this.changeParam.bind(this, "paramID")} />
							{sliders}
						</div>
						
						<div style={{float: "left", width: "30%"}}>
							sdfgsd
						</div>

			    </div>
			  </div>
			</div>
		);
	}	
}