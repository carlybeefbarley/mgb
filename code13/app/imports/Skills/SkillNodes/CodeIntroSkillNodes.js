import C from './CommonSkillNodes'
import { skillAreaItems } from '../SkillAreas'

// The content in this file is derived from the BSD-licensed content at
// tha
// See https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md for the license of that content

const CodeIntroSkillNodes = {
  $meta: {
    name: 'Intro to Coding',
    description: 'Learn the basics of the JavaScript programming language.',
  },
  comments: {
    $meta: {
      name: 'Comment your JavaScript Code',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  caseSensitiveVariables: {
    $meta: {
      name: 'Understanding Case Sensitivity in Variables',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  variables: {
    $meta: {
      name: 'Declare JavaScript Number and String Variables', // Name changed
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  initVariables: {
    $meta: {
      name: 'Understanding Initialized and Uninitialized Variables', // Name changed
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // COMBINEFD WITH INITIALIZED VARIABLES

  // unitializedVariables: {
  //   $meta: {
  //     name: 'Understanding Uninitialized Variables',
  //     icon: 'code',
  //     subsection: 'Numbers',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  positionImage: {
    $meta: {
      name: 'Positioning Sprites',
      icon: 'code',
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `Position an image with x, y and anchor point`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser', // for example
      ...C.E.$meta,
    },
  },
  // CONSOLIDATING WITH DECLARING VARIABLES AND DECLARING STRINGS

  // assignmentOperator: {
  //   $meta: {
  //     name: 'Storing Values with the Assignment Operator',
  //     icon: 'code',
  //     subsection: 'Numbers',
  //     ...C.E.$meta,
  //   },
  // },

  sumNumbers: {
    $meta: {
      name: 'Basic Math Operations with JavaScript', // Name changed
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  // This reusable functions tutorial is new to MGB
  reusableFunctions: {
    $meta: {
      name: 'Write Reusable JavaScript Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  // CONSOLIDATING WITH ADDING AND MULTIPLYING

  // divideNumbers: {
  //   $meta: {
  //     name: 'Divide One Number by Another with JavaScript',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
  drawImage: {
    $meta: {
      name: 'Load & Draw image',
      icon: 'code',
      link: '/u/!vault/asset/5Bm4R9kJHRAMBv4kD',
      description: `The most basic concept for starting game development`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  positionImage: {
    $meta: {
      name: 'Positioning Sprites',
      icon: 'code',
      link: '/u/!vault/asset/eoTTDhibmKGrhuvHn',
      description: `Position an image with x, y and anchor point`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  manipulateImage: {
    $meta: {
      name: 'Image scaling, rotation, and more',
      icon: 'code',
      link: '/u/!vault/asset/nzZK4r5a4WPAszBjj',
      description: `Image scaling, transparency, rotation and tinting`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  inputClick: {
    $meta: {
      name: 'Mouse/Touch Input',
      icon: 'code',
      link: '/u/!vault/asset/ENnr8RSrrSRB3ybTg',
      description: `Click on image, click on game`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  inputKeyboard: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/8j9CBTzfBuT5GKLtF',
      name: 'Keyboard input',
      description: `Using Keyboard input for your game`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  updateFunction: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/4fQsLapzr4uWGLbnp',
      name: "Phaser's update() function",
      description: `Using Phaser's update() function to change text based on up/down arrow keypresses`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  spriteSheet: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/QN7cKdBnoZ2dKjj3m',
      name: 'Spritesheet animations',
      description: `Frame animation for a character`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  spriteSheetEvents: {
    $meta: {
      icon: 'code',
      link: '/u/!vault/asset/cSm7LivYTvCTa2dqf',
      name: 'Spritesheet events',
      description: `Animation start, stop and looping`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },

  physicsBasics: {
    $meta: {
      name: 'Physics basics',
      icon: 'code',
      link: '/u/!vault/asset/6gDjnQ6wAFQp2LZXB',
      description: `Velocity, gravity, bounce and world bounds`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  physicsCollide: {
    $meta: {
      name: 'Physics collisions',
      icon: 'code',
      link: '/u/!vault/asset/9dhJ2jzY7iER84GeM',
      description: `Collisions between two objects`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  tweens: {
    $meta: {
      name: 'Tweening',
      icon: 'code',
      link: '/u/!vault/asset/XnsehSEruvMKMBKLx',
      description: `Animating images with interpolation instead of frames`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  groups: {
    $meta: {
      name: 'Sprite Groups',
      icon: 'code',
      link: '/u/!vault/asset/jYQwe8cv2rtDDCM89',
      description: `Adding sprites to a group`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  getObjectFromGroup: {
    $meta: {
      name: 'Get object from group',
      icon: 'code',
      description: `Iterating through group children`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  bringToTop: {
    $meta: {
      name: 'Bring to top',
      icon: 'code',
      description: `Bring object in a group to top`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  swapChildren: {
    $meta: {
      name: 'Swap children',
      icon: 'code',
      description: `Swap object indexes in a group`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  callAll: {
    $meta: {
      name: 'Call all',
      icon: 'code',
      description: `Call all objects in a group`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  sound: {
    $meta: {
      name: 'Sound',
      icon: 'code',
      description: `Music and sound`,
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
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
      subsection: 'Game 0',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH DECLARING VARIABLES AND ASSIGNMENT OPERATORS

  // declareString: {
  //   $meta: {
  //     name: 'Declare String Variables',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  arrayVariable: {
    $meta: {
      name: 'Store Multiple Values in one Variable using JavaScript Arrays',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  functionArguments: {
    $meta: {
      name: 'Passing Values to Functions with Arguments',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalScope: {
    $meta: {
      name: 'Global Scope and Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  localScope: {
    $meta: {
      name: 'Local Scope and Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalVsLocal: {
    $meta: {
      name: 'Global vs. Local Scope in Functions',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  returnValue: {
    $meta: {
      name: 'Return a Value from a Function with Return and Assign a Returned Value', // Name changed
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // CONSOLIDATED WITH RETURN A VALUE FROM A FUNCTION WITH RETURN

  // assignmentReturnedValue: {
  //   $meta: {
  //     name: 'Assignment with a Returned Value',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },

  objects: {
    $meta: {
      name: 'Build JavaScript Objects',
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  objectsPropertiesDot: {
    $meta: {
      name: 'Accessing Objects Properties with the Dot Operator and Bracket Notation', // Name changed
      icon: 'code',
      subsection: 'Game 0',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // COMBINED WITH ACCESSING PROPERTIES WITH DOT OPERATOR

  // objectsPropertiesBrackets: {
  //   $meta: {
  //     name: 'Accessing Objects Properties with Bracket Notation',
  //     icon: 'code',
  //     subsection: 'Game 0',
  //     skillChallengeType: 'challenges',
  //     ...C.E.$meta,
  //   },
  // },
}

export default CodeIntroSkillNodes
