import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { business: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const LegalSkillNodes = {
  $meta: {
    name: 'Legal',
    description: 'Represents intellectual property and other legal topics',
  },
  intellectualProperty: {
    copyright: C.E,
    license: C.E,
    patents: C.E,
    publicDomain: C.E,
    fairUse: C.E,
  },
  contracts: {
    workForHire: C.E,
    keyTerms: C.E,
    jurisdiction: C.E,
  },
  tax: {
    salesTax: C.E,
    incomeTax: C.E,
  },
}

export default LegalSkillNodes
