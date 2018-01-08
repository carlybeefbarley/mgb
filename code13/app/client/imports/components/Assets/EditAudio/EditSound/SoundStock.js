import { HTTP } from 'meteor/http'
import _ from 'lodash'
import React from 'react'
import ReactDOM from 'react-dom'
import { makeCDNLink } from '/client/imports/helpers/assetFetchers'

import './editSound.css'

export default class SoundStock extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      searchField: 'sound',
      sounds: [],
      playingSoundID: null,
    }

    this.searchOnSubmit() // to be deleted

    // animframe for updating selecting rectangle animation
    this._raf = () => {
      if (this.state.playingSoundID) this.drawTimeline()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }

  // react suggest to track down all async functions/events/timers and stop/cancel them in unmount method
  // much simpler is to track single boolean and stop async call in callback
  // TODO: do some day this react way - manually track all async functions and stop them on unmount
  componentDidMount() {
    this.isReallyMounted = true // isMounted is reserved and deprecated
  }
  componentWillUnmount() {
    this.isReallyMounted = false
  }

  searchOnChange(event) {
    // TODO clever autosearch
    this.setState({ searchField: event.target.value })
  }

  searchOnSubmit() {
    let self = this
    const infolink = makeCDNLink('/api/asset/sound/name/' + this.state.searchField)
    HTTP.get(infolink, (error, sounds) => {
      // async call component might be unmounted
      if (!this.isReallyMounted) return
      self.setState({ sounds })
    })
  }

  togglePlay(soundID) {
    let player = ReactDOM.findDOMNode(this.refs[soundID])
    if (this.state.playingSoundID === null) {
      this.playSound(soundID)
    } else if (soundID === this.state.playingSoundID) {
      player.pause()
      this.clearTimeline(soundID)
      this.setState({ playingSoundID: null })
    } else {
      // if is played another sound already
      let player2 = ReactDOM.findDOMNode(this.refs[this.state.playingSoundID])
      player2.pause()
      player2.currentTime = 0
      this.clearTimeline(this.state.playingSoundID)
      this.playSound(soundID)
    }
  }

  playSound(soundID) {
    let player = ReactDOM.findDOMNode(this.refs[soundID])
    if (player.src) {
      player.play()
      this.setState({ playingSoundID: soundID })
    } else {
      let self = this
      const infolink = '/api/asset/sound/' + soundID
      HTTP.get(infolink, (error, data) => {
        player.src = data.dataUri
        player.play()
        self.setState({ playingSoundID: soundID })
      })
    }
  }

  drawTimeline() {
    let player = ReactDOM.findDOMNode(this.refs[this.state.playingSoundID])
    let timeLine = ReactDOM.findDOMNode(this.refs['timeline_' + this.state.playingSoundID])
    let ctx = timeLine.getContext('2d')
    let width = 280 * player.currentTime / player.duration
    // timeLine.width = width
    ctx.fillStyle = '#c3c3c3'
    ctx.clearRect(0, 0, 280, 160)
    ctx.fillRect(0, 0, width, 160)
    // console.log(width)
    return width
  }

  timelineClick(soundID, duration, e) {
    let player = ReactDOM.findDOMNode(this.refs[soundID])
    let timeLine = ReactDOM.findDOMNode(this.refs['timeline_' + soundID])
    let rect = timeLine.getBoundingClientRect()
    let x = e.clientX - rect.left
    duration = player.duration ? player.duration : duration
    // console.log(duration * x / 280)
    player.currentTime = duration * x / 280

    if (this.state.playingSoundID === soundID) {
      // do nothing
    } else if (this.state.playingSoundID === null) {
      this.playSound(soundID)
    } else {
      // another song is playing
      let player2 = ReactDOM.findDOMNode(this.refs[this.state.playingSoundID])
      player2.pause()
      player2.currentTime = 0
      this.clearTimeline(this.state.playingSoundID)
      this.playSound(soundID)
    }
  }

  clearTimeline(soundID) {
    let timeLine = ReactDOM.findDOMNode(this.refs['timeline_' + soundID])
    let ctx = timeLine.getContext('2d')
    ctx.clearRect(0, 0, 280, 160)
  }

  audioEnded(event) {
    let soundID = event.target.dataset.id
    let player = ReactDOM.findDOMNode(this.refs[soundID])
    player.pause()
    player.currentTime = 0
    if (soundID === this.state.playingSoundID) {
      this.clearTimeline(soundID)
      this.setState({ playingSoundID: null })
    }
  }

  importSound(soundID) {
    let player = ReactDOM.findDOMNode(this.refs[soundID])
    if (player.src) {
      this.props.importSound(player, 'Imported stock sound')
    } else {
      let self = this
      const infolink = '/api/asset/sound/' + soundID
      HTTP.get(infolink, (error, data) => {
        player.src = data.dataUri
        self.props.importSound(player, 'Imported stock sound')
      })
    }
  }

  formatDuration(sec) {
    if (!sec) sec = 1
    sec = Math.round(sec)
    let min = Math.floor(sec / 60) + ''
    if (min.length < 2) min = '0' + min
    sec = sec % 60 + ''
    if (sec.length < 2) sec = '0' + sec
    return min + ':' + sec
  }

  render() {
    let soundItems = _.map(this.state.sounds, (sound, nr) => {
      return (
        <div key={'soundKey_' + sound._id} className="soundWrapper" ref={'soundWave_' + sound._id}>
          <img src={sound.thumbnail} />
          <canvas
            onClick={this.timelineClick.bind(this, sound._id, sound.duration)}
            className="timelineCanvas"
            ref={'timeline_' + sound._id}
          />
          <button onClick={this.togglePlay.bind(this, sound._id)} className="ui icon button">
            <i className={'icon ' + (this.state.playingSoundID === sound._id ? 'pause' : 'play')} />
          </button>
          {sound.name}
          &nbsp;&nbsp; ({this.formatDuration(sound.duration)})
          <audio ref={sound._id} data-id={sound._id} onEnded={this.audioEnded.bind(this)} />
          <button onClick={this.importSound.bind(this, sound._id)} className="ui icon right floated button">
            <i className="add square icon" />
          </button>
        </div>
      )
    })

    return (
      <div className="content">
        <div className="ui action input">
          <input onChange={this.searchOnChange.bind(this)} type="text" placeholder="Sound name..." />
          <button onClick={this.searchOnSubmit.bind(this)} className="ui button">
            Search
          </button>
        </div>

        <div className="ui divider" />

        <div>{soundItems}</div>
        <div>&nbsp;</div>
      </div>
    )
  }
}
