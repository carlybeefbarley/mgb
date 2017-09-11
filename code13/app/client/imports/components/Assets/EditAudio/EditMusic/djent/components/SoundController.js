import React, { Component } from 'react'
import deepEqual from 'deep-equal'

import { playSound } from '../utils/audio'

import { convertAllowedLengthsToArray, generateSequence, getSequenceForInstrument } from '../utils/sequences'

import { generateRiff } from '../utils/riffs'

import { capitalize, compose, deepClone, isIOS } from '../utils/tools'

import { saveAsWAVFile, saveAsMIDIFile } from '../utils/save'

import IOSWarning from './IOSWarning'
import LoopController from './LoopController'
import SVG from './SVG'
import Waveform from './Waveform'
import ContinuousGenerationController from './ContinuousGenerationController'
import Switch from './Switch'
import audioBufferToWav from 'audiobuffer-to-wav'

import lamejs from '../../../lib/lame.all.js'

import WaveDraw from '/client/imports/components/Assets/EditAudio/lib/WaveDraw'

import '../../editMusic.css'

// Note that 1 is max and definitely too loud for listener
const AUDIO_VOLUME = 0.5

const getSequences = (grooveTotalBeats, allowedLengths, hitChance) => {
  const mainBeat = generateSequence({ totalBeats: grooveTotalBeats, allowedLengths, hitChance })
  const cymbalSequence = getSequenceForInstrument('cymbal')
  const hihatSequence = getSequenceForInstrument('hihat')
  const snareSequence = getSequenceForInstrument('snare')
  const droneSequence = getSequenceForInstrument('drone')

  const sequences = {
    c: cymbalSequence,
    h: hihatSequence,
    k: mainBeat,
    g: mainBeat,
    s: snareSequence,
    d: droneSequence,
  }

  return sequences
}

const generateNewBuffer = ({
  bpm,
  beats,
  allowedLengths,
  hitChance,
  instruments,
  usePredefinedSettings,
  audioContext,
}) => {
  if (!allowedLengths.filter(length => length.amount).length)
    return Promise.reject('There are no allowed lengths given')

  const totalBeats = beats.find(beat => beat.id === 'total')
  const grooveTotalBeats = beats.find(beat => beat.id === 'groove')
  const grooveTotalBeatsProduct = grooveTotalBeats.beats * grooveTotalBeats.bars
  const totalBeatsProduct = totalBeats.beats * totalBeats.bars
  const sequences = getSequences(
    grooveTotalBeatsProduct,
    convertAllowedLengthsToArray(allowedLengths),
    hitChance,
  )
  let riff = generateRiff(
    { bpm, totalBeatsProduct, allowedLengths, sequences, instruments, usePredefinedSettings },
    audioContext,
  )
  return riff
}

const play = (audioContext, buffer) =>
  playSound(audioContext, buffer, audioContext.currentTime, buffer.duration, AUDIO_VOLUME)

const stop = src => {
  if (src) {
    src.onended = () => {}
    src.stop(0)
  }
}
const loop = (src, isLooping) => {
  if (src) {
    src.loop = isLooping
  }
}

const fadeIn = (gainNode, duration) => {
  if (!duration) return gainNode
  const startVal = -1
  const endVal = 0
  gainNode.gain.value = startVal

  let startTime = 0
  ;(function loop(t) {
    if (!startTime) startTime = t
    const time = t - startTime
    const speed = duration === 0 ? 0 : time / duration

    gainNode.gain.value = startVal + speed
    if (gainNode.gain.value < endVal) requestAnimationFrame(loop)
    else gainNode.gain.value = endVal
  })(0.0)

  return gainNode
}

class SoundController extends Component {
  queuedBuffer
  queuedInstruments
  currentGainNode
  audioContext = ''
  isOutDated = true
  renewalTimeout
  renewalPoint = 0.8
  state = {
    isLoading: false,
    error: '',
    isConvertingWav: false,
    isGenerating: false,
  }

