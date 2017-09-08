import _ from 'lodash'

// Helper functions for Badges. These mostly require a user object from users.js
//  getAllBadgesForUser(user) gets list of user's badges (returns array of keys into badgeList)

export const badgeList = {
  emailVerified: {
    name: 'emailVerified',
    title: 'Email Verified',
    img: 'bronze/accepted_question.png',
    descr: 'Clicked on verification email. Email exists!',
  },
  hasAvatar: { name: 'hasAvatar', title: 'Has Avatar', img: 'bronze/cleaner.png', descr: 'Made an Avatar' },

  // skill based
  getStartedChat: {
    name: 'getStartedChat',
    title: 'Talker',
    img: 'bronze/nice_question.png',
    descr: 'Write a chat message',
  },
  getStartedAsset: {
    name: 'getStartedAsset',
    title: 'Create an Asset',
    img: 'bronze/created_asset.png',
    descr: 'Create a sound asset',
  },
  getStartedProject: {
    name: 'getStartedProject',
    title: 'Create a Project',
    img: 'bronze/created_project.png',
    descr: 'Create a project',
  },
  getStartedAll: {
    name: 'getStartedAll',
    title: 'Complete Get Started',
    img: 'bronze/learner.png',
    descr: 'Finish all "Get Started" tutorials',
  },

  codeBasicsBronze: {
    name: 'codeBasicsBronze',
    title: 'Code Basics',
    level: 0,
    img: 'bronze/javascript.png',
    descr: 'Complete 3 code basics tutorials',
  },
  codeBasicsSilver: {
    name: 'codeBasicsSilver',
    title: 'Code Basics',
    level: 1,
    img: 'silver/javascript.png',
    descr: 'Complete 15 code basics tutorials',
  },
  codeBasicsGold: {
    name: 'codeBasicsGold',
    title: 'Code Basics',
    level: 2,
    img: 'gold/javascript.png',
    descr: 'Complete all code basics tutorials',
  },

  codePhaserBronze: {
    name: 'codePhaserBronze',
    title: 'Code Phaser',
    level: 0,
    img: 'bronze/phaser.png',
    descr: 'Complete 1 Phaser task',
  },
  codePhaserSilver: {
    name: 'codePhaserSilver',
    title: 'Code Phaser',
    level: 1,
    img: 'silver/phaser.png',
    descr: 'Complete 3 Phaser task',
  },
  codePhaserGold: {
    name: 'codePhaserGold',
    title: 'Code Phaser',
    level: 2,
    img: 'gold/phaser.png',
    descr: 'Complete all Phaser tutorials',
  },

  codeAdvancedBronze: {
    name: 'codeAdvancedBronze',
    title: 'Code Advanced',
    level: 0,
    img: 'bronze/code_advanced.png',
    descr: 'Complete 3 code advanced tutorials',
  },
  codeAdvancedSilver: {
    name: 'codeAdvancedSilver',
    title: 'Code Advanced',
    level: 1,
    img: 'silver/code_advanced.png',
    descr: 'Complete 15 code advanced tutorials',
  },
  codeAdvancedGold: {
    name: 'codeAdvancedGold',
    title: 'Code Advanced',
    level: 2,
    img: 'gold/code_advanced.png',
    descr: 'Complete all code advanced tutorials',
  },

  artBronze: {
    name: 'artBronze',
    title: 'Art',
    level: 0,
    img: 'bronze/artist_03.png',
    descr: 'Complete 2 art tutorials',
  },
  artSilver: {
    name: 'artSilver',
    title: 'Art',
    level: 1,
    img: 'silver/artist_03.png',
    descr: 'Complete 6 art tutorials',
  },
  artGold: {
    name: 'artGold',
    title: 'Art',
    level: 2,
    img: 'gold/artist_03.png',
    descr: 'Complete all art tutorials',
  },

  // TODO - time based
  // visitStrikeBronze: {
  //   name: 'visitStrikeBronze',
  //   img: 'bronze/teacher.png',
  //   descr: 'Visit MGB for 2 consecutive days',
  // },
  // visitStrikeSilver: {
  //   name: 'visitStrikeSilver',
  //   img: 'silver/teacher.png',
  //   descr: 'Visit MGB for 7 consecutive days',
  // },
  // visitStrikeGold: {
  //   name: 'visitStrikeGold',
  //   img: 'gold/teacher.png',
  //   descr: 'Visit MGB for 30 consecutive days',
  // },

  // time based - editors
  useGraphicEditorBronze: {
    name: 'useGraphicEditorBronze',
    title: 'Graphic Editor',
    level: 0,
    img: 'bronze/artist.png',
    descr: 'Use graphic editor for 2 min',
  },
  useGraphicEditorSilver: {
    name: 'useGraphicEditorSilver',
    title: 'Graphic Editor',
    level: 1,
    img: 'silver/artist.png',
    descr: 'Use graphic editor for 1 hour',
  },
  useGraphicEditorGold: {
    name: 'useGraphicEditorGold',
    title: 'Graphic Editor',
    level: 2,
    img: 'gold/artist.png',
    descr: 'Use graphic editor for 10 hours',
  },

  useCodeEditorBronze: {
    name: 'useCodeEditorBronze',
    title: 'Code Editor',
    level: 0,
    img: 'bronze/code.png',
    descr: 'Use code editor for 2 min',
  },
  useCodeEditorSilver: {
    name: 'useCodeEditorSilver',
    title: 'Code Editor',
    level: 1,
    img: 'silver/code.png',
    descr: 'Use code editor for 1 hour',
  },
  useCodeEditorGold: {
    name: 'useCodeEditorGold',
    title: 'Code Editor',
    level: 2,
    img: 'gold/code.png',
    descr: 'Use code editor for 10 hours',
  },

  useMapEditorBronze: {
    name: 'useMapEditorBronze',
    title: 'Map Editor',
    level: 0,
    img: 'bronze/map_editor.png',
    descr: 'Use map editor for 2 min',
  },
  useMapEditorSilver: {
    name: 'useMapEditorSilver',
    title: 'Map Editor',
    level: 1,
    img: 'silver/map_editor.png',
    descr: 'Use map editor for 1 hour',
  },
  useMapEditorGold: {
    name: 'useMapEditorGold',
    title: 'Map Editor',
    level: 2,
    img: 'gold/map_editor.png',
    descr: 'Use map editor for 10 hours',
  },

  useActorEditorBronze: {
    name: 'useActorEditorBronze',
    title: 'Actor Editor',
    level: 0,
    img: 'bronze/animator_02.png',
    descr: 'Use actor editor for 2 min',
  },
  useActorEditorSilver: {
    name: 'useActorEditorSilver',
    title: 'Actor Editor',
    level: 1,
    img: 'silver/animator_02.png',
    descr: 'Use actor editor for 1 hour',
  },
  useActorEditorGold: {
    name: 'useActorEditorGold',
    title: 'Actor Editor',
    level: 2,
    img: 'gold/animator_02.png',
    descr: 'Use actor editor for 10 hours',
  },

  useActormapEditorBronze: {
    name: 'useActormapEditorBronze',
    title: 'Actormap Editor',
    level: 0,
    img: 'bronze/actormap.png',
    descr: 'Use actormap editor for 2 min',
  },
  useActormapEditorSilver: {
    name: 'useActormapEditorSilver',
    title: 'Actormap Editor',
    level: 1,
    img: 'silver/actormap.png',
    descr: 'Use actormap editor for 1 hour',
  },
  useActormapEditorGold: {
    name: 'useActormapEditorGold',
    title: 'Actormap Editor',
    level: 2,
    img: 'gold/actormap.png',
    descr: 'Use actormap editor for 10 hours',
  },

  useSoundEditorBronze: {
    name: 'useSoundEditorBronze',
    title: 'Sound Editor',
    level: 0,
    img: 'bronze/sound_guru_01.png',
    descr: 'Use sound editor for 2 min',
  },
  useSoundEditorSilver: {
    name: 'useSoundEditorSilver',
    title: 'Sound Editor',
    level: 1,
    img: 'silver/sound_guru_01.png',
    descr: 'Use sound editor for 1 hour',
  },
  useSoundEditorGold: {
    name: 'useSoundEditorGold',
    title: 'Sound Editor',
    level: 2,
    img: 'gold/sound_guru_01.png',
    descr: 'Use sound editor for 10 hours',
  },

  useMusicEditorBronze: {
    name: 'useMusicEditorBronze',
    title: 'Music Editor',
    level: 0,
    img: 'bronze/music.png',
    descr: 'Use music editor for 2 min',
  },
  useMusicEditorSilver: {
    name: 'useMusicEditorSilver',
    title: 'Music Editor',
    level: 1,
    img: 'silver/music.png',
    descr: 'Use music editor for 1 hour',
  },
  useMusicEditorGold: {
    name: 'useMusicEditorGold',
    title: 'Music Editor',
    level: 2,
    img: 'gold/music.png',
    descr: 'Use music editor for 10 hours',
  },

  // mgb1 and mgb2 alpha specific
  mgb2AlphaTester: {
    name: 'mgb2AlphaTester',
    title: 'MGB Alpha Tester',
    img: 'bronze/bug.png',
    descr: 'Active Alpha Tester',
  },
  mgb1namesVerified: {
    name: 'mgb1namesVerified',
    title: 'MGB1 Verified',
    img: 'bronze/necromancer.png',
    descr: 'Verified MGBv1 veteran',
  },
  mgb1namesImported: {
    name: 'mgb1namesImported',
    title: 'MGB1 Imported',
    img: 'bronze/necromancer.png',
    descr: 'Imported an MGBv1 game',
  },

  mgbAdmin: { name: 'mgbAdmin', title: 'MGB Admin', img: 'gold/winner.png', descr: 'MGB Administrator' },

  // TODO interaction based
  // heartsBronze: { name: 'heartsBronze', img: 'bronze/teacher.png', descr: 'Asset got 1 like' },
  // heartsSilver: { name: 'heartsSilver', img: 'bronze/teacher.png', descr: 'Asset got 5 likes' },
  // heartsGold: { name: 'heartsGold', img: 'bronze/teacher.png', descr: 'Asset got 20 likes' },

  // playsBronze: { name: 'playsBronze', img: 'bronze/teacher.png', descr: 'Game got 5 plays' },
  // playsSilver: { name: 'playsSilver', img: 'bronze/teacher.png', descr: 'Game got 50 plays' },
  // playsGold: { name: 'playsGold', img: 'bronze/teacher.png', descr: 'Game got 500 plays' },

  // mentionsBronze: {
  //   name: 'mentionsBronze',
  //   img: 'bronze/teacher.png',
  //   descr: 'Got @ mentioned in chat 1 time',
  // },
  // mentionsSilver: {
  //   name: 'mentionsSilver',
  //   img: 'bronze/teacher.png',
  //   descr: 'Got @ mentioned in chat 10 times',
  // },
  // mentionsGold: {
  //   name: 'mentionsGold',
  //   img: 'bronze/teacher.png',
  //   descr: 'Got @ mentioned in chat 50 times',
  // },

  // projInviteBronze: {
  //   name: 'projInviteBronze',
  //   img: 'bronze/teacher.png',
  //   descr: 'Got invited to 1 project',
  // },
  // projInviteSilver: {
  //   name: 'projInviteSilver',
  //   img: 'bronze/teacher.png',
  //   descr: 'Got invited to 3 projects',
  // },
  // projInviteGold: { name: 'projInviteGold', img: 'bronze/teacher.png', descr: 'Got invited to 10 projects' },

  // // special badges
  // verifiedAccount: {
  //   name: 'verifiedAccount',
  //   img: 'bronze/teacher.png',
  //   descr: 'Verified account. Verification link sent via email',
  // },
  // // invite friends via special link?
  // inviteFriendsBronze: { name: 'inviteFriendsBronze', img: 'bronze/teacher.png', descr: 'Invite a friend' },
  // inviteFriendsSilver: { name: 'inviteFriendsSilver', img: 'bronze/teacher.png', descr: 'Invite 3 friends' },
  // inviteFriendsGold: { name: 'inviteFriendsGold', img: 'bronze/teacher.png', descr: 'Invite 10 friends' },
}

