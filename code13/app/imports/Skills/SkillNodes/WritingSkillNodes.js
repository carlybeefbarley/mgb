import C from './CommonSkillNodes.js'

// These will be inserted into { writing: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const WritingSkillNodes = {
  $meta: {
    name: 'Writing',
    description: 'Represents writing skills - plot, character, narrative, dialog etc',
  },
  character: {
    roles: {
      protagonist: C.E,
      antagonist: C.E,
      protector: C.E,
      mentor: C.E,
      dependent: C.E,
    },
    motivations: {
      survival: C.E,
    },
  },
  structures: {
    Plot: C.E,
    Tropes: C.E,
    "Hero's Journey": C.E,
  },
  'narrative devices': {
    Narrator: C.E,
    Notes: C.E,
  },
}

export default WritingSkillNodes
