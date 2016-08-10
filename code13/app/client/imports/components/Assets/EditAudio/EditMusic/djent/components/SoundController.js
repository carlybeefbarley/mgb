import React, { Component } from 'react';
import deepEqual from 'deep-equal';

import {
    playSound,
} from '../utils/audio';

import {
    convertAllowedLengthsToArray,
    generateSequence,
    getSequenceForInstrument,
} from '../utils/sequences';

import {
    generateRiff,
} from '../utils/riffs';

import {
    capitalize,
    compose,
    deepClone,
    isIOS,
} from '../utils/tools';

import { saveAsWAVFile, saveAsMIDIFile } from '../utils/save';

import IOSWarning from './IOSWarning';
import LoopController from './LoopController';
import SVG from './SVG';
import Waveform from './Waveform';
import ContinuousGenerationController from './ContinuousGenerationController';
import Switch from './Switch';

const getSequences = (grooveTotalBeats, allowedLengths, hitChance) => {
    const mainBeat       = generateSequence({ totalBeats: grooveTotalBeats, allowedLengths, hitChance });
    const cymbalSequence = getSequenceForInstrument('cymbal');
    const hihatSequence  = getSequenceForInstrument('hihat');
    const snareSequence  = getSequenceForInstrument('snare');
    const droneSequence  = getSequenceForInstrument('drone');

    const sequences     = {
        c : cymbalSequence,
        h : hihatSequence,
        k : mainBeat,
        g : mainBeat,
        s : snareSequence,
        d : droneSequence,
    };

    return sequences;
}

const generateNewBuffer = ({ bpm, beats, allowedLengths, hitChance, instruments, usePredefinedSettings }) => {
    if (!allowedLengths.filter(length => length.amount).length) return Promise.reject('There are no allowed lengths given');

    const totalBeats              = beats.find(beat => beat.id === 'total');
    const grooveTotalBeats        = beats.find(beat => beat.id === 'groove');
    const grooveTotalBeatsProduct = grooveTotalBeats.beats * grooveTotalBeats.bars;
    const totalBeatsProduct       = totalBeats.beats * totalBeats.bars;
    const sequences               = getSequences(grooveTotalBeatsProduct, convertAllowedLengthsToArray(allowedLengths), hitChance);
    return generateRiff({ bpm, totalBeatsProduct, allowedLengths, sequences, instruments, usePredefinedSettings })
}

const play             = (audioContext, buffer) => playSound(audioContext, buffer, audioContext.currentTime, buffer.duration, 1);
const stop             = (src) => { if (src) { src.onended = () => {}; src.stop(0); } };
const loop             = (src, isLooping) => { if (src) { src.loop = isLooping } };

const fadeIn = (gainNode, duration) => {
    if (!duration) return gainNode
    const startVal = -1;
    const endVal = 0;
    gainNode.gain.value = startVal;

    let startTime = 0;
    (function loop (t) {
        if (!startTime) startTime = t;
        const time = t - startTime;
        const speed = duration === 0 ? 0 : time / duration;

        gainNode.gain.value = startVal + speed
        if (gainNode.gain.value < endVal) requestAnimationFrame(loop);
        else gainNode.gain.value = endVal;
    })(0.00);

    return gainNode;
}

class SoundController extends Component {
    queuedBuffer;
    queuedInstruments;
    currentGainNode;
    audioContext = '';
    isOutDated = true;
    renewalTimeout;
    renewalPoint = .80;
    state = {
        isLoading  : false,
        error      : '',
        isConvertingWav: false,
        isGenerating: false,
    }

    updateUI = (newState) => {
        requestAnimationFrame(() => this.setState(newState));
    }

    componentWillUpdate = (nextProps, nextState) => {
        if (nextProps.isLooping !== this.props.isLooping) loop(this.props.currentSrc, nextProps.isLooping);
        if (!this.props.generationState) return;

        const generationStateInstruments = this.props.generationState.instruments;

        // Check against the generation state to see if we're out of date
        if (   nextProps.bpm !== this.props.generationState.bpm
            || nextProps.hitChance !== this.props.generationState.hitChance
            || !deepEqual(nextProps.beats, this.props.generationState.beats)
            || !deepEqual(nextProps.allowedLengths, this.props.generationState.allowedLengths)
            || nextProps.instruments
                .filter((instrument, i) =>
                    instrument.sounds
                        .filter((sound, index) => sound.enabled !== generationStateInstruments[i].sounds[index].enabled ).length
                ).length
        ) {
            this.isOutDated = true;
        } else {
            this.isOutDated = false;
        }
    }

    generate = () => {
        this.setState({ isGenerating: true })
        const { bpm, beats, allowedLengths, hitChance, instruments, usePredefinedSettings } = this.props;

        // console.log('bpm', bpm)
        // console.log(bpm, beats, allowedLengths, hitChance, instruments, usePredefinedSettings)

        const generationState = deepClone({ bpm, beats, allowedLengths, hitChance, instruments, usePredefinedSettings });

        this.props.actions.updateGenerationState(generationState);

        this.isOutDated = false;
        this.updateUI({ isLoading: true });
        let self = this
        return generateNewBuffer({ ...generationState, instruments })
            .then(({ buffer, instruments }) => {
                const newState = { isLoading: false, error: '' };
                if (!buffer) newState.error = 'Error!'

                this.updateUI(newState);
                self.setState({ isGenerating: false })
                return {buffer, instruments};
            });
    }

