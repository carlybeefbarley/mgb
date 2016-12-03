/* global Mongo, Meteor */

// The variable and collection names should be plurals, e.g. 'users'

export const Users = Meteor.users

export const Chats = new Mongo.Collection('chats')
export const Azzets = new Mongo.Collection('azzets')         // Because 'Assets' is a special global for Meteor.
export const Skills = new Mongo.Collection('skills')
export const Sysvars = new Mongo.Collection('sysvars')
export const Projects = new Mongo.Collection('projects')
export const Activity = new Mongo.Collection('activity')
export const Settings = new Mongo.Collection('settings')
export const ActivitySnapshots = new Mongo.Collection('activity_snapshots')