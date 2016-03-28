/* global Mongo, Meteor */

export const Users = Meteor.users;
export const Azzets = new Mongo.Collection('azzets');   // Because 'Assets' is a special global for Meteor.
export const Activity = new Mongo.Collection('activity');  