import lamejs from '../lib/lame.all.js'

let AudioConverter = function(audioCtx){
	this.audioCtx = audioCtx

	this.dataUriToBuffer = function(dataUri, callback){
		let reader = new FileReader()
    reader.onload = (e) => {
      let audioData = e.target.result
      this.audioCtx.decodeAudioData(audioData, (audioBuffer) => {
      	var channelData = audioBuffer.getChannelData(0)	// reads only mono
        callback(channelData)
      })
    }
    let blob = this.dataURItoBlob(dataUri)
    reader.readAsArrayBuffer(blob)
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

	this.float32ToInt16 = function(float32){
		let samples = new Int16Array(float32.length);
    for(var i=0; i<float32.length; i++){
        let n = float32[i]
        let v = n < 0 ? n * 32768 : n * 32767
        samples[i] = Math.round(v)
    }
    return samples
	}
}

export default AudioConverter