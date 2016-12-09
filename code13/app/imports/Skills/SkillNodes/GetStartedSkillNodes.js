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
      sequence:       'profilePage,avatar,badges,bio,description,focus,mgb1Name,history'
    },
    profilePage:      C.E,
    avatar:           C.E,
    badges:           C.E,
    bio:              C.E,
    description:      C.E,
    focus:            C.E,
    mgb1Name:         C.E,
    history:          C.E
  },

  chat: {
    $meta: {
      name:           'Chat',
      description:    'Learn to use chat and say Hi',
      sequence:       'chatFlexPanel,chatChannels,chatRandomSayHi'
    },
    chatFlexPanel:    C.E,
    chatChannels:     C.E,
    chatRandomSayHi:  C.E
  },

  play: {
    $meta: {
      name:           'Play',
      description:    'Find games you can play here',
      sequence:       'findGames,searchGames,completeGames,gameAssets'
    },
    findGames:        C.E,
    searchGames:      C.E,
    completeGames:    C.E,
    gameAssets:       C.E
  },

  assetsBasics: {
    $meta: {
      name:           'Assets (basics)',
      description:    'Find, create and work with Game Assets',
      sequence:       'createAssets,findAssets,searchAssets,kinds,deleteAsset'
    },
    createAssets:     C.E,
    findAssets:       C.E,
    searchAssets:     C.E,
    kinds:            C.E,
    deleteAsset:      C.E
  },

  projects: {
    $meta: {
      name:           'Projects',
      description:    'Set up Projects and Teams',
    },
    createProject:         C.E,
    createAssetInProject:  C.E,
    changeProjectForAsset: C.E,
    projectAvatar:         C.E,
    projectMembers:        C.E,
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
  },

}