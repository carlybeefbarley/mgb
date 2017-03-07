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
      description: `The most basic concept for starting game development`,
    },
    'drawImage': C.En(0),
  },
  positionImage: {
    $meta: {
      name: 'Position image',
      icon: 'code',
      isTask: true,
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `Position an image with x, y and anchor point`,
    },
    'positionImage': C.En(0),
  },
  taskSetPosition: {
    $meta: {
      name: 'Task set position',
      icon: 'tasks',
      link: '/u/!vault/asset/Pn9mhjR7yAW3iTsRt',
      description: `Set image positions`,
    },
    'taskSetPosition': C.En(0),
  },
  manipulateImage: {
    $meta: {
      name: 'Manipulate image',
      icon: 'code',
      link: '/u/!vault/asset/nzZK4r5a4WPAszBjj',
      description: `Image scaling, transparency, rotation and tinting`,
    },
    'manipulateImage': C.En(0),
  },
  inputClick: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/ENnr8RSrrSRB3ybTg',
      name: 'Input click',
      description: `Click on image, click on game`
    },
    'inputClick': C.En(0),
  },
  taskInput: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/79YpYHXg9DbQG6tXp',
      name: 'Task Input',
      description: `On each click, make the sprite rotate counter-clockwise by 10°`
    },
    'taskInput': C.En(0),
  },
  inputKeyboard: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/8j9CBTzfBuT5GKLtF',
      name: 'Input keyboard',
      description: `Using Keyboard input for your game`
    },
    'inputKeyboard': C.En(0),
  },
  updateFunction: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/4fQsLapzr4uWGLbnp',
      name: 'update() function',
      description: `Example of increasing/descreasing Image size based on up/down arrow keypresses`
    },
    'updateFunction': C.En(0),
  },
  taskMoveChar: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/kMhY34EAEsETMiGmF',
      name: 'Task move character',
      description: `Move a character around the screen using arrow keys`
    },
    'taskMoveChar': C.En(0),
  },
  spriteSheet: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/QN7cKdBnoZ2dKjj3m',
      name: 'Spritesheet',
      description: `Frame animation for a character`
    },
    'spriteSheet': C.En(0),
  },
  spriteSheetEvents: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/cSm7LivYTvCTa2dqf',
      name: 'Spritesheet events',
      description: `Animation start, stop and looping`
    },
    'spriteSheetEvents': C.En(0),
  },
  taskCharAnim: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/qNcrwh2emqdBEpPH5',
      name: 'Task character animation',
      description: `Animate character - spawn, idle and run`
    },
    'taskCharAnim': C.En(0),
  },
  physicsBasics: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/6gDjnQ6wAFQp2LZXB',
      name: 'Physics basics',
      description: `Velocity, gravity, bounce and world bounds`
    },
    'physicsBasics': C.En(0),
  },
  physicsCollide: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/9dhJ2jzY7iER84GeM',
      name: 'Physics collide',
      description: `Collisions between two objects`
    },
    'physicsCollide': C.En(0),
  },
  taskJump: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/qoQgYNPev3xqNXhXD',
      name: 'Task jump',
      description: `Make a jumping character using simple physics`
    },
    'taskJump': C.En(0),
  },
  tweens: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/XnsehSEruvMKMBKLx',
      name: 'Tweens',
      description: `Animating images with interpolation instead of frames`
    },
    'tweens': C.En(0),
  },
  groups: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/jYQwe8cv2rtDDCM89',
      name: 'Groups',
      description: `Adding sprites to a group`
    },
    'groups': C.En(0),
  },
  taskTweenGroup: {
    $meta: {
      icon: 'tasks',
      link: '/u/!vault/asset/rDMCqocQv3nnYx8AB',
      name: 'Task animate group',
      description: `Animate a group of dwarves`
    },
    'taskTweenGroup': C.En(0),
  },
  // TODO needs joyride selectors, completation tags
  // oop: {
  //   $meta: {
  //     icon: 'code',
  //     link: '/u/!vault/project/aEzfbLcQ9uZKYaCu8',
  //     name: 'OOP',
  //     description: `Object-oriented-programming and game states`
  //   },
  //   'oop': C.En(0),
  // },
  next: {
    $meta: {
      icon: 'info',
      link: '/u/!vault/asset/jWGJmWKcGe83r5pEY',
      name: 'What to do next?',
      description: `Learn using the Phaser docs and examples`
    },
    'next': C.En(0),
  }
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