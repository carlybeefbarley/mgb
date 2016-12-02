import C from './CommonSkillNodes.js'


// These will be inserted into { marketing: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Marketing',
    description:    'Represents publicity and brand/awareness-building skills',
  },
  customer:         C.E,
  requirements:     C.E,
  competitors:      C.E,
  brand:            C.E,
  reach:            C.E,
  growth:           C.E
}