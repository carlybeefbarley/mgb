import {
    loopSequence,
    generateTimeMap,
} from './sequences';

import {
    deepClone,
    randFromTo,
    repeatArray,
} from './tools';

// import { playSound } from './audio';

const getInstrumentsSequences = ({ instruments, sequences, totalBeats, usePredefinedSettings }) =>

    Object.keys(sequences)
        .map(instrumentId => {
            // console.log(instruments, sequences)

            const instrument = instruments.find(i => i.id === instrumentId);
            const predefinedSequence = instrument.predefinedSequence;
            const newSequence = usePredefinedSettings && predefinedSequence
                              ? predefinedSequence
                              : sequences[instrumentId];

            return {
                ...instrument,
                sequence: deepClone(newSequence)
            }
        });


const generateInstrumentTimeMap = (instrument) => {
    const timeMap = generateTimeMap(instrument.sequence);

    return {
        ...instrument,
        timeMap
    }
}

const generateInstrumentHitTypes = (instrument, usePredefinedSettings) => {
    const predefinedHitTypes = instrument.predefinedHitTypes;

    if (usePredefinedSettings && predefinedHitTypes && predefinedHitTypes.length) return {
        ...instrument,
        hitTypes: [ ...predefinedHitTypes ]
    }

    const activeSounds = instrument.sounds.reduce((newArr, sound, i) => sound.enabled ? [ ...newArr, { ...sound } ] : newArr, []);
    let hitTypes = [];

    if (activeSounds.length) {
        hitTypes = instrument.sequence.map((hit) => {
            return activeSounds[randFromTo(0, activeSounds.length-1)].id});
    }

    return {
        ...instrument,
        hitTypes
    }
}

const getActiveSoundsFromHitTypes = (hitTypes) =>
    (!hitTypes ? [] : hitTypes)
        .reduce((newArr, hit, i) => {
            return newArr.includes(hit) ? newArr : [ ...newArr, hit ];
        }, [])
        .map(hit => ({ id: hit, enabled: true }));

const renderInstrumentSoundsAtTempo = (instruments, totalBeats, bpmMultiplier, audioCtx) => {
    const timeLength = totalBeats * bpmMultiplier;
    // const offlineCtx = new OfflineAudioContext(2, 44100 * timeLength, 44100);
    // const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(2, 44100 * timeLength, 44100);
    // console.log(offlineCtx)

    // instruments.forEach((instrument) => {
    //     let startTimes = [];
    //     let durations  = [];
    //     const sources = instrument.timeMap.reduce((sources, time, i) => {
    //         const pitchAmount       = instrument.pitch || 0;
    //         const instrumentSound    = instrument.buffers[instrument.hitTypes[i]];
    //         const startTime          = offlineCtx.currentTime + (time * bpmMultiplier);
    //         const duration           = instrument.ringout ? instrumentSound.duration : ((1 / instrument.sequence[i].beat) * bpmMultiplier);
    //         const source             = playSound(offlineCtx, instrumentSound, startTime, duration, instrument.sequence[i].volume, pitchAmount);

    //         startTimes[i] = startTime;
    //         durations[i]   = duration;

    //         return [ ...sources, source ];
    //     }, []);
    // })


    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const buffer = audioCtx.createBuffer(1, 44100 * timeLength, 44100)
    const bufferData = buffer.getChannelData(0)
    instruments.forEach((instrument) => {
        let startTimes = [];
        let durations  = [];
        const sources = instrument.timeMap.reduce((sources, time, i) => {
            const pitchAmount       = instrument.pitch || 0;
            const instrumentSound    = instrument.buffers[instrument.hitTypes[i]];
            const instrumentBuffer   = instrumentSound.getChannelData(0)
            const instrumentBuffer2   = instrumentSound.getChannelData(1)
            // const startTime          = offlineCtx.currentTime + (time * bpmMultiplier);
            const startTime          = (time * bpmMultiplier);
            const duration           = instrument.ringout ? instrumentSound.duration : ((1 / instrument.sequence[i].beat) * bpmMultiplier);

            sumBuffers(instrumentBuffer, startTime, duration, instrument.sequence[i].volume, pitchAmount, bufferData)
            sumBuffers(instrumentBuffer2, startTime, duration, instrument.sequence[i].volume, pitchAmount, bufferData)
        })
    })

    normalizeBuffer(bufferData)

    return new Promise((res, rej) => {
        res(buffer)
    })



    // return new Promise((res, rej) => {
    //     // offlineCtx.oncomplete = ev => res(ev.renderedBuffer)
    //     // offlineCtx.onerror    = ev => rej(ev.renderedBuffer)
    //     offlineCtx.oncomplete = ev => {
    //         console.log('render instruments done', ev.renderedBuffer)
    //         res(ev.renderedBuffer)
    //     }
    //     offlineCtx.onerror    = ev => {
    //         console.log('render instruments rejected', ev.renderedBuffer)
    //         rej(ev.renderedBuffer) 
    //     }
    //     offlineCtx.onstatechange = ev => {
    //         console.log('onstatechange fired', ev)
    //     }
    //     console.log("offlineCtx start rendering")
    //     offlineCtx.startRendering()
    //     // .then((renderedBuffer) => {
    //     //     console.log('render success', renderedBuffer)
    //     // }).catch(function(err) {
    //     //   console.log('Rendering failed: ' + err);
    //     // })
    // })
}

const sumBuffers = (newBuffer, startTime, duration, volume, pitchAmount, destBuffer) => {
  const startInd = Math.round(startTime * 44100)
  let endInd = Math.round((startTime+duration) * 44100)
  if(endInd > destBuffer.length-1) endInd = destBuffer.length-1

  for(let i=startInd; i<endInd; i++){
    destBuffer[i] += newBuffer[i-startInd] * volume
  }
}

const normalizeBuffer = buffer => {
    buffer.forEach((val, i) => {
        if(val > 1) buffer[i] = 1
        else if(val < -1) buffer[i] = -1
    })
}

const repeatHits = instrument => {
    const hitTypes = repeatArray(instrument.hitTypes, instrument.sequence.length);

    return {
        ...instrument,
        hitTypes
    }
}

const repeatSequence = (instrument, beats) => {
    const sequence = loopSequence(instrument.sequence, beats);

    return {
        ...instrument,
        sequence
    }
}


export {
    getInstrumentsSequences,
    generateInstrumentTimeMap,
    generateInstrumentHitTypes,
    getActiveSoundsFromHitTypes,
    renderInstrumentSoundsAtTempo,
    repeatHits,
    repeatSequence,
}
