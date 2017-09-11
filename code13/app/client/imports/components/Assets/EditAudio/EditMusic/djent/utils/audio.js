import AudioConverter from '../../../lib/AudioConverter.js'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'

const bufferCache = {}
const BufferLoader = context => {
  let newInstrumentPack = []

  const loadBuffer = (instrument, index) => {
    const newInstrument = Object.assign({}, instrument)
    const enabledSounds = newInstrument.sounds.filter(sound => sound.enabled)
    const bufferAmount = enabledSounds.length
    let bufferCount = 0
    newInstrument.buffers = {}

    const loadingSound = new Promise((res, rej) => {
      enabledSounds.forEach((sound, i) => {
        const url = sound.path
        if (bufferCache[url]) {
          newInstrument.buffers[sound.id] = bufferCache[url]
          newInstrumentPack[index] = newInstrument
          bufferCount++
          if (bufferCount === bufferAmount) {
            res()
          }
          return
        }

        mgbAjax(
          url,
          (err, content) => {
            if (err) {
              rej(err)
              return
            }
            const converter = new AudioConverter(context)
            converter.blobToDataURL(content, dataUri => {
              converter.dataUriToBuffer(
                dataUri,
                buffer => {
                  newInstrument.buffers[sound.id] = buffer
                  bufferCache[url] = buffer
                  newInstrumentPack[index] = newInstrument
                  bufferCount++
                  if (bufferCount === bufferAmount) {
                    res()
                  }
                },
                true,
              )
            })
          },
          null,
          request => {
            request.responseType = 'blob'
          },
        )

        // // Load buffer asynchronously
        // const request = new XMLHttpRequest()
        // request.open('GET', url, true)
        // // request.responseType = "arraybuffer";
        // request.responseType = 'blob'
        //
        // // console.log(url)
        //
        // request.onload = () => {
        //   // Asynchronously decode the audio file data in request.response
        //   // console.log(request.response)
        //   const converter = new AudioConverter(context)
        //
        //   // const dataUri = window.URL.createObjectURL(request.response)
        //   // console.log(dataUri)
        //   // converter.dataUriToBuffer(dataUri, (buffer) => {
        //   //     console.log(buffer)
        //   // }, true)
        //
        //   converter.blobToDataURL(request.response, dataUri => {
        //     // console.log(dataUri)
        //     converter.dataUriToBuffer(
        //       dataUri,
        //       buffer => {
        //         // console.log(buffer)
        //         newInstrument.buffers[sound.id] = buffer
        //         bufferCache[url] = buffer
        //         newInstrumentPack[index] = newInstrument
        //         bufferCount++
        //         if (bufferCount === bufferAmount) {
        //           res()
        //         }
        //       },
        //       true,
        //     )
        //   })
        //
        //   // context.decodeAudioData(
        //   //     request.response,
        //   //     (buffer) => {
        //   //         if (!buffer) {
        //   //             alert('error decoding file data: ' + url);
        //   //             return;
        //   //         }
        //   //         newInstrument.buffers[sound.id] = buffer;
        //   //         bufferCache[url] = buffer;
        //   //         newInstrumentPack[index] = newInstrument;
        //   //         bufferCount++;
        //   //         if(bufferCount === bufferAmount) {
        //   //             res();
        //   //         }
        //   //     },
        //   //     (error) => {
        //   //         rej(error);
        //   //         alert('decode audio error')
        //   //     }
        //   // );
        //
        //   // context.decodeAudioData(
        //   //     request.response,
        //   //     (buffer) => {
        //   //         if (!buffer) {
        //   //             alert('error decoding file data: ' + url);
        //   //             return;
        //   //         }
        //   //         newInstrument.buffers[sound.id] = buffer;
        //   //         bufferCache[url] = buffer;
        //   //         newInstrumentPack[index] = newInstrument;
        //   //         bufferCount++;
        //   //         if(bufferCount === bufferAmount) {
        //   //             res();
        //   //         }
        //   //     },
        //   //     (error) => {
        //   //         rej(error);
        //   //         alert('decode audio error')
        //   //     }
        //   // );
        //
        //   // function syncStream(node){ // should be done by api itself. and hopefully will.
        //   //     var buf8 = new Uint8Array(node.buf);
        //   //     buf8.indexOf = Array.prototype.indexOf;
        //   //     var i=node.sync, b=buf8;
        //   //     while(1) {
        //   //         node.retry++;
        //   //         i=b.indexOf(0xFF,i); if(i==-1 || (b[i+1] & 0xE0 == 0xE0 )) break;
        //   //         i++;
        //   //     }
        //   //     if(i!=-1) {
        //   //         var tmp=node.buf.slice(i); //carefull there it returns copy
        //   //         delete(node.buf); node.buf=null;
        //   //         node.buf=tmp;
        //   //         node.sync=i;
        //   //         return true;
        //   //     }
        //   //     return false;
        //   // }
        //
        //   // function decode(node) {
        //   //     try{
        //   //         context.decodeAudioData(node.buf,
        //   //         function(buffer){
        //   //             node.source  = context.createBufferSource();
        //   //             node.source.connect(context.destination);
        //   //             node.source.buffer=buffer;
        //   //             // node.source.noteOn(0);
        //
        //   //             newInstrument.buffers[sound.id] = buffer;
        //   //             bufferCache[url] = buffer;
        //   //             newInstrumentPack[index] = newInstrument;
        //   //             bufferCount++;
        //   //             if(bufferCount === bufferAmount) {
        //   //                 res();
        //   //             }
        //
        //   //         },
        //   //         function(){ // only on error attempt to sync on frame boundary
        //   //             if(syncStream(node)) decode(node);
        //   //         });
        //   //     } catch(e) {
        //   //         alert('decode exception',e.message);
        //   //     }
        //   // }
        //
        //   // let node = {}
        //   // node.buf = request.response
        //   // node.sync = 0
        //   // node.retry = 0
        //   // decode(node)
        // }
        //
        // request.onerror = error => {
        //   rej(error)
        //   alert('BufferLoader: XHR error')
        // }
        //
        // request.send()
      })
    })

    return loadingSound
  }

  const load = instruments => {
    const loadingSounds = instruments
      .filter(instrument => instrument.sounds.filter(sound => sound.enabled).length)
      .map(loadBuffer)

    return Promise.all(loadingSounds)
      .then(() => newInstrumentPack)
      .catch(e => (console.error || console.log).call(console, e))
  }

  return {
    load,
  }
}

const loadInstrumentBuffers = (context, instruments) => {
  return BufferLoader(context).load(instruments)
}

const getPitchPlaybackRatio = pitchAmount => {
  const pitchIsPositive = pitchAmount > 0
  const negAmount = pitchIsPositive ? pitchAmount * -1 : pitchAmount
  const val = 1 / Math.abs(negAmount / 1200 - 1)

  return pitchIsPositive ? 1 / val : val
}

const playSound = (context, buffer, time, duration, volume, pitchAmount = 0) => {
  // console.log(context, buffer, time, duration, volume, pitchAmount)
  if (!buffer) return

  const source = context.createBufferSource()
  const gainNode = context.createGain()
  const durationMultiplier = getPitchPlaybackRatio(pitchAmount)

  gainNode.gain.value = volume

  source.connect(gainNode)

  gainNode.connect(context.destination)

  // source.pitch.value = pitchAmount;
  source.playbackRate.value = durationMultiplier
  source.buffer = buffer
  source.start(time, 0, duration * durationMultiplier)

  return source
}

export { loadInstrumentBuffers, playSound }
