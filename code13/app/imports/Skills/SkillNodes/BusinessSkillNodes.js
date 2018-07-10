import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { business: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const BusinessSkilNodes = {
  $meta: {
    name: 'Business',
    description: 'Represents business, monetization and project management skills',
  },
  monetization: {
    freemium: C.E,
    upsell: C.E,
    consumables: C.E,
    subscriptions: C.E,
    ads: C.E,
  },
  projectManagement: C.E,
}

export default BusinessSkilNodes
