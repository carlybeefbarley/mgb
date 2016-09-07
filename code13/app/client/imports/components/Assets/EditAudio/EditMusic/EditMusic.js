import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import ImportMusic from './ImportMusic.js'
import MusicStock from './MusicStock.js'
import GenerateMusic from './GenerateMusic.js'
import Generate8bit from './Generate8bit.js'

import Channel from './Channel.js'
import lamejs from '../lib/lame.all.js'
import WaveDraw from '../lib/WaveDraw.js'
import AudioConverter from '../lib/AudioConverter.js'
import BrowserCompat from '/client/imports/components/Controls/BrowserCompat'

export default class EditMusic extends React.Component {

  constructor (props) {
    super(props)

    // console.log(props.asset.content2)
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    this.channelsMounted = props.asset.content2.channels ? props.asset.content2.channels.length : 0
    this.areChannelsMounted = props.asset.content2.channels ? false : true
    const pxPerSecond = 30

    this.state = {
      isPlaying: false,
      isLoop: true,
      canvasWidth: pxPerSecond * props.asset.content2.duration + 1, // changing depending on props.duration
      canvasHeight: 128,
      pxPerSecond: pxPerSecond, // defines width of canvass 
      waveColor: '#4dd2ff'
    }
  }

  componentDidMount () {
    this.musicCanvas = ReactDOM.findDOMNode(this.refs.musicCanvas)
    this.musicCtx = this.musicCanvas.getContext('2d')
    this.thumbnailCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
    this.thumbnailCtx = this.thumbnailCanvas.getContext('2d')

    this.timelineCanvas = ReactDOM.findDOMNode(this.refs.timeline)
    this.timelineCtx = this.timelineCanvas.getContext('2d')
    this.drawTimeline()

    // popups references
    this.importMusicPopup = ReactDOM.findDOMNode(this.refs.importMusicPopup)
    this.musicStockPopup = ReactDOM.findDOMNode(this.refs.musicStockPopup)
    this.generateMusicPopup = ReactDOM.findDOMNode(this.refs.generateMusicPopup)
    this.generate8bitPopup = ReactDOM.findDOMNode(this.refs.generate8bitPopup)

    $(this.importMusicPopup)
      .modal('setting', {
        onHide: () => {
          this.stopPopupAudio()
        }
      })

    $(this.generateMusicPopup)
      .modal('setting', {
        onHide: () => {
          this.stopPopupAudio()
        }
      })

    $(this.generate8bitPopup)
      .modal('setting', {
        onHide: () => {
          this.stopPopupAudio()
        }
      })

    this.converter = new AudioConverter(this.audioCtx)
    let c2 = this.props.asset.content2
    if (c2.dataUri) {
      this.converter.dataUriToBuffer(c2.dataUri, this.bufferLoaded.bind(this))
    }

    this.cursor = ReactDOM.findDOMNode(this.refs.cursor)
    this.cursorOffsetX = 200
    this.songTime = 0
    this.splitTime = 0
    // animframe for updating cursor position
    this._raf = () => {
      this.updateTimer()
      window.requestAnimationFrame(this._raf)
    }
    this._raf()
  }

  bufferLoaded (buffer) {
    const data = {
      audioCtx: this.audioCtx,
      duration: this.props.asset.content2.duration,
      canvas: this.musicCanvas,
      color: this.state.waveColor,
      buffer: buffer
    }
    this.waveDraw = new WaveDraw(data)
  }

  componentDidUpdate (prevProps, prevState) {
    // console.log('did update')
    this.drawTimeline()

    if (prevProps.asset.content2.channels) {
      // channel deleted
      if (prevProps.asset.content2.channels.length > this.props.asset.content2.channels.length) {
        this.callChildren('drawWave')
        this.mergeChannels()
      }
      if (prevProps.asset.content2.duration !== this.props.asset.content2.duration) {
        this.updateCanvasLength()
      }
    }
  }

  // checks if all channel are loaded and sets flag to true. After that each newly added channel is automatically merged
  mountChannel () {
    if (this.areChannelsMounted) {
      this.mergeChannels()
    }

    this.channelsMounted--
    if (this.channelsMounted <= 0) {
      this.areChannelsMounted = true
    }
  }

  unMountChannel () {
    this.callChildren('drawWave')
    this.mergeChannels()
  }

  openImportPopup () {
    $(this.importMusicPopup).modal('show')
  }

  importMusic (audioObject, saveText) {
    if (!this.hasPermission) return

    if (audioObject) {
      let c2 = _.cloneDeep(this.props.asset.content2)
      if (!c2.duration || c2.duration < audioObject.duration) {
        c2.duration = audioObject.duration
      }
      this.addChannel(audioObject.src, c2)
    }

    $(this.importMusicPopup).modal('hide')
    $(this.musicStockPopup).modal('hide')
    $(this.generateMusicPopup).modal('hide')
    $(this.generate8bitPopup).modal('hide')
  }

