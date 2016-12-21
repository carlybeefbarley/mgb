import _ from 'lodash'
import { hasMultipleSkills } from './skills'
import { Skills } from '/imports/schemas'



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
    newBadgeName:   'hasAvatar',
    requiredSkills: ['getStarted.profile.profilePage', 'getStarted.profile.avatar']
    // This case should ideally also test.. but it's ok, sinc ethat avatar does have an awaitCompletionTag...  user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")   // TODO: Fix this - it's wrong since we always do the gravatar hash

  }
]


const doRefreshBadgeStatus = (userId, user) => {
  if (!userId || !user)
    return []

  let newBadgeKeys = []
  
  // 1. Skill-based awards
  const skills = Skills.findOne(userId)
  _.each(_skillBasedBadges, sbb => {
    if ( hasMultipleSkills(skills, sbb.requiredSkills) )
    {
      console.log(`User '{user.username}' meets Skill requirements for BADGE '${sbb.newBadgeName}'`)
      if (!_.includes(user.badges, sbb.newBadgeName))
      {
        console.log("User '{user.username}' does not have '${sbb.newBadgeName}' badge, so awarding it!")
        const count = Meteor.users.update(
          userId, 
          {
            $addToSet: { 'badges': sbb.newBadgeName },
            $set:      { updatedAt: new Date() }
          }
        )
        console.log(`Skill-based Badge Awarded -  update returned count=${count}`)
        if (count === 1) // Note that this will be the case at least because of the $set: updatedAt
          newBadgeKeys.push(sbb.newBadgeName)
      }
    }
  })

  // TODO: more...


  // OK, return the array of newly-granted badge keys
  return newBadgeKeys
}

if (Meteor.isServer)
{
  Meteor.methods({
    "User.refreshBadgeStatus": function( ) {
      return doRefreshBadgeStatus(this.userId, Meteor.user())
    }
  })
}