import C from './CommonSkillNodes.js'


// These will be inserted into { art: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Art',
    description:    'Represents pixel art and animation skills',
  },
  proportion:         C.E,
  process: {
    'concept':        C.E,
    'constraints':    C.E,
    'sketch':         C.E,
    'review':         C.E,
    'coloring':       C.E
  },
  shading: {
    'pillow shading':   C.E,
    'dithering':        C.E,
    'anti-aliasing':    C.E,
    'reverse aa':       C.E,
    'lines-and-curves': C.E,
    'ambient lighting': C.E,
    'transparency':     C.E,
    'interlaces-scanlines': C.E,
    'layers':           C.E
  },
  perspectives: {
    'top-down':     C.E,
    'side-view':    C.E,
    isometric:      C.E
    // @stanchion.. others?
  },
  'character-design': {
    humanoids:		C.E,
    animals:	  	C.E,
    monsters:     C.E,
    objects:			C.E	// i.e. cookies, burgers, etc
  },
  color: 
  { 
    'palettes':    C.E,
    'color-temp':  C.E,
  },
  animations:      C.E
}