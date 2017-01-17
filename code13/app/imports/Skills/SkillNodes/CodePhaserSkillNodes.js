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
  basics: {
    $meta: {
      name:         'PhaserJS Basics',
      description:  'Basics to start learn Phaser'
    },
    loadImage:       C.En(1),
    moveImage:       C.En(1),
    clickImage:      C.En(1),
    text:            C.En(1),
    animation:       C.En(1),
    tween:           C.En(1),
  },
  sprites: {
    $meta: {
      name:         'Sprites',
      description:  'Drawing and manipulating images (sprites)'
    },
    add:             C.En(1),
    scale:           C.En(1),
    spritesheet:     C.En(1),
    tint:            C.En(1),
    pivot:           C.En(1),
    rotate:          C.En(1),
    destroy:         C.En(1),
  },
  groups: {
    $meta: {
      name:         'Groups',
      description:  'Grouping objects and manipulating them'
    },
    addSprite:          C.En(1),
    foreach:            C.En(1),
    callAllAnimations:  C.En(1),
    bringToTop:         C.En(1),
    swapChildren:       C.En(1),
  },
  input: {
    $meta: {
      name:         'Input',
      description:  'Mouse, touch and keyboard'
    },
    clickGame:        C.En(1),
    clickOnSprite:    C.En(1),
    keyboard:         C.En(1),
    drag:             C.En(1),
    downDuration:     C.En(1),
  },
  animation: {
    $meta: {
      name:         'Animations',
      description:  'Frame based animations'
    },
    changeFrame:         C.En(1),
    events:              C.En(1),
    multipleAnimations:  C.En(1),
  },
  tweens: {
    $meta: {
      name:         'Tweens',
      description:  'Tween based animation. Interpolating between one state to another'
    },
    tweensTo:         C.En(1),
    alphaText:        C.En(1),
    events:           C.En(1),
    chainedTweens:    C.En(1),
    easing:           C.En(1),
    bubbles:          C.En(1),
  },
  audio: {
    $meta: {
      name:         'Audio',
      description:  'Loading audio and playing it'
    },
    playSound:       C.En(1),
    pauseResume:     C.En(1),
  },
  physics: {
    $meta: {
      name:         'Physics',
      description:  'Simple physics: collision detection, bounding boxes'
    },
    collide:        C.En(1),
    gravity:        C.En(1),
    boundingBox:    C.En(1),
    bodySize:       C.En(1),
    angryBirds:     C.En(1),
  }

}