export const getAllBadgesForUser = user => {
  const userBadges = user.badges || []
  _.remove(userBadges, badgeKey => _.isEmpty(badgeList[badgeKey]))
  return userBadges
}

// if user has bronze and gold badge then return only gold one
export const getBadgesWithHighestLevel = user => {
  const userBadges = user.badges || []
  _.remove(userBadges, badgeKey => _.isEmpty(badgeList[badgeKey]))
  const badges = []
  _.map(userBadges, badgeKey => {
    const badge = badgeList[badgeKey]
    let repeatBadge = null
    for (var i = 0; i < badges.length; i++) {
      const tmpBadge = badgeList[badges[i]]
      // compare titles, they must much
      if (tmpBadge.title == badge.title) {
        repeatBadge = tmpBadge
        break
      }
    }
    if (!repeatBadge) badges.push(badge.name)
    else if (badge.level > repeatBadge.level) {
      const i = badges.indexOf(repeatBadge.name)
      badges[i] = badge.name
    }
  })
  return badges
}

export const getBadgesWithEnabledFlag = userBadges => {
  const badgesArr = []

  _.each(badgeList, (badge, badgeKey) => {
    badgesArr.push({
      img: '/images/badges/' + badge.img,
      name: badge.name,
      title: badge.title,
      descr: badge.descr,
      enabled: _.includes(userBadges, badgeKey),
    })
  })

  return badgesArr
}

export const selectBadges = (badgesArr, count, isEnabled) => {
  const arr = []
  _.every(badgesArr, badge => {
    if (badge.enabled === isEnabled) {
      arr.push(badge)
    }
    return arr.length < count
  })
  return arr
}

/**
 * hasBadge()
 *
 * @export
 * @param {any} user
 * @param {string} badgeString
 * @returns {boolean}
 */
export const hasBadge = (user, badgeString) => (user ? _.includes(user.badges, badgeString) : false)