  stopPopupAudio () {
    // console.log("stop popup audio")  
    this.refs.importMusic.stopMusic()
    this.refs.generateMusic.stop()
    this.refs.generate8bit.stop()
  }

  openStockPopup () {
    $(this.musicStockPopup).modal('show')
  }

  openGeneratePopup () {
    $(this.generateMusicPopup).modal('show')
  }

  open8bitPopup () {
    $(this.generate8bitPopup).modal('show')
  }

  getFromStock (audioObject) {
    console.log(audioObject)
  }

  togglePlayMusic () {
    if (this.state.isPlaying) {
      this.audioCtx.suspend()
    } else {
      this.splitTime = Date.now()
      this.audioCtx.resume()
    }
    this.setState({ isPlaying: !this.state.isPlaying })
  }

  stopMusic () {
    this.setState({ isPlaying: false })
    this.audioCtx.suspend()
    this.songTime = 0
    this.updateCursor()
    this.callChildren('initAudio')
  }

  toggleLoop () {
    this.setState({ isLoop: !this.state.isLoop })
  }

  callChildren (func, args) {
    let c2 = this.props.asset.content2
    if (!c2.channels) return
    if (!args) args = []
    c2.channels.forEach((channel, id) => {
      this.refs['channel' + channel.id][func]()
    })
  }

  drawTimeline () {
    this.timelineCtx.clearRect(0, 0, this.state.canvasWidth, 50)
    let c2 = this.props.asset.content2
    if (!c2.duration) return
    let count = Math.floor(c2.duration) + 1
    this.timelineCtx.save()
    this.timelineCtx.strokeStyle = '#333'
    this.timelineCtx.globalAlpha = 0.4
    for (let i = 0; i < count; i++) {
      const x = i * this.state.pxPerSecond + 0.5 // 0.5 for 1px line instead of 2px
      const y = i % 5 == 0 ? 10 : 5
      this.timelineCtx.beginPath()
      this.timelineCtx.moveTo(x, 0)
      this.timelineCtx.lineTo(x, y)
      this.timelineCtx.stroke()
    }
    this.timelineCtx.restore()
  }

  mergeChannels (c2) {
    if (!c2) c2 = _.cloneDeep(this.props.asset.content2)

    let bufferList = []
    c2.channels.forEach((channel, id) => {
      const buffer = this.refs['channel' + channel.id].getBuffer()
      if (buffer && buffer.length > 0) {
        bufferList.push(buffer)
      }
    })

    let buffer = this.converter.mergeBuffers(bufferList, c2.duration)
    this.bufferLoaded(buffer)

    this.converter.bufferToDataUri(buffer, (dataUri) => {
      // console.log(dataUri)
      c2.dataUri = dataUri
      this.handleSave('Merge channels', c2)
    })
  }

  updateTimer () {
    if (this.state.isPlaying) {
      const ms = Date.now()
      // const deltaTime = (date - this.splitTime) * this.speed
      const deltaTime = ms - this.splitTime
      this.songTime += deltaTime
      this.splitTime = ms
      if (this.songTime / 1000 >= this.props.asset.content2.duration) {
        this.stopMusic()
        if (this.state.isLoop) this.togglePlayMusic()
      }
      this.updateCursor()
    }
  }

  updateCursor () {
    const x = this.cursorOffsetX + this.state.pxPerSecond * this.songTime / 1000
    this.cursor.style.left = x + 'px'
  }

