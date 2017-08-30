import _ from 'lodash'

// Helper functions for Badges. These mostly require a user object from users.js
//  getAllBadgesForUser(user) gets list of user's badges (returns array of keys into badgeList)

export const badgeList = {
  mgbAdmin: { name: 'mgbAdmin', img: 'gold/winner.png', descr: 'MGB Administrator' },
  hasAvatar: { name: 'hasAvatar', img: 'bronze/cleaner.png', descr: 'Made an Avatar' },
  mgb2AlphaTester: { name: 'mgb2AlphaTester', img: 'bronze/bug.png', descr: 'Active Alpha Tester' },
  mgb1namesVerified: {
    name: 'mgb1namesVerified',
    img: 'bronze/necromancer.png',
    descr: 'Verified MGBv1 veteran',
  },
  mgb1namesImported: {
    name: 'mgb1namesImported',
    img: 'bronze/necromancer.png',
    descr: 'Imported an MGBv1 game',
  },

  // This is a special case just to make it easier to generate some UI consistently
  _blankBadge: { name: '_blankBadge', img: 'Empty Badge slot.png', descr: 'Space for another badge' },

  // skill based
  getStartedChat: { name: 'getStartedChat', img: 'bronze/nice_question.png', descr: 'Write a chat message' },
  getStartedAsset: { name: 'getStartedAsset', img: 'bronze/teacher.png', descr: 'Create a sound asset' },
  getStartedProject: { name: 'getStartedProject', img: 'bronze/teacher.png', descr: 'Create a project' },
  getStartedAll: {
    name: 'getStartedAll',
    img: 'bronze/learner.png',
    descr: 'Finish all "Get Started" tutorials',
  },

  codeBasicsBronze: {
    name: 'codeBasicsBronze',
    img: 'bronze/teacher.png',
    descr: 'Complete 3 code basics tutorials',
  },
  codeBasicsSilver: {
    name: 'codeBasicsSilver',
    img: 'silver/teacher.png',
    descr: 'Complete 15 code basics tutorials',
  },
  codeBasicsGold: {
    name: 'codeBasicsGold',
    img: 'gold/teacher.png',
    descr: 'Complete all code basics tutorials',
  },

  codePhaserBronze: { name: 'codePhaserBronze', img: 'bronze/teacher.png', descr: 'Complete 1 Phaser task' },
  codePhaserSilver: { name: 'codePhaserSilver', img: 'silver/teacher.png', descr: 'Complete 3 Phaser task' },
  codePhaserGold: { name: 'codePhaserGold', img: 'gold/teacher.png', descr: 'Complete all Phaser tutorials' },

  codeAdvancedBronze: {
    name: 'codeAdvancedBronze',
    img: 'bronze/teacher.png',
    descr: 'Complete 3 code advanced tutorials',
  },
  codeAdvancedSilver: {
    name: 'codeAdvancedSilver',
    img: 'silver/teacher.png',
    descr: 'Complete 15 code advanced tutorials',
  },
  codeAdvancedGold: {
    name: 'codeAdvancedGold',
    img: 'gold/teacher.png',
    descr: 'Complete all code advanced tutorials',
  },

  artBronze: { name: 'artBronze', img: 'bronze/teacher.png', descr: 'Complete 2 art tutorials' },
  artSilver: { name: 'artSilver', img: 'silver/teacher.png', descr: 'Complete 6 art tutorials' },
  artGold: { name: 'artGold', img: 'gold/teacher.png', descr: 'Complete all art tutorials' },

  // time based
  visitStrikeBronze: {
    name: 'visitStrikeBronze',
    img: 'bronze/teacher.png',
    descr: 'Visit MGB for 2 consecutive days',
  },
  visitStrikeSilver: {
    name: 'visitStrikeSilver',
    img: 'silver/teacher.png',
    descr: 'Visit MGB for 7 consecutive days',
  },
  visitStrikeGold: {
    name: 'visitStrikeGold',
    img: 'gold/teacher.png',
    descr: 'Visit MGB for 30 consecutive days',
  },

  // time based - editors
  useGraphicEditorBronze: {
    name: 'useGraphicEditorBronze',
    img: 'bronze/artist.png',
    descr: 'Use graphic editor for 2 min',
  },
  useGraphicEditorSilver: {
    name: 'useGraphicEditorSilver',
    img: 'silver/artist.png',
    descr: 'Use graphic editor for 1 hour',
  },
  useGraphicEditorGold: {
    name: 'useGraphicEditorGold',
    img: 'gold/artist.png',
    descr: 'Use graphic editor for 10 hours',
  },

  useCodeEditorBronze: {
    name: 'useCodeEditorBronze',
    img: 'bronze/code.png',
    descr: 'Use code editor for 2 min',
  },
  useCodeEditorSilver: {
    name: 'useCodeEditorSilver',
    img: 'silver/code.png',
    descr: 'Use code editor for 1 hour',
  },
  useCodeEditorGold: {
    name: 'useCodeEditorGold',
    img: 'gold/code.png',
    descr: 'Use code editor for 10 hours',
  },

  useMapEditorBronze: {
    name: 'useMapEditorBronze',
    img: 'bronze/teacher.png',
    descr: 'Use map editor for 2 min',
  },
  useMapEditorSilver: {
    name: 'useMapEditorSilver',
    img: 'silver/teacher.png',
    descr: 'Use map editor for 1 hour',
  },
  useMapEditorGold: {
    name: 'useMapEditorGold',
    img: 'gold/teacher.png',
    descr: 'Use map editor for 10 hours',
  },

  useActorEditorBronze: {
    name: 'useActorEditorBronze',
    img: 'bronze/animator_02.png',
    descr: 'Use actor editor for 2 min',
  },
  useActorEditorSilver: {
    name: 'useActorEditorSilver',
    img: 'silver/animator_02.png',
    descr: 'Use actor editor for 1 hour',
  },
  useActorEditorGold: {
    name: 'useActorEditorGold',
    img: 'gold/animator_02.png',
    descr: 'Use actor editor for 10 hours',
  },

  useActormapEditorBronze: {
    name: 'useActormapEditorBronze',
    img: 'bronze/teacher.png',
    descr: 'Use actormap editor for 2 min',
  },
  useActormapEditorSilver: {
    name: 'useActormapEditorSilver',
    img: 'silver/teacher.png',
    descr: 'Use actormap editor for 1 hour',
  },
  useActormapEditorGold: {
    name: 'useActormapEditorGold',
    img: 'gold/teacher.png',
    descr: 'Use actormap editor for 10 hours',
  },

  useSoundEditorBronze: {
    name: 'useSoundEditorBronze',
    img: 'bronze/sound_guru_01.png',
    descr: 'Use sound editor for 2 min',
  },
  useSoundEditorSilver: {
    name: 'useSoundEditorSilver',
    img: 'silver/sound_guru_01.png',
    descr: 'Use sound editor for 1 hour',
  },
  useSoundEditorGold: {
    name: 'useSoundEditorGold',
    img: 'gold/sound_guru_01.png',
    descr: 'Use sound editor for 10 hours',
  },

  useMusicEditorBronze: {
    name: 'useMusicEditorBronze',
    img: 'bronze/music.png',
    descr: 'Use music editor for 2 min',
  },
  useMusicEditorSilver: {
    name: 'useMusicEditorSilver',
    img: 'silver/music.png',
    descr: 'Use music editor for 1 hour',
  },
  useMusicEditorGold: {
    name: 'useMusicEditorGold',
    img: 'gold/music.png',
    descr: 'Use music editor for 10 hours',
  },

  // interaction based
  heartsBronze: { name: 'heartsBronze', img: 'bronze/teacher.png', descr: 'Asset got 1 like' },
  heartsSilver: { name: 'heartsSilver', img: 'bronze/teacher.png', descr: 'Asset got 5 likes' },
  heartsGold: { name: 'heartsGold', img: 'bronze/teacher.png', descr: 'Asset got 20 likes' },

  playsBronze: { name: 'playsBronze', img: 'bronze/teacher.png', descr: 'Game got 5 plays' },
  playsSilver: { name: 'playsSilver', img: 'bronze/teacher.png', descr: 'Game got 50 plays' },
  playsGold: { name: 'playsGold', img: 'bronze/teacher.png', descr: 'Game got 500 plays' },

  mentionsBronze: {
    name: 'mentionsBronze',
    img: 'bronze/teacher.png',
    descr: 'Got @ mentioned in chat 1 time',
  },
  mentionsSilver: {
    name: 'mentionsSilver',
    img: 'bronze/teacher.png',
    descr: 'Got @ mentioned in chat 10 times',
  },
  mentionsGold: {
    name: 'mentionsGold',
    img: 'bronze/teacher.png',
    descr: 'Got @ mentioned in chat 50 times',
  },

  projInviteBronze: {
    name: 'projInviteBronze',
    img: 'bronze/teacher.png',
    descr: 'Got invited to 1 project',
  },
  projInviteSilver: {
    name: 'projInviteSilver',
    img: 'bronze/teacher.png',
    descr: 'Got invited to 3 projects',
  },
  projInviteGold: { name: 'projInviteGold', img: 'bronze/teacher.png', descr: 'Got invited to 10 projects' },

  // special badges
  verifiedAccount: {
    name: 'verifiedAccount',
    img: 'bronze/teacher.png',
    descr: 'Verified account. Verification link sent via email',
  },
  // invite friends via special link?
  inviteFriendsBronze: { name: 'inviteFriendsBronze', img: 'bronze/teacher.png', descr: 'Invite a friend' },
  inviteFriendsSilver: { name: 'inviteFriendsSilver', img: 'bronze/teacher.png', descr: 'Invite 3 friends' },
  inviteFriendsGold: { name: 'inviteFriendsGold', img: 'bronze/teacher.png', descr: 'Invite 10 friends' },
}

export const getAllBadgesForUser = user => {
  const userBadges = user.badges || []
  _.remove(userBadges, badgeKey => _.isEmpty(badgeList[badgeKey]))
  return userBadges
}

export const getBadgesWithEnabledFlag = userBadges => {
  const badgesArr = []

  _.each(badgeList, (badge, badgeKey) => {
    badgesArr.push({
      img: '/images/badges/' + badge.img,
      title: badgeKey,
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
