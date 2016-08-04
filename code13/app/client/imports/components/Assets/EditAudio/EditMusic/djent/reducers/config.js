import { extendObjectArrayByID } from '../utils/tools';

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
        amount: 1,
        isTriplet: false
    },
    {
        id: "2",
        name: 'eighth',
        amount: 1,
        isTriplet: false
    },
    {
        id: "4",
        name: 'sixteenth',
        amount: 2,
        isTriplet: false
    },
];

const initialState = {
    allowedLengths,
    activePresetID       : 'adtr',
    bpm                  : 80,
    fadeIn               : false,
    hitChance            : 0.8,
    continuousGeneration : false,
};

const getInitialState = () => {
    return {
        ...initialState,
        allowedLengths: allowedLengths.map(length => ({ ...length }))
    }
}

export default function config(state = getInitialState(), action) {
    let { type, payload } = action;

    switch (type) {
        case 'UPDATE_ALLOWED_LENGTHS':
            return {
                ...state,
                allowedLengths: [ ...payload.allowedLengths ]
            };

        case 'UPDATE_BPM':
            return {
                ...state,
                bpm: payload.bpm
            };

        case 'UPDATE_IS_LOOOPING':
            return {
                ...state,
                continuousGeneration: payload.isLooping ? false : state.continuousGeneration
            };

        case 'UPDATE_CONTINUOUS_GENERATION':
            return {
                ...state,
                continuousGeneration: payload.continuousGeneration
            };

        case 'UPDATE_HITCHANCE':
            return {
                ...state,
                hitChance: payload.hitChance
            };

        case 'UPDATE_FADEIN':
            return {
                ...state,
                fadeIn: payload.fadeIn
            };

        case 'APPLY_PRESET':
            const { preset } = payload;
            const { bpm, fadeIn, allowedLengths, hitChance } = preset.settings.config;
            const newState = { ...getInitialState() };

            if (bpm) newState.bpm = bpm;
            if (fadeIn) newState.fadeIn = fadeIn;
            if (hitChance) newState.hitChance = hitChance;
            if (allowedLengths) {
                newState.allowedLengths = extendObjectArrayByID(newState.allowedLengths, [ ...allowedLengths ])
            }

            return {
                ...newState,
                activePresetID: preset.id
            };

        default:
            return state;
  }
}

export {
    initialState
}

