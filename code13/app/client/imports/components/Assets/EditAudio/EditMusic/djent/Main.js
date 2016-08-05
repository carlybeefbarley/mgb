import React, { Component } from 'react';

import BeatsController from './components/BeatsController';
import Expandable from './components/Expandable';
import ExportController from './components/ExportController';
import InstrumentList from './components/InstrumentList';
import Panel from './components/Panel';
import Spinner from './components/Spinner';

import BeatPanel from './components/BeatPanel';
import PresetController from './components/PresetController';


import BPMController from './containers/BPMController';
import BPMTapper from './containers/BPMTapper';
import FadeController from './containers/FadeController';
import Modal from './containers/Modal';
import ShareController from './containers/ShareController';
import SoundController from './containers/SoundController';
import Visualiser from './containers/Visualiser';

import presets from './utils/presets';
import { getActiveSoundsFromHitTypes } from './utils/instruments';
import { getPresetData, getPresetFromData, handleGoogleAPI } from './utils/short-urls';
import { getAllowedLengthsFromSequence } from './utils/sequences';

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
        }

        this.props.actions.applyPreset = this.applyPreset.bind(this)
        this.props.actions.updateHitChance = this.updateHitChance.bind(this)
        this.props.actions.updateBeats = this.updateBeats.bind(this)
        this.props.actions.updateAllowedLengths = this.updateAllowedLengths(this)
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
        this.setState({ activePresetID: preset.id, preset: preset })
    }

    updateHitChance(hitChance) {
        console.log('updatehitchance', hitChance)

        if (!hitChance)       hitChance = 1;
        if (hitChance < 0.05) hitChance = 0.05;
        if (hitChance > 1)    hitChance = 1;

        this.setState({ hitChance: hitChance})
    }

    updateBeats(id, prop, value) {
        console.log('update beats', id, prop, value)
        if (prop === 'bars' || prop === 'beats') {
            if (!value)    value = 4;
            if (value < 1) value = 1;
            if (value > 8) value = 8;
        }


    }

    updateAllowedLengths(allowedLengths){
        console.log('update allowed length', allowedLengths)

    }






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
        const totalBeat = this.props.beats.find(beat => beat.id === 'total');
        const beats = this.props.beats
            .filter(beat => beat.id !== 'total')
            .map((beat, i) => <BeatPanel beat={ beat } actions={this.props.actions} preset={this.state.preset} key={i} /> );

        // console.log(this.props.hitChance)

        const usePredefinedSettings = isShareRoute;
        const generateButtonText = isShareRoute ? 'Load riff' : 'Generate Riff';

        return (
            <section>
                <Modal />
                <div className="group-capped-x group-centered">

                    <div className="group-spacing-x">
                        <div className="group-spacing-y-large u-flex-row u-flex-justify">
                            <h1 className="title-primary u-txt-light">
                                Djenerator!!
                            </h1>
                        </div>
                    </div>

                    <div className="group-spacing-x">
                        <div className="group-spacing-y">
                            {
                                isShareRoute
                                ? null
                                : (
                                    <Panel>
                                        <h2 className="title-primary">
                                            Preset
                                        </h2>

                                        <PresetController activePresetID={this.state.activePresetID} actions={this.props.actions} />
                                    </Panel>
                                )
                            }

                            <Panel>
                                <Visualiser pretext={ isShareRoute ? "Click 'Load Riff' to begin" : "Click 'Generate Riff' to begin" } />
                            </Panel>

                            <Panel theme="dark" sizeY="small">
                                <div className="u-flex-row u-flex-justify u-flex-center u-flex-wrap">
                                    <SoundController
                                        usePredefinedSettings={ usePredefinedSettings }
                                        generateButtonText={ generateButtonText }
                                        enableContinuousGenerationControl={ !isShareRoute }
                                    />

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

                                </div>
                            </Panel>
                        </div>

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
                                        <h2 className="title-primary">Main Settings</h2>

                                        <div className="grid grid--wide grid--middle">
                                            <div className="grid__item one-half alpha--one-whole">
                                                <div className="group-spacing-y-small">
                                                    <div className="u-flex-row u-flex-end">
                                                        <div className="u-flex-grow-1 u-mr1">
                                                            <BPMController />
                                                        </div>
                                                        <div className="">
                                                            <BPMTapper />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {
                                                isShareRoute
                                                ? null
                                                : (
                                                    <div className="grid__item one-half alpha--one-whole">
                                                        <div className="group-spacing-y-small">
                                                            <BeatsController
                                                                beat={ totalBeat }
                                                                actions={{ updateBeats: this.props.actions.updateBeats }}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }

                                        </div>
                                    </Panel>

                                    <Panel>
                                        { beats }
                                    </Panel>
                                </div>

                                    <div className="group-spacing-y">
                                        <Panel>
                                            <h2 className="title-primary">Sounds</h2>

                                            <InstrumentList
                                                actions={{
                                                    disableModal: this.props.actions.disableModal,
                                                    enableModal: this.props.actions.enableModal,
                                                    updateInstrumentSound: this.props.actions.updateInstrumentSound,
                                                    updateInstrumentPitch: this.props.actions.updateInstrumentPitch,
                                                }}
                                                instruments={this.props.instruments}
                                            />
                                        </Panel>
                                    </div>
                                </Expandable>
                            )
                        }

                    </div>

                </div>
            </section>
        );
    }
}