    togglePlay = () => {
        if (this.props.isPlaying) {
            this.stopEvent();
        } else {
            this.playEvent(this.props.currentBuffer);
        }
    }

    playEvent = (currentBuffer) => {
        if (!currentBuffer || this.state.error) return;
        if (!this.audioContext) this.audioContext = new AudioContext();
        this.currentGainNode = this.audioContext.createGain();

        const currentSrc = currentBuffer ? play(this.audioContext, currentBuffer) : null;

        this.props.actions.updateCurrentBuffer(currentBuffer);
        this.props.actions.updateCurrentSrc(currentSrc);

        // Set up volume and fades
        currentSrc.connect(this.currentGainNode);
        this.currentGainNode.gain.value = 0;
        this.currentGainNode.connect(this.audioContext.destination);
        this.currentGainNode = fadeIn(this.currentGainNode, (this.props.fadeIn ? 5000 : 0));

        loop(currentSrc, this.props.isLooping);
        this.props.actions.updateIsPlaying(true);

        if (this.props.continuousGeneration) {
            const renewalTimeoutTime = Math.round((currentBuffer.duration * 1000) * this.renewalPoint);
            this.renewalTimeout = setTimeout(this.generateAndQueue, renewalTimeoutTime);
        }

        currentSrc.addEventListener('ended', this.onEnded);
    }

    stopEvent = () => {
        if (this.props.currentSrc && this.props.isPlaying) {
            this.props.currentSrc.removeEventListener('ended', this.onEnded);
            stop(this.props.currentSrc);
            if (this.renewalTimeout) clearTimeout(this.renewalTimeout);
            this.props.actions.updateIsPlaying(false);
        }
    }

    generateEvent = () => {
        if (!this.state.isLoading) {
            if (isIOS()) {
                const content = <IOSWarning onButtonClick={this.props.actions.disableModal} />
                this.props.actions.enableModal({ content, isCloseable: true, className: 'modal--wide' });
            }
            this.stopEvent();
            this.generate()
                .then(({buffer, instruments}) => this.updateInstrumentsAndPlay(buffer, instruments));
        }
    }

    generateAndQueue = () => {
        this.generate()
            .then(({buffer, instruments}) => {
                if (!this.props.isPlaying) return this.updateInstrumentsAndPlay(buffer, instruments);

                this.queuedBuffer = buffer;
                this.queuedInstruments = instruments;
            });
    }

    onEnded = () => {
        const { isPlaying, continuousGeneration } = this.props;
        if (isPlaying && continuousGeneration && this.queuedBuffer) {
            this.updateInstrumentsAndPlay(this.queuedBuffer, this.queuedInstruments)
            this.queuedInstruments = undefined;
            this.queuedBuffer = undefined;
        }
        else this.stopEvent();
    }

    updateInstrumentsAndPlay = (buffer, instruments) => {
        this.playEvent(buffer);
        this.props.actions.updateCustomPresetInstruments(instruments);
    }

    importWav(){
        var self = this
        this.setState({ isConvertingWav: true})
        let audioObject = saveAsWAVFile(this.props.currentBuffer, function(dataUri){
            self.importWavCB(dataUri)
        })

        // console.log('import wav', audioObject)
        // this.props.actions.importAudio(audioObject)
    }

    importWavCB(dataUri){
        // console.log(dataUri)
        let audioObject = new Audio()
        audioObject.src = dataUri
        this.props.actions.importAudio(audioObject)
        this.setState({ isConvertingWav: false})
        
    }

    render () {
        const eventName = this.props.isPlaying ? 'stop' : 'play';
        const continuousGeneration = document.location.hash === '#beta' && this.props.enableContinuousGenerationControl ? (
            <div className="group-spacing-y-small u-mr1">
                <ContinuousGenerationController
                    continuousGeneration={this.props.continuousGeneration}
                    actions={{
                        updateContinuousGeneration: (newVal) => this.props.actions.updateContinuousGeneration(newVal)
                    }}
                />
            </div>
        ) : null;

        return (
            <div>
                { this.state.error ? <p className="txt-error">{ this.state.error }</p> : null }
                <div className="row">
                    <button 
                        className={"ui blue button " + (this.state.isGenerating ? "loading" : "")} 
                        onClick={() => this.generateEvent()}>

                        { this.props.generateButtonText || 'Generate Riff' }
                    </button>

                    <button className={"ui button "+(!this.props.currentBuffer ? "disabled" : "")} title={ capitalize(eventName) } onClick={this.togglePlay}>
                        <i className={"icon " + eventName}></i>
                    </button>

                    <LoopController
                        isLooping={this.props.isLooping}
                        actions={{
                            updateIsLooping: (newVal) => this.props.actions.updateIsLooping(newVal)
                        }}
                    />

                    { continuousGeneration }

                        <Switch 
                            id={"settings"}
                            label={"Settings"}
                            isActive={this.props.isExpanded}
                            customStyle={{float:"right", marginTop:"7.5px", marginLeft:"5px"}}
                            onChange={this.props.actions.toggleSettings.bind(this, !this.props.isExpanded)}
                        />

                    <button className={"ui right floated button "+(!this.props.currentBuffer ? "disabled " : "")+(this.state.isConvertingWav ? "loading" : "")} title="Import" onClick={this.importWav.bind(this)}>
                        <i className="add square icon"></i> Import
                    </button>

                </div>
            </div>
        );
    }
}

export default SoundController;
