import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import SFXR from '../lib/sfxr.js'
import WaveSurfer from '../lib/WaveSurfer.js'
import lamejs from '../lib/lame.all.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

SFXR.Params.prototype.query = function() {
  let result = ''
  let self = this
  $.each(this, function(key, value) {
    if (self.hasOwnProperty(key)) result += '&' + key + '=' + value
  })
  return result.substring(1)
}

export default class CreateSound extends React.Component {
  constructor(props) {
    super(props)

    this.sound = null
    this.resetParams()

    this.state = {
      paramsUpdated: new Date().getTime(), // this.PARAMS is actual object in sfxr lib and paramsUpdated is just flag to trigger UI updates
      playerStatus: 'empty', // empty, play, pause
    }
  }

  componentDidMount() {
    this.wavesurfer = WaveSurfer.create({
      container: '#createSoundPlayer',
      waveColor: 'violet',
      progressColor: 'purple',
    })

    var self = this
    this.wavesurfer.on('finish', function() {
      self.wavesurfer.stop()
      self.setState({ playerStatus: 'pause' })
    })
  }

  resetParams() {
    this.PARAMS = new SFXR.Params()
    this.PARAMS.sound_vol = 0.25
    this.PARAMS.sample_rate = 44100
    this.PARAMS.sample_size = 8
  }

  gen(fx) {
    this.resetParams()
    this.PARAMS[fx]()
    this.setState({ paramsUpdated: new Date().getTime() })
    this.regenerateSound()
    joyrideCompleteTag('mgbjr-CT-editSound-createSound-' + fx + '-generate')
  }

  regenerateSound() {
    this.sound = new SFXR.SoundEffect(this.PARAMS).generate()
    lamejs.encodeMono(1, this.sound.header.sampleRate, this.sound.samples, audioObject => {
      // console.log(audioObject)
      this.sound.dataURI = audioObject.src
      this.playSound()
    })
  }

  playSound() {
    // setTimeout(() => {
      let sound = new Audio()
      sound.oncanplaythrough = (event) => {
        sound.play()
      }
      sound.src = this.sound.dataURI
      sound.load()
      if (this.sound.dataURI.length > 100) {
        // check if dataUri is not corrupted. Sometimes jsfxr returns only part of uri
        this.wavesurfer.load(this.sound.dataURI)
      } else {
        this.wavesurfer.empty()
      }
    // }, 0)
  }

  changeParam(paramID, event) {
    this.PARAMS[event.target.id] = parseInt(event.target.value) / 1000.0
    this.setState({ paramsUpdated: new Date().getTime() })
  }

  changeWaveType(event) {
    this.PARAMS.wave_type = parseInt(event.target.value)
    this.setState({ paramsUpdated: new Date().getTime() })
    this.playSound()
  }

  saveSound() {
    let sound = new Audio()
    sound.src = this.sound.dataURI
    if (this.sound.dataURI.length > 100) {
      // check if dataUri is not corrupted
      this.props.importSound(sound, 'Created sound')
    } else {
      this.props.importSound(null)
    }
  }

  resetSliders() {
    this.resetParams()
    this.setState({ paramsUpdated: new Date().getTime() })
  }

