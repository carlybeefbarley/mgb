import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { getStarted: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

// [MAINTAIN] When making changes:
// a) Some of these are used in badges-server.js for the _skillBasedBadges[]
//    Check you didn't break a skill-based badge when removing/renaming skills
// b) For paranoia, each section has a 'sequence'.. check that always matches any
//    changes in the names of child nodes for skills
export default {
  $meta: {
    name:           'Get Started',
    description:    'Represents basic MGB usage skills - set up your profile, play a game, find friends, etc',
    sequence:       'profile,chat,play,assetsBasics,projects,nonCodeGame'
  },

  profile: {
    $meta: {
      name:           'Profile',
      description:    'Add avatars and other info to your profile',
      sequence:       'avatar,badges,bio'
    },
    avatar:           C.E,
    badges:           C.E,
    bio:              C.E
//    quickTour:        C.E
  },

  chat: {
    $meta: {
      name:           'Chat',
      description:    'Learn to use chat and say Hi',
      sequence:       'chatFlexPanel,assetChat'
    },
    chatFlexPanel:    C.E,  // Public chat - show flexPanels, change channel, say Hi on Random
//  chatAtMention:    C.E,  // Not yet implemented as a feature.. this will just say 'coming soon'
//  privateChat:      C.E,  // Not yet implemented as a feature.. this will just say 'coming soon'
    assetChat:        C.E   // Actually this is asset and project chat
  },

  play: {
    $meta: {
      name:           'Play',
      description:    'Find games to play here',
      sequence:       'playOneGame,gamesImade,continueAgame'
    },
    playOneGame:      C.E,
    gamesImade:       { ...C.E, $meta: { ...C.E.$meta, name: 'Games I Made' } },
    // Not yet implemented as a feature.. this will just say 'coming soon' for now
    continueAgame:    { ...C.E, $meta: { ...C.E.$meta, name: 'Continue A Game'} }
  },

  assetsBasics: {
    $meta: {
      name:           'Assets',
      description:    'Find, create and work with Game Assets',
      sequence:       'findAssets,createAssets,assetProperties,searchAssets'
    },
    findAssets:       C.E,
    createAssets:     C.E,
    assetProperties:  C.E,
    searchAssets:     C.E
  },

  projects: {
    $meta: {
      name:           'Projects',
      description:    'Set up Projects and Teams',
    },
    createProject:         C.E,
    createAssetInProject:  C.E,
    projectAvatar:         C.E,
    // projectMembers:        C.E,
    // changeProjectForAsset: C.E,
    // projectsCanOverlap:    C.E,
    // projectPrefix:         C.E
  },

  nonCodeGame: {
    $meta: {
      name:           'Simple non-code game',
      description:    'A simple game using Actors instead of Code',
      sequence:       'createGraphic,createActor,createPlayer,createNPC,createObjects,createShot,createActorMap,useActorMap'
    },
    createGraphic:   C.E,
    createActor:     C.E,
    createPlayer:    C.E,
    createNPC:       C.E,
    createObjects:   C.E,
    createShot:      C.E,
    createActorMap:  C.E,
    useActorMap:     C.E,
  //  learnMore:       C.E
  },

  // These probably should not be in GetStarted


  // codeGame: {
  //   $meta: {
  //     name:           'Simple code-based game',
  //     description:    'A simple game written in JavaScript',
  //     sequence:       'createCode,starterTemplate,runGame,stopGame,codeMentor'
  //   },
  //   createCode:      C.E,
  //   starterTemplate: C.E,
  //   runGame:         C.E,
  //   stopGame:        C.E,
  //   codeMentor:      C.E
  // },



  // assetsAdvanced: {
  //   $meta: {
  //     name:           'Assets (advanced)',
  //     description:    'Fancy tricks with Game Assets',
  //     sequence:       'viewers,changes,qualityLevel,completedFlag,forking,licensing'
  //   },
  //   viewers:          C.E,
  //   changes:          C.E,
  //   qualityLevel:     C.E,
  //   completedFlag:    C.E,
  //   forking:          C.E,
  //   licensing:        C.E
  // },

  // learn: {
  //   $meta: {
  //     name:           'Learn',
  //     description:    'Find more ways to Learn',
  //   },
  //   skills:              C.E,
  //   games:               C.E,
  //   ask:                 C.E
  // }
}
