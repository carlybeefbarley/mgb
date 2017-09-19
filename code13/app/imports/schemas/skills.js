import _ from 'lodash'
import SkillNodes, {
  makeSlashSeparatedSkillKey,
  makeTutorialsFindSelector,
} from '/imports/Skills/SkillNodes/SkillNodes.js'
import { Azzets, Skills } from '/imports/schemas'
import { isUserSuperAdmin } from './roles'
import { logActivity } from '/imports/schemas/activity'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

var schema = {
  // ID of skills objects in the Skills Collection.
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:settings
  _id: String,

  updatedAt: Date, // Always handy to have this
}

// Basis for the skill - to what extent is this subjectively or objectively verified
const skillBasis = {
  SELF_CLAIMED: 'self',
  PEER_ASSERTED: 'peer', // TODO in future - use some # of votes of 'respected peers' as basis for claim
  MGB_MEASURED: 'guru', // TODO in future - use some moderator/guru account as basis for claim
}

Meteor.methods({
  'Skill.learn'(dottedSkillKey, userID, basis = skillBasis.SELF_CLAIMED) {
    //console.log(dottedSkillKey, userID, basis)
    let awardedSkill = false
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    // if (basis !== skillBasis.SELF_CLAIMED)
    //   throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    if (userID) {
      // if userID passed then it means that admin is giving a skill to user
      // superAdmin check
      if (!isUserSuperAdmin(Meteor.user()))
        throw new Meteor.Error(401, 'Only admins/mods can award skills to others')
      basis = skillBasis.MGB_MEASURED
      awardedSkill = true
    }

    // if userID is passed then admin is giving skill for another user
    userID = userID || this.userId

    const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(userID, {
      $addToSet: { [slashSeparatedSkillKey]: basis },
      $set: { updatedAt: new Date() },
    })

    if (Meteor.isServer) {
      if (count) {
        if (awardedSkill) {
          const userRecord = Meteor.users.findOne({ _id: userID }, { fields: { username: 1, _id: 1 } })
          logActivity(
            'user.awardedSkill',
            `was awarded the '${dottedSkillKey}' skill by @${Meteor.user().username}`,
            null,
            null,
            { override_byUser: userRecord },
          )
        } else {
          logActivity('user.learnedSkill', `learned skill '${dottedSkillKey}'`)
        }
      }
    }

    return count
  },

  'Skill.forget'(dottedSkillKey, userID, basis = skillBasis.SELF_CLAIMED) {
    if (!this.userId) throw new Meteor.Error(401, 'Login required')

    // if (basis !== skillBasis.SELF_CLAIMED)
    //   throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    if (userID) {
      // if userID passed then it means that admin is removing a skill from user
      basis = skillBasis.MGB_MEASURED
      // superAdmin check
      if (!isUserSuperAdmin(Meteor.user())) return false
    }

    // id userID is passed then admin is removing skill from another user
    userID = userID || this.userId

    const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(userID, {
      $pullAll: { [slashSeparatedSkillKey]: [basis] },
      $set: { updatedAt: new Date() },
    })

    // Note that we don't announce skill removals

    return count
  },
})

if (Meteor.isServer)
  Meteor.methods({
    'Skill.getTutorialListForSkill'(dottedSkillKey) {
      if (!this.userId) throw new Meteor.Error(401, 'Login required')

      const sel = makeTutorialsFindSelector(dottedSkillKey, 0)
      const retval = Azzets.find(sel, { fields: { name: 1, text: 1 } }).fetch()
      return retval
    },
  })

/** hasSkill() returns true iff the user skill object provided has the requested skill
 * @export
 * @param {any} skillsObj - a user's skill context - a record from the Skills collection
 * @param {string} dottedSkillKey - a dottedSkillsKey e.g. getStarted.profile.profilePage
 * @returns {boolean} true iff the user skill object provided has all requested skills
 */
export const hasSkill = (skillsObj, dottedSkillKey) => {
  if (!skillsObj || !dottedSkillKey || dottedSkillKey === '') return false

  const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)
  const val = skillsObj[slashSeparatedSkillKey]
  return val && val.length > 0
}

/** hasMultipleSkills() returns true iff the user skill object provided has all requested skills
 * @export
 * @param {any} skillsObj - a user's skill context - a record from the Skills collection
 * @param {array} dottedSkillKeysArray - array of dottedSkillsKeys
 * @returns {boolean} true iff the user skill object provided has all requested skills
 */
export const hasMultipleSkills = (skillsObj, dottedSkillKeysArray) => {
  if (!skillsObj || !dottedSkillKeysArray || dottedSkillKeysArray.length === 0) return false

  return _.every(dottedSkillKeysArray, sk => hasSkill(skillsObj, sk))
}

