import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'
import { Modal } from 'semantic-ui-react'

import ImportMusic from './ImportMusic'
import MusicStock from './MusicStock'
import GenerateMusic from './GenerateMusic'
import Generate8bit from './Generate8bit'

import AudioToolbar from './AudioToolbar'
import Preview from './Preview'
import Timeline from './Timeline'
import Channel from './Channel'
import lamejs from '../lib/lame.all'
import AudioConverter from '../lib/AudioConverter'
import NumberInput from '/client/imports/components/Controls/NumberInput'
import { joyrideStore } from '/client/imports/stores'
import { showToast } from '/client/imports/modules'

export default class EditMusic extends React.Component {
  constructor(props) {
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
      pxPerSecond, // defines width of canvass
      waveColor: '#4dd2ff',
      isDrag: false,
      isSelecting: false,
      selectData: null,
      pasteData: null,
      isPaste: false,
    }
  }

  componentDidMount() {
    this.converter = new AudioConverter(this.audioCtx)
    this.refs.previewComponent.loadDataUri(this.props.asset.content2.dataUri)
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

  componentDidUpdate(prevProps, prevState) {
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

  componentWillUnmount() {
    this._raf = () => {}
    this.stopMusic()
  }

  // checks if all channel are loaded and sets flag to true. After that each newly added channel is automatically merged
  mountChannel = () => {
    if (this.areChannelsMounted) {
      this.mergeChannels()
    }

    this.channelsMounted--
    if (this.channelsMounted <= 0) {
      this.areChannelsMounted = true
    }
  }

  unMountChannel = () => {
    this.callChildren('drawWave')
    this.mergeChannels()
  }

  openImportPopup = () => this.setState({ isImportMusicPopupOpen: true })

  importMusic = (audioObject, saveText) => {
    if (!this.hasPermission()) {
      showToast.error("You don't have write access to this Asset")
      return false
    }

    if (audioObject) {
      const c2 = _.cloneDeep(this.props.asset.content2)
      if (!c2.duration || c2.duration < audioObject.duration) {
        c2.duration = audioObject.duration
      }
      this.addChannel(audioObject.src, c2)
    }

    this.closeAllModals()

    joyrideStore.completeTag('mgbjr-CT-editMusic-music-imported')
  }

  closeAllModals = () => {
    // Heads up!
    // 'Stop' works via DOM refs.  Stop music before closing Modals and removing DOM nodes.
    if (this.refs.importMusic) this.refs.importMusic.stopMusic()
    if (this.refs.generateMusic) this.refs.generateMusic.stop()
    if (this.refs.generate8bit) this.refs.generate8bit.stop()

    this.setState({
      isImportMusicPopupOpen: false,
      isMusicStockPopupOpen: false,
      isGenerateMusicPopupOpen: false,
      isGenerate8bitPopupOpen: false,
    })
  }

  handleModalClose = () => {
    this.closeAllModals()
  }

  openStockPopup = () => {
    this.setState({ isMusicStockPopupOpen: true })
  }

  openGeneratePopup = () => {
    this.setState({ isGenerateMusicPopupOpen: true })
    joyrideStore.completeTag('mgbjr-CT-editMusic-generateMetal-invoke')
  }

  open8bitPopup = () => {
    this.setState({ isGenerate8bitPopupOpen: true })
    joyrideStore.completeTag('mgbjr-CT-editMusic-generate8bit-invoke')
  }

  togglePlayMusic = () => {
    if (this.state.isPlaying) {
      this.audioCtx.suspend()
    } else {
      this.splitTime = Date.now()
      this.audioCtx.resume()
    }
    this.setState({ isPlaying: !this.state.isPlaying })
  }

  stopMusic = () => {
    this.setState({ isPlaying: false })
    this.audioCtx.suspend()
    this.songTime = 0
    this.updateCursor()
    this.callChildren('initAudio', [this.songTime])
    this.audioCtx.suspend()
  }

  setAudioTime = newTime => {
    this.songTime = newTime
    this.callChildren('initAudio', [this.songTime])
    if (this.state.isPlaying) this.audioCtx.resume()
    else this.updateCursor()
  }

  saveChannel = channel => {
    console.log('save channel')
    this.callChildren('initAudio', [this.songTime])
    if (this.state.isPlaying) this.audioCtx.resume()
    // updates channel, merge rest of channels and saves to db
    let c2 = _.cloneDeep(this.props.asset.content2)
    let nr = _.findIndex(c2.channels, a => a.id == channel.id)
    c2.channels[nr] = channel
    this.mergeChannels(c2)
    console.log('channel saved')
  }

  toggleLoop = () => {
    this.setState({ isLoop: !this.state.isLoop })
  }

  callChildren = (func, args) => {
    let c2 = this.props.asset.content2
    if (!c2.channels) return
    if (!args) args = []
    c2.channels.forEach((channel, id) => {
      if (!this.refs['channel' + channel.id]) return false
      this.refs['channel' + channel.id][func](...args)
    })
  }

  mergeChannels = (c2, saveText = 'Merge channels') => {
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

    this.converter.bufferToDataUri(buffer, dataUri => {
      // console.log(dataUri)
      c2.dataUri = dataUri
      this.handleSave(saveText, c2)
    })
  }

  updateTimer = () => {
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
      if (this.refs.previewComponent) this.refs.previewComponent.update(this.songTime)
    }
  }

  updateCursor = () => {
    const x = this.cursorOffsetX + this.state.pxPerSecond * this.songTime / 1000
    this.cursor.style.left = x + 'px'
  }

  hasPermission = () => {
    if (!this.props.canEdit) {
      // this.props.editDeniedReminder()
      return false
    } else {
      return true
    }
  }

  handleSave = (saveText, c2) => {
    if (!this.hasPermission()) {
      showToast.error("You don't have write access to this Asset")
      return false
    }
    if (!c2) c2 = this.props.asset.content2

    // console.log("SAVE", saveText, c2)
    const thumbnail = this.refs.previewComponent.getThumbnail()
    this.props.handleContentChange(c2, thumbnail, saveText)
  }

  changeDuration = newDuration => {
    let c2 = _.cloneDeep(this.props.asset.content2)
    c2.duration = newDuration
    // this.handleSave('Change duration', c2)
    this.mergeChannels(c2, 'Change duration')
    this.doSaveStateForUndo('Change duration')
  }

  // updateCanvasLength = () => {
  //   console.log('updateCanvasLength')
  //   let c2 = this.props.asset.content2
  //   let viewWidth = c2.duration * this.state.pxPerSecond + 1
  //   this.setState({ viewWidth })
  //   this.callChildren('drawWave')
  // }

  zoom = zoomIn => {
    const { pxPerSecond } = this.state

    // boolean zoomIn or zoomOut
    const level = this.zoomLevels.indexOf(pxPerSecond)

    // zoom in
    if (zoomIn && level < this.zoomLevels.length - 1) {
      this.setState({ pxPerSecond: this.zoomLevels[level + 1] })
      return
    }

    // zoom out
    if (!zoomIn && level > 0) {
      this.setState({ pxPerSecond: this.zoomLevels[level - 1] })
      return
    }
  }

  setViewOffset = seconds => {
    this.refs.timelineComponent.setViewOffset(seconds)
    this.callChildren('setViewOffset', [seconds])
  }

  clearSelection = () => {
    let c2 = this.props.asset.content2
    if (this.state.isSelecting && c2.channels) {
      // unselect all selections
      c2.channels.forEach(channel => {
        this.refs['channel' + channel.id].clearSelect()
      })
      this.setState({ selectData: null })
    }
  }

  setSelected = (channelID, selectStart, selectDuration) => {
    // in sec
    this.setState({
      selectData: {
        channelID,
        selectStart,
        selectDuration,
      },
    })

    let c2 = this.props.asset.content2
    c2.channels.forEach(channel => {
      if (channel.id !== channelID) {
        this.refs['channel' + channel.id].clearSelect()
      }
    })
  }

  cutSelected = () => {
    if (!this.state.selectData) {
      console.log('Something wrong with selecting')
      return
    }

    this.copySelected()
    const sData = this.state.selectData
    this.refs['channel' + sData.channelID].clearBufferPart(sData.selectStart, sData.selectDuration)
    this.doSaveStateForUndo('Cut selected')
  }

  copySelected = () => {
    if (!this.state.selectData) {
      console.log('Something wrong with selecting')
      return
    }

    const sData = this.state.selectData
    const selectBuffer = this.refs['channel' + sData.channelID].getSelectBuffer(
      sData.selectStart,
      sData.selectDuration,
    )
    this.setState({ pasteData: selectBuffer })
  }

  eraseSelected = () => {
    if (!this.state.selectData) {
      console.log('Something wrong with selecting')
      return
    }

    const sData = this.state.selectData
    this.refs['channel' + sData.channelID].eraseBufferPart(sData.selectStart, sData.selectDuration)
    this.doSaveStateForUndo('Erase selected')
  }

  selectableButtons = button => {
    this.clearSelection()
    let newState = {}
    const buttonArr = ['isDrag', 'isSelecting', 'isPaste']
    buttonArr.forEach(key => {
      newState[key] = key === button ? !this.state[key] : false
    })
    this.setState(newState)
  }

  addChannel = (dataUri, c2) => {
    if (!c2) c2 = _.cloneDeep(this.props.asset.content2)
    if (!c2.channels) c2.channels = []
    c2.channels.push({
      id: Date.now(),
      title: 'Channel ' + c2.channels.length,
      volume: 0.75,
      dataUri,
    })
    this.handleSave('Add channel', c2)
    this.doSaveStateForUndo('Add channel')
  }

  deleteChannel = channelID => {
    let c2 = _.cloneDeep(this.props.asset.content2)
    c2.channels.splice(channelID, 1)
    // this.mergeChannels(c2)
    this.handleSave('Remove channel', c2)
    this.doSaveStateForUndo('Remove channel')
  }

  // useful for undo and redo
  forceDraw = newC2 => {
    let channels = this.props.asset.content2.channels
    if (newC2.channels.length != channels.length) return false

    channels.forEach((channel, id) => {
      this.refs['channel' + channel.id].forceDraw(newC2.channels[id])
    })
  }

  handleUndo = () => {
    if (this.undoSteps.length > 0) {
      let zombie = this.undoSteps.pop()
      let c2 = zombie.savedContent2

      this.doSaveStateForRedo('Redo changes')
      this.handleSave('Undo changes', c2)
      this.forceDraw(c2)
    }
  }

  handleRedo = () => {
    if (this.redoSteps.length > 0) {
      let zombie = this.redoSteps.pop()
      let c2 = zombie.savedContent2

      this.doSaveStateForUndo('Undo changes')
      this.handleSave('Redo changes', c2)
      this.forceDraw(c2)
    }
  }

  initDefaultUndoStack = () => {
    // undoSteps will be an array of
    //   {
    //      when:           Date.now() of when it was added to the stack
    //      byUserName      username who made the change
    //      byUserContext   Where the user made the change (IP address etc)
    //      changeInfo      The change - for example 'Deleted frame'
    //      savedContent2   The saved data
    //    }
    //
    // Oldest items will be at index=0 in array

    if (this.hasOwnProperty('undoSteps') === false) this.undoSteps = []

    if (this.hasOwnProperty('redoSteps') === false) this.redoSteps = []
  }

  doMakeUndoStackEntry = changeInfoString => {
    return {
      when: Date.now(),
      byUserName: 'usernameTODO', // TODO
      byUserContext: 'someMachineTODO', // TODO
      changeInfo: changeInfoString,
      savedContent2: _.cloneDeep(this.props.asset.content2),
    }
  }

  doTrimUndoStack = () => {
    let u = this.undoSteps
    if (u.length > 20) u.shift() // Remove 0th element (which is the oldest)
  }

  doSaveStateForUndo = changeInfoString => {
    this.doTrimUndoStack()
    this.undoSteps.push(this.doMakeUndoStackEntry(changeInfoString))
  }

  doTrimRedoStack = () => {
    if (this.redoSteps.length > 20) this.redoSteps.shift()
  }

  doSaveStateForRedo = changeInfoString => {
    this.doTrimRedoStack()
    this.redoSteps.push(this.doMakeUndoStackEntry(changeInfoString))
  }

  renderChannels = () => {
    let c2 = this.props.asset.content2
    if (!c2.channels) {
      return <div>No channels added...</div>
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
          handleSave={this.handleSave}
          doSaveStateForUndo={this.doSaveStateForUndo}
          saveChannel={this.saveChannel}
          setAudioTime={this.setAudioTime}
          deleteChannel={this.deleteChannel}
          mountChannel={this.mountChannel}
          setSelected={this.setSelected}
        />
      )
    })
  }

  render() {
    this.initDefaultUndoStack()
    const c2 = this.props.asset.content2

    const {
      isDrag,
      isLoop,
      isGenerate8bitPopupOpen,
      isGenerateMusicPopupOpen,
      isImportMusicPopupOpen,
      isMusicStockPopupOpen,
      isPaste,
      isPlaying,
      isSelecting,
      pasteData,
      pxPerSecond,
      selectData,
      viewWidth,
      waveColor,
    } = this.state

    return (
      <div className="ui grid">
        <div className="ui sixteen wide column">
          {/*** button row ***/}
          <div className="row">
            <button
              className="ui small icon button"
              title="Import sound from your computer"
              onClick={this.openImportPopup}
            >
              <i className="add square icon" /> Import
            </button>
            {/*
              <button className="ui small icon button"
                title="Get sound from stock"
                onClick={this.openStockPopup}>
                <i className="folder icon"></i> Stock [not ready]
              </button>
            */}
            <button
              id="mgbjr-musicEditor-generateMetal-button"
              className="ui small icon button"
              title="Generate music (Currently only creates Heavy Metal.. More music styles to follow :)"
              onClick={this.openGeneratePopup}
            >
              <i className="options icon" /> Generate metal music
            </button>
            <button
              id="mgbjr-musicEditor-generate8bit-button"
              className="ui small icon button"
              title="Generate music (Currently only creates 8bit music.. More music styles to follow :)"
              onClick={this.open8bitPopup}
            >
              <i className="options icon" /> Generate 8bit music
            </button>

            <div className="ui small labeled input" title="Audio duration">
              <div className="ui label">Duration</div>
              <NumberInput
                className="ui small input"
                min={1}
                max={999}
                style={{ width: '6em' }}
                value={c2.duration ? Math.floor(c2.duration) : 1}
                onFinalChange={this.changeDuration}
              />
            </div>
          </div>
          <div className="content">
            <Preview
              ref="previewComponent"
              audioCtx={this.audioCtx}
              duration={c2.duration}
              waveColor={waveColor}
              pxPerSecond={pxPerSecond}
              viewWidth={viewWidth}
              setViewOffset={this.setViewOffset}
            />

            <div className="channelsHeader">
              <AudioToolbar
                isPlaying={isPlaying}
                selectData={selectData}
                pasteData={pasteData}
                isLoop={isLoop}
                undoSteps={this.undoSteps}
                redoSteps={this.redoSteps}
                isDrag={isDrag}
                isSelecting={isSelecting}
                isPaste={isPaste}
                addChannel={this.addChannel}
                togglePlayMusic={this.togglePlayMusic}
                stopMusic={this.stopMusic}
                toggleLoop={this.toggleLoop}
                handleUndo={this.handleUndo}
                handleRedo={this.handleRedo}
                zoom={this.zoom}
                eraseSelected={this.eraseSelected}
                cutSelected={this.cutSelected}
                copySelected={this.copySelected}
                selectableButtons={this.selectableButtons}
                hasPermission={this.hasPermission}
              />

              <div className="controls" />

              <Timeline
                ref="timelineComponent"
                duration={c2.duration}
                viewWidth={viewWidth}
                pxPerSecond={pxPerSecond}
              />
            </div>
            <div className="channelList" ref="channelList">
              <div ref="cursor" className="cursor" style={{ left: this.cursorOffsetX + 'px' }} />
              {this.renderChannels()}
            </div>
          </div>
        </div>
        {/*** POPUPS ***/}
        <Modal open={isImportMusicPopupOpen} onClose={this.handleModalClose}>
          <ImportMusic ref="importMusic" importMusic={this.importMusic} />
        </Modal>
        <Modal open={isMusicStockPopupOpen}>
          <MusicStock importMusic={this.importMusic} />
        </Modal>
        <Modal open={isGenerateMusicPopupOpen} onClose={this.handleModalClose} className="generateMusicPopup">
          <GenerateMusic ref="generateMusic" importMusic={this.importMusic} />
        </Modal>
        <Modal
          open={isGenerate8bitPopupOpen}
          onClose={this.handleModalClose}
          className="generate8bitPopup"
          style={{ minWidth: '860px' }}
        >
          <Generate8bit ref="generate8bit" importMusic={this.importMusic} />
        </Modal>
      </div>
    )
  }
}
