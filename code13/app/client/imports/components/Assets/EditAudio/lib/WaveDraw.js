let WaveDraw = function(data) {
  this.draw = function() {
    if (!this.buffer) {
      console.warn('No buffer!')
      return
    }
    const drawWidth = Math.floor(this.duration * this.pxPerSecond)
    const chunk = Math.floor(this.buffer.length / drawWidth) // for performance draw only part of buffer, e.g. one element from a chunk
    const subChunk = 10 // for better visuals draws addditional 10 elements from chunk
    const subChunkVal = Math.floor(chunk / subChunk)
    this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvasCtx.save()
    this.canvasCtx.strokeStyle = this.color
    this.canvasCtx.globalAlpha = 0.4 // looks a way cooler than alpha = 1
    const y = this.canvas.height / 2
    for (let i = 0; i < drawWidth; i++) {
      for (var j = 0; j < subChunk; j++) {
        const val = this.buffer[i * chunk + j * subChunkVal]
        // const x = i+j*(1/subChunk)
        const x = i
        this.canvasCtx.beginPath()
        this.canvasCtx.moveTo(x, y)
        this.canvasCtx.lineTo(x, y + val * y)
        this.canvasCtx.stroke()
      }
    }
    this.canvasCtx.restore()
  }

  this.audioCtx = data.audioCtx
  this.duration = data.duration

  this.canvas = data.canvas
  this.canvasCtx = this.canvas.getContext('2d')
  this.pxPerSecond = data.pxPerSecond ? data.pxPerSecond : this.canvas.width / this.duration
  this.buffer = data.buffer ? data.buffer : [] // default is Float32Array format -1 to 1
  if (data.int16buffer) this.buffer = this.int16ToFloat32(data.int16buffer)
  if (data.bufferList) this.buffer = this.sumBufferList(data.bufferList)
  this.color = data.color ? data.color : '#000000'

  this.draw()
}

export default WaveDraw
