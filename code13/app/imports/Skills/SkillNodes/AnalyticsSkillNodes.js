import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { art: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const AnalyticsSkillNodes = {
  $meta: {
    name: 'Analytics',
    description: 'Represents pixel art and animation skills',
  },

  metrics: C.E,
  bouncerate: C.E,
  engagement: C.E,
  conversion: C.E,
}

export default AnalyticsSkillNodes
