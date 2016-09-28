import {
    loadInstrumentBuffers,
} from './audio';

import {
    generateInstrumentTimeMap,
    generateInstrumentHitTypes,
    getInstrumentsSequences,
    repeatHits,
    repeatSequence,
    renderInstrumentSoundsAtTempo
} from './instruments';

import {
    compose,
} from './tools';

const generateRiff = ({ bpm, totalBeatsProduct, allowedLengths, sequences, instruments, usePredefinedSettings }) => {
    // console.log(sequences, instruments)
    const bpmMultiplier  = 60 / bpm;
    const context        = new (window.AudioContext || window.webkitAudioContext)()
    const instrumentPack = getInstrumentsSequences({ sequences, instruments, usePredefinedSettings, totalBeats: totalBeatsProduct });

    console.log(instrumentPack)

    return loadInstrumentBuffers(context, instrumentPack)
        .then((instrumentPack) => { 
            console.log(instrumentPack)
            return initiateInstruments({ context, instrumentPack, totalBeatsProduct, bpmMultiplier, usePredefinedSettings }) })
        .then(({ buffer, instruments }) => {
            if (context.close) context.close();
            return Promise.resolve({ buffer, instruments })
        })
        .catch(e => { (console.error || console.log).call(console, e); });
}

const initiateInstruments = ({ context, instrumentPack, totalBeatsProduct, bpmMultiplier, usePredefinedSettings }) => {
    const createSoundMaps = instrument => compose(
        generateInstrumentTimeMap,
        repeatHits,
        instrument => repeatSequence(instrument, totalBeatsProduct),
        generateInstrumentHitTypes
    )(instrument, usePredefinedSettings);

    console.log(instrumentPack)

    const instruments = instrumentPack.map(createSoundMaps)

    console.log(instruments)

    return renderInstrumentSoundsAtTempo(instruments, totalBeatsProduct, bpmMultiplier)
        .then(buffer => Promise.resolve({ buffer, instruments }));
}

export {
    generateRiff,
}
