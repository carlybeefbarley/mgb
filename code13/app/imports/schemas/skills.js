import _ from 'lodash'
import SkillNodes, { makeSlashSeparatedSkillKey, makeTutorialsFindSelector } from '/imports/Skills/SkillNodes/SkillNodes.js'
import { Azzets, Skills } from '/imports/schemas'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

var schema = {
  // ID of skills objects in the Skills Collection. 
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:settings
  _id:       String,

  updatedAt: Date,      // Always handy to have this
}

// Basis for the skill - to what extent is this subjectively or objectively verified
const skillBasis = { 
  SELF_CLAIMED:   'self',
  PEER_ASSERTED:  'peer',    // TODO in future - use some # of votes of 'respected peers' as basis for claim
  MGB_MEASURED:   'guru'     // TODO in future - use some moderator/guru account as basis for claim  
}


Meteor.methods({
  "Skill.learn": function(dottedSkillKey, basis = skillBasis.SELF_CLAIMED) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    if (basis !== skillBasis.SELF_CLAIMED) 
      throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(this.userId, { 
      $addToSet: { [slashSeparatedSkillKey]: basis },
      $set:      { updatedAt: new Date() }
    })

    return count
  },

  "Skill.forget": function(dottedSkillKey, basis = skillBasis.SELF_CLAIMED) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    if (basis !== skillBasis.SELF_CLAIMED) 
      throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(this.userId, { 
      $pullAll:  { [slashSeparatedSkillKey]: [ basis ] },
      $set:      { updatedAt: new Date() }
    })

    return count
  }
})


if (Meteor.isServer)
  Meteor.methods({
    "Skill.getTutorialListForSkill": function(dottedSkillKey) {
      if (!this.userId) 
        throw new Meteor.Error(401, "Login required")
      
      const sel = (makeTutorialsFindSelector(dottedSkillKey, 0))
      const retval = Azzets.find( sel, { fields: { name: 1, text: 1 } } ).fetch()
      return retval
    }
  })


// SkillsObj is the user's skill context - a record from the Skills collection
export const hasSkill = (skillsObj, dottedSkillKey) => {
  if (!skillsObj || !dottedSkillKey || dottedSkillKey === '')
    return false

  const slashSeparatedSkillKey = makeSlashSeparatedSkillKey(dottedSkillKey)
  const val = skillsObj[slashSeparatedSkillKey]
  return (val && val.length > 0)
}

export const learnSkill = dottedSkillKey => {
  Meteor.call("Skill.learn", dottedSkillKey, (err, result) => {
    console.log("Skill learned: ", dottedSkillKey, err, result)
  })
  // TODO: set it with a rounded timestamp so we know timeline and recency of this skill change
}


export const forgetSkill = dottedSkillKey => {
  Meteor.call("Skill.forget", dottedSkillKey, (err, result) => {
    console.log("Skill forgotten: ", dottedSkillKey, err,  result)
  })
}

export function countCurrentUserSkills(skillsObj)
{
  if (!skillsObj)
    return null

  return _.size(_.filter(_.keys(SkillNodes.$meta.map), s => hasSkill(skillsObj, s)))
}

export function getSkillNodeStatus(userObj, skillsObj, dottedSkillNodeKey)
{
  // TODO: is dottedSkillKey a valid key
  //  ...

  // TODO: is skillsObj valid?
  //  ...
  
  // TODO: Check for in-progress tutorials on userObj
  //  ...
  
  const node = _.get(SkillNodes, dottedSkillNodeKey)
  // If we have a skills sequence in the $meta, then use that (in that order)
  const childSkills = node.$meta.sequence ? node.$meta.sequence.split(',') :  _.without(Object.keys(node), '$meta')

  const [ learnedSkills, todoSkills ] = _.partition(childSkills, c => hasSkill(skillsObj, dottedSkillNodeKey + '.' + c) )

  const retval = {
    childSkills,
    learnedSkills,
    todoSkills  
  }
  return retval
}



export function getLeafSkillStatus(skillsObj, dottedSkillLeafKey)
{
  // TODO: is dottedSkillLeafKey a valid key AND a LEAF

  // TODO: is skillsObj valid?



  const retval = {

  }

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

function getSkillStatus(dottedSkillKeyPrefix)
{
  // return array of skills for this prefix   foo.bar.
  // entries contain (skillKey, currentStatus, firstGranted, validationLevel, ...)
  
  // Note that the idea of validation levels is a progression from...
  //    selfCertified - I said so
  //    peerValidated - N peers said so
  //    mentorValidated - N people more senior than me said so
  //    tested   - I passed some automated tests to comfirm it
  //    anointed - a deity of our site has vouched that I have this skill
}


function getSkillPercentage(dottedSkillKeyPrefix, depth)
{
  // provide rollup of skills gained at various levels of the skillkey hierarchy
}


function getSkillStructure(dottedSkillKeyPrefix)
{
  
  // return some encoding of a hierarchy/sequence of skills.. 
  // most importantly, given skillsIhave, provide list of suggestedSkillsToGainNext*
}


// related to this is features_I_have_used... is this a skill or something different?
// -> TERRITORY EXPLORED


// also related - muting of various helpers.. is this a skill or something different?
//  ... i think it is different.. for example regex expansion/help
// -> CUSTOMIZATION.. BUT it is also related to SKILLS and TERRITORY



// examples of skillKeys


// mgb.asset.code.js.statements._for
// mgb.asset.code.js.statements._var
// mgb.asset.code.js.statements._let
// ...
// mgb.asset.code.js.fw.phaser.Game
// mgb.asset.code.js.fw.phaser.Loader