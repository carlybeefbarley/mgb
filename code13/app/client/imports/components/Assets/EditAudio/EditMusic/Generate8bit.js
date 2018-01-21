import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import './editMusic.css'
import Song from './8bit/song.js'
import RIFFWAVE from './8bit/encoder.js'
// import RIFFWAVE from '../lib/riffwave.js'
import lamejs from '../lib/lame.all.js'

export default class Generate8bit extends React.Component {
  constructor(props) {
    super(props)

    this.sampleRate = 44100
    this.maxval = 32767
    this.audio = null

    this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1

    this.state = {
      canvasWidth: 860,
      canvasHeight: 480,
      isHidden: true,
      isPlaying: false,
      isGenerating: false,
      isAudio: false,

      bpm: 140,
      isBass: true,
      bassVolume: 4,
      isLoop: true,

      pianoParams: {
        v: Math.floor(Math.random() * 4) - 2, // -2 1
        v1: Math.floor(Math.random() * 20) - 10, // -10 9
        v2: Math.floor(Math.random() * 20) - 10, //-10 9
        v3: Math.floor(Math.random() * 20) - 10, //-10 9
        vv: Math.floor(Math.random() * 2) + 3, // 3 5

        melodyNoteCount: 4,
        delay: 0.2,
        noteProbability: 0.25,
        enchance: true,
      },
    }
  }

  componentDidMount() {
    this.canvas = ReactDOM.findDOMNode(this.refs.canvas)
    this.ctx = this.canvas.getContext('2d')
  }

  generate = () => {
    if (this.state.isHidden) {
      this.setState({ isHidden: false })
    }
    this.stop()
    this.audio = null
    this.setState({ isGenerating: true, isAudio: false })

    setTimeout(() => {
      const bassParams = {
        isBass: this.state.isBass,
        bassVolume: this.state.bassVolume,
      }
      let song = new Song(bassParams, this.state.pianoParams)
      let wave = this.generateSample(song)
      lamejs.encodeMono(1, wave.header.sampleRate, wave.samples, audioObject => {
        // console.log(audioObject)
        this.audio = new Audio(audioObject.src)
        // this.audio = new Audio(wave.dataURI)
        this.audio.loop = this.state.isLoop
        this.play()
        this.setState({ isGenerating: false, isAudio: true })
      })
    }, 50)
  }

  randomize = () => {
    let pianoParams = this.state.pianoParams
    pianoParams.v = Math.floor(Math.random() * 4) - 2
    pianoParams.v1 = Math.floor(Math.random() * 20) - 10
    pianoParams.v2 = Math.floor(Math.random() * 20) - 10
    pianoParams.v3 = Math.floor(Math.random() * 20) - 10
    pianoParams.vv = Math.floor(Math.random() * 2) + 3
    let bpm = Math.floor(Math.random() * 100) + 80
    let bassVolume = Math.floor(Math.random() * 4) + 2
    this.setState({ pianoParams, bpm, bassVolume })
  }

  generateSample = song => {
    var downsample = 2 //increasing this will speed up generation but yield lower-res sound
    var bpm = this.state.bpm
    bpm = 1 / (bpm / 120)
    var duration = song.bars * song.secperbar * bpm //duration of the song in seconds
    var data = []
    for (let t = 0; t < Math.round(this.sampleRate * duration); t++) {
      data[t] = 0
    }

    for (let i in song.Channels) {
      const channel = song.Channels[i]
      const instrument = channel.instrument
      for (let n in channel.notes) {
        const note = channel.notes[n]
        // console.log(note.vol)
        var ns = Math.floor(note.start * this.sampleRate * bpm)
        var ne = Math.floor(note.end * this.sampleRate * bpm)
        for (let t2 = ns; t2 < ne; t2 += downsample) {
          var thisdata = instrument.generator(Math.floor(t2), note.key / 88, ns, ne) * note.vol
          for (let d = 0; d < downsample; d++) {
            data[Math.floor(t2) + d] += thisdata
          }
          //data[Math.floor(t)]+=instrument.generator(Math.floor(t),note.key/88,ns,ne)*note.vol;
        }
      }
    }

    for (let t2 in data) {
      data[t2] = Math.min(Math.round(data[t2] / song.Channels.length * this.maxval / 4), this.maxval)
    }

    this.drawNotes(song, bpm, duration)

    return new RIFFWAVE(data)
    // var audio = new Audio(wave.dataURI);
    // return audio;
  }

  drawNotes = (song, bpm, duration) => {
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.state.canvasWidth, this.state.canvasHeight)

