import C from './CommonSkillNodes.js'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// These will be inserted into { getStarted: ___ }

// The paths for these skills are related the .skillNodes properties of the helpInfo Object defined in TokenDescription.js

export default {
  $meta: {
    name:           'Get Started',
    description:    'Represents basic MGB usage skills - set up your profile, play a game, find friends, etc',
  },
  
  profile: {
    $meta: {
      name:           'Profile',
      description:    'Learn to set up your profile',
    },
    profilePage:      C.E,
    badges:           C.E,
    avatar:           C.E,
    mgb1Name:         C.E,
    bio:              C.E,
    description:      C.E,
    focus:            C.E,
    projects:         C.E,
    history:          C.E
  },

  chat: {
    $meta: {
      name:           'Chat',
      description:    'Learn to use chat and say Hi',
    },
    chatFlexPanel:    C.E,
    chatChannels:     C.E,
    chatRandomSayHi:  C.E
  },

  play: {
    $meta: {
      name:           'Play',
      description:    'Learn to find and play games',
    },
    findGames:        C.E,
    searchGames:      C.E,
    completeGames:    C.E,
    gameAssets:       C.E
  },

  assets: {
    $meta: {
      name:           'Assets',
      description:    'Learn to find, create and work with game Assets',
    },
    findAssets:       C.E,
    searchAssets:     C.E,
    createAssets:     C.E,
    kinds:            C.E,
    deleteAssets:     C.E,
    qualityLevel:     C.E,
    complete:         C.E,
    forking:          C.E,
    licensing:        C.E,
    viewers:          C.E,
    changes:          C.E
  },

  projects: {
    $meta: {
      name:           'Projects',
      description:    'Learn to make Projects and Teams',
    },
    createProject:         C.E,
    createAssetInProject:  C.E,
    changeProjectForAsset: C.E,
    projectAvatar:         C.E,
    projectMembers:        C.E,
    projectPrefix:         C.E,

  },

  learn: {
    $meta: {
      name:           'Learn',
      description:    'Learn the next ways to Learn',
    },
    skills:              C.E,
    games:               C.E,
    ask:                 C.E
  },

}