import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import ImportMusic from './ImportMusic.js'
import MusicStock from './MusicStock.js'
import GenerateMusic from './GenerateMusic.js'
import Generate8bit from './Generate8bit.js'

import AudioToolbar from './AudioToolbar.js'
import Preview from './Preview.js'
import Timeline from './Timeline.js'
import Channel from './Channel.js'
import lamejs from '../lib/lame.all.js'
import AudioConverter from '../lib/AudioConverter.js'
import BrowserCompat from '/client/imports/components/Controls/BrowserCompat'
import NumberInput from '/client/imports/components/Controls/NumberInput'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

export default class EditMusic extends React.Component {

  constructor (props) {
    super(props)

    // console.log(props.asset.content2)
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    this.channelsMounted = props.asset.content2.channels ? props.asset.content2.channels.length : 0
    this.areChannelsMounted = props.asset.content2.channels ? false : true
    this.zoomLevels = [8, 15, 30, 60, 120, 200]
    const pxPerSecond = this.zoomLevels[2]

    this.state = {
      isPlaying: false,
      isLoop: true,
      viewWidth: 500, // temporary width
      trackWidth: pxPerSecond * props.asset.content2.duration + 1, // changing depending on props.duration
      canvasHeight: 128,
      pxPerSecond: pxPerSecond, // defines width of canvass 
      waveColor: '#4dd2ff', 
      isDrag: false,
      isSelecting: false,
      selectData: null,
      pasteData: null,
      isPaste: false,
    }


  }