  updateUI = newState => {
    requestAnimationFrame(() => this.setState(newState))
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (nextProps.isLooping !== this.props.isLooping) loop(this.props.currentSrc, nextProps.isLooping)
    if (!this.props.generationState) return

    const generationStateInstruments = this.props.generationState.instruments

    // Check against the generation state to see if we're out of date
    if (
      nextProps.bpm !== this.props.generationState.bpm ||
      nextProps.hitChance !== this.props.generationState.hitChance ||
      !deepEqual(nextProps.beats, this.props.generationState.beats) ||
      !deepEqual(nextProps.allowedLengths, this.props.generationState.allowedLengths) ||
      nextProps.instruments.filter(
        (instrument, i) =>
          instrument.sounds.filter(
            (sound, index) => sound.enabled !== generationStateInstruments[i].sounds[index].enabled,
          ).length,
      ).length
    ) {
      this.isOutDated = true
    } else {
      this.isOutDated = false
    }
  }

  generate = () => {
    this.setState({ isGenerating: true })
    const { bpm, beats, allowedLengths, hitChance, instruments, usePredefinedSettings } = this.props

    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)()

    const generationState = deepClone({
      bpm,
      beats,
      allowedLengths,
      hitChance,
      instruments,
      usePredefinedSettings,
    })

    this.props.actions.updateGenerationState(generationState)

