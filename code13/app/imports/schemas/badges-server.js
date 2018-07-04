import _ from 'lodash'
import { hasMultipleSkills, hasSkillCount } from './skills'
import { Skills, Projects, Users } from '/imports/schemas'
import { isUserSuperAdmin, isUserTeacher } from '/imports/schemas/roles'
import { logActivity } from '/imports/schemas/activity'
import { badgeList } from '/imports/schemas/badges'

// Dear Maintainers:
// This file must be imported by main_server.js so that the Meteor method can be registered
// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

// This is some server-side code that does badge awards for User accounts
// It primarily creates the following server-side-only Meteor.call:
//    "User.refreshBadgeStatus" ..which takes no params. It will typically be called
// during a tutorial using the %refreshBadgeStatus% macro, or at other times using the call directly
// (for example once a qualifying action has been completed)

// It's here so we can make it harder for people to just call 'add badge' for their account:
// The api intentionally doesn't say what badge to add (that would be far too easy to hack); instead
// this server code shall check for pre-conditions being met and then award those badges if not yet met.

// This structure defines rules for awarding badges based on specific tutorials being completed
//   newBadgeName: Must be a key that satisfies _validateBadgeKeyArray() in badges.js
//   requiredSkills
const _skillBasedBadges = [
  {
    newBadgeName: badgeList.hasAvatar.name,
    requiredSkills: ['getStarted.profile.avatar'],
    // This case should ideally also test for an avatar.. but it's ok, since
    //   that avatar does have an awaitCompletionTag:
    //    user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")
    //// TODO: Fix this - it's wrong since we always do the gravatar hash on account create. Doh!
  },
  {
    newBadgeName: badgeList.getStartedChat.name,
    requiredSkills: ['getStarted.chat.chatFlexPanel'],
  },
  {
    newBadgeName: badgeList.getStartedAsset.name,
    requiredSkills: ['getStarted.assetsBasics.createAssets'],
  },
  {
    newBadgeName: badgeList.getStartedProject.name,
    requiredSkills: ['getStarted.projects.createProject'],
  },
  // {
  //   newBadgeName: badgeList.getStartedAll.name,
  //   requiredSkills: ['getStarted.nonCodeGame.buildAndPlayActorMap'],
  // },
]

const _skillCountBasedBadges = [
  {
    newBadgeName: badgeList.codeBasicsBronze.name,
    requiredCount: 3,
    skillPath: 'code/js/intro',
  },
  {
    newBadgeName: badgeList.codeBasicsSilver.name,
    requiredCount: 15,
    skillPath: 'code/js/intro',
  },
  {
    newBadgeName: badgeList.codeBasicsGold.name,
    requiredCount: 54,
    skillPath: 'code/js/intro',
  },
  {
    newBadgeName: badgeList.codeAdvancedBronze.name,
    requiredCount: 3,
    skillPath: 'code/js/advanced',
  },
  {
    newBadgeName: badgeList.codeAdvancedSilver.name,
    requiredCount: 15,
    skillPath: 'code/js/advanced',
  },
  {
    newBadgeName: badgeList.codeAdvancedGold.name,
    requiredCount: 40,
    skillPath: 'code/js/advanced',
  },
  {
    newBadgeName: badgeList.codePhaserBronze.name,
    requiredCount: 3,
    skillPath: 'code/js/phaser',
  },
  {
    newBadgeName: badgeList.codePhaserSilver.name,
    requiredCount: 9,
    skillPath: 'code/js/phaser',
  },
  {
    newBadgeName: badgeList.codePhaserGold.name,
    requiredCount: 24,
    skillPath: 'code/js/phaser',
  },

  {
    newBadgeName: badgeList.artBronze.name,
    requiredCount: 2,
    skillPath: 'art/',
  },
  {
    newBadgeName: badgeList.artSilver.name,
    requiredCount: 6,
    skillPath: 'art/',
  },
  {
    newBadgeName: badgeList.artGold.name,
    requiredCount: 12,
    skillPath: 'art/',
  },
]