  render() {
    let effects = 'pickupCoin,laserShoot,explosion,powerUp,hitHurt,jump,blipSelect,random,tone'.split(',')
    let effectButtons = _.map(effects, effect => {
      return (
        <div id={'mgbjr-editSound-createSound-button-' + effect} key={'effect_' + effect}>
          <button
            className="ui fluid button small"
            onMouseUp={this.gen.bind(this, effect)}
          >
            {effect}
          </button>
        </div>
      )
    })

    let sliderParams = [
      { id: 'p_env_attack', title: 'Attack time' },
      { id: 'p_env_sustain', title: 'Sustain time' },
      { id: 'p_env_punch', title: 'Sustain punch' },
      { id: 'p_env_decay', title: 'Decay time' },
      { id: 'p_base_freq', title: 'Start frequency' },
      { id: 'p_freq_limit', title: 'Min freq. cutoff' },
      { id: 'p_freq_ramp', title: 'Slide', signed: true },
      { id: 'p_freq_dramp', title: 'Delta slide', signed: true },
      { id: 'p_vib_strength', title: 'Depth' },
      { id: 'p_vib_speed', title: 'Speed' },
      { id: 'p_arp_mod', title: 'Frequency mult', signed: true },
      { id: 'p_arp_speed', title: 'Change speed' },
      { id: 'p_duty', title: 'Duty cycle' },
      { id: 'p_duty_ramp', title: 'Sweep', signed: true },
      { id: 'p_repeat_speed', title: 'Rate' },
      { id: 'p_pha_offset', title: 'Offset', signed: true },
      { id: 'p_pha_ramp', title: 'Sweep', signed: true },
      { id: 'p_lpf_freq', title: 'Cutoff frequency' },
      { id: 'p_lpf_ramp', title: 'Cutoff sweep', signed: true },
      { id: 'p_lpf_resonance', title: 'Resonance' },
      { id: 'p_hpf_freq', title: 'Cutoff frequency' },
      { id: 'p_hpf_ramp', title: 'Cutoff sweep', signed: true },
    ]
    let sliders = _.map(sliderParams, param => {
      return (
        <div key={'slider_' + param.id}>
          <input
            id={param.id}
            type="range"
            value={this.PARAMS[param.id] * 1000}
            min={param.signed ? -1000 : 0}
            max="1000"
            onChange={this.changeParam.bind(this, param.id)}
            onMouseUp={this.changeParam.bind(this, param.id)}
          />{' '}
          {param.title}
          <br />
        </div>
      )
    })

    let shapeTypes = ['square', 'sawtooth', 'sine', 'noise']
    let waveShapes = _.map(shapeTypes, (shape, nr) => {
      return (
        <div key={'wavetype_' + shape} className="field">
          <div className="ui radio checkbox">
            <input
              onChange={this.changeWaveType.bind(this)}
              type="radio"
              value={nr}
              name="waveType"
              id={shape}
              checked={this.PARAMS.wave_type === nr ? 'checked' : ''}
            />
            <label>{shape}</label>
          </div>
        </div>
      )
    })

    return (
      <div className="content">
        <div className="grid">
          <div style={{ float: 'left', width: '25%' }}>{effectButtons}</div>

          <div style={{ float: 'left', width: '37%', paddingLeft: '20px' }}>
            {sliders}
            <div>&nbsp;</div>
          </div>

          <div style={{ float: 'left', width: '30%' }}>
            <button
              className="ui icon button massive"
              title="Play"
              onMouseUp={this.regenerateSound.bind(this)}
            >
              <i className="play icon" />
            </button>
            <button
              id="mgbjr-editSound-createSound-save"
              className="ui icon button massive"
              title="Save sound"
              onMouseUp={this.saveSound.bind(this)}
            >
              <i className="save icon" />
            </button>
            <button
              className="ui icon button massive"
              title="Reset sliders"
              onMouseUp={this.resetSliders.bind(this)}
            >
              <i className="erase icon" />
            </button>
            <div>&nbsp;</div>
            <div className="ui form">
              <div className="grouped fields">
                <label>Wave Type</label>
                {waveShapes}
              </div>
            </div>

            <div>
              <div>
                <b>Volume</b>
              </div>
              <input
                id="sound_vol"
                type="range"
                value={this.PARAMS.sound_vol * 1000}
                min="0"
                max="1000"
                onChange={this.changeParam.bind(this, 'sound_vol')}
                onMouseUp={this.changeParam.bind(this, 'sound_vol')}
              />
            </div>

            <div id="createSoundPlayer" />
          </div>
        </div>
      </div>
    )
  }
}

function clone(obj) {
  if (null == obj || 'object' != typeof obj) return obj
  var copy = {}
  for (let attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr]
  }
  return copy
}