  hasPermission () {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return false
    }else {
      return true
    }
  }

  handleSave (saveText, c2) {
    if (!this.hasPermission()) return
    if (!c2) c2 = this.props.asset.content2

    // console.log("SAVE", saveText, c2)
    this.thumbnailCtx.putImageData(this.musicCtx.getImageData(0, 0, 290, 128), 0, 0)
    this.props.handleContentChange(c2, this.thumbnailCanvas.toDataURL('image/png'), saveText)
  }

  changeDuration (e) {
    let c2 = _.cloneDeep(this.props.asset.content2)
    c2.duration = parseFloat(e.target.value)
    this.handleSave('Change duration', c2)
  }

  updateCanvasLength () {
    let c2 = this.props.asset.content2
    let canvasWidth = c2.duration * this.state.pxPerSecond + 1
    this.setState({ canvasWidth: canvasWidth })
  }

  addChannel (dataUri, c2) {
    if (!c2) c2 = _.cloneDeep(this.props.asset.content2)
    if (!c2.channels) c2.channels = []
    c2.channels.push({
      id: Date.now(),
      title: 'Channel ' + c2.channels.length,
      volume: 0.75,
      dataUri: dataUri
    })
    this.handleSave('Add channel', c2)
  }

  deleteChannel (channelID) {
    let c2 = _.cloneDeep(this.props.asset.content2)
    c2.channels.splice(channelID, 1)
    // this.mergeChannels(c2)
    this.handleSave('Remove channel', c2)
  }

  renderChannels () {
    let c2 = this.props.asset.content2
    if (!c2.channels) {
      return (<div>
                No channels added...
              </div>)
    }

    return c2.channels.map((channel, nr) => {
      return (
        <Channel
          key={channel.id}
          id={channel.id}
          nr={nr}
          ref={'channel' + channel.id}
          channel={channel}
          audioCtx={this.audioCtx}
          canvasWidth={this.state.canvasWidth}
          canvasHeight={this.state.canvasHeight}
          pxPerSecond={this.state.pxPerSecond}
          handleSave={this.handleSave.bind(this)}
          deleteChannel={this.deleteChannel.bind(this)}
          mountChannel={this.mountChannel.bind(this)} />
      )})
  }

  render () {
    let c2 = this.props.asset.content2

    return (
      <div className='ui grid'>
        <div className='ui sixteen wide column'>
          <BrowserCompat context='edit.music' />
          {/*** button row ***/}
          <div className='row'>
            <button className='ui small icon button' title='Import sound from your computer' onClick={this.openImportPopup.bind(this)}>
              <i className='add square icon'></i> Import
            </button>
            {/*
                      <button className="ui small icon button"
                        title="Get sound from stock"
                        onClick={this.openStockPopup.bind(this)}>
                        <i className="folder icon"></i> Stock [not ready]
                      </button>
                    */}
            <button className='ui small icon button' title='Generate music (Currently only creates Heavy Metal.. More music styles to follow :)' onClick={this.openGeneratePopup.bind(this)}>
              <i className='options icon'></i> Generate metal music
            </button>
            <button className='ui small icon button' title='Generate music (Currently only creates 8bit music.. More music styles to follow :)' onClick={this.open8bitPopup.bind(this)}>
              <i className='options icon'></i> Generate 8bit music
            </button>
          </div>
          <div className='content'>
            <div>
              <canvas ref='musicCanvas' width={"1200px"} height='128px'></canvas>
            </div>
            <div className='channelsHeader'>
              {/***** Control buttons *****/}
              <div className='row'>
                <button className='ui small icon button' title='Add new audio channel' onClick={this.addChannel.bind(this, null, null)}>
                  <i className='add square icon'></i>
                </button>
                <button title={this.state.isPlaying ? 'Pause channels' : 'Play channels'} className='ui icon button small' onClick={this.togglePlayMusic.bind(this)}>
                  <i className={'icon ' + (this.state.isPlaying ? 'pause' : 'play')}></i>
                </button>
                <button title='Stop channels' className='ui icon button small' onClick={this.stopMusic.bind(this)}>
                  <i className={"icon stop"}></i>
                </button>
                <div className={"ui toggle checkbox "} title='Enable audio looping'>
                  <input type='checkbox' checked={(this.state.isLoop ? 'checked' : '')} onChange={this.toggleLoop.bind(this)} />
                  <label>
                    Loop
                  </label>
                </div>
                &nbsp;
                <div className='ui small labeled input' title='Audio duration'>
                  <div className='ui label'>
                    Duration
                  </div>
                  <input
                    type='number'
                    value={c2.duration ? Math.floor(c2.duration) : 1}
                    min='1'
                    max='999'
                    onChange={this.changeDuration.bind(this)} />
                </div>
              </div>
              <div className='controls'>
              </div>
              <div className='timeline'>
                <canvas ref='timeline' width={this.state.canvasWidth} height='50px'></canvas>
              </div>
            </div>
            <div className='channelList'>
              <div ref='cursor' className='cursor' style={{ left: this.cursorOffsetX + 'px' }}></div>
              {this.renderChannels()}
            </div>
            <canvas
              ref='thumbnailCanvas'
              style={{display: 'none'}}
              width='290px'
              height='128px'></canvas>
          </div>
        </div>
        {/*** POPUPS ***/}
        <div className='ui modal' ref='importMusicPopup'>
          <ImportMusic ref='importMusic' importMusic={this.importMusic.bind(this)} />
        </div>
        <div className='ui modal' ref='musicStockPopup'>
          <MusicStock importMusic={this.importMusic.bind(this)} />
        </div>
        <div className='ui modal generateMusicPopup' ref='generateMusicPopup'>
          <GenerateMusic ref='generateMusic' importMusic={this.importMusic.bind(this)} />
        </div>
        <div className='ui modal generate8bitPopup' ref='generate8bitPopup'>
          <Generate8bit ref='generate8bit' importMusic={this.importMusic.bind(this)} />
        </div>
      </div>
    )
  }
}