const _timeBasedBadges = [
  {
    newBadgeName: badgeList.useGraphicEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'graphic',
  },
  {
    newBadgeName: badgeList.useGraphicEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'graphic',
  },
  {
    newBadgeName: badgeList.useGraphicEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'graphic',
  },
  {
    newBadgeName: badgeList.useCodeEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'code',
  },
  {
    newBadgeName: badgeList.useCodeEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'code',
  },
  {
    newBadgeName: badgeList.useCodeEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'code',
  },
  {
    newBadgeName: badgeList.useMapEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'map',
  },
  {
    newBadgeName: badgeList.useMapEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'map',
  },
  {
    newBadgeName: badgeList.useMapEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'map',
  },
  {
    newBadgeName: badgeList.useActorEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'actor',
  },
  {
    newBadgeName: badgeList.useActorEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'actor',
  },
  {
    newBadgeName: badgeList.useActorEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'actor',
  },
  {
    newBadgeName: badgeList.useActormapEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'actormap',
  },
  {
    newBadgeName: badgeList.useActormapEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'actormap',
  },
  {
    newBadgeName: badgeList.useActormapEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'actormap',
  },
  {
    newBadgeName: badgeList.useSoundEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'sound',
  },
  {
    newBadgeName: badgeList.useSoundEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'sound',
  },
  {
    newBadgeName: badgeList.useSoundEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'sound',
  },
  {
    newBadgeName: badgeList.useMusicEditorBronze.name,
    timeSec: 2 * 60,
    editType: 'music',
  },
  {
    newBadgeName: badgeList.useMusicEditorSilver.name,
    timeSec: 60 * 60,
    editType: 'music',
  },
  {
    newBadgeName: badgeList.useMusicEditorGold.name,
    timeSec: 10 * 60 * 60,
    editType: 'music',
  },
]

const _nameBasedBadges = [
  {
    newBadgeName: badgeList.mgb2AlphaTester.name,
    usernames: 'Puupuls,legacyDev,dgolds,stauzs,guntis,leah,Supergirl,stanchion,LunarRaid,hawke,Viveiros,jazeps,avaragado,triptych,sleepysort,hertlen,collectordx,skadwaz,jaketor,Fantasythief,Nemopolymer,rabbidpony'.split(
      ',',
    ),
  },
]

const _functionBasedBadges = [
  {
    newBadgeName: badgeList.mgbAdmin.name,
    func: isUserSuperAdmin, // a function that takes a user-record as a parameter, and returns true if badge should be granted
  },
  {
    newBadgeName: badgeList.officialTeacher.name,
    func: isUserTeacher, // a function that takes a user-record as a parameter, and returns true if badge should be granted
  },
  {
    newBadgeName: badgeList.hasAvatar.name,
    func: user => _.startsWith(user.profile.avatar, '/api/asset'),
  },
  {
    newBadgeName: badgeList.mgb1namesVerified.name,
    func: user => _.isString(user.profile.mgb1namesVerified) && user.profile.mgb1namesVerified.length > 0,
  },
  {
    newBadgeName: badgeList.mgb1namesImported.name,
    func: user => Projects.find({ ownerId: user._id, mgb1: { $exists: true } }).count() > 0,
  },
  {
    newBadgeName: badgeList.emailVerified.name,
    func: user => _.get(user, 'emails[0].verified'),
  },
]

