// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// Note that the .tag names here (code, art, audio etc) must correlate with
// the top level properties of SkillNodes as defined in SkillNodes.js.

// HOWEVER..
// YOU *MUST* READ THE GIANT COMMENT IN SkillNodes.js TO GROK
// THE INTERCONNETEDNESS OF THE skillAreas/skillNodes/tutorials/help DATA
// STRUCTURES BEFORE MAKING ANY CHANGES. ALL CHNAGES SHOULD BE REVIEWED
// WITH @dgolds

// TODO(@dgolds) - it may be better to move these to $meta data on the top-level
// objects in SkillNodes.js

// Also.. It is permitted that some nodes in SkillNodes.js that do not exist here..
// That is ok for SPEIAL CASES that have their OWN top-level UI for introducing
// and guiding the user through the skills paths.
// See SkillNodes.js (where SkillNodes is defined and exported) for the list of
// those specific exceptions
//   (for example SkillsNode['getStarted'] is handled by LearnGetStartedRoute.js)

export const skillAreaItems = [
  {
    tag: 'code',
    color: 'green',
    mascot: 'bigguy',
    mascotName: 'Codo',
    icon: 'code',
    title: 'Code',
    desc: 'Code using JavaScript and Phaser.',
  },
  {
    tag: 'art',
    color: 'orange',
    mascot: 'penguin',
    mascotName: 'Pixguin',
    icon: 'paint brush',
    title: 'Pixel Art',
    desc: 'Create animated sprites, spritesheets and tilemaps for games.',
  },
  {
    tag: 'design',
    color: '#b010b0',
    mascot: 'ideaguy',
    mascotName: 'Desi',
    icon: 'idea',
    title: 'Game Design',
    desc: 'Design levels, balance gameplay mechanics and keep it fun.',
  },
  {
    tag: 'audio',
    color: '#b08080',
    mascot: 'flyingcat',
    mascotName: 'Mewse',
    icon: 'music',
    title: 'Music & Audio',
    desc: 'Bring engagement and mood to games through music and sound.',
  },
  {
    tag: 'analytics',
    color: '#b02050',
    mascot: 'whale',
    mascotName: 'Hammer',
    icon: 'line chart',
    title: 'Analytics',
    desc: 'Data beats opinions: analyze player activity and improve all the things.',
  },
  {
    tag: 'writing',
    color: '#001020',
    mascot: 'duck',
    mascotName: 'Wryt',
    icon: 'book',
    title: 'Story Writing',
    desc: 'Bring game stories to life through plot, character, narrative and dialog.',
  },
  {
    tag: 'marketing',
    color: '#00b020',
    mascot: 'game_runner',
    mascotName: 'Marky',
    icon: 'flag outline',
    title: 'Marketing',
    desc: 'Learn to publicise your game and get people to play it.',
  },
  {
    tag: 'community',
    color: '#0010b0',
    mascot: 'slimy2',
    mascotName: 'Slimy',
    icon: 'umbrella',
    title: 'Community',
    desc: 'Learn to organize, communicate and playtest with player communities.',
  },
  {
    tag: 'legal',
    color: '#008080',
    mascot: 'rpgGuy',
    mascotName: 'Gard',
    icon: 'law',
    title: 'Legal',
    desc: 'Learn to protect your work and stay out of jail.',
  },
  {
    tag: 'business',
    color: '#002050',
    mascot: 'game_shop',
    mascotName: 'Bizni',
    icon: 'dollar',
    title: 'Business',
    desc: 'Learn the best ways to make a good profit from your games.',
  },
]
