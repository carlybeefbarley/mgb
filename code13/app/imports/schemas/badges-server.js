import _ from 'lodash'
import { hasMultipleSkills } from './skills'
import { Skills } from '/imports/schemas'
import { isUserSuperAdmin } from '/imports/schemas/roles'



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
    requiredSkills: ['getStarted.profile.avatar']
    // This case should ideally also test for an avatar.. but it's ok, since 
    //   that avatar does have an awaitCompletionTag:
    //    user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")   
    //// TODO: Fix this - it's wrong since we always do the gravatar hash on account create. Doh!

  }
]

const _nameBasedBadges = [
  {
    newBadgeName: 'guruMusic',
    usernames:    'dgolds,guntis'.split(',')
  },

  {
    newBadgeName: 'guruCode',
    usernames:    'dgolds,stauzs,guntis'.split(',')
  },

  {
    newBadgeName: 'mgb2AlphaTester',
    usernames:    'dgolds,stauzs,guntis,leah,Supergirl,stanchion,LunarRaid,hawke,Viveiros,jazeps,avaragado,triptych,sleepysort,hertlen,collectordx,skadwaz'
  }
]

const _functionBasedBadges = [
  {
    newBadgeName: 'mgbAdmin',
    func: isUserSuperAdmin       // a function that takes a user-record as a parameter, and returns true if badge should be granted
  }
]

const _doRefreshBadgeStatus = user => {
  if (!user || !user._id)
    return []

  let newBadgeKeys = []

  // 0. manual (name-based) awards
  _.each(_nameBasedBadges, nbb => {
    if (_.includes(nbb.usernames, user.username))
    {
      if (!_.includes(user.badges, nbb.newBadgeName))
      {
//        console.log(`User '${user.username}' does not have '${nbb.newBadgeName}' badge, so awarding it!`)
        const count = Meteor.users.update(
          user._id, 
          {
            $addToSet: { 'badges': nbb.newBadgeName },
            $set:      { updatedAt: new Date() }
          }
        )
        console.log(`Name-based Badge Awarded -  update returned count=${count}`)
        if (count === 1) // Note that this will be the case at least because of the $set: updatedAt
          newBadgeKeys.push(nbb.newBadgeName)
      }
    }
  })
  
  // 1. Skill-based awards
  const skills = Skills.findOne(user._id)
  _.each(_skillBasedBadges, sbb => {
    if ( hasMultipleSkills(skills, sbb.requiredSkills) )
    {
//      console.log(`User '${user.username}' meets Skill requirements for BADGE '${sbb.newBadgeName}'`)
      if (!_.includes(user.badges, sbb.newBadgeName))
      {
        console.log(`User '${user.username}' does not have '${sbb.newBadgeName}' badge, so awarding it!`)
        const count = Meteor.users.update(
          user._id, 
          {
            $addToSet: { 'badges': sbb.newBadgeName },
            $set:      { updatedAt: new Date() }
          }
        )
        console.log(`Skill-based Badge '${sbb.newBadgeName}' award to '@${user.username}': Mongo Update returned count=${count}`)
        if (count === 1) // Note that this will be the case at least because of the $set: updatedAt
          newBadgeKeys.push(sbb.newBadgeName)
      }
    }
  })

  // 0. function (code-based, using a function that takes a user-record as a parameter) awards
  _.each(_functionBasedBadges, fbb => {
    if (fbb.func(user))
    {
      if (!_.includes(user.badges, fbb.newBadgeName))
      {
//      console.log(`User '${user.username}' does not have '${fbb.newBadgeName}' badge, so awarding it!`)
        const count = Meteor.users.update(
          user._id, 
          {
            $addToSet: { 'badges': fbb.newBadgeName },
            $set:      { updatedAt: new Date() }
          }
        )
        console.log(`Function-based Badge '${fbb.newBadgeName}' award to '@${user.username}': Mongo Update returned count=${count}`)
        if (count === 1) // Note that this will be the case at least because of the $set: updatedAt
          newBadgeKeys.push(fbb.newBadgeName)
      }
    }
  })
  // TODO: more...


  // OK, return the array of newly-granted badge keys
  return newBadgeKeys
}

Meteor.methods({
  "User.refreshBadgeStatus": function( ) {
    return _doRefreshBadgeStatus(Meteor.user())
  },
  
  // "User.refreshAllUserBadges": function() {   // e.g. call with   Meteor.call("User.refreshAllUserBadges")
  //   Meteor.users.find(  ).forEach(function(u) { _doRefreshBadgeStatus(u) } ) 
  //   console.log("---User.refreshAllUserBadges-done---")
  // }
})


// Example of how to fix badges given by mistake:
//     Meteor.users.update( {}  , { $pull: { badges: "mgbAdmin" }}, { multi: true }  )
