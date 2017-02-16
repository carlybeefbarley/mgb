
// If you REALLY have to have some special global values/ids in this codebase,
// at least put it here and reference it from here so we understand the extent of
// this code smell in our codebase :)


export default SpecialGlobals = {
  // codeflower props (probably we could allow user to tune these some day)
  // description about props can be found here: https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md
  codeFlower: {
    "mainCharge":     -500,
    "charge":         -200,
    "chargePerChild": -200,
    "chargeDistance": 100,
    "link":           10,
    "linkStrength":   1,
    "linkPerChild":   5,
    "link_at_same_level": 0,
    "friction":       0.9,
    "theta":          0.8,
    "gravity":        0.1
  },
  defaultUserProfileImage: '//www.gravatar.com/avatar/2e2c17f8f3abdb1bb2594ebd2d3b35c5?s=50&d=mm',

  thumbnail: {
    width: 200,
    height: 150
  },
  // in a case that observers will turn out too slow - we may change it to false - and then implement slow polling
  allowObservers: true,
  editCode: {
    mgbMentorPrefix:{
      singleLine: '// MGB mentor:',
      multiLine: '/* MGB mentor:'
    },
    maxFileSizeForAST: 10000 * 1024, // 100 KB
    typingSpeed: 750, //ms - this will prevent all updates for X time after keypress - improves fast typing UX (feels more responsive)
    maxLengthOfCursorHistory: 100,
    popularLibs: [
      {
        name: 'Phaser',
        import: 'phaser',
        desc: 'A fast, free and fun open source framework for Canves and WebGL powered browser games.'
      },
      {
        name: 'React',
        import: 'react',
        desc: 'A JavaScript library for building user interfaces'
      },
      {
        name: '_',
        import: 'lodash',
        desc: 'A modern JavaScript utility library delivering modularity, performance & extras.'
      }
    ]
  },

  assets: {
    "maxUploadSize":  1*1024*1024,   // 1 MB
  },

  map: {
    "maxUndoSteps":       99,
    "objectRotationStep": 15
  },

  //these are used in the ActorHelper
  actorMap: {
    actionsImage:   '/api/asset/tileset/AymKGyM9grSAo3yjp',
    actionsInImage: 2, // atm - jump and music,
    eventLayerId:   3
  },

  gamePlay: {
    playCountDebounceMs: 10 * 1000
  },

  settings: {
    settingsSaveDebounceMs: 300           // Should be small - less than a second, because there is a race when page nav happens because of getMeteorData() in App.js
  },

  skillsModelTrifecta: {  // See SkillNodes.js to understand these values related to the SKILLS_MODEL_TRIFECTA
    tutorialAccount:         '!vault',
    tutorialAssetNamePrefix: 'tutorials.'
  }

}
