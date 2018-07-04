import _ from 'lodash'

// Helper functions for Badges. These mostly require a user object from users.js
//  getAllBadgesForUser(user) gets list of user's badges (returns array of keys into badgeList)

export const badgeList = {
  _blankBadge: {
    name: '_blankBadge',
    title: '',
    img: '/images/badges/Empty Badge slot.png',
    descr: 'Use MGB to Earn badges',
    hideBeforeEnabled: true,
  },
  emailVerified: {
    name: 'emailVerified',
    title: 'Validated',
    img: '/images/badges/bronze/accepted_question.png',
    descr: 'Click the link in the verification email',
  },
  mgbAdmin: {
    name: 'mgbAdmin',
    title: 'MGB Admin',
    img: '/images/badges/gold/winner.png',
    descr: 'Works at MGB',
    hideBeforeEnabled: true,
  },
  officialTeacher: {
    name: 'officialTeacher',
    title: 'Official Teacher Account',
    img: '/images/badges/gold/teacher.png',
    descr: 'Official Classroom teacher',
    hideBeforeEnabled: true,
  },
  hasAvatar: {
    name: 'hasAvatar',
    title: 'Looking Good',
    img: '/images/badges/bronze/cleaner.png',
    descr: 'Make an Avatar',
  },

  // skill based
  getStartedChat: {
    name: 'getStartedChat',
    title: 'Ice Breaker',
    img: '/images/badges/bronze/nice_question.png',
    descr: 'Write a chat message',
  },
  getStartedAsset: {
    name: 'getStartedAsset',
    title: 'Grand Creator',
    img: '/images/badges/bronze/created_asset.png',
    descr: 'Create an asset',
  },
  getStartedProject: {
    name: 'getStartedProject',
    title: 'Master Builder',
    img: '/images/badges/bronze/created_project.png',
    descr: 'Create a project',
  },
  getStartedAll: {
    name: 'getStartedAll',
    title: 'Honorable Initiate',
    img: '/images/badges/bronze/learner.png',
    descr: 'Finish all "Get Started" tutorials',
  },

  codeBasicsBronze: {
    name: 'codeBasicsBronze',
    title: 'Code Student',
    level: 0,
    img: '/images/badges/bronze/javascript.png',
    descr: 'Complete 3 code basics tutorials',
  },
  codeBasicsSilver: {
    name: 'codeBasicsSilver',
    title: 'Code Student',
    level: 1,
    img: '/images/badges/silver/javascript.png',
    descr: 'Complete 15 code basics tutorials',
  },
  codeBasicsGold: {
    name: 'codeBasicsGold',
    title: 'Code Student',
    level: 2,
    img: '/images/badges/gold/javascript.png',
    descr: 'Complete all code basics tutorials',
  },

  codePhaserBronze: {
    name: 'codePhaserBronze',
    title: 'Game Dev',
    level: 0,
    img: '/images/badges/bronze/phaser.png',
    descr: 'Complete 1 Phaser task',
  },
  codePhaserSilver: {
    name: 'codePhaserSilver',
    title: 'Game Dev',
    level: 1,
    img: '/images/badges/silver/phaser.png',
    descr: 'Complete 3 Phaser task',
  },
  codePhaserGold: {
    name: 'codePhaserGold',
    title: 'Game Dev',
    level: 2,
    img: '/images/badges/gold/phaser.png',
    descr: 'Complete all Phaser tutorials',
  },

  codeAdvancedBronze: {
    name: 'codeAdvancedBronze',
    title: 'Hacker',
    level: 0,
    img: '/images/badges/bronze/code_advanced.png',
    descr: 'Complete 3 code advanced tutorials',
  },
  codeAdvancedSilver: {
    name: 'codeAdvancedSilver',
    title: 'Hacker',
    level: 1,
    img: '/images/badges/silver/code_advanced.png',
    descr: 'Complete 15 code advanced tutorials',
  },
  codeAdvancedGold: {
    name: 'codeAdvancedGold',
    title: 'Hacker',
    level: 2,
    img: '/images/badges/gold/code_advanced.png',
    descr: 'Complete all code advanced tutorials',
  },

  artBronze: {
    name: 'artBronze',
    title: 'Artist',
    level: 0,
    img: '/images/badges/bronze/artist_03.png',
    descr: 'Complete 2 art tutorials',
  },
  artSilver: {
    name: 'artSilver',
    title: 'Artist',
    level: 1,
    img: '/images/badges/silver/artist_03.png',
    descr: 'Complete 6 art tutorials',
  },
  artGold: {
    name: 'artGold',
    title: 'Artist',
    level: 2,
    img: '/images/badges/gold/artist_03.png',
    descr: 'Complete all art tutorials',
  },

  // TODO - time based
  // visitStrikeBronze: {
  //   name: 'visitStrikeBronze',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Visit MGB for 2 consecutive days',
  // },
  // visitStrikeSilver: {
  //   name: 'visitStrikeSilver',
  //   img: '/images/badges/silver/teacher.png',
  //   descr: 'Visit MGB for 7 consecutive days',
  // },
  // visitStrikeGold: {
  //   name: 'visitStrikeGold',
  //   img: '/images/badges/gold/teacher.png',
  //   descr: 'Visit MGB for 30 consecutive days',
  // },

  // time based - editors
  useGraphicEditorBronze: {
    name: 'useGraphicEditorBronze',
    title: 'Painter',
    level: 0,
    img: '/images/badges/bronze/artist.png',
    descr: 'Use Graphic editor for 2min',
  },
  useGraphicEditorSilver: {
    name: 'useGraphicEditorSilver',
    title: 'Painter',
    level: 1,
    img: '/images/badges/silver/artist.png',
    descr: 'Use Graphic editor for 1hr',
  },
  useGraphicEditorGold: {
    name: 'useGraphicEditorGold',
    title: 'Painter',
    level: 2,
    img: '/images/badges/gold/artist.png',
    descr: 'Use Graphic editor for 10hrs',
  },

  useCodeEditorBronze: {
    name: 'useCodeEditorBronze',
    title: 'Coder',
    level: 0,
    img: '/images/badges/bronze/code.png',
    descr: 'Use Code editor for 2min',
  },
  useCodeEditorSilver: {
    name: 'useCodeEditorSilver',
    title: 'Coder',
    level: 1,
    img: '/images/badges/silver/code.png',
    descr: 'Use Code editor for 1hr',
  },
  useCodeEditorGold: {
    name: 'useCodeEditorGold',
    title: 'Coder',
    level: 2,
    img: '/images/badges/gold/code.png',
    descr: 'Use Code editor for 10hrs',
  },

  useMapEditorBronze: {
    name: 'useMapEditorBronze',
    title: 'Cartographer',
    level: 0,
    img: '/images/badges/bronze/map_editor.png',
    descr: 'Use Map editor for 2min',
  },
  useMapEditorSilver: {
    name: 'useMapEditorSilver',
    title: 'Cartographer',
    level: 1,
    img: '/images/badges/silver/map_editor.png',
    descr: 'Use Map editor for 1hr',
  },
  useMapEditorGold: {
    name: 'useMapEditorGold',
    title: 'Cartographer',
    level: 2,
    img: '/images/badges/gold/map_editor.png',
    descr: 'Use Map editor for 10hrs',
  },

  useActorEditorBronze: {
    name: 'useActorEditorBronze',
    title: 'Puppeteer',
    level: 0,
    img: '/images/badges/bronze/animator_02.png',
    descr: 'Use Actor editor for 2min',
  },
  useActorEditorSilver: {
    name: 'useActorEditorSilver',
    title: 'Puppeteer',
    level: 1,
    img: '/images/badges/silver/animator_02.png',
    descr: 'Use Actor editor for 1hr',
  },
  useActorEditorGold: {
    name: 'useActorEditorGold',
    title: 'Puppeteer',
    level: 2,
    img: '/images/badges/gold/animator_02.png',
    descr: 'Use Actor editor for 10hrs',
  },

  useActormapEditorBronze: {
    name: 'useActormapEditorBronze',
    title: 'Director',
    level: 0,
    img: '/images/badges/bronze/actormap.png',
    descr: 'Use ActorMap editor for 2min',
  },
  useActormapEditorSilver: {
    name: 'useActormapEditorSilver',
    title: 'Director',
    level: 1,
    img: '/images/badges/silver/actormap.png',
    descr: 'Use ActorMap editor for 1hr',
  },
  useActormapEditorGold: {
    name: 'useActormapEditorGold',
    title: 'Director',
    level: 2,
    img: '/images/badges/gold/actormap.png',
    descr: 'Use ActorMap editor for 10hrs',
  },

  useSoundEditorBronze: {
    name: 'useSoundEditorBronze',
    title: 'Audio Tech',
    level: 0,
    img: '/images/badges/bronze/sound_guru_01.png',
    descr: 'Use Sound editor for 2min',
  },
  useSoundEditorSilver: {
    name: 'useSoundEditorSilver',
    title: 'Audio Tech',
    level: 1,
    img: '/images/badges/silver/sound_guru_01.png',
    descr: 'Use Sound editor for 1hr',
  },
  useSoundEditorGold: {
    name: 'useSoundEditorGold',
    title: 'Audio Tech',
    level: 2,
    img: '/images/badges/gold/sound_guru_01.png',
    descr: 'Use Sound editor for 10hrs',
  },

  useMusicEditorBronze: {
    name: 'useMusicEditorBronze',
    title: 'Musician',
    level: 0,
    img: '/images/badges/bronze/music.png',
    descr: 'Use Music editor for 2min',
  },
  useMusicEditorSilver: {
    name: 'useMusicEditorSilver',
    title: 'Musician',
    level: 1,
    img: '/images/badges/silver/music.png',
    descr: 'Use Music editor for 1hr',
  },
  useMusicEditorGold: {
    name: 'useMusicEditorGold',
    title: 'Musician',
    level: 2,
    img: '/images/badges/gold/music.png',
    descr: 'Use Music editor for 10hrs',
  },

  // mgb1 and mgb2 alpha specific
  mgb2AlphaTester: {
    name: 'mgb2AlphaTester',
    title: 'MGB Alpha Tester',
    img: '/images/badges/bronze/bug.png',
    descr: 'Active Alpha Tester',
    hideBeforeEnabled: true,
  },
  mgb1namesVerified: {
    name: 'mgb1namesVerified',
    title: 'MGB1 Verified',
    img: '/images/badges/bronze/necromancer.png',
    descr: 'Verified MGBv1 veteran',
    hideBeforeEnabled: true,
  },
  mgb1namesImported: {
    name: 'mgb1namesImported',
    title: 'MGB1 Imported',
    img: '/images/badges/bronze/necromancer.png',
    descr: 'Import an MGBv1 game',
    hideBeforeEnabled: true,
  },

  // TODO interaction based
  // heartsBronze: { name: 'heartsBronze', img: '/images/badges/bronze/teacher.png', descr: 'Asset got 1 like' },
  // heartsSilver: { name: 'heartsSilver', img: '/images/badges/bronze/teacher.png', descr: 'Asset got 5 likes' },
  // heartsGold: { name: 'heartsGold', img: '/images/badges/bronze/teacher.png', descr: 'Asset got 20 likes' },

  // playsBronze: { name: 'playsBronze', img: '/images/badges/bronze/teacher.png', descr: 'Game got 5 plays' },
  // playsSilver: { name: 'playsSilver', img: '/images/badges/bronze/teacher.png', descr: 'Game got 50 plays' },
  // playsGold: { name: 'playsGold', img: '/images/badges/bronze/teacher.png', descr: 'Game got 500 plays' },

  // mentionsBronze: {
  //   name: 'mentionsBronze',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Get @ mentioned in chat 1 time',
  // },
  // mentionsSilver: {
  //   name: 'mentionsSilver',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Get @ mentioned in chat 10 times',
  // },
  // mentionsGold: {
  //   name: 'mentionsGold',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Get @ mentioned in chat 50 times',
  // },

  // projInviteBronze: {
  //   name: 'projInviteBronze',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Get invited to 1 project',
  // },
  // projInviteSilver: {
  //   name: 'projInviteSilver',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Get invited to 3 projects',
  // },
  // projInviteGold: { name: 'projInviteGold', img: '/images/badges/bronze/teacher.png', descr: 'Get invited to 10 projects' },

  // // special badges
  // verifiedAccount: {
  //   name: 'verifiedAccount',
  //   img: '/images/badges/bronze/teacher.png',
  //   descr: 'Verified account. Verification link sent via email',
  // },
  // // invite friends via special link?
  // inviteFriendsBronze: { name: 'inviteFriendsBronze', img: '/images/badges/bronze/teacher.png', descr: 'Invite a friend' },
  // inviteFriendsSilver: { name: 'inviteFriendsSilver', img: '/images/badges/bronze/teacher.png', descr: 'Invite 3 friends' },
  // inviteFriendsGold: { name: 'inviteFriendsGold', img: '/images/badges/bronze/teacher.png', descr: 'Invite 10 friends' },
}

