import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { routerShape } from 'react-router'

import BeatsController from './components/BeatsController'
import Expandable from './components/Expandable'
// import ExportController from './components/ExportController';
import InstrumentList from './components/InstrumentList'
import Panel from './components/Panel'
import Spinner from './components/Spinner'

import BeatPanel from './components/BeatPanel'
import PresetController from './components/PresetController'
import BPMController from './components/BPMController'
import BPMTapper from './components/BPMTapper'
import SoundController from './components/SoundController'

import presets from './utils/presets'
import { confineToRange } from './utils/tools'

import defaultInstruments from './utils/default-instruments'
import defaultLengths from './utils/defaultLengths'

const activePresetID = 'adtr'

export default class Djent extends Component {
  static contextTypes = {
    router: routerShape.isRequired,
  }

  state = {
    googleAPIHasLoaded: false,
    activePresetID,
    preset: presets.find(a => a.id === activePresetID) || null,

    isPlaying: false,
    isLooping: true,
    generationState: undefined,
    currentBuffer: undefined,
    currentSrc: undefined,

    continuousGeneration: false,
    fadeIn: false,

    isExpanded: false,

    canvasWidth: 850,
    duration: 0,
  }

  constructor(props) {
    super(props)
    this.importAudio = this.props.importAudio
  }

  componentWillMount = () => {
    const { activePresetID } = this.state

    const preset = presets.find(preset => preset.id === activePresetID)

    return this.applyPreset(preset)
  }

