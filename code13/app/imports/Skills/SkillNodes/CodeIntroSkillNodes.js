import C from './CommonSkillNodes'
import { skillAreaItems } from '../SkillAreas'

// The content in this file is derived from the BSD-licensed content at
// tha
// See https://github.com/freeCodeCamp/freeCodeCamp/blob/staging/LICENSE.md for the license of that content

const CodeIntroSkillNodes = {
  $meta: {
    name: 'Intro to Game Coding with JavaScript and Phaser',
    description:
      'At the end of these tutorials, you will know the basics of the JavaScript programming language and the Phaser game engine. You will be able to draw a player character, and then animate them to run and fly!',
  },
  comments: {
    $meta: {
      name: 'Comment your JavaScript Code',
      icon: 'comment',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  caseSensitiveVariables: {
    $meta: {
      name: 'Understanding Case Sensitivity in Variables',
      icon: 'font',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  variables: {
    $meta: {
      name: 'Declare JavaScript Number and String Variables', // Name changed
      icon: 'announcement',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  initVariables: {
    $meta: {
      name: 'Understanding Initialized and Uninitialized Variables', // Name changed
      icon: 'superscript',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  sumNumbers: {
    $meta: {
      name: 'Basic Math Operations with JavaScript', // Name changed
      icon: 'calculator',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  // This debugging/console tutorial is new to MGB
  debuggingAndConsole: {
    $meta: {
      name: 'Introduction to the Debugging Challenge and Using the Dev Console',
      icon: 'bug',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  // This reusable functions tutorial is new to MGB
  reusableFunctions: {
    $meta: {
      name: 'Write Reusable JavaScript Functions',
      icon: 'recycle',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  functionArguments: {
    $meta: {
      name: 'Passing Values to Functions with Arguments',
      icon: 'share',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalScope: {
    $meta: {
      name: 'Global Scope and Functions',
      icon: 'globe',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  localScope: {
    $meta: {
      name: 'Local Scope and Functions',
      icon: 'home',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  globalVsLocal: {
    $meta: {
      name: 'Global vs. Local Scope in Functions',
      icon: 'search',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  returnValue: {
    $meta: {
      name:
        'Return a Value from a Function with Return, Understand Undefined Values Returned from a Function, and Assignment with a Returned Value', // Name changed
      icon: 'reply',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  arrayVariable: {
    $meta: {
      name: 'Store Multiple Values in one Variable using JavaScript Arrays',
      icon: 'lock',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  objects: {
    $meta: {
      name: 'Build JavaScript Objects',
      icon: 'cube',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },

  objectsPropertiesDot: {
    $meta: {
      name: 'Accessing Objects Properties with the Dot Operator and Bracket Notation', // Name changed
      icon: 'unlock alternate',
      subsection: 'Introduction to JavaScript',
      skillChallengeType: 'challenges',
      ...C.E.$meta,
    },
  },
  intro: {
    $meta: {
      name: 'Intro to Phaser',
      icon: 'info',
      description: "A brief intro to Phaser and how we'll Us it",
      subsection: 'Introduction to Phaser',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  predefinedMethods: {
    $meta: {
      name: "Phaser's Predefined Methods",
      icon: 'tags',
      description: "Predefined methods we will use and what they're for",
      subsection: 'Introduction to Phaser',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  createSprite: {
    $meta: {
      name: 'Creating sprites',
      icon: 'female',
      description: `Learn to load and add images to the game as sprites`,
      subsection: 'Sprites',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  manipulateSprite: {
    $meta: {
      name: 'Sprite scaling, rotation, and more',
      icon: 'expand',
      description: `Manipulate sprites using angle and rotation properties`,
      subsection: 'Sprites',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  anchor: {
    $meta: {
      name: 'Using the anchor property',
      icon: 'anchor',
      description: `How the anchor property affects sprite properties`,
      subsection: 'Sprites',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  taskPositionSprites: {
    $meta: {
      name: 'Task: Position five sprites',
      isTask: true,
      icon: 'trophy',
      description: `Position five instances of a sprite`,
      subsection: 'Sprites',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  keyEvents: {
    $meta: {
      name: 'Key events',
      icon: 'keyboard',
      description: `Adding key events to the game`,
      subsection: 'Input',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  handlingInputs: {
    $meta: {
      icon: 'laptop',
      name: 'Handling inputs in update()',
      description: `Learn how to handle inputs with update()`,
      subsection: 'Input',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  taskCharMovement: {
    $meta: {
      isTask: true,
      icon: 'trophy',
      name: 'Task: Character movement',
      description: `Move a game character around the screen using arrow keys`,
      subsection: 'Input',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  physicsIntro: {
    $meta: {
      name: 'Physics basics',
      icon: 'wrench',
      description: `Velocity, gravity, bounce, and world bounds`,
      subsection: 'Physics',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  physicsCollide: {
    $meta: {
      name: 'Physics collisions',
      icon: 'compress',
      description: `Collisions between two objects`,
      subsection: 'Physics',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  physicsGroup: {
    $meta: {
      name: 'Physics group',
      icon: 'group',
      description: `Grouping physics enabled objects`,
      subsection: 'Physics',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  taskJump: {
    $meta: {
      name: 'Task: Jumping',
      isTask: true,
      icon: 'trophy',
      description: `Make the character jump using what we learned`,
      subsection: 'Physics',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  spriteSheet: {
    $meta: {
      icon: 'child',
      name: 'Spritesheet animations',
      description: `Frame animations for a character`,
      subsection: 'Animation',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
  taskAnimate: {
    $meta: {
      isTask: true,
      icon: 'trophy',
      name: 'Task: Character animation',
      description: `Animate character - idle, run, jump, strike`,
      subsection: 'Animation',
      skillChallengeType: 'phaser',
      ...C.E.$meta,
    },
  },
}

export default CodeIntroSkillNodes
