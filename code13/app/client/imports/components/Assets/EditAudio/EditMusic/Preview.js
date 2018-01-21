import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

import WaveDraw from '../lib/WaveDraw.js'
import AudioConverter from '../lib/AudioConverter.js'
import './editMusic.css'

export default class Preview extends React.Component {
  constructor(props) {
    super(props)
    // console.log(props)

    this.state = {
      previewWidth: 500,
    }

    this.buffer
    this.sliderX = 0
    this.sliderWidth = 0
  }

  componentDidMount() {
    this.converter = new AudioConverter(this.props.audioCtx)

    this.previewDiv = ReactDOM.findDOMNode(this.refs.previewDiv)
    this.previewCanvas = ReactDOM.findDOMNode(this.refs.previewCanvas)
    this.previewCtx = this.previewCanvas.getContext('2d')
    this.thumbnailCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
    this.thumbnailCtx = this.thumbnailCanvas.getContext('2d')
    this.previewSlider = ReactDOM.findDOMNode(this.refs.previewSlider)

    this.setState({ previewWidth: this.previewDiv.offsetWidth })
  }

  componentDidUpdate(prevProps, prevState) {
    this.draw()
  }

  loadDataUri = dataUri => {
    if (!dataUri) return
    this.converter.dataUriToBuffer(dataUri, this.loadBuffer.bind(this))
  }

  loadBuffer = buffer => {
    this.buffer = buffer
    this.draw()
  }

  draw = () => {
    if (!this.buffer) return

    const data = {
      audioCtx: this.props.audioCtx,
      duration: this.props.duration,
      canvas: this.previewCanvas,
      color: this.props.waveColor,
      buffer: this.buffer,
    }
    this.waveDraw = new WaveDraw(data)
    this.drawSlider()
  }

  drawSlider = () => {
    if (this.props.duration * this.props.pxPerSecond > this.props.viewWidth) {
      const visibleDuration = this.props.viewWidth / this.props.pxPerSecond
      const previewPxPerSecond = this.state.previewWidth / this.props.duration
      this.sliderWidth = visibleDuration * previewPxPerSecond
    } else {
      this.sliderX = 0
      this.sliderWidth = 0
      this.calculateViewOffset() // resets offset for channels
    }

    this.previewSlider.style.left = this.sliderX + 'px'
    this.previewSlider.style.width = this.sliderWidth + 'px'
  }

  onDragStart = e => {
    if (this.sliderWidth == 0) return // no slider to draw

    if (e.touches && e.touches[0]) e = e.touches[0]

    if (e.dataTransfer) {
      let ghost = e.target.cloneNode(true)
      ghost.style.display = 'none'
      e.dataTransfer.setDragImage(ghost, 0, 0)
    }
    this.dragStartX = e.clientX
  }

  onDrag = e => {
    if (e.touches && e.touches[0]) e = e.touches[0]

    if (e.clientX == 0 && e.clientY == 0) return // avoiding weid glitch when at the end of drag 0,0 coords returned
    const deltaX = e.clientX - this.dragStartX
    this.sliderX += deltaX
    if (this.sliderX < 0) this.sliderX = 0
    else if (this.sliderX + this.sliderWidth > this.state.previewWidth)
      this.sliderX = this.state.previewWidth - this.sliderWidth
    this.dragStartX = e.clientX
    this.drawSlider()
    this.calculateViewOffset()
  }

  onDragEnd = e => {}

  calculateViewOffset = () => {
    const previewPxPerSecond = this.state.previewWidth / this.props.duration
    const viewOffset = this.sliderX / previewPxPerSecond // offset in seconds
    this.props.setViewOffset(viewOffset)
  }

  update = songTime => {}

  getThumbnail = () => {
    this.thumbnailCtx.putImageData(this.previewCtx.getImageData(0, 0, 290, 128), 0, 0)
    return this.thumbnailCanvas.toDataURL('image/png')
  }

  render() {
    return (
      <div ref="previewDiv" style={{ position: 'relative' }}>
        <canvas ref="previewCanvas" width={this.state.previewWidth} height="128px" />
        <div
          ref="previewSlider"
          className="previewSlider"
          draggable
          onDragStart={this.onDragStart.bind(this)}
          onDrag={this.onDrag.bind(this)}
          onDragEnd={this.onDragEnd.bind(this)}
          onTouchStart={this.onDragStart.bind(this)}
          onTouchMove={this.onDrag.bind(this)}
          onTouchEnd={this.onDragEnd.bind(this)}
        />
        <canvas ref="thumbnailCanvas" style={{ display: 'none' }} width="290px" height="128px" />
      </div>
    )
  }
}
