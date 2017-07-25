import audioBufferToWav from 'audiobuffer-to-wav'

const saveAsWAVFile = (() => {
  return (audioBuffer, cb) => {
    const a = document.createElement('a')
    a.style = 'display: none'
    document.body.appendChild(a)

    const wav = audioBufferToWav(audioBuffer)
    const blob = new window.Blob([new DataView(wav)], {
      type: 'audio/wav',
    })

    var fileReader = new FileReader()
    fileReader.onload = function() {
      cb(this.result)
    }
    fileReader.readAsDataURL(blob)

    // return audio
    // const url = window.URL.createObjectURL(blob)

    // a.href = url
    // a.download = 'djen.wav'
    // a.click();

    // window.URL.revokeObjectURL(url);
  }
})()

const saveAsMIDIFile = (() => {
  return url => {
    const a = document.createElement('a')
    a.style = 'display: none'
    document.body.appendChild(a)
    a.href = url
    a.download = 'djen.mid'
    a.click()
    document.body.removeChild(a)
  }
})()

export { saveAsMIDIFile, saveAsWAVFile }
