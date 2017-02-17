// This file should be imported by the ./index.js file

// These are the databases keyed directly by userId.
//   Users    (of course)
//   Settings
//   Skills

import { Users, Settings, Skills } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

//
//    USERS
//

const fieldsUserPublic = { username: 1, profile: 1, permissions: 1, createdAt: 1, badges: 1 }

Meteor.users._ensureIndex({"profile.name": 1})
Meteor.users._ensureIndex({"createdAt": 1})

// This is for Meteor.user()   See http://www.east5th.co/blog/2015/03/16/user-fields-and-universal-publications/
Meteor.publish(null, function() {
  if (this.userId)
    return Meteor.users.find( { _id: this.userId }, { fields: fieldsUserPublic } )
  else
    return null
})

Meteor.publish('users.byName', function(nameSearch, limitCount, userSortType) {
  let selector = {}
  let userSorter = userSortType ? userSorters[userSortType] : userSorters.default
  if (nameSearch && nameSearch.length > 0)
  {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector["profile.name"]= {$regex: new RegExp("^.*" + nameSearch, 'i')}
  }

  let findOpts = {
    fields: fieldsUserPublic,
    sort:   userSorter
  }
  if (limitCount)
    findOpts.limit = limitCount

  return Meteor.users.find(selector, findOpts)
})


// This is used for example by the project membership list. There is no limit, so no sort is supported. The client can sort
Meteor.publish('users.getByIdList', function(idArray) {
  const selector = {_id: {"$in": idArray}}
  return Meteor.users.find(selector, { fields: fieldsUserPublic } )
})

// get Exactly one user - by id
Meteor.publish('user', function(id) {
  return Meteor.users.find(id, { fields: fieldsUserPublic } )
})

// get Exactly one user - by profile.name
Meteor.publish('user.byName', function(username) {
  let selector = { "profile.name": username }
  return Meteor.users.find(selector, { fields: fieldsUserPublic } )
})


//
//    SETTINGS (keyed by user._id)
//

// TODO: Make sure userId can't be faked on server. Allow/deny rules required...
Meteor.publish('settings.userId', function(userId) {
  return Settings.find(userId)
})



//
//    SKILLS (keyed by user._id)
//


// TODO: Make sure userId can't be faked on server. Allow/deny rules required...
Meteor.publish('skills.userId', function(userId) {
  return Skills.find(userId)
})

