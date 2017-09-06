import _ from 'lodash'
import React from 'react'

import SFXR from '../lib/sfxr.js'
import WaveSurfer from '../lib/WaveSurfer.js'
import lamejs from '../lib/lame.all.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

export default class CreateSound extends React.Component {
  constructor(...args) {
    super(...args)

    this.sfxr = new SFXR.Params()
    this.sound = null
    this.state = {
      sfxrParams: this.getDefaultParams(),
      playerStatus: 'empty', // empty, play, pause
      canPlay: false,
    }

    this.playSound = _.debounce(this.playSoundImmediate, 200)
  }

  componentDidMount() {
    this.wavesurfer = WaveSurfer.create({
      container: '#createSoundPlayer',
      waveColor: 'violet',
      progressColor: 'purple',
    })

    this.wavesurfer.on('finish', () => {
      this.wavesurfer.stop()
      this.setState({ playerStatus: 'pause' })
    })

    this.regenerateSound(false)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_.isEqual(this.state.sfxrParams, nextState.sfxrParams)
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state.sfxrParams, prevState.sfxrParams)) this.regenerateSound()
  }

  changeSliderParam = paramID => event => {
    const { sfxrParams } = this.state

    this.setState({
      sfxrParams: {
        ...sfxrParams,
        [event.target.id]: parseInt(event.target.value) / 1000.0,
      },
    })
  }

  changeWaveType = event => {
    const { sfxrParams } = this.state
    this.setState({
      sfxrParams: {
        ...sfxrParams,
        wave_type: parseInt(event.target.value),
      },
    })
  }

  gen = fx => () => {
    const { sfxrParams } = this.state

    this.setState({
      sfxrParams: {
        ...sfxrParams,
        ...this.getDefaultParams(),
        ...this.sfxr[fx](),
      },
    })

    joyrideCompleteTag('mgbjr-CT-editSound-createSound-' + fx + '-generate')
  }

  getDefaultParams = () => {
    // Params() returns values and methods, only keep non-methods
    const params = _.pickBy(new SFXR.Params(), _.negate(_.isFunction))

    return {
      ...params,
      sound_vol: 0.25,
      sample_rate: 44100,
      sample_size: 8,
    }
  }

  // iPad will only play if the playback is synchronous
  // We need immediate playback on play button press
  playSoundImmediate = () => {
    const sound = new Audio()
    sound.oncanplaythrough = event => {
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
  }

  regenerateSound = (shouldPlay = true) => {
    const { sfxrParams } = this.state

    this.sound = new SFXR.SoundEffect(sfxrParams).generate()

    lamejs.encodeMono(1, this.sound.header.sampleRate, this.sound.samples, audioObject => {
      this.sound.dataURI = audioObject.src
      if (shouldPlay) this.playSound()
      this.setState({ canPlay: true })
    })
  }

  resetSliders = () => {
    this.setState({ sfxrParams: this.getDefaultParams() })
  }

  saveSound = () => {
    const sound = new Audio()
    sound.src = this.sound.dataURI
    if (this.sound.dataURI.length > 100) {
      // check if dataUri is not corrupted
      this.props.importSound(sound, 'Created sound')
    } else {
      this.props.importSound(null)
    }
  }

  render() {
    const { sfxrParams } = this.state
    const effectButtons = [
      'pickupCoin',
      'laserShoot',
      'explosion',
      'powerUp',
      'hitHurt',
      'jump',
      'blipSelect',
      'random',
      'tone',
    ].map(effect => (
      <div id={'mgbjr-editSound-createSound-button-' + effect} key={'effect_' + effect}>
        <button className="ui fluid button small" onMouseUp={this.gen(effect)}>
          {effect}
        </button>
      </div>
    ))

    const sliders = [
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
    ].map(param => (
      <div key={'slider_' + param.id}>
        <input
          id={param.id}
          type="range"
          value={sfxrParams[param.id] * 1000}
          min={param.signed ? -1000 : 0}
          max={1000}
          step={10}
          onChange={this.changeSliderParam(param.id)}
        />{' '}
        {param.title}
        <br />
      </div>
    ))

    const shapeTypes = ['square', 'sawtooth', 'sine', 'noise']
    const waveShapes = _.map(shapeTypes, (shape, nr) => (
      <div key={'wavetype_' + shape} className="field">
        <div className="ui radio checkbox">
          <input
            onChange={this.changeWaveType}
            type="radio"
            value={nr}
            name="waveType"
            id={shape}
            checked={sfxrParams.wave_type === nr ? 'checked' : ''}
          />
          <label>{shape}</label>
        </div>
      </div>
    ))

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
              onMouseUp={this.playSoundImmediate}
              disabled={!this.state.canPlay}
            >
              <i className="play icon" />
            </button>
            <button
              id="mgbjr-editSound-createSound-save"
              className="ui icon button massive"
              title="Save sound"
              onMouseUp={this.saveSound}
            >
              <i className="save icon" />
            </button>
            <button className="ui icon button massive" title="Reset sliders" onMouseUp={this.resetSliders}>
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
                value={sfxrParams.sound_vol * 1000}
                min="0"
                max="1000"
                onChange={this.changeSliderParam('sound_vol')}
              />
            </div>

            <div id="createSoundPlayer" />
          </div>
        </div>
      </div>
    )
  }
}
