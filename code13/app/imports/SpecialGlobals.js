
// If you REALLY have to have some special global values/ids in this codebase,
// at least put it here and reference it from here so we understand the extent of
// this code smell in our codebase :)


const SpecialGlobals = {

  activity: {
    activityHistoryLimit: 20
  },

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
  defaultUserProfileImage: '//www.gravatar.com/avatar/2e2c17f8f3abdb1bb2594ebd2d3b35c5?s=155&d=mm',
  avatar: {
    validFor: 60 // seconds until we force avatar to refresh
  },
  thumbnail: {
    width: 230,     // In px. See imn mgb.css for .mgb-projectcard-width and .mgb-assetcard-width
    height: 155,     // In px
    defaultExpiresDuration: 3600
  },
  // in a case that observers will turn out too slow - we may change it to false - and then implement slow polling
  allowObservers: true,
  editCode: {
    mgbMentorPrefix: 'MGB mentor:',
    messagesInConsole: 30,
    maxFileSizeForAST: 200 * 1024, // 200 KB - seems very stable on 8GB machine - more can crash sometimes
    typingSpeed: 750, //ms - this will prevent all updates for X time after keypress - improves fast typing UX (feels more responsive)
    maxLengthOfCursorHistory: 100,
    popup: {
      maxWidth: 0.5, // 1 = 100% screen width
      maxHeight: 0.5
    },
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
    maxUploadSize:  3*1024*1024,     // 1 MB
    mainAssetsListDefaultLimit: 20,  // Number of assets shown by default in main Asset list UI per page
    // 50 gives - MongoError: Plan executor error during find: Overflow sort stage buffered data usage
    mainAssetsListSubscriptionMaxLimit: 20   // Max number of assets to subscribe to from main Asset list UI per page
  },

  map: {
    "maxUndoSteps":       20,
    "objectRotationStep": 15          // In degrees
  },

  //these are used in the ActorHelper
  actorMap: {
    actionsImage:   '/api/asset/tileset/AymKGyM9grSAo3yjp',
    actionsInImage: 2, // atm - jump and music,
    eventLayerId:   3
  },

  gamePlay: {
    playCountDebounceMs: 300 * 1000
  },

  settings: {
    settingsSaveDebounceMs: 0           // Should be small - less than a second, because there is a race when page nav happens because of getMeteorData() in App.js
  },

  skillsModelTrifecta: {  // See SkillNodes.js to understand these values related to the SKILLS_MODEL_TRIFECTA
    tutorialAccount:         '!vault',
    tutorialAssetNamePrefix: 'tutorials.'
  },
  quotas: {
    defaultNumMembersAllowedInProject: 5,
    SUdefaultNumMembersAllowedInProject: 99,
    defaultNumOfOwnedProjectsAllowed: 10,
    SUdefaultNumOfOwnedProjectsAllowed: 99
  },

  isMobile: true

}
export default SpecialGlobals
