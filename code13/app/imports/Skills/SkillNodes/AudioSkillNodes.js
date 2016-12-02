import C from './CommonSkillNodes.js'


// These will be inserted into { audio: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Audio',
    description:    'Represents music and sound skills',
  },
  music: {
    ambient:        C.E,
    intense:        C.E,
    loops:          C.E
  },
  fx: {
    jsfxr:          C.E,
    loops:          C.E
  } 
}