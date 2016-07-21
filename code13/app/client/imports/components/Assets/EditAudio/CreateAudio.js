import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import SFXR from './sfxr.js';
import WaveSurfer from './WaveSurfer.js'

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
	  this.resetParams();

  	this.state = {
  		paramsUpdated: new Date().getTime()	// this.PARAMS is actual object in sfxr lib and paramsUpdated is just flag to trigger UI updates
  		, playerStatus: "empty" // empty, play, pause
	  }
	}

	componentDidMount(){
		this.wavesurfer = WaveSurfer.create({
		    container: '#createAudioPlayer'
		    , waveColor: 'violet'
    		, progressColor: 'purple'
		})

		var self = this;
		this.wavesurfer.on('finish', function () {
			self.wavesurfer.stop();
    	self.setState({ playerStatus: "pause" })
		});
	}

	resetParams(){
		this.PARAMS = new SFXR.Params();
	  this.PARAMS.sound_vol = 0.25;
	  this.PARAMS.sample_rate = 44100;
	  this.PARAMS.sample_size = 8;
	  this.setState({ paramsUpdated: new Date().getTime() })
	}

	gen(fx){
		this.resetParams();
	  this.PARAMS[fx]();
	  this.setState({ paramsUpdated: new Date().getTime() })
	  this.playAudio();
	}

	playAudio(noregen){
		let self = this;
		setTimeout(function () { 
	    let audio = new Audio()
	    if (!noregen) {
	      self.sound = new SFXR.SoundEffect(self.PARAMS).generate()
	      // $("#file_size").text(Math.round(SOUND.wav.length / 1024) + "kB");
	      // $("#num_samples").text(SOUND.header.subChunk2Size / 
	      //                        (SOUND.header.bitsPerSample >> 3));
	      // $("#clipping").text(SOUND.clipping);
	    }
	    audio.src = self.sound.dataURI;
	    // $("#wav").attr("href", SOUND.dataURI);
	    // $("#sfx").attr("href", "sfx.wav?" + PARAMS.query());
	    self.wavesurfer.load(self.sound.dataURI);
	    audio.play(); 
  	}, 0);
	}

	changeParam(paramID, event){
    this.PARAMS[event.target.id] = parseInt(event.target.value) / 1000.0;
    this.setState({ paramsUpdated: new Date().getTime() })
	}

	changeWaveType(event){
		this.PARAMS.wave_type = parseInt(event.target.value)
		this.setState({ paramsUpdated: new Date().getTime() })
		this.playAudio();
	}

	saveAudio(){
		let audio = new Audio()
		audio.src = this.sound.dataURI;
		this.props.importAudio(audio, "Created sound");
	}

	render(){

		let effects = 'pickupCoin,laserShoot,explosion,powerUp,hitHurt,jump,blipSelect,random,tone'.split(',');
		let effectButtons = _.map(effects, (effect) => { 
      return (
      	<div key={"effect_"+effect}>
	      	<button className="ui fluid button small" onClick={this.gen.bind(this, effect)}>
					  {effect}
					</button>
				</div>
      );
    });

    let sliderParams = [
    	{ id: "p_env_attack", title: "Attack time" }
    	, { id: "p_env_sustain", title: "Sustain time" }
    	, { id: "p_env_punch", title: "Sustain punch" }
    	, { id: "p_env_decay", title: "Decay time" }
    	, { id: "p_base_freq", title: "Start frequency" }
    	, { id: "p_freq_limit", title: "Min freq. cutoff" }
    	, { id: "p_freq_ramp", title: "Slide", signed: true }
    	, { id: "p_freq_dramp", title: "Delta slide", signed: true }
    	, { id: "p_vib_strength", title: "Depth" }
    	, { id: "p_vib_speed", title: "Speed" }
    	, { id: "p_arp_mod", title: "Frequency mult", signed: true }
    	, { id: "p_arp_speed", title: "Change speed" }
    	, { id: "p_duty", title: "Duty cycle" }
    	, { id: "p_duty_ramp", title: "Sweep", signed: true }
    	, { id: "p_repeat_speed", title: "Rate" }
    	, { id: "p_pha_offset", title: "Offset", signed: true }
    	, { id: "p_pha_ramp", title: "Sweep", signed: true }
    	, { id: "p_lpf_freq", title: "Cutoff frequency" }
    	, { id: "p_lpf_ramp", title: "Cutoff sweep", signed: true }
    	, { id: "p_lpf_resonance", title: "Resonance" }
    	, { id: "p_hpf_freq", title: "Cutoff frequency" }
    	, { id: "p_hpf_ramp", title: "Cutoff sweep", signed: true }
    ];
    let sliders = _.map(sliderParams, (param) => {
    	return (
    		<div key={"slider_"+param.id}>
    			<input id={param.id} type="range" value={this.PARAMS[param.id]*1000} min={param.signed ? -1000 : 0} max="1000" 
    			onChange={this.changeParam.bind(this, param.id)} 
    			onMouseUp={this.playAudio.bind(this, false)}
    			/> {param.title}<br/>
    		</div>
    	)
    })

    let shapeTypes = ["square", "sawtooth", "sine", "noise"];
    let waveShapes = _.map(shapeTypes, (shape, nr) => {
    	return (
	    	<div key={"wavetype_"+shape} className="field">
		      <div className="ui radio checkbox">
		        <input onChange={this.changeWaveType.bind(this)} type="radio" value={nr} name="waveType" id={shape} checked={this.PARAMS.wave_type === nr ? "checked" : ""} />
		        <label>{shape}</label>
		      </div>
		    </div>
	    )
    })



		return (
			<div className="ui modal createPopup">
				<div className="content">
					<div className="grid">

						<div style={{float: "left", width: "25%"}}>
							{effectButtons}
						</div>

						<div style={{float: "left", width: "37%", paddingLeft: "20px" }}>
							{sliders}
							<div>&nbsp;</div>
						</div>
						
						<div style={{float: "left", width: "30%"}}>
							<button className="ui icon button massive" title="Play" onClick={this.playAudio.bind(this, false)}>
							  <i className="play icon"></i>
							</button>
							<button className="ui icon button massive" title="Save sound" onClick={this.saveAudio.bind(this)}>
							  <i className="save icon"></i>
							</button>
							<button className="ui icon button massive" title="Reset sliders" onClick={this.resetParams.bind(this)}>
							  <i className="remove icon"></i>
							</button>
							<div>&nbsp;</div>
							<div className="ui form">
							  <div className="grouped fields">
							    <label>Wave Type</label>
							    {waveShapes}
							  </div>
							</div>

							<div>
								<div><b>Volume</b></div>
			    			<input id="sound_vol" type="range" value={this.PARAMS.sound_vol*1000} min="0" max="1000" 
			    			onChange={this.changeParam.bind(this, "sound_vol")} 
			    			onMouseUp={this.playAudio.bind(this, false)}
			    			/>
			    		</div>

			    		<div id="createAudioPlayer"></div>
						</div>

			    </div>
			  </div>
			</div>
		);
	}	
}


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = {};
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}