/**
 * Generates a friendly "<level> <title>" name for the badge.
 *
 * @param {string|object} badge - Either a badgeList badge object or badge key string.
 * @returns {string}
 */
export const getFriendlyName = badge => {
  const isString = _.isString(badge)
  const isObject = _.isPlainObject(badge)

  if (!isString && !isObject) {
    return console.error('badges.getFriendlyName(badge) `badge` must be a string or object, got:', badge)
  }

  const badgeObject = isString ? badgeList[badge] : isObject ? badge : null

  if (!badgeObject) {
    return console.error('badges.getFriendlyName() called with unknown badge:', badge)
  }

  if (!_.has(badgeObject, 'level')) return badgeObject.title

  const prefix = ['', 'Pro', 'Guru'][badgeObject.level]

  return [prefix, badgeObject.title].filter(Boolean).join(' ')
}

export const getAllBadgesForUser = user => {
  return _.filter(user.badges, badgeKey => badgeKey in badgeList)
}

export const getBadgesWithHighestLevel = user => {
  return _.chain(badgeList)
    .filter(badge => _.includes(user.badges, badge.name))
    .groupBy('title')
    .sortBy('level')
    .map(_.last)
    .map('name')
    .value()
}

export const getBadgesWithEnabledFlag = userBadges => {
  return _.map(badgeList, (badge, badgeKey) => ({
    ...badge,
    enabled: _.includes(userBadges, badgeKey),
  }))
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
