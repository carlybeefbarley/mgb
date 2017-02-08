import C from './CommonSkillNodes'


// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { code: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js


// Some shorthands to save space and time for common nodes
// Enabled Leaf Node, Learning Level = 0..4 (0 = beginner). See CommonSkillNodes.js for info

export default {
  $meta: {
    name:           'PhaserJS',
    description:    'PhaserJS Game Development Framework',
    assetExamples:  [ '!vault:phaser.groups.addSprite'] // Not used yet. Example for discussion
  },
  // Game:       C.En(1),
  // Loader:     C.En(1),
  drawImage: {
    $meta: {
      name: 'Draw image',
      icon: 'code',
      link: '/u/!vault/asset/5Bm4R9kJHRAMBv4kD',
      description: `The most basic concept starting game devolopment`,
    },
  },
  positionImage: {
    $meta: {
      name: 'Position image',
      icon: 'code',
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `x, y and anchor point`,
    },
  },
  taskSetPosition: {
    $meta: {
      name: 'Task set position',
      icon: 'tasks',
      link: '/u/!vault/asset/Pn9mhjR7yAW3iTsRt',
      description: `Set image positions`,
    },
  },
  manipulateImage: {
    $meta: {
      name: 'Manipulate image',
      icon: 'code',
      link: '/u/!vault/asset/nzZK4r5a4WPAszBjj',
      description: `scale, alpha, rotate, tint`,
    },
  },
  inputClick: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/ENnr8RSrrSRB3ybTg',
      name: 'Input click',
      description: `Cick on image, click on game`
    },
  },
  taskInput: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/79YpYHXg9DbQG6tXp',
      name: 'Task',
      description: `On each click make the sprite rotate counter clockwise by 10°`
    },
  },
  inputKeyboard: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/8j9CBTzfBuT5GKLtF',
      name: 'Input keyboard',
      description: `keyboard keys`
    },
  },
  updateFunction: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/4fQsLapzr4uWGLbnp',
      name: 'update() function',
      description: `example with increasing/descreasing size with arrow up/down`
    },
  },
  taskMoveChar: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/kMhY34EAEsETMiGmF',
      name: 'Task',
      description: `Move character around screen using arrow keys`
    },
  },
  spriteSheet: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Spritesheet',
      description: ``
    },
  },
  spriteSheetEvents: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Spritesheet events',
      description: ``
    },
  },
  physicsBasics: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Physics basics',
      description: `velocity, gravity, world bounds...`
    },
  },
  physicsCollide: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Physics collide',
      description: ``
    },
  },
  tweens: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Tweens',
      description: ``
    },
  },
  groups: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Groups',
      description: ``
    },
  },
  oop: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'OOP',
      description: `Object oriented programming`
    },
  },
  gameState: {
    $meta: {
      icon: 'code',
      link: '',
      name: 'Game states',
      description: ``
    },
  },

}









//   basics: {
//     $meta: {
//       name:         'PhaserJS Basics',
//       description:  'Basics to start learn Phaser'
//     },
//     loadImage:       C.En(1),
//     moveImage:       C.En(1),
//     clickImage:      C.En(1),
//     text:            C.En(1),
//     animation:       C.En(1),
//     tween:           C.En(1),
//   },
//   sprites: {
//     $meta: {
//       name:         'Sprites',
//       description:  'Drawing and manipulating images (sprites)'
//     },
//     add:             C.En(1),
//     scale:           C.En(1),
//     spritesheet:     C.En(1),
//     tint:            C.En(1),
//     pivot:           C.En(1),
//     rotate:          C.En(1),
//     destroy:         C.En(1),
//   },
//   groups: {
//     $meta: {
//       name:         'Groups',
//       description:  'Grouping objects and manipulating them'
//     },
//     addSprite:          C.En(1),
//     foreach:            C.En(1),
//     callAllAnimations:  C.En(1),
//     bringToTop:         C.En(1),
//     swapChildren:       C.En(1),
//   },
//   input: {
//     $meta: {
//       name:         'Input',
//       description:  'Mouse, touch and keyboard'
//     },
//     clickGame:        C.En(1),
//     clickOnSprite:    C.En(1),
//     keyboard:         C.En(1),
//     drag:             C.En(1),
//     downDuration:     C.En(1),
//   },
//   animation: {
//     $meta: {
//       name:         'Animations',
//       description:  'Frame based animations'
//     },
//     changeFrame:         C.En(1),
//     events:              C.En(1),
//     multipleAnimations:  C.En(1),
//   },
//   tweens: {
//     $meta: {
//       name:         'Tweens',
//       description:  'Tween based animation. Interpolating between one state to another'
//     },
//     tweensTo:         C.En(1),
//     alphaText:        C.En(1),
//     events:           C.En(1),
//     chainedTweens:    C.En(1),
//     easing:           C.En(1),
//     bubbles:          C.En(1),
//   },
//   audio: {
//     $meta: {
//       name:         'Audio',
//       description:  'Loading audio and playing it'
//     },
//     playSound:       C.En(1),
//     pauseResume:     C.En(1),
//   },
//   physics: {
//     $meta: {
//       name:         'Physics',
//       description:  'Simple physics: collision detection, bounding boxes'
//     },
//     collide:        C.En(1),
//     gravity:        C.En(1),
//     boundingBox:    C.En(1),
//     bodySize:       C.En(1),
//     angryBirds:     C.En(1),
//   },