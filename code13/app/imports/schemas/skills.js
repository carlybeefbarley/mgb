import SkillNodes, { _makeSlashSeparatedSkillKey } from '/imports/Skills/SkillNodes/SkillNodes.js'
import { Skills } from '/imports/schemas'

var schema = {
  // ID of skills objects in the Skills Collection. 
  // THIS WILL BE EQUAL TO THE ID OF THE USER - simplest way to ensure and manage a 1:1 mapping of user:settings
  _id:       String,

  updatedAt: Date,      // Always handy to have this
}

// Basis for the skill - to what extent is this subjectively or objectively verified
const SKILL_BASIS_SELF_CLAIMED =  'self'
const SKILL_BASIS_PEER_ASSERTED = 'peer'    // TODO in future - use some # of votes of 'respected peers' as basis for claim
const SKILL_BASIS_MGB_MEASURED =  'guru'    // TODO in future - use some moderator/guru account as basis for claim


Meteor.methods({
  "Skill.grant": function(dottedSkillKey, basis = SKILL_BASIS_SELF_CLAIMED) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    if (basis !== SKILL_BASIS_SELF_CLAIMED) 
      throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    const slashSeparatedSkillKey = _makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(this.userId, { 
      $addToSet: { [slashSeparatedSkillKey]: basis },
      $set:      { updatedAt: new Date() }
    })

    return count
  },

  "Skill.forget": function(dottedSkillKey, basis = SKILL_BASIS_SELF_CLAIMED) {
    if (!this.userId) 
      throw new Meteor.Error(401, "Login required")

    if (basis !== SKILL_BASIS_SELF_CLAIMED) 
      throw new Meteor.Error(401, 'Only self-claimed skills are currently supported')

    const slashSeparatedSkillKey = _makeSlashSeparatedSkillKey(dottedSkillKey)

    const count = Skills.update(this.userId, { 
      $pullAll:  { [slashSeparatedSkillKey]: [ basis ] },
      $set:      { updatedAt: new Date() }
    })

    return count
  }

})


export const hasSkill = (skillsObj, dottedSkillKey) => {
  if (!skillsObj || !dottedSkillKey || dottedSkillKey === '')
    return false
    
  const slashSeparatedSkillKey = _makeSlashSeparatedSkillKey(dottedSkillKey)
  const val = skillsObj[slashSeparatedSkillKey]
  return (val && val.length > 0)
}


function grantSkill(dottedSkillKey)
{
  // TODO: set it with a rounded timestamp so we know timeline and recency of this skill change
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