import C from './CommonSkillNodes'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { code: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

// Some shorthands to save space and time for common nodes
// Enabled Leaf Node, Learning Level = 0..4 (0 = beginner). See CommonSkillNodes.js for info

const CodePhaserSkillNodes = {
  $meta: {
    name: 'Game Development Concepts',
    description:
      "These concept tutorials use the 'PhaserJS' game engine for JavaScript. However, these are fundamental concepts that will apply to any game engine you use in future.",
    assetExamples: ['!vault:phaser.groups.addSprite'], // Not used yet. Example for discussion
  },
  // Game:       C.En(1),
  // Loader:     C.En(1),
  drawImage: {
    $meta: {
      name: 'Load & Draw image',
      icon: 'code',
      link: '/u/!vault/asset/5Bm4R9kJHRAMBv4kD',
      description: `The most basic concept for starting game development`,
      subsection: 'Image',
      ...C.E.$meta,
    },
  },
  positionImage: {
    $meta: {
      name: 'Positioning Sprites',
      icon: 'code',
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `Position an image with x, y and anchor point`,
      subsection: 'Image',
      ...C.E.$meta,
    },
  },
  taskSetPosition: {
    $meta: {
      name: 'Task: Position five Sprites',
      isTask: true,
      icon: 'tasks',
      link: '/u/!vault/asset/Pn9mhjR7yAW3iTsRt',
      description: `Position five instances of a Sprite`,
      subsection: 'Image',
      ...C.E.$meta,
    },
  },
  manipulateImage: {
    $meta: {
      name: 'Image scaling, rotation, and more',
      icon: 'code',
      link: '/u/!vault/asset/nzZK4r5a4WPAszBjj',
      description: `Image scaling, transparency, rotation and tinting`,
      subsection: 'Image',
      ...C.E.$meta,
    },
  },
  inputClick: {
    $meta: {
      name: 'Mouse/Touch Input',
      icon: 'code',
      link: '/u/!vault/asset/ENnr8RSrrSRB3ybTg',
      description: `Click on image, click on game`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  taskInput: {
    $meta: {
      isTask: true,
      icon: 'tasks',
      link: '/u/!vault/asset/79YpYHXg9DbQG6tXp',
      name: 'Task: Mouse/Touch click-to-rotate',
      description: `On each click, make the sprite rotate counter-clockwise by 10°`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  inputKeyboard: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/8j9CBTzfBuT5GKLtF',
      name: 'Keyboard input',
      description: `Using Keyboard input for your game`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  updateFunction: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/4fQsLapzr4uWGLbnp',
      name: "Phaser's update() function",
      description: `Using Phaser's update() function to change text based on up/down arrow keypresses`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  taskMoveChar: {
    $meta: {
      isTask: true,
      icon: 'tasks',
      link: '/u/!vault/asset/kMhY34EAEsETMiGmF',
      name: 'Task: Player movement',
      description: `Move a game character around the screen using arrow keys`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  spriteSheet: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/QN7cKdBnoZ2dKjj3m',
      name: 'Spritesheet animations',
      description: `Frame animation for a character`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  spriteSheetEvents: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/cSm7LivYTvCTa2dqf',
      name: 'Spritesheet events',
      description: `Animation start, stop and looping`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  taskCharAnim: {
    $meta: {
      isTask: true,
      icon: 'tasks',
      link: '/u/!vault/asset/qNcrwh2emqdBEpPH5',
      name: 'Task: Character animation',
      description: `Animate character - spawn, idle and run`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },

  physicsBasics: {
    $meta: {
      name: 'Physics basics',
      icon: 'code',
      link: '/u/!vault/asset/6gDjnQ6wAFQp2LZXB',
      description: `Velocity, gravity, bounce and world bounds`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  physicsCollide: {
    $meta: {
      name: 'Physics collisions',
      icon: 'code',
      link: '/u/!vault/asset/9dhJ2jzY7iER84GeM',
      description: `Collisions between two objects`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  taskJump: {
    $meta: {
      name: 'Task: Jumping',
      isTask: true,
      icon: 'tasks',
      link: '/u/!vault/asset/qoQgYNPev3xqNXhXD',
      description: `Make a jumping character using simple physics`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  tweens: {
    $meta: {
      name: 'Tweening',
      icon: 'code',
      link: '/u/!vault/asset/XnsehSEruvMKMBKLx',
      description: `Animating images with interpolation instead of frames`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  groups: {
    $meta: {
      name: 'Sprite Groups',
      icon: 'code',
      link: '/u/!vault/asset/jYQwe8cv2rtDDCM89',
      description: `Adding sprites to a group`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  taskTweenGroup: {
    $meta: {
      isTask: true,
      name: 'Task: Animate a group',
      icon: 'tasks',
      link: '/u/!vault/asset/rDMCqocQv3nnYx8AB',
      description: `Animate a group of dwarves`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  getObjectFromGroup: {
    $meta: {
      name: 'Get object from group',
      icon: 'code',
      description: `Iterating through group children`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  bringToTop: {
    $meta: {
      name: 'Bring to top',
      icon: 'code',
      description: `Bring object in a group to top`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  swapChildren: {
    $meta: {
      name: 'Swap children',
      icon: 'code',
      description: `Swap object indexes in a group`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  callAll: {
    $meta: {
      name: 'Call all',
      icon: 'code',
      description: `Call all objects in a group`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
  sound: {
    $meta: {
      name: 'Sound',
      icon: 'code',
      description: `Music and sound`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
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
      description: `Learn using the Phaser docs and examples`,
      subsection: 'Misc',
      ...C.E.$meta,
    },
  },
}

export default CodePhaserSkillNodes

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
