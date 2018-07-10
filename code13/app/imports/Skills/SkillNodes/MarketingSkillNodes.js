import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { marketing: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const MarketingSkillNodes = {
  $meta: {
    name: 'Marketing',
    description: 'Represents publicity and brand/awareness-building skills',
  },
  customer: C.E,
  requirements: C.E,
  competitors: C.E,
  brand: C.E,
  reach: C.E,
  growth: C.E,
}

export default MarketingSkillNodes
