import _ from 'lodash'
import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

import WaveDraw from '../lib/WaveDraw.js'
import AudioConverter from '../lib/AudioConverter.js'


export default class Preview extends React.Component {

  constructor (props) {
    super(props)
    // console.log(props)

    this.state = {
      previewWidth: 500,
    }

    this.buffer
    this.sliderX = 0
    this.sliderWidth = 0

  }

  componentDidMount () {
    this.converter = new AudioConverter(this.props.audioCtx)

    this.previewDiv = ReactDOM.findDOMNode(this.refs.previewDiv)
    this.previewCanvas = ReactDOM.findDOMNode(this.refs.previewCanvas)
    this.previewCtx = this.previewCanvas.getContext('2d')
    this.thumbnailCanvas = ReactDOM.findDOMNode(this.refs.thumbnailCanvas)
    this.thumbnailCtx = this.thumbnailCanvas.getContext('2d')
    
    this.setState({ previewWidth: this.previewDiv.offsetWidth})
  }

  componentDidUpdate (prevProps, prevState) {
    this.draw()
  }

  loadDataUri (dataUri) {
    if(!dataUri) return
    this.converter.dataUriToBuffer(dataUri, this.loadBuffer.bind(this))
  }

  loadBuffer (buffer) {
    this.buffer = buffer
    this.draw()
  }

  draw () {
    if(!this.buffer) return

    const data = {
      audioCtx: this.props.audioCtx,
      duration: this.props.duration,
      canvas: this.previewCanvas,
      color: this.props.waveColor,
      buffer: this.buffer
    }
    this.waveDraw = new WaveDraw(data)

  }

  drawSlider(){
    if(this.props.duration * this.props.pxPerSecond > this.props.viewWidth){
      let visibleDuration = this.props.viewWidth / this.propx.pxPerSecond
    }
  }

  update (songTime) {
    
  }

  getThumbnail () {
    this.thumbnailCtx.putImageData(this.previewCtx.getImageData(0, 0, 290, 128), 0, 0)
    return this.thumbnailCanvas.toDataURL('image/png')
  }

  render () {
    return (
      <div ref="previewDiv">
        <canvas ref='previewCanvas' width={this.state.previewWidth} height='128px'></canvas>
        <canvas
          ref='thumbnailCanvas'
          style={{display: 'none'}}
          width='290px'
          height='128px'>
        </canvas>
      </div>
    )
  }

}
