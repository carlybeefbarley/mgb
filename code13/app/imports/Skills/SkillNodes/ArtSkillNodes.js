import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { art: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

const ArtSkillNodes = {
  $meta: {
    name: 'Art',
    description: 'Represents pixel art and animation skills',
  },

  lineArt: {
    $meta: {
      name: 'Line Art',
      description: 'Basics of creating line art.',
    },
    linesAndCurves: C.En(0),
    antiAliasing: C.En(2),
  },

  colors: {
    $meta: {
      name: 'Colors',
      description: 'Creating and applying an appropriate color palette for your art.',
    },
    HSV: C.En(0),
    colorPalette: C.En(1),
    colorRamps: C.En(2),
  },

  shadesAndTextures: {
    $meta: {
      name: 'Shades and Textures',
      description: 'Shading and adding textures to your art.',
    },
    shadowAndLight: C.En(0),
    dithering: C.En(2),
    textures: C.En(3),
  },

  gameSprites: {
    $meta: {
      name: 'Game Sprites',
      description: 'Designing and creating sprite with the game in mind.',
    },
    perspectives: C.En(3),
    characterDesign: C.En(1),
    animations: C.En(2),
    tiling: C.En(2),
  },
}

export default ArtSkillNodes