  componentDidMount () {
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
    this.refs.previewComponent.loadDataUri( this.props.asset.content2.dataUri )
    this.setState({ viewWidth: ReactDOM.findDOMNode(this.refs.channelList).offsetWidth - 200 })

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

  componentDidUpdate (prevProps, prevState) {
    // console.log('did update')
    if (prevProps.asset.content2.channels) {
      // channel deleted
      if (prevProps.asset.content2.channels.length > this.props.asset.content2.channels.length) {
        this.callChildren('drawWave')
        this.mergeChannels()
      }
      // if (prevProps.asset.content2.duration !== this.props.asset.content2.duration) {
      //   this.updateCanvasLength()
      // }
    }
  }

  componentWillUnmount () {
    this.stopMusic()
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
    joyrideCompleteTag('mgbjr-CT-editMusic-music-imported')
  }

  stopPopupAudio () {
    // console.log("stop popup audio")  
    if(this.refs.importMusic) this.refs.importMusic.stopMusic()
    if(this.refs.generateMusic) this.refs.generateMusic.stop()
    if(this.refs.generate8bit) this.refs.generate8bit.stop()
  }

  openStockPopup () {
    $(this.musicStockPopup).modal('show')
  }

  openGeneratePopup () {
    $(this.generateMusicPopup).modal('show')
    joyrideCompleteTag('mgbjr-CT-editMusic-generateMetal-invoke')

  }

  open8bitPopup () {
    $(this.generate8bitPopup).modal('show')
    joyrideCompleteTag('mgbjr-CT-editMusic-generate8bit-invoke')
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
    this.callChildren('initAudio', [this.songTime])
    this.audioCtx.suspend()
  }

  setAudioTime (newTime) {
    this.songTime = newTime
    this.callChildren('initAudio', [this.songTime])
    if(this.state.isPlaying) this.audioCtx.resume()
    else this.updateCursor()
  }

  saveChannel (channel) {
    this.callChildren('initAudio', [this.songTime])
    if(this.state.isPlaying) this.audioCtx.resume()
    // updates channel, merge rest of channels and saves to db
    let c2 = _.cloneDeep(this.props.asset.content2)
    let nr = _.findIndex(c2.channels, (a) => a.id == channel.id)
    c2.channels[nr] = channel
    this.mergeChannels(c2)
  }

  toggleLoop () {
    this.setState({ isLoop: !this.state.isLoop })
  }

  callChildren (func, args) {
    let c2 = this.props.asset.content2
    if (!c2.channels) return
    if (!args) args = []
    c2.channels.forEach((channel, id) => {
      if(!this.refs['channel' + channel.id]) return false
      this.refs['channel' + channel.id][func](...args)
    })
  }

  mergeChannels (c2, saveText="Merge channels") {
    if (!c2) c2 = _.cloneDeep(this.props.asset.content2)

    let bufferList = []
    c2.channels.forEach((channel, id) => {
      const buffer = this.refs['channel' + channel.id].getBuffer()
      if (buffer && buffer.length > 0) {
        bufferList.push(buffer)
      }
    })

    let buffer = this.converter.mergeBuffers(bufferList, c2.duration)
    this.refs.previewComponent.loadBuffer(buffer)

    this.converter.bufferToDataUri(buffer, (dataUri) => {
      // console.log(dataUri)
      c2.dataUri = dataUri
      this.handleSave(saveText, c2)
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
      if(this.refs.previewComponent) this.refs.previewComponent.update(this.songTime)
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
    const thumbnail = this.refs.previewComponent.getThumbnail()
    this.props.handleContentChange(c2, thumbnail, saveText)
  }

  changeDuration (newDuration) {
    let c2 = _.cloneDeep(this.props.asset.content2)
    c2.duration = newDuration
    // this.handleSave('Change duration', c2)
    this.mergeChannels(c2, "Change duration")
  }

  // updateCanvasLength () {
  //   let c2 = this.props.asset.content2
  //   let viewWidth = c2.duration * this.state.pxPerSecond + 1
  //   this.setState({ viewWidth: viewWidth })
  //   this.callChildren("drawWave")
  // }

  zoom (zoomIn) { // boolean zoomIn or zoomOut
    let i = this.zoomLevels.indexOf(this.state.pxPerSecond)
    // zooming in
    if(zoomIn && i < this.zoomLevels.length-1){
      i++
      this.setState({ pxPerSecond: this.zoomLevels[i]})
    }
    // zooming out
    else if(!zoomIn && i > 0){
      i--
      this.setState({ pxPerSecond: this.zoomLevels[i] })
    }
  }

  setViewOffset (seconds) {
    this.refs.timelineComponent.setViewOffset(seconds)
    this.callChildren("setViewOffset", [seconds])
  }

  clearSelection () {
    let c2 = this.props.asset.content2
    if(this.state.isSelecting && c2.channels){  // unselect all selections
      c2.channels.forEach((channel) => {
        this.refs["channel"+channel.id].clearSelect()
      })
      this.setState({ selectData: null })
    }
  }

  setSelected (channelID, selectStart, selectDuration) { // in sec
    this.setState({
      selectData: {
        channelID: channelID,
        selectStart: selectStart,
        selectDuration: selectDuration,
      }
    })

    let c2 = this.props.asset.content2
    c2.channels.forEach((channel) => {
      if(channel.id !== channelID){
        this.refs["channel"+channel.id].clearSelect()
      }
    })
  }

  cutSelected () {
    if(!this.state.selectData){
      console.log("Something wrong with selecting")
      return
    }

    this.copySelected()
    const sData = this.state.selectData
    this.refs["channel"+sData.channelID].clearBufferPart(sData.selectStart, sData.selectDuration)
  }

  copySelected () {
    if(!this.state.selectData){
      console.log("Something wrong with selecting")
      return
    }

    const sData = this.state.selectData
    const selectBuffer = this.refs["channel"+sData.channelID].getSelectBuffer(sData.selectStart, sData.selectDuration)
    this.setState({ pasteData: selectBuffer })
  }

  eraseSelected () {
    if(!this.state.selectData){
      console.log("Something wrong with selecting")
      return
    }

    const sData = this.state.selectData
    this.refs["channel"+sData.channelID].eraseBufferPart(sData.selectStart, sData.selectDuration)
  }

  selectableButtons (button) {
    this.clearSelection()
    let newState = {}
    const buttonArr = ['isDrag', 'isSelecting', 'isPaste']
    buttonArr.forEach((key) => {
      newState[key] = key === button ? !this.state[key] : false
    })
    this.setState(newState)
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
          duration={c2.duration}
          channel={channel}
          audioCtx={this.audioCtx}
          viewWidth={this.state.viewWidth}
          canvasHeight={this.state.canvasHeight}
          pxPerSecond={this.state.pxPerSecond}
          isDrag={this.state.isDrag}
          isSelecting={this.state.isSelecting}
          isPaste={this.state.isPaste}
          pasteData={this.state.pasteData}

          handleSave={this.handleSave.bind(this)}
          saveChannel={this.saveChannel.bind(this)}
          setAudioTime={this.setAudioTime.bind(this)}
          deleteChannel={this.deleteChannel.bind(this)}
          mountChannel={this.mountChannel.bind(this)}
          setSelected={this.setSelected.bind(this)}
        />
      )})
  }

