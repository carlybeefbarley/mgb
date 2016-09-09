import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import WaveSurfer from '../lib/WaveSurfer.js'

export default class Channel extends React.Component {

  constructor (props) {
    super(props)
    // console.log(props)

    this.state = {

    }

    this.sample = {
      duration: 0,
      delay: props.channel.delay || 0,   // in sec
      offsetX: (props.channel.delay || 0) * props.pxPerSecond,
      width: 0,
      dragStartX: 0,
    }

  }

  componentDidMount () {
    this.waveCanvas = ReactDOM.findDOMNode(this.refs.waveCanvas)
    this.waveCtx = this.waveCanvas.getContext('2d')
    this.initWave()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.buffer) {
      if (this.props.viewWidth !== prevProps.viewWidth) {
        this.drawWave()
      }
      if(this.props.pxPerSecond !== prevProps.pxPerSecond){
        this.drawWave()
      }
    }
  }

  getBuffer () {
    if(!this.buffer) return null
    const bufferLength = this.props.duration * this.props.audioCtx.sampleRate
    const delayLength = this.sample.delay * this.props.audioCtx.sampleRate
    // console.log(bufferLength, delayLength)
    let returnBuffer = new Float32Array(bufferLength)
    const channelData = this.buffer.getChannelData(0)
    let i = delayLength < 0 ? Math.abs(delayLength) : 0
    const maxInd = delayLength + channelData.length > bufferLength ? bufferLength - delayLength : channelData.length
    let returnInd = delayLength < 0 ? 0 : delayLength
    for(; i<maxInd; i++, returnInd++){
      returnBuffer[returnInd] = channelData[i]
    }
    return returnBuffer
  }

  initWave () {
    const channel = this.props.channel
    if (!channel.dataUri) return

    const soundBlob = this.dataURItoBlob(channel.dataUri)
    let reader = new FileReader()
    reader.onload = (e) => {
      let audioData = e.target.result
      this.props.audioCtx.decodeAudioData(audioData, (audioBuffer) => {
        this.buffer = audioBuffer
        this.initAudio()
        this.drawWave()
        this.props.mountChannel()
      })
    }
    reader.readAsArrayBuffer(soundBlob)
  }

  initAudio (songTime = 0) {
    if (!this.buffer) return
    this.clearAudio()
    this.sample.duration = this.buffer.length / this.props.audioCtx.sampleRate
    this.sample.width = Math.floor(this.sample.duration * this.props.pxPerSecond)
    this.source = this.props.audioCtx.createBufferSource()
    this.gainNode = this.props.audioCtx.createGain()

    this.source.buffer = this.buffer
    this.source.playbackRate.value = 1
    this.source.connect(this.gainNode)
    this.gainNode.connect(this.props.audioCtx.destination)
    this.gainNode.gain.value = this.props.channel.volume

    let startTime = 0
    let delay = this.sample.delay - songTime/1000
    if(delay < 0) {
      startTime = Math.abs(delay)
      delay = 0
    }
    // console.log(delay, startTime)
    this.source.start(this.props.audioCtx.currentTime + delay, startTime) // delay, startTime
    this.props.audioCtx.suspend()
  }

  clearAudio () {
    if (this.source) {
      this.source.stop()
      this.source.disconnect(0)
    }
    if (this.gainNode) this.gainNode.disconnect(0)
  }

  drawWave () {
    this.waveCtx.clearRect(0, 0, this.props.viewWidth, this.props.canvasHeight)
    this.drawTimeline()
    this.drawSampleBG()
    if (!this.buffer) return // in situations when audio is not decoded yet
    // console.log("draw wave", this.props.id)
    const channelData = this.buffer.getChannelData(0)
    const chunk = Math.floor(channelData.length / this.sample.width)
    const subChunk = 10
    const subChunkVal = Math.floor(chunk / subChunk)
    this.waveCtx.save()
    this.waveCtx.strokeStyle = '#4dd2ff'
    this.waveCtx.globalAlpha = 0.4
    const y = this.props.canvasHeight / 2
    for (let i = 0; i < this.sample.width; i++) {
      for (var j = 0; j < subChunk; j++) {
        const val = channelData[i * chunk + j * subChunkVal]
        // const x = i+j*(1/subChunk)
        const x = i + this.sample.offsetX
        this.waveCtx.beginPath()
        this.waveCtx.moveTo(x, y)
        this.waveCtx.lineTo(x, y + val * y)
        this.waveCtx.stroke()
      }
    }
    this.waveCtx.restore()
  }

  drawSampleBG () {
    this.waveCtx.save()
    this.waveCtx.globalAlpha = 0.2
    this.waveCtx.fillStyle = '#4dd2ff'
    const width = this.sample.duration * this.props.pxPerSecond
    this.waveCtx.fillRect(this.sample.offsetX, 0, width, this.props.canvasHeight)
    this.waveCtx.restore()
  }

  drawTimeline () {
    let count = Math.floor(this.props.duration) + 1
    this.waveCtx.save()
    this.waveCtx.strokeStyle = '#333'
    this.waveCtx.globalAlpha = 0.2
    for (let i = 0; i < count; i++) {
      const x = i * this.props.pxPerSecond + 0.5 // 0.5 for 1px line instead of 2px
      this.waveCtx.beginPath()
      this.waveCtx.moveTo(x, 0)
      this.waveCtx.lineTo(x, this.props.canvasHeight)
      this.waveCtx.stroke()
    }
    this.waveCtx.restore()
  }

  dataURItoBlob (dataURI) {
    var byteString = atob(dataURI.split(',')[1])
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length)
    var ia = new Uint8Array(ab)
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    var blob = new Blob([ab], {type: mimeString})
    return blob
  }

  onClick (e) {
    let canvasX = this.waveCanvas.getBoundingClientRect().left
    let cursorX = e.clientX - canvasX
    let newTime = Math.round((cursorX/this.props.pxPerSecond)*1000)
    this.props.setAudioTime(newTime)
  }

  onDragStart (e) {
    // empty image so you don't see canvas element drag. Need to see only what is dragged inside canvas
    let ghost = e.target.cloneNode(true)
    ghost.style.display = "none"
    e.dataTransfer.setDragImage(ghost, 0, 0)
    this.sample.dragStartX = e.clientX
  }

  onDrag (e) {
    // console.log('drag')
    // e.preventDefault()
    if(e.clientX == 0 && e.clientY == 0) return   // avoiding weid glitch when at the end of drag 0,0 coords returned
    const deltaX = e.clientX - this.sample.dragStartX
    this.sample.offsetX += deltaX
    this.sample.dragStartX = e.clientX
    this.drawWave()
  }

  onDragEnd (e) {
    // calculate audio offset in sec
    this.sample.delay = this.sample.offsetX / this.props.pxPerSecond
    let channel = this.props.channel
    channel.delay = this.sample.delay
    this.props.saveChannel(channel)
    // console.log(this.sample.delay)
  }

  changeVolume (e) {
    this.props.channel.volume = parseFloat(e.target.value)
    this.props.handleSave('Volume change')
    this.gainNode.gain.value = this.props.channel.volume
  // console.log(parseFloat(e.target.value))
  }

  deleteChannel () {
    this.clearAudio()
    this.props.deleteChannel(this.props.nr)
  }

  render () {
    let channel = this.props.channel
    return (
      <div key={this.props.id} className='channelContainer'>
        <div className='controls'>
          {channel.title}
          <div>
            <input
              type='range'
              value={channel.volume}
              min='0'
              max='1'
              step='0.05'
              onChange={this.changeVolume.bind(this)} /> Volume
            <br/>
          </div>
          <buton className='ui mini icon button' onClick={this.deleteChannel.bind(this)}>
            <i className='remove icon'></i>
          </buton>
        </div>
        <div className='channelWave'>
          <canvas 
            ref='waveCanvas'
            draggable={true}
            onDragStart={this.onDragStart.bind(this)}
            onDrag={this.onDrag.bind(this)}
            onDragEnd={this.onDragEnd.bind(this)}
            onClick={this.onClick.bind(this)}
            width={this.props.viewWidth}
            height={this.props.canvasHeight}>
          </canvas>
        </div>
      </div>
    )
  }
}