export const hasSkillCount = (skillsObj, skillPath, requiredCount) => {
  let totalCount = 0
  _.forIn(skillsObj, (val, key) => {
    if (_.startsWith(key, skillPath)) totalCount++
  })
  return totalCount >= requiredCount
}

export const learnSkill = (dottedSkillKey, userID) => {
  Meteor.call('Skill.learn', dottedSkillKey, userID, (err, result) => {
    console.log(`${result} Skill learned: '${dottedSkillKey}'. Err=`, err)
  })
  // TODO: set it with a rounded timestamp so we know timeline and recency of this skill change
}

export const forgetSkill = (dottedSkillKey, userID) => {
  Meteor.call('Skill.forget', dottedSkillKey, userID, (err, result) => {
    console.log(`${result} Skill forgotten: '${dottedSkillKey}'. Err=`, err)
  })
}

export const toggleSkill = (skillsObj, dottedSkillKey) =>
  hasSkill(skillsObj, dottedSkillKey) ? forgetSkill(dottedSkillKey) : learnSkill(dottedSkillKey)

/**
 * Count a User's Total number of actual achieved Skills.
 * The counterpart for (fixed) max-available totals is countMaxUserSkills() in SkillNodes.js
 *
 * @export
 * @param {any} skillsObj
 * @param {string} [dotttedSkillPrefix=null] Optional prefix in dotted form.. e.g. getStarted.
 * @returns {Number}
 */
export function countCurrentUserSkills(skillsObj, dotttedSkillPrefix = null) {
  if (!skillsObj) return null

  return _.size(
    _.filter(
      _.keys(SkillNodes.$meta.map),
      s => (dotttedSkillPrefix === null || s.startsWith(dotttedSkillPrefix)) && hasSkill(skillsObj, s),
    ),
  )
}

export function getSkillNodeStatus(userObj, skillsObj, dottedSkillNodeKey) {
  // TODO: is dottedSkillKey a valid key
  //  ...

  // TODO: is skillsObj valid?
  //  ...

  const node = _.get(SkillNodes, dottedSkillNodeKey)
  // If we have a skills sequence in the $meta, then use that (in that order)
  const childSkills = node.$meta.sequence
    ? node.$meta.sequence.split(',')
    : _.without(Object.keys(node), '$meta')

  const [learnedSkills, todoSkills] = _.partition(childSkills, c =>
    hasSkill(skillsObj, dottedSkillNodeKey + '.' + c),
  )

  const retval = {
    childSkills,
    learnedSkills,
    todoSkills,
  }
  return retval
}

export function getLeafSkillStatus(skillsObj, dottedSkillLeafKey) {
  // TODO: is dottedSkillLeafKey a valid key AND a LEAF

  // TODO: is skillsObj valid?

  const retval = {}

  return retval
  // return array of skills for this prefix   foo.bar.
  // entries contain (skillKey, currentStatus, firstGranted, validationLevel, ...)

  // Note that the idea of validation levels is a progression from...
  //    selfCertified - I said so
  //    peerValidated - N peers said so
  //    mentorValidated - N people more senior than me said so
  //    tested   - I passed some automated tests to comfirm it
  //    anointed - a deity of our site has vouched that I have this skill
}

function getSkillStatus(dottedSkillKeyPrefix) {
  // return array of skills for this prefix   foo.bar.
  // entries contain (skillKey, currentStatus, firstGranted, validationLevel, ...)
  // Note that the idea of validation levels is a progression from...
  //    selfCertified - I said so
  //    peerValidated - N peers said so
  //    mentorValidated - N people more senior than me said so
  //    tested   - I passed some automated tests to comfirm it
  //    anointed - a deity of our site has vouched that I have this skill
}

function getSkillPercentage(dottedSkillKeyPrefix, depth) {
  // provide rollup of skills gained at various levels of the skillkey hierarchy
}

function getSkillStructure(dottedSkillKeyPrefix) {
  // return some encoding of a hierarchy/sequence of skills..
  // most importantly, given skillsIhave, provide list of suggestedSkillsToGainNext*
}

// related to this is features_I_have_used... is this a skill or something different?
// -> TERRITORY EXPLORED

// also related - muting of various helpers.. is this a skill or something different?
//  ... i think it is different.. for example regex expansion/help
// -> CUSTOMIZATION.. BUT it is also related to SKILLS and TERRITORY

// examples of skillKeys

// code.js.statements._for
// code.js.statements._var
// code.js.statements._let
//
// code.js.fw.phaser.Game
// code.js.fw.phaser.Loader
