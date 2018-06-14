// Heads Up!
//
// Checklist when adding a collection:
// 1. Add it here
// 2. Know that it is automatically added to the list of Denies in denyRules.js
// 3. Consider any publications and indexes in publications.js

// The variable and collection names should be plurals, e.g. 'users'
export const Activity = new Mongo.Collection('activity')
export const ActivitySnapshots = new Mongo.Collection('activity_snapshots')
export const Assignments = new Mongo.Collection('assignments')
export const Azzets = new Mongo.Collection('azzets') // Because 'Assets' is a special global for Meteor.
export const Chats = new Mongo.Collection('chats')
export const Classrooms = new Mongo.Collection('classrooms')
export const Flags = new Mongo.Collection('flags')
export const Projects = new Mongo.Collection('projects')
// export const Schools = new Mongo.Collection('schools') Maybe one day, "when we're all rich"
export const Settings = new Mongo.Collection('settings')
export const Skills = new Mongo.Collection('skills')
export const Sysvars = new Mongo.Collection('sysvars')
export const PurgedAzzets = new Mongo.Collection('purgedAzzets')
export const Users = Meteor.users
