let WaveDraw = function(data){	
	
	


	this.draw = function(){
		if(!this.buffer) {
			console.warn("No buffer!")
			return
		}
		const drawWidth = Math.floor( this.duration * this.pxPerSecond )
		const chunk = Math.floor(this.buffer.length / drawWidth)	// for performance draw only part of buffer, e.g. one element from a chunk
		const subChunk = 10	// for better visuals draws addditional 10 elements from chunk
		const subChunkVal = Math.floor(chunk/subChunk)
		this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.canvasCtx.save()
   	this.canvasCtx.strokeStyle = this.color
   	this.canvasCtx.globalAlpha = 0.4	// looks a way cooler than alpha = 1
   	const y = this.canvas.height/2
		for(let i=0; i<drawWidth; i++){
			for(var j=0; j<subChunk; j++){
				const val = this.buffer[i*chunk + j*subChunkVal]
				// const x = i+j*(1/subChunk)
				const x = i
				this.canvasCtx.beginPath()
	     	this.canvasCtx.moveTo( x, y )
	     	this.canvasCtx.lineTo( x, y + val*y )
	     	this.canvasCtx.stroke()
     }
		}
		this.canvasCtx.restore();
	}

	// function int16ToFloat32(int16){
	// 	// TODO conversion here
	// 	return int16
	// }

	this.sumBufferList = function(bufferList){
		
		const arrayLength = Math.floor(this.duration * this.audioCtx.sampleRate)
		let sumBuffer = new Float32Array(arrayLength)
		bufferList.forEach((buffer) => {
			// buffer length shouldn't exceed all track length
			const bufferLength = buffer.length < arrayLength ? buffer.length : arrayLength	
			for(let i=0; i<bufferLength; i++){
				sumBuffer[i] += buffer[i]
			}
		})

		// summing buffers some values could be greater than -1 to 1 range. need to avoid this
		sumBuffer.forEach((val, i) => {
			if(val < -1) sumBuffer[i] = -1
			if(val > 1) sumBuffer[i] = 1
		})

		console.log("sum buffer list", sumBuffer)

		return sumBuffer

		// this.drawWave(sumBuffer)

		// let samples = new Int16Array( sumBuffer.length )
		// sumBuffer.forEach((val, i) => {
		// 	if(val > 1) val = 1
		// 	else if(val < -1) val = 1
  //     val = val < 0 ? val * 32768 : val * 32767
  //     samples[i] = Math.round(val)
		// })

		// lamejs.encodeMono(1, this.audioCtx.sampleRate, samples, (audioObject) => {
  //   	audioObject.play()
  //   	this.handleSave("Music import")
  //   })
	}




	this.audioCtx = data.audioCtx
	this.duration = data.duration
	
	this.canvas = data.canvas
	this.canvasCtx = this.canvas.getContext('2d')
	this.pxPerSecond = data.pxPerSecond ? data.pxPerSecond : this.canvas.width / this.duration
	this.buffer = data.buffer ? data.buffer : [] 	// default is Float32Array format -1 to 1
	if(data.int16buffer) this.buffer = this.int16ToFloat32(data.int16buffer)
	if(data.bufferList)	this.buffer = this.sumBufferList(data.bufferList)
	this.color = data.color ? data.color : '#000000'

	this.draw()
}

export default WaveDraw