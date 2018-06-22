// Asset Kind - list of supported AssetKinds and various strings, icons etc related to each Asset Kind.
//              This is mostly extra information and visual content that the UI will use

// NOTE: It is intended that modules would import { AssetKinds } via   ../assets.js
//   There are some more handy manipulators defined in assets.js such as AssetKindKeysALL etc

import { roleSuperAdmin, roleTeacher } from '/imports/schemas/roles'
import SpecialGlobals from '/imports/SpecialGlobals'

// .icon is as defined in http://semantic-ui.com/elements/icon.html
// color is a standard semantic color list
//   (red, orange, yellow, olive, green, teal, blue, violet, purple, pink, brown, grey, black

const UAKerr = 'Unknown Asset Kind' // An error message string used a few places in this file.

export const AssetKinds = {
  // "palette": {
  //   name: "Palette",
  //   selfPlural: false,
  //   disable: true,
  //   longName: "Color Palette",
  //   icon: "block layout",
  //   requiresUserRole: null,
  //   description: "Color palette",
  //   explanation: 'Not yet implemented'
  // },
  graphic: {
    name: 'Graphic',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['graphic'],
    longName: 'Graphic',
    icon: 'image',
    color: 'orange',
    requiresUserRole: null,
    description: 'Graphic Assets are pixel art that will be used in a game',
    explanation:
      'A Graphic asset can be a simple image frame. It can also contain animations or TileMaps. Graphics can hold multiple animation frames, and can even be constructed using multiple layers for easier editing. Graphic Assets are used for all game art - game characters, backgrounds, map tiles etc',
  },
  actor: {
    name: 'Actor',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['actor'],
    longName: 'Actor',
    icon: 'child',
    color: 'teal',
    requiresUserRole: null,
    description: 'Actors define Game behaviors without you having to write any code. Put them on ActorMaps',
    explanation:
      'Actors provide sets of rules you can modify in order to make the behaviors you want - player, NPC, item, bullet, trap, healthpack, etc. You define them using the Actor Editor, then place them on a special kind of map called an ActorMap (using the ActorMap Editor) in order to create complete games',
  },
  actormap: {
    name: 'ActorMap',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['actormap'],
    longName: 'Map using Actors - makes games without coding',
    icon: 'map',
    color: 'blue',
    requiresUserRole: null,
    description: 'ActorMaps are games / game-levels that use Actors instead of code. Put Actors on ActorMaps',
    explanation:
      'You can place Actors on background, middle and foreground layers of an ActorMap, and instantly play the game you are designing without needing to write any code. You can also link maps using the Effects layer of the ActorMap in order to make large multi-level games',
  },
  map: {
    name: 'Map',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['map'],
    longName: 'Game Level Map (TMX style for game coding)',
    icon: 'map outline',
    color: 'olive',
    requiresUserRole: null,
    description: 'Maps are used to make game levels in games that you are coding.',
    explanation:
      "Maps are used by Code to make games. if you don't want to try coding yet, you can make games using Actors and ActorMaps instead. For those who know about 2D Map formats, this is a TMX-style map editor that can import and export TMX/JSON maps. Very awesome!",
  },
  // "physics": {
  //   name: "Physics",
  //   selfPlural: true,
  //   disable: true,
  //   longName: "Physics Config",
  //   icon: "rocket",
  //   requiresUserRole: null,
  //   description: "Physics configuration",
  //   explanation: 'Not yet implemented'
  // },
  assignment: {
    name: 'Assignment',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['assignment'],
    longName: 'Assignment',
    icon: 'file text outline',
    color: 'grey',
    requiresUserRole: roleTeacher,
    description: 'Assignment',
    explanation: 'A class assignment with a due date.',
  },
  // "cheatsheet": {
  //   name: "Cheatsheet",
  //   selfPlural: false,
  //   disable: true,
  //   longName: "Cheat Sheet",
  //   icon: "student",
  //   requiresUserRole: null,
  //   description: "Cheat Sheet to help remember useful stuff",
  //   explanation: 'Not yet implemented'
  // },
  // "cutscene": {
  //   name: "Cutscene",
  //   selfPlural: false,
  //   disable: true,
  //   longName: "Cut Scene",
  //   icon: "file video outline",
  //   requiresUserRole: null,
  //   description: "Cut scene used in a game",
  //   explanation: 'Not yet implemented'
  // },
  sound: {
    name: 'Sound',
    selfPlural: true,
    disable: SpecialGlobals.disabledAssets['sound'],
    longName: 'Sound',
    icon: 'volume up',
    color: 'pink',
    requiresUserRole: null,
    description: 'Sound Effects for use in games',
    explanation:
      'You can create or import sound effects for your games. You can make your game play these sounds by attaching them to Actors in the Actor Editor, or by writing your own custom Code for your games',
  },
  music: {
    name: 'Music',
    selfPlural: true,
    disable: SpecialGlobals.disabledAssets['music'],
    longName: 'Music',
    icon: 'music',
    color: 'blue',
    description: 'Background Music for use in games',
    explanation:
      'You can create or import Music for your games. You can make your game play this music by attaching Music Events to an ActorMap, or by writing your own custom Code for your games',
  },
  code: {
    name: 'Code',
    selfPlural: true,
    disable: SpecialGlobals.disabledAssets['code'],
    longName: 'Code Script',
    icon: 'code',
    color: 'green',
    requiresUserRole: null,
    description: 'Code is Source code script used to make your game',
    explanation:
      "Code is written in the 'Javascript 2015' programming language. You can use Assets such as Graphics, Sound, Music, Map... and also other 'imported' code/modules/packages to make your game.",
  },
  game: {
    name: 'GameConfig',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['game'],
    longName: 'Game definition',
    icon: 'gamepad',
    color: 'brown',
    requiresUserRole: null,
    description: 'Game rules, start location, and play statistics',
    explanation:
      'The GameConfig Asset lets you choose options for your game, and specify which ActorMap or Code Asset is the start of the game. GameConfig Assets are also used to publish your game so others can find it, and to store play information such as play counts, analytics, high scores, game saves etc.',
  },
  tutorial: {
    name: 'Tutorial',
    selfPlural: false,
    disable: SpecialGlobals.disabledAssets['tutorial'],
    longName: 'Tutorial definition',
    icon: 'student',
    color: 'black',
    requiresUserRole: null,
    description: 'The tutorials that you use in MGB are defined in Tutorial Assets',
    explanation:
      'Tutorials in MGB are JSON files. You can see how the built-in tutorials work, or make your own to share',
  },
  // PURGED FROM DB 9/24/2016
  // "_mgbui": {
  //   name: "MGB UI",
  //   selfPlural: true,
  //   disable: true,      // Disabled 9/23/2016 by dgolds since we now have stardust!
  //   longName: "MGB UI Mockup",
  //   icon: "code",
  //   requiresUserRole: roleSuperAdmin,
  //   description: "(MGB Dev Team Only) MGB UI Prototyping tool"
  // },
  // Helper function that handles unknown asset kinds and also appends ' icon' for convenience
  isValidKey(key) {
    return AssetKinds.hasOwnProperty(key)
  },
  getIconClass(key) {
    return (AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : 'warning sign') + ' icon'
  },
  getIconName(key) {
    return AssetKinds.hasOwnProperty(key) ? AssetKinds[key].icon : 'warning sign'
  },
  getColor(key) {
    return AssetKinds.hasOwnProperty(key) ? AssetKinds[key].color : 'pink'
  },
  getLongName(key) {
    return AssetKinds.hasOwnProperty(key) ? AssetKinds[key].longName : UAKerr
  },
  getDescription(key) {
    return AssetKinds.hasOwnProperty(key) ? AssetKinds[key].description : UAKerr
  },
  getName(key) {
    return AssetKinds.hasOwnProperty(key) ? AssetKinds[key].name : UAKerr
  },
  getNamePlural(key) {
    return AssetKinds.hasOwnProperty(key)
      ? AssetKinds[key].name + (AssetKinds[key].selfPlural ? '' : 's')
      : UAKerr
  },
}
