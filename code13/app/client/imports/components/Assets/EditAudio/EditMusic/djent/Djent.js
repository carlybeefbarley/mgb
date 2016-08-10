import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

// import configureStore from './store/configureStore';
import defaultInstruments from './utils/default-instruments.js';
import Main from './Main.js';

// import * as configActions from './actions/config';
// import * as instrumentsActions from './actions/instruments';
// import * as modalActions from './actions/modal';
// import { updateBeats } from './actions/beats';

// const store = configureStore();

const initialState = {
    allowedLengths			 : [],
    activePresetID       : 'adtr',
    bpm                  : 50,
    fadeIn               : false,
    hitChance            : 0.7,
    continuousGeneration : false,

    params: {splat: "djent"},

    beats	 : [ { id : 'total', bars  : 4, beats : 4, },
				       { id    : 'groove', bars  : 2, beats : 4, },
				     ]
}

const allowedLengths = [
    {
        id: "0.25",
        name: 'whole',
        amount: 0,
        isTriplet: false
    },
    {
        id: "0.5",
        name: 'half',
        amount: 0,
        isTriplet: false
    },
    {
        id: "1",
        name: 'quarter',
        amount: 25,
        isTriplet: false
    },
    {
        id: "2",
        name: 'eighth',
        amount: 25,
        isTriplet: false
    },
    {
        id: "4",
        name: 'sixteenth',
        amount: 50,
        isTriplet: false
    },
]

const actions = {
    // ...configActions,
    // ...instrumentsActions,
    // ...modalActions,
    // updateBeats
}

export default class Djent extends React.Component {

	constructor(props) {
  	super(props)

  	// console.log(allowedLengths)
    actions.importAudio = this.props.importAudio

	}

	render(){
		
		return (
       <div className="generatorRoot">
       	
       	<Main
       		allowedLengths={allowedLengths}
       		activePresetID={initialState.activePresetID}
       		bpm={initialState.bpm}
       		beats={initialState.beats}
       		instruments={defaultInstruments}
       		params={initialState.params}
       		actions={actions}
       	/>

       </div>
		)
	}

}



 // <Main
 //        	activePresetID={initialState.activePresetID}
 //        	allowedLengths={initialState.allowedLengths}
 //        	bpm={initialState.bpm}
 //        	beats={initialState.beats}
 //        	currentBuffer={state.sound.currentSrc ? state.sound.currentSrc.buffer : undefined}
 //        	instruments={initialState.instruments}
 //        />