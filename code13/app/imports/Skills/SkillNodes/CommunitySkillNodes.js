import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { art: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const CommunitySkillNodes = {
  $meta: {
    name: 'Community',
    description: 'Represents Community growth and management skills',
  },
  betas: C.E,
  feedback: C.E,
  support: C.E,
  issues: C.E,
  trolls: C.E,
  playtesting: C.E,
}

export default CommunitySkillNodes
