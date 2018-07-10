import lamejs from '../lib/lame.all.js'

let AudioConverter = function(audioCtx){
	this.audioCtx = audioCtx

  this.dataUriToBuffer = function(dataUri, callback, respAudioBufferObject){
    let blob = this.dataURItoBlob(dataUri)
    this.blobToBuffer(blob, callback, respAudioBufferObject)
  }

  this.blobToBuffer = function(blob, callback, respAudioBufferObject){
    let reader = new FileReader()
    reader.onload = (e) => {
      let audioData = e.target.result
      this.audioCtx.decodeAudioData(audioData, (audioBuffer) => {
      	var channelData = audioBuffer.getChannelData(0)	// reads only mono
        respAudioBufferObject ? callback(audioBuffer) : callback(channelData)
      }, (error) => {
      	console.warn("decode audio error", error)
      })
    }
    reader.readAsArrayBuffer(blob)
  }

	// datUri will be mp3
	this.bufferToDataUri = function(buffer, callback){
		if(buffer instanceof Float32Array){
			buffer = this.float32ToInt16(buffer)
		}
		lamejs.encodeMono(1, this.audioCtx.sampleRate, buffer, (audioObject) => {
    	callback(audioObject.src)
    })
	}

	this.dataURItoBlob = function(dataURI) {
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

  this.blobToDataURL = function(blob, callback) {
    var reader = new FileReader()
    reader.onload = function(e) {callback(e.target.result)}
    reader.readAsDataURL(blob)
  }

	this.float32ToInt16 = function(float32){
		let samples = new Int16Array(float32.length);
    for(var i=0; i<float32.length; i++){
        let n = float32[i]
        let v = n < 0 ? n * 32768 : n * 32767
        samples[i] = Math.round(v)
    }
    return samples
	}

	this.mergeBuffers = function(bufferList, duration){
		const arrayLength = Math.floor(duration * this.audioCtx.sampleRate)
		let sumBuffer = new Float32Array(arrayLength)
		bufferList.forEach((buffer, i) => {
			// console.log('buffer '+i)
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

		return sumBuffer
	}
}

export default AudioConverter