    for (let i in song.Channels) {
      let channel = song.Channels[i]
      // instrument=channel.instrument;
      for (let n in channel.notes) {
        let note = channel.notes[n]
        let ns = note.start * bpm / duration * this.state.canvasWidth
        let ne = note.end * bpm / duration * this.state.canvasWidth

        if (i == 0) this.ctx.fillStyle = 'rgba(128,128,255,0.5)'
        else if (i == 1) this.ctx.fillStyle = 'rgba(128,255,128,0.5)'
        else if (i == 2) this.ctx.fillStyle = 'rgba(255,128,128,0.5)'
        this.ctx.fillRect(ns, note.key * 5, Math.max(2, ne - ns), 5)
        this.ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        this.ctx.strokeRect(ns - 0.5, note.key * 5 - 0.5, Math.max(2, ne - ns), 5)
        this.ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        this.ctx.strokeRect(ns + 0.5, note.key * 5 + 0.5, Math.max(2, ne - ns), 5)
      }
    }
  }

  togglePlay = () => {
    if (!this.audio) return

    this.state.isPlaying ? this.stop() : this.play()
  }

  play = () => {
    if (!this.audio) return
    this.audio.play()
    this.setState({ isPlaying: true })
  }

  stop = () => {
    if (!this.audio) return
    this.audio.pause()
    this.audio.currentTime = 0
    this.setState({ isPlaying: false })
  }

  toggleLoop = () => {
    if (this.audio) {
      this.audio.loop = this.isLoop
    }
    this.setState({ isLoop: !this.state.isLoop })
  }

  importAudio = () => {
    if (!this.audio) return
    this.props.importMusic(this.audio, 'Generated 8bit music')
  }

  changeBPM = e => {
    this.setState({ bpm: parseInt(e.target.value) })
  }

  toggleBass = () => {
    this.setState({ isBass: !this.state.isBass })
  }

  changeBassVolume = e => {
    this.setState({ bassVolume: parseInt(e.target.value) / 10 })
  }

  changePianoParams = (id, e) => {
    let pianoParams = this.state.pianoParams
    pianoParams[id] = parseFloat(e.target.value)
    this.setState({ pianoParams })
    // console.log(this.state.pianoParams)
  }

  toggleEnchancePiano = e => {
    let pianoParams = this.state.pianoParams
    pianoParams.enchance = !pianoParams.enchance
    this.setState({ pianoParams })
  }

  render() {
    return (
      <div className="content">
        <div className="row">
          <button className={'ui button '} onClick={this.randomize.bind(this)}>
            Randomize
          </button>

          <button
            className={'ui blue button ' + (this.state.isGenerating ? 'loading' : '')}
            onClick={this.generate.bind(this)}
          >
            Generate
          </button>

          <button
            className={'ui button ' + (!this.state.isAudio || this.state.isGenerating ? 'disabled' : '')}
            onClick={this.togglePlay.bind(this)}
          >
            <i className={'icon ' + (this.state.isPlaying ? 'stop' : 'play')} />
          </button>

          <div className={'ui toggle checkbox '}>
            <input
              type="checkbox"
              checked={this.state.isLoop ? 'checked' : ''}
              onChange={this.toggleLoop.bind(this)}
            />
            <label>Loop</label>
          </div>

          <button
            className={'ui right floated labeled icon button ' + (!this.state.isAudio ? 'disabled ' : '')}
            title="Save"
            onClick={this.importAudio.bind(this)}
          >
            <i className="save icon" /> Save
          </button>
        </div>
        <div className="ui divider" />
        <div>
          <canvas
            ref="canvas"
            width={this.state.canvasWidth + 'px'}
            height={this.state.canvasHeight + 'px'}
            className={this.state.isHidden ? 'mgb-hidden' : ''}
          />
        </div>
        <div style={{ width: '150px', float: 'left', marginRight: '20px' }}>
          <div>
            <div title="Beats per minute">
              <b>BPM</b>
            </div>
            <input
              type="range"
              value={this.state.bpm}
              min={this.isFirefox ? '60' : '30'}
              max="240"
              onChange={this.changeBPM.bind(this)}
            />
          </div>
          <div title="Enabling, disabling bass">
            <b>Bass</b>
          </div>
          <div className={'ui toggle checkbox '}>
            <input
              type="checkbox"
              checked={this.state.isBass ? 'checked' : ''}
              onChange={this.toggleBass.bind(this)}
            />
            <label />
          </div>
          <div>
            <div title="Bass volume">
              <b>Bass volume</b>
            </div>
            <input
              type="range"
              value={this.state.bassVolume * 10}
              min="0"
              max="60"
              onChange={this.changeBassVolume.bind(this)}
            />
          </div>
          <div title="Enchance piano on second part of song">
            <b>Enchance piano</b>
          </div>
          <div className={'ui toggle checkbox '}>
            <input
              type="checkbox"
              checked={this.state.pianoParams.enchance ? 'checked' : ''}
              onChange={this.toggleEnchancePiano.bind(this)}
            />
            <label />
          </div>
        </div>
        <div style={{ width: '150px', float: 'left', marginRight: '20px' }}>
          <div title="Piano params">
            <b>Piano</b>
          </div>
          <input
            type="range"
            value={this.state.pianoParams.v}
            min="-2"
            max="1"
            step="1"
            onChange={this.changePianoParams.bind(this, 'v')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.v1}
            min="-10"
            max="9"
            step="1"
            onChange={this.changePianoParams.bind(this, 'v1')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.v2}
            min="-10"
            max="9"
            step="1"
            onChange={this.changePianoParams.bind(this, 'v2')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.v3}
            min="-10"
            max="9"
            step="1"
            onChange={this.changePianoParams.bind(this, 'v3')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.vv}
            min="3"
            max="5"
            step="1"
            onChange={this.changePianoParams.bind(this, 'vv')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.melodyNoteCount}
            min="3"
            max="5"
            step="1"
            onChange={this.changePianoParams.bind(this, 'melodyNoteCount')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.delay}
            min="0"
            max="0.5"
            step="0.05"
            onChange={this.changePianoParams.bind(this, 'delay')}
          />
          <br />
          <input
            type="range"
            value={this.state.pianoParams.noteProbability}
            min="0"
            max="0.5"
            step="0.05"
            onChange={this.changePianoParams.bind(this, 'noteProbability')}
          />
          <br />
        </div>
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}
