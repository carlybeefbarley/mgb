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
      'These concept tutorials use the Phaser game engine for JavaScript. However, these are fundamental concepts that will apply to any game engine you use in future.',
    assetExamples: ['!vault:phaser.groups.addSprite'], // Not used yet. Example for discussion
  },
  // Game:       C.En(1),
  // Loader:     C.En(1),
  intro: {
    $meta: {
      name: 'Intro to Phaser',
      icon: 'code',
      description: `A brief intro to Phaser and how we'll use it`,
      subsection: 'Introduction',
      ...C.E.$meta,
    },
  },
  predefinedMethods: {
    $meta: {
      name: "Phaser's predefined methods",
      icon: 'code',
      description: `Predefined methods we will use and what they're for`,
      subsection: 'Introduction',
      ...C.E.$meta,
    },
  },
  createSprite: {
    $meta: {
      name: 'Creating sprites',
      icon: 'code',
      description: `Learn to load and add images to the game as sprites`,
      subsection: 'Sprite',
      ...C.E.$meta,
    },
  },
  manipulateSprite: {
    $meta: {
      name: 'Sprite scaling, rotation, and more',
      icon: 'code',
      description: `Manipulate sprites using angle and rotation properties`,
      subsection: 'Sprite',
      ...C.E.$meta,
    },
  },
  anchor: {
    $meta: {
      name: 'Using the anchor property',
      icon: 'code',
      description: `How the anchor property affects sprite properties`,
      subsection: 'Sprite',
      ...C.E.$meta,
    },
  },
  taskPositionSprites: {
    $meta: {
      name: 'Task: Position five sprites',
      isTask: true,
      icon: 'tasks',
      description: `Position five instances of a sprite`,
      subsection: 'Sprite',
      ...C.E.$meta,
    },
  },
  keyEvents: {
    $meta: {
      name: 'Key events',
      icon: 'code',
      description: `Adding key events to the game`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  handlingInputs: {
    $meta: {
      icon: 'code',
      name: 'Handling inputs in update()',
      description: `Learn how to handle inputs with update()`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  taskCharMovement: {
    $meta: {
      isTask: true,
      icon: 'tasks',
      name: 'Task: Character movement',
      description: `Move a game character around the screen using arrow keys`,
      subsection: 'Input',
      ...C.E.$meta,
    },
  },
  physicsIntro: {
    $meta: {
      name: 'Physics basics',
      icon: 'code',
      description: `Velocity, gravity, bounce, and world bounds`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  collisions: {
    $meta: {
      name: 'Physics collisions',
      icon: 'code',
      description: `Collisions between two objects`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  physicsGroup: {
    $meta: {
      name: 'Physics group',
      icon: 'code',
      description: `Grouping physics enabled objects`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  taskJump: {
    $meta: {
      name: 'Task: Jump',
      isTask: true,
      icon: 'tasks',
      description: `Make the character jump using what we learned`,
      subsection: 'Physics',
      ...C.E.$meta,
    },
  },
  spriteSheet: {
    $meta: {
      icon: 'code',
      name: 'Spritesheet animations',
      description: `Frame animations for a character`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  taskAnimate: {
    $meta: {
      isTask: true,
      icon: 'tasks',
      name: 'Task: Character animation',
      description: `Animate character - idle, run, jump, strike`,
      subsection: 'Animation',
      ...C.E.$meta,
    },
  },
  usingDocs: {
    $meta: {
      icon: 'info',
      name: 'Phaser Docs and Examples',
      description: `Learn using the Phaser docs`,
      subsection: "What's Next?",
      ...C.E.$meta,
    },
  },

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
}
export default CodePhaserSkillNodes
