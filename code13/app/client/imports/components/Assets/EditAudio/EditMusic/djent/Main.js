import React, { Component } from 'react';

import BeatsController from './components/BeatsController';
import Expandable from './components/Expandable';
import ExportController from './components/ExportController';
import InstrumentList from './components/InstrumentList';
import Panel from './components/Panel';
import Spinner from './components/Spinner';

import BeatPanel from './components/BeatPanel';
import PresetController from './components/PresetController';
import BPMController from './components/BPMController';
import BPMTapper from './components/BPMTapper';
import SoundController from './components/SoundController';
import Visualiser from './components/Visualiser';


import FadeController from './containers/FadeController';
import Modal from './containers/Modal';
import ShareController from './containers/ShareController';



import presets from './utils/presets';
import { getActiveSoundsFromHitTypes } from './utils/instruments';
import { getPresetData, getPresetFromData, handleGoogleAPI } from './utils/short-urls';
import { getAllowedLengthsFromSequence } from './utils/sequences';

import defaultInstruments from './utils/default-instruments';
import defaultLengths from './utils/defaultLengths';

export default class Main extends Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired
    }
    state = {
        googleAPIHasLoaded: false
    }

    constructor(props) {
        super(props);

        const activePresetID = 'adtr';
        const preset = presets.find(function(a){ return a.id===activePresetID ? a : null })
        this.state = {
            activePresetID: activePresetID,
            preset: preset,
            
            isPlaying       : false,
            isLooping       : true,
            generationState : undefined,
            currentBuffer   : undefined,
            currentSrc      : undefined,

            continuousGeneration: false,
            fadeIn: false,
        }

        this.props.actions.applyPreset = this.applyPreset.bind(this)
        this.props.actions.updateHitChance = this.updateHitChance.bind(this)
        this.props.actions.updateBeats = this.updateBeats.bind(this)
        this.props.actions.updateAllowedLengths = this.updateAllowedLengths.bind(this)
        this.props.actions.updateBPM = this.updateBPM.bind(this)
        this.props.actions.updateInstrumentSound = this.updateInstrumentSound.bind(this)
        this.props.actions.updateInstrumentPitch = this.updateInstrumentPitch.bind(this)

        this.props.actions.updateIsPlaying = this.updateIsPlaying.bind(this)
        this.props.actions.updateIsLooping = this.updateIsLooping.bind(this)
        this.props.actions.updateGenerationState = this.updateGenerationState.bind(this)
        this.props.actions.updateCurrentBuffer = this.updateCurrentBuffer.bind(this)
        this.props.actions.updateCurrentSrc = this.updateCurrentSrc.bind(this)

        this.props.actions.updateContinuousGeneration = this.updateContinuousGeneration.bind(this)
        this.props.actions.updateFadeIn = this.updateFadeIn.bind(this)


    }

    

    componentWillMount = () => {
        const shareID = this.props.params.shareID;

        console.log(this.props.actions)

        handleGoogleAPI()
            .then(() => {
                this.checkForShareData(shareID);
                this.setState({ googleAPIHasLoaded: true })
            })
            .catch(e => console.log(e));

        if (!shareID) {
            const presetID = this.props.params.presetID || this.props.activePresetID;
            const preset = presets.find(preset => preset.id === presetID) || presets.find(preset => preset.id === this.props.activePresetID);
            console.log('apply preset')
            return this.props.actions.applyPreset(preset);
        }

        this.props.actions.enableModal({
            content: (<Spinner subtext="Loading..." />),
            isCloseable: false,
            className: 'modal--auto-width',
        });

    }


    // ********** actions *******************
    applyPreset(preset){
        console.log('apply preset new', preset)
     

        let instruments = preset.settings.instruments
        // add missing instruments
        defaultInstruments.map(instrument => {
            const newInstrument = instruments.find(newInstrument => newInstrument.id === instrument.id)
            if (!newInstrument){
                instruments.push(instrument)
            }
        })

        // add missing params for instruments
        instruments.map(instrument => {
            const configInstrument = defaultInstruments.find(configInstrument => configInstrument.id === instrument.id)
            Object.keys(configInstrument).map(param => {
                if(!instrument[param])
                    instrument[param] = configInstrument[param]
            })

            // add missing sound params
            instrument.sounds.map(sound => {
                const configSound = configInstrument.sounds.find(configSound => configSound.id === sound.id)
                Object.keys(configSound).map(param => {
                    if(!sound[param])
                        sound[param] = configSound[param]
                })
            })

            // add missing sounds
            configInstrument.sounds.map(configSound => {
                const newSound = instrument.sounds.find(newSound => configSound.id === newSound.id)
                if(!newSound){
                    instrument.sounds.push(configSound)
                }
            })

        })

        // add missing allowed lengths
        let allowedLengths = preset.settings.config.allowedLengths
        defaultLengths.map(item => {
            const newLength = allowedLengths.find(newLength => newLength.id === item.id)
            if (!newLength){
                allowedLengths.push(item)
            }
        })

        // add missing allowed lengths params
        allowedLengths.map(item => {
           const defaultL = defaultLengths.find(defaultL => defaultL.id === item.id)

           Object.keys(defaultL).map(param => {
             if(!item[param]){
                item[param] = defaultL[param]
             }
           }) 
        })

        
        this.setState({ activePresetID: preset.id, preset: preset })
    }

    updateHitChance(hitChance) {
        console.log('updatehitchance', hitChance)

        if (!hitChance)       hitChance = 1;
        if (hitChance < 0.05) hitChance = 0.05;
        if (hitChance > 1)    hitChance = 1;

        let preset = this.state.preset
        preset.settings.config.hitChance = hitChance
        this.setState({ preset: preset })
    }

    updateBeats(id, prop, value) {
        console.log('update beats', id, prop, value)
        if (prop === 'bars' || prop === 'beats') {
            if (!value)    value = 4;
            if (value < 1) value = 1;
            if (value > 8) value = 8;
        }

        let beats = this.state.preset.settings.beats
        let beat = beats.find(function(a){ return a.id === id ? a : null })
        let i = beats.indexOf(beat)
        if(beat && beat[prop]){
            beat[prop] = value
            beats[i] = beat

            let preset = this.state.preset
            preset.settings.beats = beats
            this.setState({ preset: preset })

            console.log('updated beats')
        }
    }

    updateAllowedLengths(allowedLengths){
        console.log('update allowed length', allowedLengths)

        let preset = this.state.preset
        preset.settings.config.allowedLengths = allowedLengths
        this.setState({ preset: preset })
    }

    updateBPM(bpm) {
        if (!bpm)       bpm = 100;
        if (bpm < 50)   bpm = 50;
        if (bpm > 300) bpm = 300;

        let preset = this.state.preset
        preset.settings.config.bpm = bpm
        this.setState({ preset: preset })

    }

    updateInstrumentSound({ soundID, parentID, prop, value }) {
        console.log('updateInstrumentSound', soundID, parentID, prop, value)

        let instruments = this.state.preset.setting.instruments
        let parent = instruments.find(function(a){ return a.id === parentID ? a : null })
        let parentNr = instruments.indexOf(parent)
        if(parent){
            let sound = parent.sounds.find(function(a){ a.id === soundID ? a : null })
            let soundNr = parent.sounds.indexOf(sound)
            if(sound){
                sound[prop] = value

                parent.sounds[soundNr] = sound
                instruments[parentNr] = parent

                let preset = this.state.preset
                preset.settings.instruments = instruments
                this.setState({ preset: preset })

                console.log('updateInstrumentSound22222')
            }
        }
    }

    updateInstrumentPitch({ instrumentID, value }) {
        console.log('updateInstrumentPitch', instrumentID, value, confineToRange(value, -1200, 1200))


        return {
            type: 'UPDATE_INSTRUMENT_DETUNE_PROP',
            payload: { instrumentID, value: confineToRange(value, -1200, 1200) },
        };
    }


    updateIsPlaying(isPlaying) { this.setState({ isPlaying: isPlaying }) }


    updateIsLooping(isLooping){ this.setState({ isLooping: isLooping }) }

    

    // updateIsLoading(isLoading) {
    //     return {
    //         type: 'UPDATE_IS_LOADING',
    //         payload: { isLoading },
    //     };
    // }

    // export function updateError(error) {
    //     return {
    //         type: 'UPDATE_ERROR',
    //         payload: { error },
    //     };
    // }

    updateGenerationState(generationState) { this.setState({ generationState: generationState }) }

    updateCurrentBuffer(currentBuffer) { this.setState({ currentBuffer: currentBuffer }) }

    updateCurrentSrc(currentSrc) { this.setState({ currentSrc: currentSrc }) }

    updateContinuousGeneration(continuousGeneration) { this.setState({ continuousGeneration: continuousGeneration}) }

    updateFadeIn(fadeIn) { this.setState({ fadeIn: fadeIn}) }

    // -------------- actions ----------------------





    componentWillUpdate = (nextProps) => {
        if (!this.props.params.shareID && nextProps.params.shareID) {
            this.checkForShareData(nextProps.params.shareID);
        }
    }

    checkForShareData = (shareID) => {
        if (shareID) getPresetData(shareID)
            .then(this.applySharedPreset);
    }

    applySharedPreset = (data) => {
        const sharedPreset = getPresetFromData(data);

        if (sharedPreset) {
            sharedPreset.settings.config.allowedLengths = getAllowedLengthsFromSequence(sharedPreset.settings.instruments.find(i => i.id === 'g').predefinedSequence, this.props.allowedLengths)
            sharedPreset.settings.instruments = sharedPreset.settings.instruments
                .map(i => ({ ...i, sounds: getActiveSoundsFromHitTypes(i.predefinedHitTypes) }));
        }

        const preset = sharedPreset;

        this.props.actions.applyPreset(preset);
        this.props.actions.disableModal();
    }

    render = () => {
        // const isShareRoute = this.props.route.id === 'share';
        const isShareRoute = false;
        const totalBeat = this.state.preset.settings.beats.find(beat => beat.id === 'total');
        const beats = this.state.preset.settings.beats
            .filter(beat => beat.id !== 'total')
            .map((beat, i) => <BeatPanel beat={ beat } actions={this.props.actions} preset={this.state.preset} key={i} /> );

        // console.log(this.props.hitChance)

        const usePredefinedSettings = isShareRoute;
        const generateButtonText = isShareRoute ? 'Load riff' : 'Generate Riff';

        return (
            <section>
                <Modal />
                <div>
                    <div>
                        <div>
                            {
                                isShareRoute
                                ? null
                                : (
                                    <div className="row">
                                        <span className="title-primary">
                                            Preset
                                        </span>
                                        &nbsp;&nbsp;
                                        <PresetController activePresetID={this.state.activePresetID} actions={this.props.actions} />
                                    </div>
                                )
                            }

                            <Panel>
                                <Visualiser 
                                    pretext={""} 

                                    isPlaying={this.state.isPlaying}
                                    currentBuffer={this.state.currentBuffer}
                                    currentSrc={this.state.currentSrc}
                                />
                            </Panel>

                            <Panel>
                                <div>
                                    <SoundController
                                        usePredefinedSettings={ usePredefinedSettings }
                                        generateButtonText={ generateButtonText }
                                        enableContinuousGenerationControl={ !isShareRoute }


                                        isPlaying={this.state.isPlaying}
                                        isLooping={this.state.isLooping}                                        
                                        generationState={this.state.generationState}
                                        currentBuffer={this.state.currentBuffer}
                                        currentSrc={this.state.currentSrc}

                                        bpm={this.state.preset.settings.config.bpm} 
                                        beats={this.state.preset.settings.beats} 
                                        allowedLengths={this.state.preset.settings.config.allowedLengths}
                                        hitChance={this.state.preset.settings.config.hitChance}
                                        instruments={this.state.preset.settings.instruments}

                                        continuousGeneration={this.state.continuousGeneration}
                                        fadeIn={this.state.fadeIn}

                                        actions={this.props.actions}
                                    />

                                    {/*
                                    <div className={`u-flex-row u-flex-wrap u-flex-${ isShareRoute ? 'center' : 'start' }`}>
                                        <div className={`group-spacing-y-small u-mr05 ${ isShareRoute ? '' : 'u-mb0' }`}>
                                            <ExportController
                                                instruments={ this.props.instruments }
                                                bpm={ this.props.bpm }
                                                currentBuffer={ this.props.currentBuffer }
                                                actions={{
                                                    disableModal: this.props.actions.disableModal,
                                                    enableModal: this.props.actions.enableModal,
                                                }}
                                            />
                                        </div>

                                        {
                                            isShareRoute
                                            ? (
                                                <div className="group-spacing-y-small">
                                                    <span className="u-mr05">or</span>
                                                    <a className="link-base" onClick={e => this.context.router.push('/')}>
                                                        Generate new riff
                                                    </a>
                                                </div>
                                            )
                                            : (
                                                <div className="group-spacing-y-small">
                                                    <ShareController googleAPIHasLoaded={this.state.googleAPIHasLoaded} />
                                                </div>
                                            )
                                        }
                                    </div>

                                */}

                                </div>
                            </Panel>
                        </div>

                        <div style={{clear:"both"}}>&nbsp;</div>

                        {
                            isShareRoute
                            ? null
                            : (
                                <Expandable
                                    title="Settings"
                                    titleClassName="u-curp u-mb1 title-primary dropdown-icon-after dropdown-icon-after--light u-dib u-txt-light u-txt-large"
                                    enableStateSave={true}
                                >
                                <div>
                                    <Panel>
                                        <h3>Main Settings</h3>

                                        <div className="row">
                                            <BPMController bpm={this.state.preset.settings.config.bpm} actions={this.props.actions} />
                                            &nbsp;&nbsp;
                                            <BPMTapper actions={this.props.actions} />
                                            &nbsp;&nbsp;

                                            {
                                                isShareRoute
                                                ? null
                                                : (
                    
                                                    <BeatsController
                                                        beat={ totalBeat }
                                                        actions={this.props.actions}
                                                    />
                                                )
                                            }

                                        </div>
                                    </Panel>

                                    <div style={{clear:"both"}}>&nbsp;</div>
                                    <Panel>
                                        { beats }
                                    </Panel>
                                </div>

                                    <div style={{clear:"both"}}>&nbsp;</div>
                                    <Panel>
                                        <h3>Sounds</h3>

                                        <InstrumentList
                                            actions={{
                                                disableModal: this.props.actions.disableModal,
                                                enableModal: this.props.actions.enableModal,
                                                updateInstrumentSound: this.props.actions.updateInstrumentSound,
                                                updateInstrumentPitch: this.props.actions.updateInstrumentPitch,
                                            }}
                                            instruments={this.state.preset.settings.instruments}
                                        />
                                    </Panel>
                                </Expandable>
                            )
                        }

                    </div>

                </div>
            </section>
        );
    }
}