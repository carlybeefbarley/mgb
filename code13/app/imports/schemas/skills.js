import _ from 'lodash'
import SkillNodes from '/imports/SkillNodes/SkillNodes.js'



// are enums enough - or we need separate object for these?
const UNKNOWN =       0;
const SELF_CLAIMED =  0b001;
const PEER_ASSERTED = 0b010;
const MGB_MEASURED =  0b100;
// temporary save in the ram
// TODO: save in real DB
const uSkills = {};

var getSkillsRecord = (userId) => {
  if(!uSkills[userId]){
    uSkills[userId] = {}
  }
  return uSkills[userId]
}

Meteor.methods({
  // TODO: check if active user is allowed to grant skill
  // TODO(find out): do we need to store which user have asserted skill? or asserters count
  "Skill.grant": function(key, userId = Meteor.userId(), origin = SELF_CLAIMED){
    let rec = getSkillsRecord(userId)
    console.log("skill granted:", uSkills);
    if(!rec[key]){
      rec[key] = UNKNOWN
    }
    rec[key] |= origin
    return rec;
  },
  "Skill.forget": function(key, userId = Meteor.userId()){
    const rec = getSkillsRecord(userId);
    delete rec[key];
  },
  // TODO: publish this
  "Skill.getForUser": function(userId = Meteor.userId()){
    console.log("skills:", getSkillsRecord(userId), uSkills)
    return getSkillsRecord(userId);
  }
})


function hasSkill(skillKey)
{
  return false
}


function grantSkill(skillKey)
{
  // TODO: set it with a rounded timestamp so we know timeline and recency of this skill change
}


function getSkillStatus(skillKeyPrefix)
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


function getSkillPercentage(skillKeyPrefix, depth)
{
  // provide rollup of skills gained at various levels of the skillkey hierarchy
}


function getSkillStructure(skillKeyPrefix)
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
//