  render () {
    let c2 = this.props.asset.content2
    let zoomInd = this.zoomLevels.indexOf(this.state.pxPerSecond)

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
            <button 
              id="mgbjr-musicEditor-generateMetal-button"
              className='ui small icon button' title='Generate music (Currently only creates Heavy Metal.. More music styles to follow :)' 
              onClick={this.openGeneratePopup.bind(this)}>
              <i className='options icon'></i> Generate metal music
            </button>
            <button 
              id="mgbjr-musicEditor-generate8bit-button"
              className='ui small icon button' title='Generate music (Currently only creates 8bit music.. More music styles to follow :)' 
              onClick={this.open8bitPopup.bind(this)}>
              <i className='options icon'></i> Generate 8bit music
            </button>

            <div className='ui small labeled input' title='Audio duration'>
              <div className='ui label'>
                Duration
              </div>
              <NumberInput
                className="ui small input"
                min={1}
                max={999}
                style={{width: "6em"}}
                value={c2.duration ? Math.floor(c2.duration) : 1}
                onFinalChange={(num) => {this.changeDuration(num)} }
              />
            </div>

          </div>
          <div className='content'>

            <Preview
              ref="previewComponent"
              audioCtx={this.audioCtx}
              duration={c2.duration}
              waveColor={this.state.waveColor}
              pxPerSecond={this.state.pxPerSecond}
              viewWidth={this.state.viewWidth}
              setViewOffset={this.setViewOffset.bind(this)}

            />
            
            <div className='channelsHeader'>

              <AudioToolbar
                isPlaying={this.state.isPlaying}
                selectData={this.state.selectData}
                pasteData={this.state.pasteData}
                isLoop={this.state.isLoop}

                isDrag={this.state.isDrag}
                isSelecting={this.state.isSelecting}
                isPaste={this.state.isPaste}

                addChannel={this.addChannel.bind(this)}
                togglePlayMusic={this.togglePlayMusic.bind(this)}
                stopMusic={this.stopMusic.bind(this)}
                toggleLoop={this.toggleLoop.bind(this)}
                zoom={this.zoom.bind(this)}
                eraseSelected={this.eraseSelected.bind(this)}
                cutSelected={this.cutSelected.bind(this)}
                copySelected={this.copySelected.bind(this)}
                selectableButtons={this.selectableButtons.bind(this)}
              />


              <div className='controls'>
              </div>
              
              <Timeline
                ref="timelineComponent"
                duration={c2.duration}
                viewWidth={this.state.viewWidth}
                pxPerSecond={this.state.pxPerSecond}
              />

            </div>
            <div className='channelList' ref="channelList">
              <div ref='cursor' className='cursor' style={{ left: this.cursorOffsetX + 'px' }}></div>
              {this.renderChannels()}
            </div>
          </div>
        </div>
        {/*** POPUPS ***/}
        <div className='ui modal' ref='importMusicPopup'>
          <ImportMusic ref='importMusic' importMusic={this.importMusic.bind(this)} />
        </div>
        <div className='ui modal' ref='musicStockPopup'>
          <MusicStock importMusic={this.importMusic.bind(this)} />
        </div>
        <div className='ui modal generateMusicPopup' 
          ref='generateMusicPopup'>
          <GenerateMusic ref='generateMusic' importMusic={this.importMusic.bind(this)} />
        </div>
        <div
          className='ui modal generate8bitPopup' 
          ref='generate8bitPopup'  style={{minWidth:"860px"}}>
          <Generate8bit ref='generate8bit' importMusic={this.importMusic.bind(this)} />
        </div>
      </div>
    )
  }
}
