import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { getStarted: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Get Started',
    description:    'Represents basic MGB usage skills - set up your profile, play a game, find friends, etc',
    sequence:       'profile,chat,play,assetsBasics,projects,learn'
  },
  
  profile: {
    $meta: {
      name:           'Profile',
      description:    'Add avatars and other info to your profile',
      sequence:       'profilePage,avatar,badges,bio,quickTour'
    },
    profilePage:      C.E,
    avatar:           C.E,
    badges:           C.E,
    bio:              C.E,
    quickTour:        C.E
  },

  chat: {
    $meta: {
      name:           'Chat',
      description:    'Learn to use chat and say Hi',
      sequence:       'chatFlexPanel,chatAtMention,privateChat,projectChat,assetChat'
    },
    chatFlexPanel:    C.E,  // Public chat - show flexPanels, change channel, say Hi on Random 
    chatAtMention:    C.E,  // Not yet implemented as a feature.. this will just say 'coming soon'
    privateChat:      C.E,  // Not yet implemented as a feature.. this will just say 'coming soon'
    projectChat:      C.E,  // Not yet implemented as a feature.. this will just say 'coming soon'
    assetChat:        C.E   // Not yet implemented as a feature.. this will just say 'coming soon'
  },

  play: {
    $meta: {
      name:           'Play',
      description:    'Find games you can play here',
      sequence:       'playOneGame,gamesImade,continueAgame'
    },
    playOneGame:      C.E,
    gamesImade:       C.E,
    continueAgame:    C.E   // Not yet implemented as a feature.. this will just say 'coming soon' for now
  },

  assetsBasics: {
    $meta: {
      name:           'Assets (basics)',
      description:    'Find, create and work with Game Assets',
      sequence:       'findAssets,createAssets,assetKinds,deleteAsset,searchAssets,gameAsset'
    },
    findAssets:       C.E,
    createAssets:     C.E,
    assetKinds:       C.E,
    deleteAsset:      C.E,
    searchAssets:     C.E,
    gameAsset:        C.E
  },

  projects: {
    $meta: {
      name:           'Projects',
      description:    'Set up Projects and Teams',
    },
    createProject:         C.E,
    createAssetInProject:  C.E,
    projectAvatar:         C.E,
    projectMembers:        C.E,
    changeProjectForAsset: C.E,
    projectsCanOverlap:    C.E,
    projectPrefix:         C.E
  },

  assetsAdvanced: {
    $meta: {
      name:           'Assets (advanced)',
      description:    'Fancy tricks with Game Assets',
      sequence:       'viewers,changes,qualityLevel,completedFlag,forking,licensing'
    },
    viewers:          C.E,
    changes:          C.E,
    qualityLevel:     C.E,
    completedFlag:    C.E,
    forking:          C.E,
    licensing:        C.E
  },

  learn: {
    $meta: {
      name:           'Learn',
      description:    'Find more ways to Learn',
    },
    skills:              C.E,
    games:               C.E,
    ask:                 C.E
  }
}