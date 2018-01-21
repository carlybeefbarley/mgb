import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import './editMusic.css'
import VolumeSlider from './VolumeSlider.js'

import WaveSurfer from '../lib/WaveSurfer.js'
import AudioConverter from '../lib/AudioConverter.js'

export default class Channel extends React.Component {
  constructor(props) {
    super(props)
    // console.log(props)

    this.state = {}

    this.sample = {
      duration: 0,
      delay: props.channel.delay || 0, // in sec
      offsetX: this.calculateOffsetX(),
    }

    this.dragStartX = 0
    this.viewOffset = 0 // in sec

    this.selectX = 0 // px
    this.selectWidth = 0 // px
    // this.selectStart = 0  // in ms
    // this.selectDuration = 0 // in ms
  }

  componentDidMount() {
    this.converter = new AudioConverter(this.props.audioCtx)
    this.waveCanvas = ReactDOM.findDOMNode(this.refs.waveCanvas)
    this.waveCtx = this.waveCanvas.getContext('2d')
    this.pasteCanvas = ReactDOM.findDOMNode(this.refs.pasteCanvas)
    this.pasteCtx = this.pasteCanvas.getContext('2d')
    this.selectDiv = ReactDOM.findDOMNode(this.refs.selectDiv)
    this.initWave()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.buffer) {
      if (this.props.viewWidth !== prevProps.viewWidth) {
        this.drawWave()
      }
      if (this.props.pxPerSecond !== prevProps.pxPerSecond) {
        this.sample.offsetX = this.calculateOffsetX()
        this.drawWave()
      }
    }
  }

  getBuffer = () => {
    if (!this.buffer) return null
    const bufferLength = Math.round(this.props.duration * this.props.audioCtx.sampleRate)
    const delayLength = Math.round(this.sample.delay * this.props.audioCtx.sampleRate)
    // console.log(bufferLength, delayLength)
    let returnBuffer = new Float32Array(bufferLength)
    const channelData = this.buffer.getChannelData(0)
    let i = delayLength < 0 ? Math.abs(delayLength) : 0
    const maxInd =
      delayLength + channelData.length > bufferLength ? bufferLength - delayLength : channelData.length
    let returnInd = delayLength < 0 ? 0 : delayLength
    for (; i < maxInd; i++, returnInd++) {
      returnBuffer[returnInd] = channelData[i]
    }
    return returnBuffer
  }

  getSelectBuffer = (selectStart, selectDuration) => {
    // in sec
    let bufferLength = Math.round(selectDuration * this.props.audioCtx.sampleRate)
    let selectBuffer = new Float32Array(bufferLength)
    if (!this.buffer) return selectBuffer
    let sampleInd = this.sample.delay < selectStart ? selectStart - this.sample.delay : 0
    sampleInd = Math.round(sampleInd * this.props.audioCtx.sampleRate)
    let startInd = this.sample.delay < selectStart ? 0 : this.sample.delay - selectStart
    startInd = Math.round(startInd * this.props.audioCtx.sampleRate)
    if (startInd > bufferLength || this.sample.delay + this.sample.duration < selectStart) return selectBuffer // sample out of selection
    const channelData = this.buffer.getChannelData(0)
    for (let i = startInd; i < bufferLength; i++, sampleInd++) {
      if (channelData.length > sampleInd) {
        selectBuffer[i] = channelData[sampleInd]
      }
    }
    return selectBuffer
  }

  forceDraw = channel => {
    this.initWave(channel)
  }

  initWave = channel => {
    channel = channel || this.props.channel
    if (!channel.dataUri) return

    const soundBlob = this.dataURItoBlob(channel.dataUri)
    let reader = new FileReader()
    reader.onload = e => {
      let audioData = e.target.result
      this.props.audioCtx.decodeAudioData(audioData, audioBuffer => {
        this.buffer = audioBuffer
        this.initAudio()
        this.drawWave()
        this.props.mountChannel()
      })
    }
    reader.readAsArrayBuffer(soundBlob)
  }

  initAudio = (songTime = 0) => {
    if (!this.buffer) return
    this.clearAudio()
    this.sample.duration = Math.round(this.buffer.length / this.props.audioCtx.sampleRate)
    this.source = this.props.audioCtx.createBufferSource()
    this.gainNode = this.props.audioCtx.createGain()

    this.source.buffer = this.buffer
    this.source.playbackRate.value = 1
    this.source.connect(this.gainNode)
    this.gainNode.connect(this.props.audioCtx.destination)
    this.gainNode.gain.value = this.props.channel.volume

    let startTime = 0
    let delay = this.sample.delay - songTime / 1000
    if (delay < 0) {
      startTime = Math.abs(delay)
      delay = 0
    }
    this.source.start(this.props.audioCtx.currentTime + delay, startTime) // delay, startTime
    this.props.audioCtx.suspend()

    // setTimeout( () => {
    // if((this.source.playbackState === this.source.PLAYING_STATE || this.source.playbackState === this.source.FINISHED_STATE)) {
    //         // console.log("source unlocked")
    //         } else {
    //             console.warn("audio source LOCKED", this.source)
    //             // this.source.start(0, 0)
    //         }
    //     }, 0)
  }

  clearAudio = () => {
    if (this.source) {
      this.source.stop()
      this.source.disconnect(0)
    }
    if (this.gainNode) this.gainNode.disconnect(0)
  }

  calculateOffsetX = () => {
    return (this.props.channel.delay || 0) * this.props.pxPerSecond
  }

  drawWave = () => {
    this.waveCtx.clearRect(0, 0, this.props.viewWidth, this.props.canvasHeight)
    this.drawTimeline()
    this.drawSampleBG()
    if (!this.buffer) return // in situations when audio is not decoded yet
    const sampleWidth = Math.floor(this.sample.duration * this.props.pxPerSecond)
    const channelData = this.buffer.getChannelData(0)
    const chunk = Math.floor(channelData.length / sampleWidth)
    let subChunk = 10
    if (this.props.pxPerSecond > 60) subChunk = 3
    const subChunkVal = Math.floor(chunk / subChunk)
    const viewOffsetX = this.viewOffset * this.props.pxPerSecond
    // startX and endX draws only visible wave for sake of optimization
    let startX = Math.round(viewOffsetX - this.sample.offsetX)
    let endX = sampleWidth
    if (startX > sampleWidth) return false // no need to draw because outside of view on left side
    if (startX < 0) {
      if (Math.abs(startX) > this.props.viewWidth) return false // no draw because outside on right side
      endX = Math.round(this.props.viewWidth + startX)
      if (endX > sampleWidth) endX = sampleWidth
      startX = 0
    } else {
      endX = Math.round(this.props.viewWidth + startX)
      if (endX > sampleWidth) endX = sampleWidth
    }

    this.waveCtx.save()
    this.waveCtx.strokeStyle = '#4dd2ff'
    this.waveCtx.globalAlpha = 0.4
    // let count = 0
    const y = this.props.canvasHeight / 2
    for (let i = startX; i < endX; i++) {
      for (let j = 0; j < subChunk; j++) {
        const val = channelData[i * chunk + j * subChunkVal]
        // const x = i+j*(1/subChunk)
        const x = i + this.sample.offsetX - viewOffsetX
        this.waveCtx.beginPath()
        this.waveCtx.moveTo(x, y)
        this.waveCtx.lineTo(x, y + val * y)
        this.waveCtx.stroke()
        // count++
      }
    }
    // console.log(count, startX, endX)
    this.waveCtx.restore()
  }

  setViewOffset = seconds => {
    this.viewOffset = seconds
    this.drawWave()
  }

  drawSampleBG = () => {
    this.waveCtx.save()
    this.waveCtx.globalAlpha = 0.2
    this.waveCtx.fillStyle = '#4dd2ff'
    const viewOffsetX = this.viewOffset * this.props.pxPerSecond
    const width = this.sample.duration * this.props.pxPerSecond
    this.waveCtx.fillRect(this.sample.offsetX - viewOffsetX, 0, width, this.props.canvasHeight)
    this.waveCtx.restore()
  }

  drawTimeline = () => {
    let count = Math.floor(this.props.duration) + 1
    const viewOffsetX = this.viewOffset * this.props.pxPerSecond
    this.waveCtx.save()
    this.waveCtx.strokeStyle = '#333'
    this.waveCtx.globalAlpha = 0.2
    // console.log('timeline count', count, this.props.duration)
    for (let i = 0; i < count; i++) {
      const x = i * this.props.pxPerSecond + 0.5 // 0.5 for 1px line instead of 2px
      this.waveCtx.beginPath()
      this.waveCtx.moveTo(x - viewOffsetX, 0)
      this.waveCtx.lineTo(x - viewOffsetX, this.props.canvasHeight)
      this.waveCtx.stroke()
    }
    this.waveCtx.restore()
  }

  dataURItoBlob = dataURI => {
    var byteString = atob(dataURI.split(',')[1])
    var mimeString = dataURI
      .split(',')[0]
      .split(':')[1]
      .split(';')[0]
    var ab = new ArrayBuffer(byteString.length)
    var ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    var blob = new Blob([ab], { type: mimeString })
    return blob
  }

  onClick = e => {
    // paste sample
    if (this.props.isPaste) {
      this.pasteSample(e)
    } else {
      // set cursor
      let canvasX = this.waveCanvas.getBoundingClientRect().left
      let cursorX = e.clientX - canvasX
      let newTime = Math.round(cursorX / this.props.pxPerSecond * 1000)
      this.props.setAudioTime(newTime)
    }
  }

  onDragStart = e => {
    if (e.touches && e.touches[0]) e = e.touches[0]

    e.dataTransfer.setData('text', 'startDrag')

    // firefox way of implementing dragover. actually chrome also can work that way
    document.ondragover = event => this.onDrag(event)

    // empty image so you don't see canvas element drag. Need to see only what is dragged inside canvas
    // guntis - commented this out because it showed some weird icon in firefox
    // if(e.dataTransfer){
    //   let ghost = e.target.cloneNode(true)
    //   ghost.style.display = "none"
    //   e.dataTransfer.setDragImage(ghost, 0, 0)
    // }
    if (this.props.isSelecting) {
      this.clearSelect()
    }
    this.dragStartX = e.clientX
  }

  onDrag = e => {
    if (e.touches && e.touches[0]) e = e.touches[0]

    if (e.clientX == 0 && e.clientY == 0) return // avoiding weird glitch when at the end of drag 0,0 coords returned

    // drag select
    if (this.props.isSelecting) {
      const canvasX = this.waveCanvas.getBoundingClientRect().left
      if (e.clientX > this.dragStartX) {
        this.selectX = this.dragStartX - canvasX
        this.selectWidth = e.clientX - this.dragStartX
      } else {
        this.selectX = e.clientX - canvasX
        this.selectWidth = this.dragStartX - e.clientX
      }
      if (this.selectX < 0) this.selectX = 0
      if (this.selectWidth > this.props.viewWidth) this.selectWidth = this.props.viewWidth
      this.drawSelect()
    } else if (this.props.isDrag) {
      // drag sample
      const deltaX = e.clientX - this.dragStartX
      this.sample.offsetX += deltaX
      this.dragStartX = e.clientX
      this.drawWave()
    }
  }

  onDragEnd = e => {
    if (e.touches && e.touches[0]) e = e.touches[0]

    // selecting
    if (this.props.isSelecting) {
      const viewOffsetX = this.viewOffset * this.props.pxPerSecond
      let selectStart = (this.selectX + viewOffsetX) / this.props.pxPerSecond // in sec
      let selectDuration = this.selectWidth / this.props.pxPerSecond // in sec
      this.props.setSelected(this.props.id, selectStart, selectDuration)
    } else if (this.props.isDrag) {
      // moving
      // calculate audio offset in sec
      this.sample.delay = this.sample.offsetX / this.props.pxPerSecond
      let channel = this.props.channel
      channel.delay = this.sample.delay
      this.props.doSaveStateForUndo('Drag')
      this.props.saveChannel(channel)
      // console.log(this.sample.delay)
    }
  }

  pastePreview = e => {
    if (this.props.isPaste && this.props.pasteData) {
      // paste tool is actived
      this.clearPastePreview()
      const canvasX = this.waveCanvas.getBoundingClientRect().left
      const startX = e.clientX - canvasX
      const duration = this.props.pasteData.length / this.props.audioCtx.sampleRate // in sec
      const sampleWidth = Math.floor(duration * this.props.pxPerSecond)
      const chunk = Math.floor(this.props.pasteData.length / sampleWidth)
      let subChunk = 10
      if (this.props.pxPerSecond > 60) subChunk = 3
      const subChunkVal = Math.floor(chunk / subChunk)

      this.pasteCtx.save()
      this.pasteCtx.strokeStyle = '#00ff00'
      this.pasteCtx.globalAlpha = 0.4
      const y = this.props.canvasHeight / 2
      for (let i = 0; i < sampleWidth; i++) {
        for (let j = 0; j < subChunk; j++) {
          const val = this.props.pasteData[i * chunk + j * subChunkVal]
          const x = i + startX
          this.pasteCtx.beginPath()
          this.pasteCtx.moveTo(x, y)
          this.pasteCtx.lineTo(x, y + val * y)
          this.pasteCtx.stroke()
        }
      }
      this.pasteCtx.restore()
    }
  }

  clearPastePreview = () => {
    if (this.props.isPaste) {
      this.pasteCtx.clearRect(0, 0, this.props.viewWidth, this.props.canvasHeight)
    }
  }

  pasteSample = e => {
    if (this.props.isPaste && this.props.pasteData) {
      const canvasX = this.waveCanvas.getBoundingClientRect().left
      const viewOffsetX = this.viewOffset * this.props.pxPerSecond
      const startX = e.clientX - canvasX + viewOffsetX
      const pasteDelay = startX / this.props.pxPerSecond
      const pasteDuration = this.props.pasteData.length / this.props.audioCtx.sampleRate
      const startTime = this.sample.delay < pasteDelay ? this.sample.delay : pasteDelay
      const endTime =
        this.sample.delay + this.sample.duration > pasteDelay + pasteDuration
          ? this.sample.delay + this.sample.duration
          : pasteDelay + pasteDuration
      const sampleData = this.buffer.getChannelData(0)
      // console.log(this.sample.delay, this.sample.duration, pasteDelay, pasteDuration, startTime, endTime)

      // no need for new audioBuffer because pasted in existing sample
      if (!(this.sample.delay <= startTime && this.sample.delay + this.sample.duration >= endTime)) {
        // paste wave is outside existing sample, need for new audioBuffer
        const bufferLength = Math.round(this.props.audioCtx.sampleRate * (endTime - startTime))
        this.buffer = this.props.audioCtx.createBuffer(1, bufferLength, this.props.audioCtx.sampleRate)
      }
      const channelData = this.buffer.getChannelData(0)
      this.copyData(
        sampleData,
        Math.round((this.sample.delay - startTime) * this.props.audioCtx.sampleRate),
        channelData,
      )
      this.copyData(
        this.props.pasteData,
        Math.round((pasteDelay - startTime) * this.props.audioCtx.sampleRate),
        channelData,
      )
      this.sample.delay = startTime
      this.props.channel.delay = startTime
      this.sample.offsetX = this.calculateOffsetX()
      this.props.doSaveStateForUndo('Cut selected')
      this.saveNewBuffer()
    }
  }

  saveNewBuffer = () => {
    this.initAudio()
    this.drawWave()
    const channelData = this.buffer.getChannelData(0)
    this.converter.bufferToDataUri(channelData, dataUri => {
      this.props.channel.dataUri = dataUri
      this.props.saveChannel(this.props.channel)
    })
  }

  clearBufferPart = (selectStart, selectDuration) => {
    let startId = this.timeToArrayId(selectStart)
    let endId = this.timeToArrayId(selectStart + selectDuration)
    const channelData = this.buffer.getChannelData(0)
    for (let i = startId; i < endId; i++) {
      channelData[i] = 0
    }
    this.saveNewBuffer()
  }

  eraseBufferPart = (selectStart, selectDuration) => {
    const startId = this.timeToArrayId(selectStart)
    const endId = this.timeToArrayId(selectStart + selectDuration)
    const deleteLength = endId - startId
    const oldBuffer = this.buffer.getChannelData(0)
    if (deleteLength <= 0 || deleteLength > oldBuffer.length) return false
    let newLength = oldBuffer.length - deleteLength
    if (newLength == 0) newLength = 1
    this.buffer = this.props.audioCtx.createBuffer(1, newLength, this.props.audioCtx.sampleRate)
    const channelData = this.buffer.getChannelData(0)
    for (let i = 0; i < newLength; i++) {
      let key = i < startId ? i : i + deleteLength
      if (oldBuffer.length > key) channelData[i] = oldBuffer[key]
    }
    this.sample.duration = Math.round(newLength * this.props.audioCtx.sampleRate)
    // this.props.duration = this.sample.duration     // could be nasty bug
    this.saveNewBuffer()
  }

  timeToArrayId = time => {
    let ind
    if (this.sample.delay > time) {
      ind = 0
    } else if (this.sample.delay + this.sample.duration < time) {
      ind = this.sample.duration
    } else {
      ind = time - this.sample.delay
    }
    return Math.round(ind * this.props.audioCtx.sampleRate)
  }

  copyData = (source, offset, destination) => {
    if (offset >= destination.length) return
    const end = destination.length < offset + source.length ? destination.length : offset + source.length
    for (let i = offset; i < end; i++) {
      destination[i] = source[i - offset]
    }
  }

  clearSelect = () => {
    this.selectX = 0
    this.selectWidth = 0
    this.drawSelect()
  }

  drawSelect = () => {
    this.selectDiv.style.left = this.selectX + 'px'
    this.selectDiv.style.width = this.selectWidth + 'px'
  }

  changeVolume = volume => {
    this.props.doSaveStateForUndo('Volume change')
    this.props.channel.volume = volume
    if (this.gainNode) this.gainNode.gain.value = volume
    this.props.saveChannel(this.props.channel)
  }

  deleteChannel = () => {
    this.clearAudio()
    this.props.deleteChannel(this.props.nr)
  }

  render() {
    let channel = this.props.channel
    return (
      <div key={this.props.id} className="channelContainer">
        <div className="controls chn">
          {channel.title}
          {/*<div>
           <input
           type='range'
           value={channel.volume}
           min='0'
           max='1'
           step='0.05'
           onChange={this.changeVolume.bind(this)} /> Volume
           <br/>
           </div>*/}
          <VolumeSlider volume={channel.volume} changeVolume={this.changeVolume.bind(this)} />
          <buton className="ui mini icon button" onClick={this.deleteChannel.bind(this)}>
            <i className="remove icon" />
          </buton>
        </div>
        <div className="channelWave" style={{ position: 'relative' }}>
          <canvas ref="waveCanvas" width={this.props.viewWidth} height={this.props.canvasHeight} />
          <canvas
            ref="pasteCanvas"
            className="pasteCanvas"
            onMouseMove={this.pastePreview.bind(this)}
            onMouseOut={this.clearPastePreview.bind(this)}
            draggable
            onDragStart={this.onDragStart.bind(this)}
            onDragEnd={this.onDragEnd.bind(this)}
            onTouchStart={this.onDragStart.bind(this)}
            onTouchMove={this.onDrag.bind(this)}
            onTouchEnd={this.onDragEnd.bind(this)}
            onClick={this.onClick.bind(this)}
            width={this.props.viewWidth}
            height={this.props.canvasHeight}
          />
          <div ref="selectDiv" className="selectDiv" />
        </div>
      </div>
    )
  }
}
