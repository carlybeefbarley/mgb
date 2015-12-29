/* global Mongo, Meteor */

export const Users = Meteor.users;
export const Teams = new Mongo.Collection('teams');
export const Plans = new Mongo.Collection('plans');
export const Todos = new Mongo.Collection('todos');
export const Azzets = new Mongo.Collection('azzets');   // Because 'Assets' is a special global for Meteor.
