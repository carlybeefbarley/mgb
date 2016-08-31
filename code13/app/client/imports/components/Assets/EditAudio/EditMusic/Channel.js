import _ from 'lodash';
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';

import WaveSurfer from '../lib/WaveSurfer.js';

export default class Channel extends React.Component {

	constructor(props) {
  	super(props)
  	// console.log(props)

  	this.state = {

  	}
  	
	}

	componentDidMount(){
		const channel = this.props.channel
		if(!channel.dataUri) return

		this.audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  	this.buffer = []
  	this.waveCanvas = ReactDOM.findDOMNode(this.refs.waveCanvas)
		this.waveCtx = this.waveCanvas.getContext('2d')

		const soundBlob = this.dataURItoBlob(channel.dataUri)
		let reader = new FileReader()
    reader.onload = (e) => {
      let audioData = e.target.result
      this.audioCtx.decodeAudioData(audioData, (audioBuffer) => {
      	this.buffer = audioBuffer
      	this.initAudio()
      	this.drawWave()	
	    })
    }
    reader.readAsArrayBuffer(soundBlob)
	}

	componentDidUpdate(prevProps, prevState){
		if(this.buffer){
			if(this.props.isPlaying && !prevProps.isPlaying){
				this.play()
			} 
			else if(!this.props.isPlaying && prevProps.isPlaying){
				this.pause()
			}

			if(this.props.canvasWidth !== prevProps.canvasWidth){
				this.drawWave()
			}
			
		}
	}

	initAudio(){
		this.clearAudio()
		let startTime = 0
		this.source = this.audioCtx.createBufferSource()
		this.gainNode = this.audioCtx.createGain()

		this.source.buffer = this.buffer
		this.source.playbackRate.value = 1
    this.source.connect(this.gainNode)
		this.gainNode.connect(this.audioCtx.destination)

		this.source.start(0, startTime)		// delay, startTime
		this.audioCtx.suspend()
	}

	clearAudio(){
		if(this.source) {
			this.source.stop()
			this.source.disconnect(0)
		}
		if(this.gainNode) this.gainNode.disconnect(0)
	}

	play(){
		this.audioCtx.resume()
	}

	pause(){
		this.audioCtx.suspend()
	}

	drawWave(){
		if(!this.buffer) return	// in situations when audio is not decoded yet
		// console.log('draw wave')
		const channelData = this.buffer.getChannelData(0)
		const channelWidth = Math.floor( this.buffer.duration * this.props.pxPerSecond )
		const chunk = Math.floor(channelData.length / channelWidth)
		const subChunk = 10
		const subChunkVal = Math.floor(chunk/subChunk)
		this.waveCtx.clearRect(0, 0, this.props.canvasWidth, this.props.canvasHeight)
		this.waveCtx.save()
   	this.waveCtx.strokeStyle = '#4dd2ff'
   	this.waveCtx.globalAlpha = 0.4
   	const y = this.props.canvasHeight/2
		for(let i=0; i<channelWidth; i++){
			for(var j=0; j<subChunk; j++){
				const val = channelData[i*chunk + j*subChunkVal]
				// const x = i+j*(1/subChunk)
				const x = i
				this.waveCtx.beginPath()
	     	this.waveCtx.moveTo( x, y )
	     	this.waveCtx.lineTo( x, y + val*y )
	     	this.waveCtx.stroke()
     }
		}
		this.waveCtx.restore();
	}

	dataURItoBlob(dataURI) {
	  var byteString = atob(dataURI.split(',')[1]);
	  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
	  var ab = new ArrayBuffer(byteString.length);
	  var ia = new Uint8Array(ab);
	  for (var i = 0; i < byteString.length; i++) {
	      ia[i] = byteString.charCodeAt(i);
	  }
	  var blob = new Blob([ab], {type: mimeString});
	  return blob;
	}

	changeVolume(e){
		this.props.channel.volume = parseFloat(e.target.value)
		this.props.handleSave("Volume change")
		this.gainNode.gain.value = this.props.channel.volume
		// console.log(parseFloat(e.target.value))
	}

	deleteChannel(){
		this.props.deleteChannel(this.props.id)
	}

	render(){
		let channel = this.props.channel
		return (
			<div key={this.props.id} className="channelContainer">
				<div className="controls">
					{channel.title}
					<div>
	    			<input type="range" value={channel.volume} min="0" max="1" step="0.05"
	    			onChange={this.changeVolume.bind(this)}
	    			/> Volume<br/>
	    		</div>
	    		<buton className="ui mini icon button" onClick={this.deleteChannel.bind(this)}>
	    			<i className="remove icon"></i>
	    		</buton>
				</div>
				<div className="channelWave">
					<canvas ref="waveCanvas" width={this.props.canvasWidth} height={this.props.canvasHeight}></canvas>
				</div>
			</div>
		)
	}
}