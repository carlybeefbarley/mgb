import C from './CommonSkillNodes.js'


// These will be inserted into { business: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Business',
    description:    'Represents business, monetization and project management skills',
  },
  monetization: {
    freemium:         C.E,
    upsell:           C.E,
    consumables:      C.E,
    subscriptions:    C.E,
    ads:              C.E
  },
  projectManagement:  C.E
}