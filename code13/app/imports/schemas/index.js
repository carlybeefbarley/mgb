import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'

// Heads Up!
//
// Checklist when adding a collection:
// 1. Add it here
// 2. Know that it is automatically added to the list of Denies in denyRules.js
// 3. Consider any publications and indexes in publications.js

// The variable and collection names should be plurals, e.g. 'users'
export const Chats = new Mongo.Collection('chats')
export const Azzets = new Mongo.Collection('azzets') // Because 'Assets' is a special global for Meteor.
export const Flags = new Mongo.Collection('flags')
export const Skills = new Mongo.Collection('skills')
export const Sysvars = new Mongo.Collection('sysvars')
export const Projects = new Mongo.Collection('projects')
export const Activity = new Mongo.Collection('activity')
export const Settings = new Mongo.Collection('settings')
export const ActivitySnapshots = new Mongo.Collection('activity_snapshots')
export const PurgedAzzets = new Mongo.Collection('purgedAzzets')

//
// Users
//
// We wrap Meteor.users here so that we can handle "guests".
// Guests are excluded from "find*" queries by default.

// Modifies a selector to exclude 'profile.guest' users by default.
const ignoreGuests = selector => {
  const selectorObj = _.isString(selector) ? { _id: selector } : selector

  return { 'profile.guest': { $ne: true }, ...selectorObj }
}

const MeteorUsers = Meteor.users
export const Users = Meteor.users

const MeteorUsersFind = Meteor.users.find.bind(Users)
const MeteorUsersFindOne = Meteor.users.findOne.bind(Users)

Users.find = (selector, options) => MeteorUsersFind(ignoreGuests(selector), options)
Users.findOne = (selector, options) => MeteorUsersFindOne(ignoreGuests(selector), options)

// Provide warnings if `users` is directly accessed through the Meteor global.
Object.defineProperty(Meteor, 'users', {
  get() {
    console.error('Warning: Do not use Meteor.users directly.  Use `Users` from /schemas instead.')
    return MeteorUsers
  },
})