const _doRefreshBadgeStatus = user => {
  if (!user || !user._id) return []

  let newBadgeKeys = []
  const now = new Date()

  // 0. manual (name-based) awards
  _.each(_nameBasedBadges, nbb => {
    if (_.includes(nbb.usernames, user.username)) {
      if (!_.includes(user.badges, nbb.newBadgeName)) {
        _awardBadge('Name-based', nbb.newBadgeName, newBadgeKeys, user)
      }
    }
  })

  // 1. Skill-based awards
  const skills = Skills.findOne(user._id)
  _.each(_skillBasedBadges, sbb => {
    if (hasMultipleSkills(skills, sbb.requiredSkills)) {
      if (!_.includes(user.badges, sbb.newBadgeName)) {
        _awardBadge('Skill-based', sbb.newBadgeName, newBadgeKeys, user)
      }
    }
  })

  // Skill count awards
  _.each(_skillCountBasedBadges, scbb => {
    if (hasSkillCount(skills, scbb.skillPath, scbb.requiredCount)) {
      if (!_.includes(user.badges, scbb.newBadgeName)) {
        _awardBadge('Skill-count-based', scbb.newBadgeName, newBadgeKeys, user)
      }
    }
  })

  const editTimeSpent = (editTime, editType, timeSec) => {
    if (_.isEmpty(editTime) || !editTime[editType]) return false
    return editTime[editType] >= timeSec
  }

  // Time based awards
  _.each(_timeBasedBadges, tbb => {
    if (!_.includes(user.badges, tbb.newBadgeName)) {
      if (editTimeSpent(user.edit_time, tbb.editType, tbb.timeSec)) {
        _awardBadge('Time-based', tbb.newBadgeName, newBadgeKeys, user)
      }
    }
  })

  // 0. function (code-based, using a function that takes a user-record as a parameter) awards
  _.each(_functionBasedBadges, fbb => {
    if (fbb.func(user)) {
      if (!_.includes(user.badges, fbb.newBadgeName)) {
        _awardBadge('Function-based', fbb.newBadgeName, newBadgeKeys, user)
      }
    }
  })
  // TODO: more...

  _.forEach(_.uniq(newBadgeKeys), bk => {
    logActivity('user.earnBadge', `earned the '${bk}' badge`, null, null)
  })

  if (newBadgeKeys.length > 0) {
    const allBadges =
      _.isArray(user.badges) && user.badges.length > 0 ? _.union(user.badges, newBadgeKeys) : newBadgeKeys
    const count = Users.update(user._id, {
      $set: {
        badges_count: allBadges.length,
        updatedAt: now,
      },
    })
    console.log(count, user.username, allBadges.length, allBadges.join(','))
  }

  // OK, return the array of newly-granted badge keys
  return newBadgeKeys
}

const _awardBadge = (type, newBadgeName, newBadgeKeys, user) => {
  console.log(`User '${user.username}' does not have '${newBadgeName}' badge, so awarding it!`)
  // guntis - this return error, but badge is still added
  /*
      error:401
      errorType:
      "Meteor.Error"
      message:"Only admins/mods can log Activity on behalf of others [401]"
    */
  const count = Users.update(user._id, {
    $addToSet: { badges: newBadgeName },
    $set: { updatedAt: Date.now() },
  })
  console.log(
    `${type} Badge '${newBadgeName}' award to '@${user.username}': Mongo Update returned count=${count}`,
  )
  if (
    count === 1 // Note that this will be the case at least because of the $set: updatedAt
  )
    newBadgeKeys.push(newBadgeName)
}

Meteor.methods({
  'User.refreshBadgeStatus'() {
    const currUser = Meteor.user()
    // don't award guest users with badges
    if (!currUser || currUser.profile.isGuest) return false
    return _doRefreshBadgeStatus(currUser)
  },
  // 'User.refreshAllUserBadges'() {
  //   // e.g. call with   Meteor.call("User.refreshAllUserBadges")
  //   console.log('---User.refreshAllUserBadges-start---')
  //   Users.find().forEach(function(u) {
  //     _doRefreshBadgeStatus(u)
  //   })
  //   console.log('---User.refreshAllUserBadges-done---')
  // },
})

// Example of how to fix badges given by mistake:
//   FIX FIX  Users.update( {}  , { $pull: { badges: "mgbAdmin" }}, { multi: true }  )