  componentDidMount() {
    this.waveCanvas = this.refs.waveCanvas
    this.forceUpdate()

    this.songTime = 0
    this.splitTime = 0
    this._raf = () => {
      this.updateCursor()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }

  updateCursor = () => {
    if (this.state.isPlaying && this.state.duration > 0) {
      const ms = Date.now()
      const deltaTime = ms - this.splitTime
      this.songTime += deltaTime
      const currTime = (this.songTime / 1000) % this.state.duration
      this.splitTime = ms
      const x = this.state.canvasWidth * currTime / this.state.duration
      this.refs.cursor.style.left = x + 'px'
    } else this.splitTime = Date.now()
  }

  stop = () => this.refs.soundController.stopEvent()

  // ********** actions *******************
  applyPreset = preset => {
    // console.log('apply preset new', preset)

    let instruments = preset.settings.instruments
    // add missing instruments
    defaultInstruments.map(instrument => {
      const newInstrument = instruments.find(newInstrument => newInstrument.id === instrument.id)
      if (!newInstrument) {
        instruments.push(instrument)
      }
    })

    // add missing params for instruments
    instruments.map(instrument => {
      const configInstrument = defaultInstruments.find(
        configInstrument => configInstrument.id === instrument.id,
      )
      Object.keys(configInstrument).map(param => {
        if (!instrument[param]) instrument[param] = configInstrument[param]
      })

      // add missing sound params
      instrument.sounds.map(sound => {
        const configSound = configInstrument.sounds.find(configSound => configSound.id === sound.id)
        Object.keys(configSound).map(param => {
          if (!sound[param]) sound[param] = configSound[param]
        })
      })

      // add missing sounds
      configInstrument.sounds.map(configSound => {
        const newSound = instrument.sounds.find(newSound => configSound.id === newSound.id)
        if (!newSound) {
          instrument.sounds.push(configSound)
        }
      })
    })

    // add missing allowed lengths
    let allowedLengths = preset.settings.config.allowedLengths
    defaultLengths.map(item => {
      const newLength = allowedLengths.find(newLength => newLength.id === item.id)
      if (!newLength) {
        allowedLengths.push(item)
      }
    })

    // add missing allowed lengths params
    allowedLengths.map(item => {
      const defaultL = defaultLengths.find(defaultL => defaultL.id === item.id)

      Object.keys(defaultL).map(param => {
        if (!item[param]) {
          item[param] = defaultL[param]
        }
      })
    })

    this.setState({ activePresetID: preset.id, preset })
  }

  updateHitChance = hitChance => {
    console.log('updatehitchance', hitChance)

    if (!hitChance) hitChance = 1
    if (hitChance < 0.05) hitChance = 0.05
    if (hitChance > 1) hitChance = 1

    let preset = this.state.preset
    preset.settings.config.hitChance = hitChance
    this.setState({ preset })
  }

  updateBeats = (id, prop, value) => {
    console.log('update beats', id, prop, value)
    if (prop === 'bars' || prop === 'beats') {
      if (!value) value = 4
      if (value < 1) value = 1
      if (value > 8) value = 8
    }

    let beats = this.state.preset.settings.beats
    let beat = beats.find(function(a) {
      return a.id === id ? a : null
    })
    let i = beats.indexOf(beat)
    if (beat && beat[prop]) {
      beat[prop] = value
      beats[i] = beat

      let preset = this.state.preset
      preset.settings.beats = beats
      this.setState({ preset })

      console.log('updated beats')
    }
  }

  updateAllowedLengths = allowedLengths => {
    console.log('update allowed length', allowedLengths)

    let preset = this.state.preset
    preset.settings.config.allowedLengths = allowedLengths
    this.setState({ preset })
  }

  updateBPM = bpm => {
    if (!bpm) bpm = 100
    if (bpm < 50) bpm = 50
    if (bpm > 300) bpm = 300

    let preset = this.state.preset
    preset.settings.config.bpm = bpm
    this.setState({ preset })
  }

  updateInstrumentSound = ({ soundID, parentID, prop, value }) => {
    let instruments = this.state.preset.settings.instruments
    let parentNr = instruments
      .map((item, nr) => {
        if (item.id === parentID) return nr
      })
      .filter(isFinite)[0]

    if (parentNr !== undefined) {
      let parent = instruments[parentNr]
      let soundNr = parent.sounds
        .map((item, nr) => {
          if (item.id === soundID) return nr
        })
        .filter(isFinite)[0]

      if (soundNr !== undefined) {
        let sound = parent.sounds[soundNr]
        // console.log(sound, soundNr)

        sound[prop] = value

        parent.sounds[soundNr] = sound
        instruments[parentNr] = parent

        let preset = this.state.preset
        preset.settings.instruments = instruments
        this.setState({ preset })
      }
    }
  }

  updateInstrumentPitch = ({ instrumentID, value }) => {
    console.log('updateInstrumentPitch', instrumentID, value, confineToRange(value, -1200, 1200))

    // return {
    //     type: 'UPDATE_INSTRUMENT_DETUNE_PROP',
    //     payload: { instrumentID, value: confineToRange(value, -1200, 1200) },
    // };
  }

  updateCustomPresetInstruments = instruments => {
    // let preset = this.state.preset
    // preset.settings.instruments = instruments
    // this.setState({ preset: preset })
  }

  updateIsPlaying = isPlaying => this.setState({ isPlaying })

  updateIsLooping = isLooping => this.setState({ isLooping })

  updateGenerationState = generationState => this.setState({ generationState })

  updateCurrentBuffer = currentBuffer => {
    this.setState({ currentBuffer })
    this.songTime = 0 // resets cursor
  }

  updateCurrentSrc = currentSrc => this.setState({ currentSrc })

  updateContinuousGeneration = continuousGeneration => this.setState({ continuousGeneration })

  updateDuration = newDuration => this.setState({ duration: newDuration })

  updateFadeIn = fadeIn => this.setState({ fadeIn })

  toggleSettings = isExpanded => this.setState({ isExpanded })

  enableModal = () => {}

  disableModal = () => {}

  // -------------- actions ----------------------

  render() {
    const {
      activePresetID,
      canvasWidth,
      continuousGeneration,
      currentBuffer,
      currentSrc,
      fadeIn,
      generationState,
      isExpanded,
      isLooping,
      isPlaying,
      preset,
    } = this.state

    const totalBeat = preset.settings.beats.find(beat => beat.id === 'total')
    const beats = preset.settings.beats
      .filter(beat => beat.id !== 'total')
      .map((beat, i) => <BeatPanel beat={beat} actions={this} preset={preset} key={i} />)

    return (
      <section>
        {/* <Modal /> */}
        <div>
          <div>
            <div className="row">
              <span className="title-primary">Preset</span>
              &nbsp;&nbsp;
              <PresetController activePresetID={activePresetID} actions={this} />
            </div>

            <Panel>
              <div style={{ position: 'relative' }}>
                <div ref="cursor" className="cursor" />
                <canvas ref="waveCanvas" width={canvasWidth} height="128px" />
              </div>
            </Panel>

            <Panel>
              <div>
                <SoundController
                  ref="soundController"
                  usePredefinedSettings={false}
                  generateButtonText={'Generate Riff'}
                  enableContinuousGenerationControl
                  isPlaying={isPlaying}
                  isLooping={isLooping}
                  generationState={generationState}
                  currentBuffer={currentBuffer}
                  currentSrc={currentSrc}
                  bpm={preset.settings.config.bpm}
                  beats={preset.settings.beats}
                  allowedLengths={preset.settings.config.allowedLengths}
                  hitChance={preset.settings.config.hitChance}
                  instruments={preset.settings.instruments}
                  continuousGeneration={continuousGeneration}
                  fadeIn={fadeIn}
                  isExpanded={isExpanded}
                  actions={this}
                  waveCanvas={this.waveCanvas}
                />
              </div>
            </Panel>
          </div>

          <div style={{ clear: 'both' }}>&nbsp;</div>
          <div style={isExpanded ? { display: 'block' } : { display: 'none' }}>
            <div>
              <Panel>
                <h3>Main Settings</h3>

                <div className="row">
                  <BPMController bpm={preset.settings.config.bpm} actions={this} />
                  &nbsp;&nbsp;
                  <BPMTapper actions={this} />
                  &nbsp;&nbsp;
                  <BeatsController beat={totalBeat} actions={this} />
                </div>
              </Panel>

              <div style={{ clear: 'both' }}>&nbsp;</div>
              <Panel>{beats}</Panel>
            </div>

            <div style={{ clear: 'both' }}>&nbsp;</div>
            <Panel>
              <h3>Sounds</h3>

              <InstrumentList
                actions={{
                  disableModal: this.disableModal,
                  enableModal: this.enableModal,
                  updateInstrumentSound: this.updateInstrumentSound,
                  updateInstrumentPitch: this.updateInstrumentPitch,
                }}
                instruments={preset.settings.instruments}
              />
            </Panel>
          </div>
        </div>
      </section>
    )
  }
}
