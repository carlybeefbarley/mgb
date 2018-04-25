// If you REALLY have to have some special global values/ids in this codebase,
// at least put it here and reference it from here so we understand the extent of
// this code smell in our codebase :)

const SpecialGlobals = {
  activity: {
    activityHistoryLimit: 20,
    feedLimit: 10,
  },

  // This is a !vault owned project for system assets
  SystemParams: {
    supportedBrowsers: 'SystemParams.supportedBrowsers',
  },

  // codeflower props (probably we could allow user to tune these some day)
  // description about props can be found here: https://github.com/d3/d3-3.x-api-reference/blob/master/Force-Layout.md
  codeFlower: {
    mainCharge: -500,
    charge: -200,
    chargePerChild: -200,
    chargeDistance: 100,
    link: 10,
    linkStrength: 1,
    linkPerChild: 5,
    link_at_same_level: 0,
    friction: 0.9,
    theta: 0.8,
    gravity: 0.1,
  },
  defaultUserProfileImage: '//www.gravatar.com/avatar/2e2c17f8f3abdb1bb2594ebd2d3b35c5?s=155&d=mm',
  avatar: {
    validFor: 60, // seconds until we force avatar to refresh
  },
  thumbnail: {
    width: 230, // In px. See in mgb.css for .mgb-projectcard-width and .mgb-assetcard-width
    height: 155, // In px
    defaultExpiresDuration: 3600,
  },
  // If observers will turn out too slow - we may change it to false - and then implement slow polling (@stauzs)
  allowObservers: true,
  editCode: {
    mgbMentorPrefix: 'MGB mentor:',
    messagesInConsole: 30,
    maxFileSizeForAST: 200 * 1024, // 200 KB - seems very stable on 8GB machine - more can crash sometimes
    typingSpeed: 750, //ms - this will prevent all updates for X time after keypress - improves fast typing UX (feels more responsive)
    maxLengthOfCursorHistory: 100,
    popup: {
      maxWidth: 0.5, // 1 = 100% screen width
      maxHeight: 0.5,
    },
    popularLibs: [
      {
        name: 'Phaser',
        import: 'phaser',
        desc: 'For making games',
        descLong:
          'Phaser is a good framework for making 2D games in Javascript. It helps developers with game scenes, asset loaders, rendering, physics, input devices, sound, and more',
        landingPageUrl: '//phaser.io',
        apiDocsPageUrl: '//photonstorm.github.io/phaser-ce/',
        tutorialsInternalLink: '/learn/code/phaser',
      },
      {
        name: 'Phaser3',
        import: 'phaser3',
        desc: 'For making games',
        descLong:
          'Phaser3 is a good framework for making 2D games in Javascript. It helps developers with game scenes, asset loaders, rendering, physics, input devices, sound, and more',
        landingPageUrl: '//phaser.io/phaser3',
        apiDocsPageUrl: '//photonstorm.github.io/phaser3-docs/index.html',
        tutorialsInternalLink: '/learn/code/phaser',
      },
      {
        name: 'React',
        import: 'react',
        desc: 'For making apps',
        descLong:
          'React is a powerful but simple User Interface framework developed by Facebook and available as open source. It is very good for making applications in JavaScript, or for making games that have a more app-like UI such as "mastermind". This site is all written using React!',
        landingPageUrl: '//facebook.github.io/react/',
        apiDocsPageUrl: '//facebook.github.io/react/docs/introducing-jsx.html',
      },
      {
        name: '_',
        import: 'lodash',
        desc: 'Helpful extra functions',
        descLong:
          'Lodash provides helpful general purpose routines to compare and transform data or functions. Any time you write a loop of some kind to transform a data structure, there\'s probably a way to do it more easily in one line of lodash... Once you get used to it :) Lodash is a variant of another similar JavaScript library called "Underscore". They are usually seen in JavaScript programs doing things like _.isString() or _.union(). ',
        landingPageUrl: '//lodash.com/',
        apiDocsPageUrl: '//lodash.com/docs',
      },
    ],
  },

  assets: {
    maxUploadSize: 3 * 1024 * 1024, // 1 MB
    mainAssetsListDefaultLimit: 50, // Number of assets shown by default in main Asset list UI per page
    mainAssetsListSubscriptionMaxLimit: 200, // Max number of assets to subscribe to from main Asset list UI per page
  },

  map: {
    maxUndoSteps: 20,
    objectRotationStep: 15, // In degrees
  },

  //these are used in the ActorHelper
  actorMap: {
    actionsImage: '/api/asset/tileset/AymKGyM9grSAo3yjp',
    actionsInImage: 2, // atm - jump and music,
    eventLayerId: 3,
  },

  gamePlay: {
    playCountDebounceMs: 60 * 1000,
  },

  settings: {
    // If this is non-zero, need to change code in settings-client.js
    settingsSaveDebounceMs: 0, // Should be small - less than a second, because there is a race when page nav happens because of getMeteorData() in App.js
  },

  skillsModelTrifecta: {
    // See SkillNodes.js to understand these values related to the SKILLS_MODEL_TRIFECTA
    tutorialAccount: '!vault',
    tutorialAssetNamePrefix: 'tutorials.',
  },

  relatedAssets: {
    limit: {
      withUser: 100,
      noContext: 30,
    },
  },

  quotas: {
    // Project limits: max members in project
    defaultNumMembersAllowedInProject: 10, // For normal users
    SUdefaultNumMembersAllowedInProject: 99, // For admin accounts

    // Project limits: max projects owned by an account
    defaultNumOfOwnedProjectsAllowed: 10, // For normal accounts
    SUdefaultNumOfOwnedProjectsAllowed: 99, // For admin accounts
  },

  cache: {
    // cache max age in seconds for all /api/asset/... requests
    // BE AWARE!!! - only requests with ?hash={unique key} are cached - otherwise we assume that user has requested latest version
    apiAssets: 60 * 60 * 24 * 30,
    // cache max age in seconds for fonts
    // fonts has special CORS handling as they require 'access-control-allow-origin', '*' header
    fonts: 60 * 60 * 24 * 30,
    // all other resources - e.g. /images/logos/mgb/medium/01w.png
    static: 60 * 60 * 24 * 30,
  },
}

export default SpecialGlobals