    this.isOutDated = false
    this.updateUI({ isLoading: true })
    let self = this
    const audioContext = this.audioContext
    return generateNewBuffer({
      ...generationState,
      instruments,
      audioContext,
    }).then(({ buffer, instruments }) => {
      const newState = { isLoading: false, error: '' }
      if (!buffer) newState.error = 'Error!'

      this.updateUI(newState)

      self.setState({ isGenerating: false })
      // for mobile devices where user input should be triggered
      setTimeout(() => {
        // console.log(self.audioContext.state)
        if (self.audioContext.state == 'suspended') {
          // console.log('stop audio')
          self.stopEvent()
        }
      }, 100)
      return { buffer, instruments }
    })
  }

  togglePlay = () => {
    if (this.props.isPlaying) {
      this.stopEvent()
    } else {
      this.playEvent(this.props.currentBuffer)
    }
  }

  playEvent = currentBuffer => {
    if (!currentBuffer || this.state.error) return
    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.currentGainNode = this.audioContext.createGain()

    const currentSrc = currentBuffer ? play(this.audioContext, currentBuffer) : null

    if (currentBuffer && this.props.waveCanvas) {
      this.props.actions.updateDuration(currentBuffer.duration)
      const channelData = currentBuffer.getChannelData(0)
      const data = {
        audioCtx: this.audioContext,
        duration: currentBuffer.duration,
        canvas: this.props.waveCanvas,
        color: '#4dd2ff',
        buffer: channelData,
      }
      this.waveDraw = new WaveDraw(data)
    }

    this.props.actions.updateCurrentBuffer(currentBuffer)
    this.props.actions.updateCurrentSrc(currentSrc)

    // Set up volume and fades
    currentSrc.connect(this.currentGainNode)
    this.currentGainNode.gain.value = AUDIO_VOLUME
    this.currentGainNode.connect(this.audioContext.destination)
    // this.currentGainNode = fadeIn(this.currentGainNode, (this.props.fadeIn ? 5000 : 0));

    loop(currentSrc, this.props.isLooping)
    this.props.actions.updateIsPlaying(true)

    if (this.props.continuousGeneration) {
      const renewalTimeoutTime = Math.round(currentBuffer.duration * 1000 * this.renewalPoint)
      this.renewalTimeout = setTimeout(this.generateAndQueue, renewalTimeoutTime)
    }

    setTimeout(function() {
      if (
        currentSrc.playbackState === currentSrc.PLAYING_STATE ||
        currentSrc.playbackState === currentSrc.FINISHED_STATE
      ) {
        // console.log("source unlocked")
      } else {
        console.warn('audio source LOCKED')
        // currentSrc.start(0, 0)
      }
    }, 0)

    currentSrc.addEventListener('ended', this.onEnded)
  }

  stopEvent = () => {
    if (this.props.currentSrc && this.props.isPlaying) {
      this.props.currentSrc.removeEventListener('ended', this.onEnded)
      stop(this.props.currentSrc)
      if (this.renewalTimeout) clearTimeout(this.renewalTimeout)
      this.props.actions.updateIsPlaying(false)
    }
  }

  generateEvent = () => {
    if (!this.state.isLoading) {
      if (isIOS()) {
        // const content = <IOSWarning onButtonClick={this.props.actions.disableModal} />
        // this.props.actions.enableModal({ content, isCloseable: true, className: 'modal--wide' });
      }
      this.stopEvent()
      this.generate().then(({ buffer, instruments }) => this.updateInstrumentsAndPlay(buffer, instruments))
    }
  }

  generateAndQueue = () => {
    this.generate().then(({ buffer, instruments }) => {
      if (!this.props.isPlaying) return this.updateInstrumentsAndPlay(buffer, instruments)

      this.queuedBuffer = buffer
      this.queuedInstruments = instruments
    })
  }

  onEnded = () => {
    const { isPlaying, continuousGeneration } = this.props
    if (isPlaying && continuousGeneration && this.queuedBuffer) {
      this.updateInstrumentsAndPlay(this.queuedBuffer, this.queuedInstruments)
      this.queuedInstruments = undefined
      this.queuedBuffer = undefined
    } else this.stopEvent()
  }

  updateInstrumentsAndPlay = (buffer, instruments) => {
    this.props.actions.updateCustomPresetInstruments(instruments)
    this.playEvent(buffer)
  }

  importWav() {
    var self = this
    this.setState({ isConvertingWav: true })

    let channelData = this.props.currentBuffer.getChannelData(0)

    let samples = new Int16Array(channelData.length)
    for (let i = 0; i < channelData.length; i++) {
      let n = channelData[i]
      let v = n < 0 ? n * 32768 : n * 32767
      samples[i] = Math.round(v)
    }

    // convert to mp3
    lamejs.encodeMono(1, 44100, samples, audioObject => {
      this.props.actions.importAudio(audioObject)
      this.setState({ isConvertingWav: false })
    })
  }

  render() {
    const eventName = this.props.isPlaying ? 'stop' : 'play'
    const continuousGeneration =
      document.location.hash === '#beta' && this.props.enableContinuousGenerationControl ? (
        <div className="group-spacing-y-small u-mr1">
          <ContinuousGenerationController
            continuousGeneration={this.props.continuousGeneration}
            actions={{
              updateContinuousGeneration: newVal => this.props.actions.updateContinuousGeneration(newVal),
            }}
          />
        </div>
      ) : null

    return (
      <div>
        {this.state.error ? <p className="txt-error">{this.state.error}</p> : null}
        <div className="row">
          <button
            id="mgbjr-editMusic-generateMetal-generate-button"
            className={'ui blue button ' + (this.state.isGenerating ? 'loading' : '')}
            onClick={() => this.generateEvent()}
          >
            {this.props.generateButtonText || 'Generate Riff'}
          </button>

          <button
            className={'ui button ' + (!this.props.currentBuffer ? 'disabled' : '')}
            title={capitalize(eventName)}
            onClick={this.togglePlay}
          >
            <i className={'icon ' + eventName} />
          </button>

          <LoopController
            isLooping={this.props.isLooping}
            actions={{
              updateIsLooping: newVal => this.props.actions.updateIsLooping(newVal),
            }}
          />

          {continuousGeneration}

          <Switch
            id={'settings'}
            label={'Settings'}
            isActive={this.props.isExpanded}
            customStyle={{ float: 'right', marginTop: '7.5px', marginLeft: '5px' }}
            onChange={() => this.props.actions.toggleSettings(!this.props.isExpanded)}
          />

          <button
            id="mgbjr-editMusic-generateMetal-import-button"
            className={
              'ui right floated labeled icon button ' +
              (!this.props.currentBuffer ? 'disabled ' : '') +
              (this.state.isConvertingWav ? 'loading' : '')
            }
            title="Import"
            onClick={this.importWav.bind(this)}
          >
            <i className="save icon" /> Save
          </button>
        </div>
      </div>
    )
  }
}

export default SoundController
